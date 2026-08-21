-- Add tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_id TEXT,
ADD COLUMN IF NOT EXISTS courier_name TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_method TEXT 
DEFAULT 'Razorpay';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_user_id 
ON orders(user_id);

-- Enable public update policy on orders so tracking details can be saved
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" ON public.orders
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
