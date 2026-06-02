import { AuthError, PostgrestError } from '@supabase/supabase-js';
import supabase from '../lib/supabase';
import { LoginPayload, SignupPayload } from '../utils/validation';
import { Profile, UserRole } from '../types/database';

/**
 * Custom error parser to translate database and network codes into user-friendly messages.
 * Prevents leaking technical details like table structures or database queries.
 */
export const parseAuthError = (error: AuthError | PostgrestError | Error | any): string => {
  if (!error) return 'An unknown error occurred.';

  const message = error.message || '';
  const code = error.code || '';

  // Network/Server down issues
  if (message.includes('FetchError') || message.includes('Network request failed')) {
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }

  // Supabase Auth specific error messages
  if (message.includes('Invalid login credentials')) {
    return 'Incorrect email address or password. Please try again.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Your email address is not verified yet. Please check your inbox for the verification link.';
  }
  if (message.includes('User already exists')) {
    return 'An account with this email address already exists.';
  }

  // Postgres Database Codes (RBAC/RLS & Constraints)
  switch (code) {
    case '23505': // Unique constraint violation (e.g. username taken)
      if (message.includes('username')) {
        return 'This username is already taken. Please choose another one.';
      }
      return 'An account with these details already exists.';
    case '42501': // RLS Permission Denied
      return 'Access Denied: You do not have the required permissions to perform this action.';
    default:
      return message || 'Authentication failed. Please verify your details.';
  }
};

export const authService = {
  /**
   * Register a new user in Supabase Auth.
   * Details like username, full_name, phone_number, and address are passed in metadata
   * which is then synchronized with the public.profiles table via database trigger.
   */
  signUp: async (payload: SignupPayload): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            username: payload.username.trim().toLowerCase(),
            full_name: payload.fullName.trim(),
            phone_number: payload.phoneNumber.trim(),
            address: payload.address.trim(),
            role: 'user', // Force role to 'user' for safety on client signups
          },
        },
      });

      if (error) {
        return { error: parseAuthError(error) };
      }

      return { error: null };
    } catch (err) {
      return { error: parseAuthError(err) };
    }
  },

  /**
   * Authenticate user credentials.
   */
  signIn: async (payload: LoginPayload): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });

      if (error) {
        return { error: parseAuthError(error) };
      }

      return { error: null };
    } catch (err) {
      return { error: parseAuthError(err) };
    }
  },

  /**
   * Log out active session.
   */
  signOut: async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: parseAuthError(error) };
      }
      return { error: null };
    } catch (err) {
      return { error: parseAuthError(err) };
    }
  },

  /**
   * Retrieves profile record from profiles table to confirm RBAC roles.
   * This is called securely after session authentication.
   */
  getUserProfile: async (userId: string): Promise<{ profile: Profile | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Handle case where user is authenticated but profile is not replicated yet
        return { profile: null, error: parseAuthError(error) };
      }

      return { profile: data as Profile, error: null };
    } catch (err) {
      return { profile: null, error: parseAuthError(err) };
    }
  },

  /**
   * Update profile record in profiles table.
   */
  updateUserProfile: async (
    userId: string,
    profileData: {
      username: string;
      full_name: string;
      phone_number: string;
      address: string;
      avatar_url?: string;
    }
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profileData.username.trim().toLowerCase(),
          full_name: profileData.full_name.trim(),
          phone_number: profileData.phone_number.trim(),
          address: profileData.address.trim(),
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return { error: parseAuthError(error) };
      }

      return { error: null };
    } catch (err) {
      return { error: parseAuthError(err) };
    }
  },
};

export default authService;
