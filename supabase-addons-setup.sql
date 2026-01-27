-- Create add_ons table
CREATE TABLE IF NOT EXISTS add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL, -- e.g., 'charms'
    applicable_to TEXT[], -- Array of product categories this addon applies to, e.g., ['Chains']
    stock_quantity INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some example charms for Custom Jewellery
INSERT INTO add_ons (name, description, price, category, applicable_to, stock_quantity, active) VALUES
    ('Heart Charm', 'Sterling silver heart charm', 500, 'charms', ARRAY['Custom Jewellery'], 50, true),
    ('Star Charm', 'Gold-plated star charm', 600, 'charms', ARRAY['Custom Jewellery'], 45, true),
    ('Moon Charm', 'Crescent moon charm in silver', 550, 'charms', ARRAY['Custom Jewellery'], 40, true)
ON CONFLICT DO NOTHING;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_addons_category ON add_ons(category);
CREATE INDEX IF NOT EXISTS idx_addons_active ON add_ons(active);

-- Enable Row Level Security (RLS)
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since we're using service role key)
CREATE POLICY "Allow all operations on add_ons" ON add_ons
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add add_ons field to orders table if it doesn't exist
-- This will store selected add-ons with each order
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='orders' AND column_name='add_ons') THEN
        ALTER TABLE orders ADD COLUMN add_ons JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;
