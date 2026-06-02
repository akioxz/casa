import { supabase } from '../lib/supabase';
import { Furniture, DatabaseFurnitureInsert, DatabaseFurnitureUpdate, ActivityLog } from '../types/database';
import { useAuthStore } from '../store/authStore';

// In-memory cache for mock mode to support live editing
let mockFurniture: Furniture[] = [];

export const furnitureService = {
  fetchFurniture: async (includeDeleted: boolean = false): Promise<Furniture[]> => {
    const isMockMode = useAuthStore.getState().isMockMode;
    if (isMockMode) {
      if (includeDeleted) return mockFurniture;
      return mockFurniture.filter(f => !f.is_deleted);
    }

    let query = supabase.from('furniture').select('*');
    
    // Explicitly hide deleted for user-facing views if includeDeleted is false
    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }
    
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching furniture:', error);
      throw error;
    }
    
    if (data) {
      mockFurniture = data; // Sync mock state with remote for smooth local fallbacks
    }
    return data || [];
  },

  fetchProductById: async (id: string): Promise<Furniture | null> => {
    const isMockMode = useAuthStore.getState().isMockMode;
    if (isMockMode) {
      return mockFurniture.find(f => f.id === id) || null;
    }

    const { data, error } = await supabase
      .from('furniture')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
    return data;
  },

  createFurniture: async (product: DatabaseFurnitureInsert): Promise<Furniture> => {
    const { user, isMockMode } = useAuthStore.getState();
    if (!user) throw new Error("Must be logged in to create products.");

    if (isMockMode) {
      const newProduct: Furniture = {
        ...product,
        id: `mock-${Date.now()}`,
        is_deleted: false,
        created_at: new Date().toISOString(),
      };
      mockFurniture = [newProduct, ...mockFurniture];
      return newProduct;
    }

    const { data, error } = await supabase
      .from('furniture')
      .insert(product)
      .select()
      .single();

    if (error) throw error;

    await furnitureService.logActivity('ADD_ITEM', `Added item: ${product.name}`);
    return data;
  },

  updateFurniture: async (id: string, updates: DatabaseFurnitureUpdate): Promise<Furniture> => {
    const { user, isMockMode } = useAuthStore.getState();
    if (!user) throw new Error("Must be logged in to update products.");

    if (isMockMode) {
      let updated: Furniture | null = null;
      mockFurniture = mockFurniture.map(f => {
        if (f.id === id) {
          updated = { ...f, ...updates };
          return updated;
        }
        return f;
      });
      if (!updated) throw new Error("Product not found in mock data");
      return updated;
    }

    const { data, error } = await supabase
      .from('furniture')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await furnitureService.logActivity('EDIT_ITEM', `Edited item: ${data?.name || id}`);
    return data;
  },

  deleteFurniture: async (id: string): Promise<void> => {
    const { user, isMockMode } = useAuthStore.getState();
    if (!user) throw new Error("Must be logged in to delete products.");

    if (isMockMode) {
      mockFurniture = mockFurniture.map(f => f.id === id ? { ...f, is_deleted: true } : f);
      return;
    }

    // Use soft delete by setting is_deleted flag to true
    const { error, data } = await supabase
      .from('furniture')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
       await furnitureService.logActivity('DELETE_ITEM', `Deleted item: ${data.name}`);
    }
  },

  logActivity: async (action: 'ADD_ITEM' | 'EDIT_ITEM' | 'DELETE_ITEM', details: string): Promise<void> => {
    const { user, isMockMode } = useAuthStore.getState();
    if (!user) return;

    if (isMockMode) {
       return;
    }

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        admin_id: user.id,
        action,
        details,
      });

    if (error) {
      console.error('Failed to insert activity log:', error);
    }
  },

  fetchActivityLogs: async (): Promise<ActivityLog[]> => {
    const { isMockMode } = useAuthStore.getState();
    if (isMockMode) return [];

    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        admin:admin_id (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
    
    return data as unknown as ActivityLog[];
  }
};
