-- Run this query to set up storage policies on Supabase

-- 1. Clean up existing policies (ignore errors if they do not exist)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access" ON storage.objects;

-- 2. Create public read policy
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');

-- 3. Create public upload policy
CREATE POLICY "Allow public upload access" ON storage.objects
    FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'product-images');

-- 4. Create public update policy
CREATE POLICY "Allow public update access" ON storage.objects
    FOR UPDATE TO anon, authenticated USING (bucket_id = 'product-images');

-- 5. Create public delete policy
CREATE POLICY "Allow public delete access" ON storage.objects
    FOR DELETE TO anon, authenticated USING (bucket_id = 'product-images');

-- 6. Add dynamic images list and care note fields to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS note text DEFAULT '';

-- 7. Add custom delivery note field to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS note text DEFAULT '';
