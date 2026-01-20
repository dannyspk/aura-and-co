require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();

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
        const newOrder = {
            order_number: 'ORD-' + Date.now(),
            ...req.body
        };
        
        const { data: order, error } = await supabase
            .from('orders')
            .insert([newOrder])
            .select()
            .single();

        if (error) throw error;
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

// Export for Vercel serverless
module.exports = app;
