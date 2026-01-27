require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to parse JSON
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Configure AWS S3
const s3Config = {
    region: process.env.AWS_REGION || 'us-east-1'
};

// Add credentials if provided
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
}

const s3Client = new S3Client(s3Config);

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'aurascoimages';

// Verify S3 configuration on startup
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn('⚠️  Warning: AWS credentials not configured. S3 image uploads will fail.');
    console.warn('   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file');
}

// Initialize Supabase tables and seed data
async function initializeDatabase() {
    try {
        // Check if products table has data
        const { data: existingProducts, error } = await supabase
            .from('products')
            .select('id')
            .limit(1);

        if (error) {
            console.error('⚠️  Error checking products table:', error.message);
            console.log('💡 Please create the tables in Supabase. See console for SQL.');
            console.log(`
-- Run this SQL in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT,
    description TEXT,
    badge TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping INTEGER NOT NULL,
    tax INTEGER NOT NULL,
    total INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to products" ON products
    USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Allow service role full access to orders" ON orders
    USING (auth.jwt()->>'role' = 'service_role');
            `);
            return;
        }

        // If no products exist, seed with defaults
        if (!existingProducts || existingProducts.length === 0) {
            const defaultProducts = [
                {
                    name: "Diamond Solitaire Ring",
                    category: "rings",
                    price: 299900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EDiamond Ring%3C/text%3E%3C/svg%3E",
                    description: "Elegant 18K white gold ring with 1 carat diamond",
                    badge: "Bestseller",
                    featured: true
                },
                {
                    name: "Pearl Necklace Set",
                    category: "necklaces",
                    price: 149900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EPearl Necklace%3C/text%3E%3C/svg%3E",
                    description: "Classic freshwater pearl necklace with matching earrings",
                    badge: "New",
                    featured: true
                },
                {
                    name: "Gold Hoop Earrings",
                    category: "earrings",
                    price: 79900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EGold Hoops%3C/text%3E%3C/svg%3E",
                    description: "14K yellow gold hoop earrings",
                    featured: false
                },
                {
                    name: "Tennis Bracelet",
                    category: "bracelets",
                    price: 189900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ETennis Bracelet%3C/text%3E%3C/svg%3E",
                    description: "Classic tennis bracelet with brilliant cut diamonds",
                    badge: "Sale",
                    featured: true
                },
                {
                    name: "Emerald Ring",
                    category: "rings",
                    price: 349900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EEmerald Ring%3C/text%3E%3C/svg%3E",
                    description: "Stunning emerald ring with diamond accents",
                    featured: false
                },
                {
                    name: "Gold Chain Necklace",
                    category: "necklaces",
                    price: 129900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EGold Chain%3C/text%3E%3C/svg%3E",
                    description: "22K gold chain necklace with delicate pendant",
                    featured: false
                },
                {
                    name: "Diamond Stud Earrings",
                    category: "earrings",
                    price: 159900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EDiamond Studs%3C/text%3E%3C/svg%3E",
                    description: "0.5 carat diamond stud earrings in platinum",
                    badge: "Bestseller",
                    featured: true
                },
                {
                    name: "Charm Bracelet",
                    category: "bracelets",
                    price: 89900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ECharm Bracelet%3C/text%3E%3C/svg%3E",
                    description: "Sterling silver charm bracelet",
                    featured: false
                },
                {
                    name: "Sapphire Ring",
                    category: "rings",
                    price: 279900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ESapphire Ring%3C/text%3E%3C/svg%3E",
                    description: "Royal blue sapphire ring with diamond halo",
                    badge: "New",
                    featured: false
                },
                {
                    name: "Statement Necklace",
                    category: "necklaces",
                    price: 179900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EStatement Necklace%3C/text%3E%3C/svg%3E",
                    description: "Bold statement necklace with mixed gemstones",
                    featured: false
                },
                {
                    name: "Drop Earrings",
                    category: "earrings",
                    price: 99900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EPearl Drops%3C/text%3E%3C/svg%3E",
                    description: "Elegant drop earrings with pearls",
                    featured: false
                },
                {
                    name: "Bangles Set",
                    category: "bracelets",
                    price: 119900,
                    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EGold Bangles%3C/text%3E%3C/svg%3E",
                    description: "Set of 4 gold bangles with intricate designs",
                    badge: "Sale",
                    featured: false
                }
            ];

            const { error: insertError } = await supabase
                .from('products')
                .insert(defaultProducts);

            if (insertError) {
                console.error('Error seeding products:', insertError);
            } else {
                console.log('🌱 Seeded database with 12 default products');
            }
        }

        const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        console.log('📦 Supabase Database initialized');
        console.log(`   Products: ${count || 0}`);
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Initialize database on startup
initializeDatabase();

// Middleware
app.use(express.static(__dirname));

// Clean URL routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'shop.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/order-confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'order-confirmation.html'));
});

// ============ PRODUCTS API ============

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        res.json(products || []);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', parseInt(req.params.id))
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Product not found' });
            }
            throw error;
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create product
app.post('/api/products', async (req, res) => {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updateData = {
            ...req.body,
            updated_at: new Date().toISOString()
        };

        // Debug logging
        console.log('Updating product:', id);
        console.log('Update data:', JSON.stringify(updateData, null, 2));
        console.log('Images array:', updateData.images);

        const { data: product, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Product not found' });
            }
            throw error;
        }
        
        console.log('Product updated successfully:', product.id);
        console.log('Saved images:', product.images);
        
        res.json({ success: true, product });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        const { data: product, error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Product not found' });
            }
            throw error;
        }
        res.json({ success: true, product });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ============ ORDERS API ============

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(orders || []);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Create order
app.post('/api/orders', async (req, res) => {
    try {
        // The order data now comes in the correct database format
        const newOrder = {
            order_number: req.body.order_number,
            customer_name: req.body.customer_name,
            customer_email: req.body.customer_email,
            customer_phone: req.body.customer_phone,
            shipping_address: req.body.shipping_address,
            items: req.body.items,
            subtotal: req.body.subtotal,
            shipping: req.body.shipping,
            tax: req.body.tax,
            discount: req.body.discount || 0,
            promo_code: req.body.promo_code || null,
            total: req.body.total,
            payment_method: req.body.payment_method,
            status: req.body.status || 'pending'
        };
        
        const { data: order, error } = await supabase
            .from('orders')
            .insert([newOrder])
            .select()
            .single();

        if (error) throw error;
        
        // If promo code was used, increment its usage counter
        if (req.body.promo_code) {
            const { error: promoError } = await supabase
                .from('promo_codes')
                .update({ used_count: supabase.raw('used_count + 1') })
                .eq('code', req.body.promo_code);
            
            if (promoError) {
                console.error('Error updating promo code usage:', promoError);
                // Don't fail the order if promo update fails
            }
        }
        
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order (for status changes)
app.put('/api/orders/:orderId', async (req, res) => {
    try {
        const orderNumber = req.params.orderId;
        const updateData = {
            ...req.body,
            updated_at: new Date().toISOString()
        };

        const { data: order, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('order_number', orderNumber)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Order not found' });
            }
            throw error;
        }
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// ============ CATEGORIES API ============

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        res.json(categories || []);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Create category
app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;
        
        // Check if category already exists
        const { data: existing } = await supabase
            .from('categories')
            .select('*')
            .eq('name', name.toLowerCase())
            .single();
            
        if (existing) {
            return res.status(400).json({ error: 'Category already exists' });
        }
        
        const { data: category, error } = await supabase
            .from('categories')
            .insert([{ name: name.toLowerCase() }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, category });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category
app.put('/api/categories/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name } = req.body;
        
        // Check if new name already exists
        const { data: existing } = await supabase
            .from('categories')
            .select('*')
            .eq('name', name.toLowerCase())
            .neq('id', id)
            .single();
            
        if (existing) {
            return res.status(400).json({ error: 'Category name already exists' });
        }

        const { data: category, error } = await supabase
            .from('categories')
            .update({ name: name.toLowerCase(), updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Category not found' });
            }
            throw error;
        }
        res.json({ success: true, category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        const { data: category, error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Category not found' });
            }
            throw error;
        }
        res.json({ success: true, category });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// ============ PROMO CODES API ============

// Validate and apply promo code
app.post('/api/promo-codes/validate', async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        
        if (!code || !orderAmount) {
            return res.status(400).json({ error: 'Code and order amount are required' });
        }
        
        // Fetch promo code
        const { data: promoCode, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();
        
        if (error || !promoCode) {
            return res.status(404).json({ error: 'Invalid promo code' });
        }
        
        // Check if promo code is active
        if (!promoCode.active) {
            return res.status(400).json({ error: 'This promo code is no longer active' });
        }
        
        // Check validity period
        const now = new Date();
        if (promoCode.valid_from && new Date(promoCode.valid_from) > now) {
            return res.status(400).json({ error: 'This promo code is not yet valid' });
        }
        if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
            return res.status(400).json({ error: 'This promo code has expired' });
        }
        
        // Check usage limit
        if (promoCode.usage_limit && promoCode.used_count >= promoCode.usage_limit) {
            return res.status(400).json({ error: 'This promo code has reached its usage limit' });
        }
        
        // Check minimum order amount
        if (promoCode.min_order_amount && orderAmount < promoCode.min_order_amount) {
            return res.status(400).json({ 
                error: `Minimum order amount of Rs ${promoCode.min_order_amount.toLocaleString('en-PK')} required` 
            });
        }
        
        // Calculate discount
        let discount = 0;
        if (promoCode.discount_type === 'percentage') {
            discount = (orderAmount * promoCode.discount_value) / 100;
            if (promoCode.max_discount) {
                discount = Math.min(discount, promoCode.max_discount);
            }
        } else if (promoCode.discount_type === 'fixed') {
            discount = promoCode.discount_value;
        }
        
        // Ensure discount doesn't exceed order amount
        discount = Math.min(discount, orderAmount);
        
        res.json({
            valid: true,
            code: promoCode.code,
            discount: discount,
            description: promoCode.description,
            discountType: promoCode.discount_type,
            discountValue: promoCode.discount_value
        });
    } catch (error) {
        console.error('Error validating promo code:', error);
        res.status(500).json({ error: 'Failed to validate promo code' });
    }
});

// Get all promo codes (for admin)
app.get('/api/promo-codes', async (req, res) => {
    try {
        const { data: promoCodes, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json({ success: true, promoCodes: promoCodes || [] });
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch promo codes' });
    }
});

// Create promo code (for admin)
app.post('/api/promo-codes', async (req, res) => {
    try {
        const promoCode = {
            code: req.body.code.toUpperCase(),
            discount_type: req.body.discount_type,
            discount_value: req.body.discount_value,
            min_order_amount: req.body.min_order_amount || 0,
            max_discount: req.body.max_discount,
            usage_limit: req.body.usage_limit,
            active: req.body.active !== false,
            valid_from: req.body.valid_from,
            valid_until: req.body.valid_until,
            description: req.body.description
        };
        
        const { data, error } = await supabase
            .from('promo_codes')
            .insert([promoCode])
            .select()
            .single();
        
        if (error) throw error;
        res.json({ success: true, promoCode: data });
    } catch (error) {
        console.error('Error creating promo code:', error);
        res.status(500).json({ error: 'Failed to create promo code' });
    }
});

// Update promo code (for admin)
app.put('/api/promo-codes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body, updated_at: new Date().toISOString() };
        
        if (updates.code) {
            updates.code = updates.code.toUpperCase();
        }
        
        const { data, error } = await supabase
            .from('promo_codes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        res.json({ success: true, promoCode: data });
    } catch (error) {
        console.error('Error updating promo code:', error);
        res.status(500).json({ error: 'Failed to update promo code' });
    }
});

// Delete promo code (for admin)
app.delete('/api/promo-codes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { error } = await supabase
            .from('promo_codes')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting promo code:', error);
        res.status(500).json({ error: 'Failed to delete promo code' });
    }
});

// ============ ADD-ONS MANAGEMENT ============

// Get all add-ons (optionally filter by category and applicable_to)
app.get('/api/add-ons', async (req, res) => {
    try {
        const { category, applicable_to } = req.query;
        
        let query = supabase
            .from('add_ons')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (category) {
            query = query.eq('category', category);
        }
        
        if (applicable_to) {
            query = query.contains('applicable_to', [applicable_to]);
        }
        
        const { data: addOns, error } = await query;
        
        if (error) throw error;
        res.json({ success: true, addOns: addOns || [] });
    } catch (error) {
        console.error('Error fetching add-ons:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch add-ons' });
    }
});

// Create add-on (for admin)
app.post('/api/add-ons', async (req, res) => {
    try {
        const newAddOn = {
            name: req.body.name,
            description: req.body.description || null,
            price: parseFloat(req.body.price),
            image_url: req.body.image_url || null,
            category: req.body.category,
            applicable_to: req.body.applicable_to || [],
            stock_quantity: parseInt(req.body.stock_quantity) || 0,
            active: req.body.active !== false
        };
        
        const { data: addOn, error } = await supabase
            .from('add_ons')
            .insert([newAddOn])
            .select()
            .single();
        
        if (error) throw error;
        res.json({ success: true, addOn });
    } catch (error) {
        console.error('Error creating add-on:', error);
        res.status(500).json({ success: false, error: 'Failed to create add-on' });
    }
});

// Update add-on (for admin)
app.put('/api/add-ons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            name: req.body.name,
            description: req.body.description || null,
            price: parseFloat(req.body.price),
            image_url: req.body.image_url || null,
            category: req.body.category,
            applicable_to: req.body.applicable_to || [],
            stock_quantity: parseInt(req.body.stock_quantity) || 0,
            active: req.body.active !== false,
            updated_at: new Date().toISOString()
        };
        
        const { data: addOn, error } = await supabase
            .from('add_ons')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        res.json({ success: true, addOn });
    } catch (error) {
        console.error('Error updating add-on:', error);
        res.status(500).json({ success: false, error: 'Failed to update add-on' });
    }
});

// Delete add-on (for admin)
app.delete('/api/add-ons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { error } = await supabase
            .from('add_ons')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting add-on:', error);
        res.status(500).json({ success: false, error: 'Failed to delete add-on' });
    }
});

// ============ IMAGE UPLOAD ============

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        // Check if AWS credentials are configured
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            console.error('❌ AWS credentials not configured');
            return res.status(500).json({ 
                error: 'Server configuration error: AWS credentials not set',
                details: 'Contact administrator to configure AWS S3 credentials'
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`📤 Uploading image: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

        // Generate unique filename
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `products/${crypto.randomUUID()}${fileExtension}`;

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            CacheControl: 'max-age=31536000', // Cache for 1 year
        });

        await s3Client.send(command);

        // Return the public URL
        const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
        
        console.log(`✅ Image uploaded successfully: ${imageUrl}`);
        
        res.json({ 
            success: true, 
            url: imageUrl 
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.Code || error.code,
            name: error.name
        });
        
        res.status(500).json({ 
            error: 'Failed to upload image',
            details: error.message,
            code: error.Code || error.code || 'UNKNOWN'
        });
    }
});

// Fallback to 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start server
app.listen(PORT, () => {
    console.log(`\n✨ Aura & Co Development Server Running!\n`);
    console.log(`🌐 Local:    http://localhost:${PORT}`);
    console.log(`📁 Root:     ${__dirname}\n`);
    console.log(`Available routes:`);
    console.log(`  - http://localhost:${PORT}/`);
    console.log(`  - http://localhost:${PORT}/shop`);
    console.log(`  - http://localhost:${PORT}/checkout`);
    console.log(`  - http://localhost:${PORT}/order-confirmation`);
    console.log(`\nAPI endpoints:`);
    console.log(`  - GET/POST    /api/products`);
    console.log(`  - GET/PUT/DEL /api/products/:id`);
    console.log(`  - GET/POST    /api/orders`);
    console.log(`  - PUT         /api/orders/:orderId`);
    console.log(`  - POST        /api/upload-image\n`);
});
