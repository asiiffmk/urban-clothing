-- 1. Enable Row Level Security (RLS) on all tables

-- Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    image text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id bigint PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    price numeric NOT NULL,
    rating numeric,
    reviews integer,
    image text,
    secondary_image text,
    description text,
    colors jsonb,
    sizes text[],
    details text[],
    sizes_stock jsonb DEFAULT '{}'::jsonb,
    is_new_arrival boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text NOT NULL,
    product text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    total_price numeric NOT NULL,
    status text DEFAULT 'pending',
    customer_name text,
    phone1 text,
    phone2 text,
    house_name text,
    local_place text,
    pincode text,
    post_office text,
    district text,
    state text,
    full_address text
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id bigint,
    product_name text,
    size text,
    color text,
    quantity integer NOT NULL,
    price numeric NOT NULL
);

-- Create Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 2. Create public policies (so front-end client-side operations can fetch/insert/update/delete)

-- Categories: Anyone can read, insert, update, delete
CREATE POLICY "Allow public read on categories" ON public.categories
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert on categories" ON public.categories
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update on categories" ON public.categories
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on categories" ON public.categories
    FOR DELETE TO anon, authenticated USING (true);

-- Products: Anyone can read, insert, update, delete
CREATE POLICY "Allow public read on products" ON public.products
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert on products" ON public.products
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update on products" ON public.products
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on products" ON public.products
    FOR DELETE TO anon, authenticated USING (true);

-- Reviews: Anyone can read, insert, delete
CREATE POLICY "Allow public read on reviews" ON public.reviews
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert on reviews" ON public.reviews
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public delete on reviews" ON public.reviews
    FOR DELETE TO anon, authenticated USING (true);

-- Orders: Anyone can create, read, and delete orders (anonymous checkouts and admin cleaning)
CREATE POLICY "Allow public read on orders" ON public.orders
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert on orders" ON public.orders
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public delete on orders" ON public.orders
    FOR DELETE TO anon, authenticated USING (true);

-- Order Items: Anyone can create, read, and delete order items
CREATE POLICY "Allow public read on order_items" ON public.order_items
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert on order_items" ON public.order_items
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public delete on order_items" ON public.order_items
    FOR DELETE TO anon, authenticated USING (true);

-- Site Settings: Anyone can read, insert, update, delete
CREATE POLICY "Allow public read on site_settings" ON public.site_settings
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert on site_settings" ON public.site_settings
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update on site_settings" ON public.site_settings
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on site_settings" ON public.site_settings
    FOR DELETE TO anon, authenticated USING (true);

-- Customer Profiles: Table for tracking registered users with names
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for customer_profiles
CREATE POLICY "Allow public read on customer_profiles" ON public.customer_profiles
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert on customer_profiles" ON public.customer_profiles
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update on customer_profiles" ON public.customer_profiles
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on customer_profiles" ON public.customer_profiles
    FOR DELETE TO anon, authenticated USING (true);
