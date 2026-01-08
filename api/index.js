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
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = 'aurascoimages';

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

// ============ IMAGE UPLOAD ============

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

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
        const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
        
        res.json({ 
            success: true, 
            url: imageUrl 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            error: 'Failed to upload image',
            details: error.message 
        });
    }
});

// Export for Vercel serverless
module.exports = app;
