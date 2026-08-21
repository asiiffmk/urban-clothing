-- Run this SQL in your Supabase SQL Editor to update your tables

-- 1. Add sizes_stock JSONB column to track stock count per size on products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes_stock jsonb DEFAULT '{}'::jsonb;

-- 2. Add shipping/customer address columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone1 text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone2 text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS house_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS local_place text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS post_office text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_address text;

-- 3. Add tracking_id column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_id text;

-- 4. Enable public update policy on orders so tracking IDs can be saved
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" ON public.orders
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

