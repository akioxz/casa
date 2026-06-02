export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  address: string | null;
  role: UserRole;
  updated_at: string;
}

export interface Furniture {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url: string;
  is_deleted: boolean;
  base_color?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  action: 'ADD_ITEM' | 'EDIT_ITEM' | 'DELETE_ITEM';
  details: string | null;
  created_at: string;
  admin?: Profile; // Populated via join if needed
}

// Supabase Database Schema helper types
export type DatabaseFurnitureInsert = Omit<Furniture, 'id' | 'created_at' | 'is_deleted'> & {
  id?: string;
  is_deleted?: boolean;
};

export type DatabaseFurnitureUpdate = Partial<DatabaseFurnitureInsert>;

export type DatabaseProfileUpdate = Partial<Omit<Profile, 'id' | 'role' | 'updated_at'>>;
export type DatabaseAdminProfileUpdate = DatabaseProfileUpdate & { role?: UserRole };
