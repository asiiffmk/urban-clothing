-- Run this SQL in your Supabase SQL Editor to update your tables

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read on profiles" ON public.profiles
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow individual insert on profiles" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow individual update on profiles" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow individual delete on profiles" ON public.profiles
    FOR DELETE TO authenticated USING (auth.uid() = id);


-- 2. Create addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    house_name TEXT,
    local_place TEXT,
    pincode TEXT,
    post_office TEXT,
    district TEXT,
    state TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Addresses Policies
CREATE POLICY "Allow users to read own addresses" ON public.addresses
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own addresses" ON public.addresses
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own addresses" ON public.addresses
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own addresses" ON public.addresses
    FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 3. Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, product_id)
);

-- Enable RLS on wishlist
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Wishlist Policies
CREATE POLICY "Allow users to read own wishlist" ON public.wishlist
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own wishlist" ON public.wishlist
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own wishlist" ON public.wishlist
    FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 4. Update orders table to include user_id, tracking_id, and payment_method columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Razorpay';

-- Add read policy for orders linked to authenticated user (if not already covered by public read)
CREATE POLICY "Allow users to read own orders" ON public.orders
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5. Enable public update policy on orders so tracking IDs can be saved
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" ON public.orders
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

