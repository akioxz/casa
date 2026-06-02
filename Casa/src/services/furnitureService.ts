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
    if (isMockMode || id.startsWith('mock-') || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
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
  },

  seedMockFurniture: async (): Promise<void> => {
    const unsplashUrls = [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=600',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600',
      'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=600',
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600',
      'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=600',
      'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600',
      'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=600',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600'
    ];

    const mockNames = [
      'Puff White Cloud Chair', 'Textured Moss Chair', 'Walnut Tubular Seat', 
      'Cream Bouclé Lounge', 'Tubular Tan Occasional', 'Plush White Swivel', 
      'Layered Caramel Chair', 'Curved Crimson Chair', 'Ivory Cloud Recliner', 
      'Sculptural White Bouclé', 'Origami Accent Chair', 'Slouchy Taupe Lounger', 
      'Rounded Ivory Swivel', 'Sage Wrap Chair', 'Low Profile Dune', 
      'Wicker Mushroom Chair', 'Rattan Wave Rocker', 'Cocoon Wicker Pod', 
      'Boho Rattan Lounger', 'Rattan Curl Lounge'
    ];

    const mockDescriptions = [
      'Sculptural cloud-shaped lounge chair upholstered in shaggy cream bouclé fabric, adding warmth to any room.',
      'A striking structural chair wrapped in a vibrant green textured wool, combining bold color with minimalist geometry.',
      'Mid-century modernist design featuring dark walnut legs supporting a deeply tufted beige cushion structure.',
      'An elegant oversized lounge chair featuring soft cream bouclé upholstery with solid wooden ball feet.',
      'A minimalist piece showcasing an unbroken curved silhouette wrapped in light beige performance fabric.',
      'A contemporary swivel chair featuring an overlapping folded design wrapped in luxurious faux fur.',
      'A masterpiece of texture featuring three layers of curled caramel bouclé on a solid ribbed walnut pedestal.',
      'A striking statement piece wrapped in deep crimson velvet, featuring a bold wrap-around tubular structure.',
      'Extremely plush lounging chair offering maximum comfort in soft ivory fabric with bold oversized arms.',
      'Beautiful asymmetrical white chair combining organic curves with textured fabric for a premium minimalist aesthetic.',
      'A unique folded-style accent chair resting on arched mahogany panels. Perfect blend of Japanese and Mid-Century design.',
      'Deep taupe relaxation chair offering an oversized slouchy silhouette, perfect for cozying up with a book.',
      'Classic tub-style swivel chair in an elegant ivory upholstery, bringing subtle softness to formal living rooms.',
      'Beautiful soft sage green chair featuring a single continuous fabric wrap that acts as arms and backrest.',
      'A sprawling low-profile lounge chair in textured dune sand color, perfect for relaxed casual seating areas.',
      'A stunning dome-shaped wicker chair with a wide flared back and a plush white cushion, resting on a solid rattan pedestal base.',
      'A sculptural rattan rocking chair with a sweeping S-curve silhouette. Handwoven from natural cane with a matte finish.',
      'An organic egg-shaped wicker pod chair. Entirely handwoven from natural cane into a seamless spherical form.',
      'A dramatic open-form rattan lounger with a bold cut-through arch design. Inspired by Wabi-Sabi Japanese aesthetics.',
      'A smooth, minimalist rattan lounge chair formed from a single continuous curl of woven cane — effortlessly elegant.'
    ];

    const mockCategories = [
      'Living', 'Living', 'Dining', 'Living', 'Bedroom', 'Workspace', 'Living', 'Living', 'Bedroom', 'Living',
      'Workspace', 'Living', 'Dining', 'Living', 'Bedroom', 'Outdoor', 'Outdoor', 'Outdoor', 'Outdoor', 'Outdoor'
    ];

    const mockPrices = [
      1350.00, 980.00, 1240.00, 1150.00, 890.00, 1050.00, 1650.00, 1450.00, 1800.00, 1250.00,
      980.00, 1550.00, 1100.00, 1220.00, 1350.00, 1180.00, 1380.00, 920.00, 1450.00, 1290.00
    ];

    const payload = mockNames.map((name, i) => ({
      name,
      price: mockPrices[i],
      description: mockDescriptions[i],
      category: mockCategories[i],
      image_url: unsplashUrls[i],
      is_deleted: false,
    }));

    const { error } = await supabase.from('furniture').insert(payload);
    if (error) throw error;
  }
};
