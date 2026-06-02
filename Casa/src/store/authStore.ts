import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import supabase from '../lib/supabase';
import authService from '../services/authService';
import { LoginPayload, SignupPayload } from '../utils/validation';

export type UserRole = 'user' | 'admin' | null;

interface AuthState {
  session: Session | null;
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  isSubmitting: boolean;
  isMockMode: boolean;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole) => void;
  initialize: () => Promise<void>;
  signIn: (payload: LoginPayload) => Promise<{ error: string | null }>;
  signUp: (payload: SignupPayload) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const isPlaceholderConfig = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  return !url || url.includes('your-supabase-project') || url === '';
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  role: null,
  isLoading: true,
  isSubmitting: false,
  isMockMode: isPlaceholderConfig(),

  setSession: (session) => {
    const user = session?.user ?? null;
    const role: UserRole = user ? (user.email?.includes('admin') ? 'admin' : 'user') : null;
    
    set({
      session,
      user,
      role,
      isLoading: false,
    });
  },

  setRole: (role) => {
    set({ role });
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      if (get().isMockMode) {
        set({ session: null, user: null, role: null, isLoading: false });
        return;
      }

      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        // Fetch role from profile table
        const { profile } = await authService.getUserProfile(session.user.id);
        const role = profile?.role || 'user';
        
        set({
          session,
          user: session.user,
          role,
          isLoading: false,
        });
      } else {
        set({ session: null, user: null, role: null, isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session && session.user) {
          const { profile } = await authService.getUserProfile(session.user.id);
          const role = profile?.role || 'user';
          set({
            session,
            user: session.user,
            role,
            isLoading: false,
          });
        } else {
          set({ session: null, user: null, role: null, isLoading: false });
        }
      });
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
      set({ isLoading: false });
    }
  },

  signIn: async (payload) => {
    set({ isSubmitting: true });
    const { email, password } = payload;
    try {
      if (get().isMockMode) {
        const mockUser: User = {
          id: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: email.trim().toLowerCase(),
          phone: '',
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        };

        const mockSession: Session = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser,
        };

        await new Promise((resolve) => setTimeout(resolve, 800));
        get().setSession(mockSession);
        set({ isSubmitting: false });
        return { error: null };
      }

      // Real Sign In via authService
      const { error } = await authService.signIn(payload);
      if (error) {
        set({ isSubmitting: false });
        return { error };
      }

      // Session will be updated by auth change listener, but fetch it proactively for faster response
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const { profile } = await authService.getUserProfile(session.user.id);
        const role = profile?.role || 'user';
        set({
          session,
          user: session.user,
          role,
          isLoading: false,
        });
      }
      
      set({ isSubmitting: false });
      return { error: null };
    } catch (error: any) {
      set({ isSubmitting: false });
      return { error: error?.message || 'An unexpected error occurred during login.' };
    }
  },

  signUp: async (payload) => {
    set({ isSubmitting: true });
    const { email } = payload;
    try {
      if (get().isMockMode) {
        const mockUser: User = {
          id: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: email.trim().toLowerCase(),
          phone: '',
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        };

        const mockSession: Session = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser,
        };

        await new Promise((resolve) => setTimeout(resolve, 800));
        get().setSession(mockSession);
        set({ isSubmitting: false });
        return { error: null };
      }

      // Real Sign Up via authService
      const { error } = await authService.signUp(payload);
      if (error) {
        set({ isSubmitting: false });
        return { error };
      }

      set({ isSubmitting: false });
      return { error: null };
    } catch (error: any) {
      set({ isSubmitting: false });
      return { error: error?.message || 'An unexpected error occurred during signup.' };
    }
  },

  signOut: async () => {
    try {
      set({ isSubmitting: true });
      if (get().isMockMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({ session: null, user: null, role: null, isLoading: false, isSubmitting: false });
        return;
      }
      await authService.signOut();
      set({ session: null, user: null, role: null, isLoading: false, isSubmitting: false });
    } catch (error) {
      console.error('Failed to sign out:', error);
      set({ isSubmitting: false });
    }
  },
}));

export default useAuthStore;
