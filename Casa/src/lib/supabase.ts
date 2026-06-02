import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY_SIZE_LIMIT = 2000; // iOS Keychain has a ~2KB limit for data items

/**
 * A secure, chunked storage adapter for Supabase Auth in Expo.
 * This prevents crashes when Supabase session state exceeds the 2KB limit of Expo SecureStore.
 */
const secureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Web fallback
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }

      const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      if (!chunkCountStr) {
        // Retrieve standard value if no chunks metadata exists
        return await SecureStore.getItemAsync(key);
      }

      const chunkCount = parseInt(chunkCountStr, 10);
      let data = '';
      for (let i = 0; i < chunkCount; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
        if (!chunk) return null;
        data += chunk;
      }
      return data;
    } catch (error) {
      console.warn('[Supabase Storage Adapter] Error retrieving item:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Web fallback
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }

      // Proactively clear existing chunks to prevent leftovers
      await secureStorageAdapter.removeItem(key);

      if (value.length <= KEY_SIZE_LIMIT) {
        await SecureStore.setItemAsync(key, value);
        return;
      }

      // Chunk the data if it exceeds the limit
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += KEY_SIZE_LIMIT) {
        chunks.push(value.substring(i, i + KEY_SIZE_LIMIT));
      }

      await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString());
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
      }
    } catch (error) {
      console.warn('[Supabase Storage Adapter] Error storing item:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      // Web fallback
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }

      await SecureStore.deleteItemAsync(key);
      const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);
        await SecureStore.deleteItemAsync(`${key}_chunks`);
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
      }
    } catch (error) {
      console.warn('[Supabase Storage Adapter] Error removing item:', error);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Casa] Supabase environment variables are not configured. Running in mock mode.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
