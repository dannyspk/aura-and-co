    -- Create promo_codes table
    CREATE TABLE IF NOT EXISTS promo_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
        discount_value DECIMAL(10, 2) NOT NULL,
        min_order_amount DECIMAL(10, 2) DEFAULT 0,
        max_discount DECIMAL(10, 2),
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        valid_until TIMESTAMP WITH TIME ZONE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Insert some example promo codes
    INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, description) VALUES
        ('WELCOME10', 'percentage', 10, 0, NULL, NULL, '10% off for new customers'),
        ('SAVE500', 'fixed', 500, 2000, NULL, NULL, 'Rs 500 off on orders above Rs 2000'),
        ('FLAT20', 'percentage', 20, 5000, 1000, NULL, '20% off (max Rs 1000) on orders above Rs 5000')
    ON CONFLICT (code) DO NOTHING;

    -- Add index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
    CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(active);

    -- Enable Row Level Security (RLS)
    ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow all operations (since we're using service role key)
    CREATE POLICY "Allow all operations on promo_codes" ON promo_codes
        FOR ALL
        USING (true)
        WITH CHECK (true);

    -- Add promo_code field to orders table if it doesn't exist
    DO $$ 
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name='orders' AND column_name='promo_code') THEN
            ALTER TABLE orders ADD COLUMN promo_code TEXT;
            ALTER TABLE orders ADD COLUMN discount DECIMAL(10, 2) DEFAULT 0;
        END IF;
    END $$;
