// Migration script to move data from lowdb to Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
    try {
        console.log('🔄 Starting migration to Supabase...\n');

        // Read existing data
        const productsData = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
        const ordersData = JSON.parse(fs.readFileSync('data/orders.json', 'utf8'));

        // Migrate products
        if (productsData.products && productsData.products.length > 0) {
            console.log(`📦 Migrating ${productsData.products.length} products...`);
            
            const productsToMigrate = productsData.products.map(p => ({
                name: p.name,
                category: p.category,
                price: p.price,
                image: p.image,
                description: p.description,
                badge: p.badge || null,
                featured: p.featured || false
            }));

            const { data: migratedProducts, error: productsError } = await supabase
                .from('products')
                .insert(productsToMigrate)
                .select();

            if (productsError) {
                console.error('❌ Error migrating products:', productsError);
            } else {
                console.log(`✅ Migrated ${migratedProducts.length} products`);
            }
        } else {
            console.log('📦 No products to migrate');
        }

        // Migrate orders
        if (ordersData.orders && ordersData.orders.length > 0) {
            console.log(`\n📦 Migrating ${ordersData.orders.length} orders...`);
            
            const ordersToMigrate = ordersData.orders.map(o => ({
                order_number: o.orderNumber || o.orderId || `ORD-${Date.now()}`,
                customer_name: o.customerName || o.customer_name || 'Unknown',
                customer_email: o.customerEmail || o.customer_email || 'unknown@email.com',
                customer_phone: o.customerPhone || o.customer_phone || null,
                shipping_address: o.shippingAddress || o.shipping_address || {},
                items: o.items || [],
                subtotal: o.subtotal || 0,
                shipping: o.shipping || 0,
                tax: o.tax || 0,
                total: o.total || 0,
                payment_method: o.paymentMethod || o.payment_method || 'unknown',
                status: o.status || 'pending'
            }));

            const { data: migratedOrders, error: ordersError } = await supabase
                .from('orders')
                .insert(ordersToMigrate)
                .select();

            if (ordersError) {
                console.error('❌ Error migrating orders:', ordersError);
            } else {
                console.log(`✅ Migrated ${migratedOrders.length} orders`);
            }
        } else {
            console.log('📦 No orders to migrate');
        }

        console.log('\n✨ Migration complete!');
        console.log('\n💡 You can now delete the data/products.json and data/orders.json files');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
