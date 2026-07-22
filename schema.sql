-- ====================================================================
-- VD CREATION - Supabase Database Schema Script
-- Copy and paste this script into your Supabase SQL Editor and run it!
-- ====================================================================

-- 1. DROP EXISTINGS (Optional, use only if clean setup is needed)
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS categories;

-- 2. CREATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id text PRIMARY KEY,
    name text NOT NULL,
    category text REFERENCES categories(id) ON DELETE CASCADE,
    category_label text NOT NULL,
    base_price numeric NOT NULL,
    rating numeric DEFAULT 5.0,
    reviews numeric DEFAULT 0,
    product_image text NOT NULL,
    empty_image text,
    crop_left numeric DEFAULT 0,
    crop_top numeric DEFAULT 0,
    crop_width numeric DEFAULT 100,
    crop_height numeric DEFAULT 100,
    slots jsonb DEFAULT NULL, -- e.g. [{"left": 10, "top": 10, "width": 50, "height": 80}, ...]
    description text,
    sizes jsonb NOT NULL, -- e.g. ["6x9", "8x12"]
    features jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    pincode text NOT NULL,
    total_price numeric NOT NULL,
    status text DEFAULT 'pending'::text, -- 'pending' or 'completed'
    items jsonb NOT NULL, -- list of items including Cloudinary cropped image URLs
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 6. CREATE SECURITY POLICIES FOR CATEGORIES
DROP POLICY IF EXISTS "Allow public read on categories" ON categories;
DROP POLICY IF EXISTS "Allow admin write on categories" ON categories;
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Allow public manage on categories" ON categories FOR ALL TO public USING (true) WITH CHECK (true);

-- 7. CREATE SECURITY POLICIES FOR PRODUCTS
DROP POLICY IF EXISTS "Allow public read on products" ON products;
DROP POLICY IF EXISTS "Allow admin write on products" ON products;
CREATE POLICY "Allow public read on products" ON products FOR SELECT TO public USING (true);
CREATE POLICY "Allow public manage on products" ON products FOR ALL TO public USING (true) WITH CHECK (true);

-- 8. CREATE SECURITY POLICIES FOR ORDERS
DROP POLICY IF EXISTS "Allow public insert on orders" ON orders;
DROP POLICY IF EXISTS "Allow admin manage on orders" ON orders;
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public manage on orders" ON orders FOR ALL TO public USING (true) WITH CHECK (true);

-- 9. POPULATE INITIAL DEFAULT CATEGORIES (If empty)
INSERT INTO categories (id, name) VALUES 
('acrylic', 'Acrylic Frames'),
('matte', 'Zink Mate Frames'),
('classic', 'Normal Frames'),
('led', 'LED Frames')
ON CONFLICT (id) DO NOTHING;

-- 10. POPULATE INITIAL PRODUCTS (If empty)
INSERT INTO products (id, name, category, category_label, base_price, rating, reviews, product_image, empty_image, crop_left, crop_top, crop_width, crop_height, description, sizes, features) VALUES
(
  'acrylic-couple-frame', 
  'Premium Couple Acrylic Photo Frame', 
  'acrylic', 
  'Acrylic Frames', 
  399, 
  4.8, 
  120, 
  'assets/acrylic_couple.png', 
  'assets/acrylic_couple_empty.png', 
  9.21, 5.59, 80.11, 87.71,
  'Elegant couples customized photo frame mounted on high-gloss diamond-polished acrylic sheets. Modern and clean style.',
  '["6x9", "8x12", "10x15", "12x18"]',
  '["Diamond Polished Edges", "High-Gloss Crystal Printing", "Couples Floating Mount System"]'
),
(
  'black-wood-normal', 
  'Premium Black Wood Normal Photo Frame', 
  'classic', 
  'Normal Frames', 
  299, 
  4.8, 
  95, 
  'assets/normal_black_wood.png', 
  'assets/normal_black_wood_empty.png', 
  21.12, 24.82, 57.66, 57.35,
  'Elegant bordered photo frame with synthetic black wood grains and glass protection. Premium and modern style.',
  '["6x9", "8x12", "10x15", "12x18", "16x20", "16x24", "18x24", "20x30", "24x36", "24x48"]',
  '["Premium Synthetic Black Wood", "Clear Glass Protection", "Pre-installed Wall Hanging Hooks"]'
),
(
  'light-wood-normal', 
  'Premium Light Wood Normal Photo Frame', 
  'classic', 
  'Normal Frames', 
  299, 
  4.7, 
  110, 
  'assets/normal_wood_light.png', 
  'assets/normal_wood_light_empty.png', 
  21.05, 11.88, 50.00, 71.85,
  'Elegant bordered photo frame with synthetic light wood grains and glass protection. Premium and warm modern style.',
  '["6x9", "8x12", "10x15", "12x18", "16x20", "16x24", "18x24", "20x30", "24x36", "24x48"]',
  '["Premium Synthetic Light Wood", "Clear Glass Protection", "Pre-installed Wall Hanging Hooks"]'

ON CONFLICT (id) DO NOTHING;
