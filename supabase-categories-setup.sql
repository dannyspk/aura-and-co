-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name) VALUES
    ('rings'),
    ('necklaces'),
    ('earrings'),
    ('bracelets')
ON CONFLICT (name) DO NOTHING;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since we're using service role key)
CREATE POLICY "Allow all operations on categories" ON categories
    FOR ALL
    USING (true)
    WITH CHECK (true);
