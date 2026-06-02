-- supabase_setup.sql
-- Run this script in the Supabase SQL Editor to establish the database schema, triggers, RLS, and RBAC policies.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. TABLES DEFINITIONS
-- =========================================================================

-- Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT, -- User-side only (can be null for admins)
  address TEXT,      -- User-side only (can be null for admins)
  role TEXT NOT NULL DEFAULT 'user' CONSTRAINT check_profile_role CHECK (role IN ('user', 'admin')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Furniture Table
CREATE TABLE IF NOT EXISTS public.furniture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CONSTRAINT check_furniture_price CHECK (price > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- Validation for categories handled on client-side (e.g. Living, Dining, Bedroom, Workspace)
  image_url TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false, -- Soft delete flag
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs Table (Admin Auditing)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CONSTRAINT check_log_action CHECK (action IN ('ADD_ITEM', 'EDIT_ITEM', 'DELETE_ITEM')),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 2. ROW LEVEL SECURITY (RLS) ENABLEMENT
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furniture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 2.5 HELPER FUNCTIONS (Security Definer to prevent infinite recursion)
-- =========================================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 3. PROFILE POLICIES
-- =========================================================================

-- Policy: Users can view their own profile. Admins can view all profiles.
CREATE POLICY "Allow users to read own profile or admins to read all" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
  auth.uid() = id 
  OR 
  public.is_admin()
);

-- Policy: Users can update their own profile.
CREATE POLICY "Allow users to update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Trigger to prevent admins from editing their own username (RBAC safety rule)
CREATE OR REPLACE FUNCTION public.check_username_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'admin' AND OLD.username IS DISTINCT FROM NEW.username THEN
    RAISE EXCEPTION 'Admin accounts are not permitted to change their username for audit integrity.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_prevent_admin_username_change
  BEFORE UPDATE OF username ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_username_update();

-- =========================================================================
-- 4. FURNITURE POLICIES
-- =========================================================================

-- Policy: Anyone can select active furniture (is_deleted = false)
CREATE POLICY "Allow public/users to read non-deleted furniture" 
ON public.furniture FOR SELECT 
USING (is_deleted = false);

-- Policy: Admin Write Policies (Insert, Update, Delete)
CREATE POLICY "Allow admin to insert furniture" 
ON public.furniture FOR INSERT 
TO authenticated 
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Allow admin to update furniture" 
ON public.furniture FOR UPDATE 
TO authenticated 
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

CREATE POLICY "Allow admin to delete furniture" 
ON public.furniture FOR DELETE 
TO authenticated 
USING (
  public.is_admin()
);

-- =========================================================================
-- 5. ACTIVITY LOG POLICIES
-- =========================================================================

-- Policy: Admins can select logs
CREATE POLICY "Allow admin select logs" 
ON public.activity_logs FOR SELECT 
TO authenticated 
USING (
  public.is_admin()
);

-- Policy: Admins can insert logs
CREATE POLICY "Allow admin insert logs" 
ON public.activity_logs FOR INSERT 
TO authenticated 
WITH CHECK (
  public.is_admin()
  AND auth.uid() = admin_id
);

-- Note: No UPDATE or DELETE policies are created for activity_logs, making logs append-only.

-- =========================================================================
-- 6. SYSTEM TRIGGERS: AUTH.USERS -> PUBLIC.PROFILES REPLICATION
-- =========================================================================

-- Automatic profile creation upon user signup via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := 'user';
  v_username TEXT;
  v_full_name TEXT;
  v_phone_number TEXT;
  v_address TEXT;
BEGIN
  -- Extract metadata fields if present
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
    v_username := NEW.raw_user_meta_data->>'username';
    v_full_name := NEW.raw_user_meta_data->>'full_name';
    v_phone_number := NEW.raw_user_meta_data->>'phone_number';
    v_address := NEW.raw_user_meta_data->>'address';
  END IF;

  -- Fallback for username if not explicitly supplied
  IF v_username IS NULL OR v_username = '' THEN
    v_username := SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTR(md5(random()::text), 1, 4);
  END IF;

  INSERT INTO public.profiles (
    id, 
    username, 
    full_name, 
    phone_number, 
    address, 
    role, 
    updated_at
  )
  VALUES (
    NEW.id,
    v_username,
    v_full_name,
    v_phone_number,
    v_address,
    v_role,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after new auth.user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 7. STORAGE BUCKET CONFIGURATION (Furniture Images)
-- =========================================================================

-- Insert 'furniture' bucket into storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('furniture', 'furniture', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Anyone can read furniture images
CREATE POLICY "Allow public read access to furniture images"
ON storage.objects FOR SELECT
USING (bucket_id = 'furniture');

-- Storage Policy: Admins can upload/update/delete furniture images
CREATE POLICY "Allow admin to manage furniture images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'furniture' 
  AND public.is_admin()
)
WITH CHECK (
  bucket_id = 'furniture' 
  AND public.is_admin()
);
