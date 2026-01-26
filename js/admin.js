// Admin credentials (in production, use proper backend authentication)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'aura123' // Change this!
};

// Check if logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    }
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminName', username);
        showDashboard();
    } else {
        document.getElementById('loginError').style.display = 'block';
        setTimeout(() => {
            document.getElementById('loginError').style.display = 'none';
        }, 3000);
    }
});

// Show dashboard
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminName').textContent = sessionStorage.getItem('adminName') || 'Admin';
    
    // Load data - use async/await to handle errors gracefully
    (async function() {
        try {
            await loadCategoryDropdown(); // Try to load categories for product form
        } catch (error) {
            console.warn('Categories not available yet. Please run the categories migration.', error);
        }
        loadProducts();
        loadOrders();
    })();
}

// Logout
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminName');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// Load products into table
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const fetchedProducts = await response.json();
        
        // Update local products array
        products.length = 0;
        products.push(...fetchedProducts);
        
        console.log('📦 Loaded products:', products.map(p => ({ id: p.id, name: p.name, image: p.image?.substring(0, 50) + '...' })));
        
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            
            // Create cells with data-label for mobile
            const cellId = document.createElement('td');
            cellId.setAttribute('data-label', 'ID');
            cellId.textContent = product.id;
            
            const cellImage = document.createElement('td');
            cellImage.setAttribute('data-label', 'Image');
            const img = document.createElement('img');
            img.src = product.image || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27%3E%3Crect fill=%27%23ddd%27 width=%2760%27 height=%2760%27/%3E%3C/svg%3E';
            img.alt = product.name;
            img.className = 'product-image';
            img.setAttribute('width', '60');
            img.setAttribute('height', '60');
            img.style.cssText = 'width: 60px !important; height: 60px !important; min-width: 60px !important; min-height: 60px !important; display: block !important; object-fit: contain !important; background: #f5f5f5; border-radius: 8px; border: 2px solid #ddd;';
            cellImage.appendChild(img);
            
            const cellName = document.createElement('td');
            cellName.setAttribute('data-label', 'Name');
            cellName.textContent = product.name;
            
            const cellCategory = document.createElement('td');
            cellCategory.setAttribute('data-label', 'Category');
            cellCategory.textContent = capitalizeFirst(product.category);
            
            const cellPrice = document.createElement('td');
            cellPrice.setAttribute('data-label', 'Price');
            cellPrice.textContent = `Rs ${product.price.toLocaleString('en-PK')}`;
            
            const cellBadge = document.createElement('td');
            cellBadge.setAttribute('data-label', 'Badge');
            if (product.badge) {
                const badge = document.createElement('span');
                badge.className = 'product-badge';
                badge.textContent = product.badge;
                cellBadge.appendChild(badge);
            } else {
                cellBadge.textContent = '-';
            }
            
            const cellFeatured = document.createElement('td');
            cellFeatured.setAttribute('data-label', 'Featured');
            cellFeatured.textContent = product.featured ? '⭐ Yes' : 'No';
            
            const cellActions = document.createElement('td');
            cellActions.setAttribute('data-label', 'Actions');
            cellActions.innerHTML = `
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            // Append cells to row
            row.appendChild(cellId);
            row.appendChild(cellImage);
            row.appendChild(cellName);
            row.appendChild(cellCategory);
            row.appendChild(cellPrice);
            row.appendChild(cellBadge);
            row.appendChild(cellFeatured);
            row.appendChild(cellActions);
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Failed to load products');
    }
}

// Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Open add modal
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    // Reset images
    productImages = [];
    document.getElementById('productImage').value = '';
    document.getElementById('additionalImagesContainer').innerHTML = '';
    document.getElementById('imagePreviews').style.display = 'none';
    document.getElementById('imagePreviews').innerHTML = '';
    
    // Reset to URL method by default
    document.querySelector('input[name="imageMethod"][value="url"]').checked = true;
    toggleImageInputMethod();
    
    document.getElementById('productModal').style.display = 'block';
}

// Edit product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productBadge').value = product.badge || '';
    document.getElementById('productFeatured').checked = product.featured || false;
    
    // Reset images UI
    productImages = [];
    document.getElementById('additionalImagesContainer').innerHTML = '';
    
    // Load existing images
    const existingImages = product.images || (product.image ? [product.image] : []);
    
    if (existingImages.length > 0) {
        // Set main image
        const mainImage = existingImages[0];
        if (!mainImage.startsWith('data:')) {
            document.getElementById('productImage').value = mainImage;
        }
        
        // Add additional images
        for (let i = 1; i < existingImages.length; i++) {
            const url = existingImages[i];
            if (!url.startsWith('data:')) {
                addImageUrlInput();
                const inputs = document.querySelectorAll('.additional-image-url');
                if (inputs[i - 1]) {
                    inputs[i - 1].value = url;
                }
            }
        }
        
        // Copy to productImages array
        productImages = existingImages.filter(img => !img.startsWith('data:'));
        
        // Update previews
        updateImagePreviews();
    }
    
    // Show URL method by default for editing
    document.querySelector('input[name="imageMethod"][value="url"]').checked = true;
    toggleImageInputMethod();
    
    document.getElementById('productModal').style.display = 'block';
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadProducts();
            alert('Product deleted successfully!');
        } else {
            throw new Error(data.error || 'Failed to delete');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + error.message);
    }
}

// Close modal
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    // Clear form
    document.getElementById('productForm').reset();
    
    // Reset images
    productImages = [];
    document.getElementById('productImage').value = '';
    document.getElementById('additionalImagesContainer').innerHTML = '';
    document.getElementById('imagePreviews').style.display = 'none';
    document.getElementById('imagePreviews').innerHTML = '';
}


// Product form submit
document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    const badge = document.getElementById('productBadge').value;
    const featured = document.getElementById('productFeatured').checked;
    
    // Get images array
    let images = [];
    const imageMethod = document.querySelector('input[name="imageMethod"]:checked').value;
    
    if (imageMethod === 'url') {
        updateImagePreviews(); // Make sure productImages is up to date
        images = [...productImages];
        
        if (images.length === 0) {
            const mainImage = document.getElementById('productImage').value.trim();
            if (mainImage) {
                images.push(mainImage);
            }
        }
    } else {
        // Use uploaded images from S3
        if (productImages.length > 0) {
            images = [...productImages];
        }
    }
    
    // Generate placeholder if no images
    if (images.length === 0) {
        const encodedName = encodeURIComponent(name);
        images.push(`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E${encodedName}%3C/text%3E%3C/svg%3E`);
    }
    
    const productData = {
        name,
        category,
        price,
        description,
        image: images[0], // Main image (for backward compatibility)
        images: images,   // All images array
        badge: badge || undefined,
        featured
    };
    
    try {
        if (id) {
            // Update existing product
            console.log('Updating product:', { id, name, images });
            console.log('Full product data being sent:', productData);
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            
            const data = await response.json();
            console.log('Server response:', data);
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to update product');
            }
        } else {
            // Add new product
            console.log('Adding new product:', { name, images });
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to create product');
            }
        }
        
        await loadProducts();
        closeModal();
        alert('Product saved successfully!');
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product: ' + error.message);
    }
});

// Initialize
checkAuth();

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    const orderModal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeModal();
    }
    if (event.target === orderModal) {
        closeOrderModal();
    }
}

// ========== ORDERS MANAGEMENT ==========

// Switch between tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.tab-btn').classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Load data for the tab
    if (tabName === 'orders') {
        loadOrders();
    } else if (tabName === 'categories') {
        loadCategories();
    } else if (tabName === 'promo-codes') {
        loadPromoCodes();
    }
}

// Load orders into table
async function loadOrders() {
    try {
        console.log('🔄 Loading orders from /api/orders...');
        const response = await fetch('/api/orders');
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const orders = await response.json();
        console.log('📦 Loaded orders:', orders.length);
        
        const tbody = document.getElementById('ordersTableBody');
        
        if (!tbody) {
            console.error('❌ ordersTableBody element not found');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No orders yet</td></tr>';
            return;
        }
        
        // Sort orders by date (newest first)
        orders.sort((a, b) => new Date(b.date || b.created_at || b.createdAt) - new Date(a.date || a.created_at || a.createdAt));
        
        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.date || order.created_at || order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('en-PK') + ' ' + orderDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
            
            // Handle both old format (order.shipping) and new format (order.shipping_address)
            const shippingInfo = order.shipping_address || order.shipping || {};
            const customerName = order.customer_name || `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim() || shippingInfo.fullName || 'N/A';
            const customerEmail = order.customer_email || shippingInfo.email || 'N/A';
            const orderNum = order.order_number || order.orderNumber || order.orderId || order.id;
            
            row.innerHTML = `
                <td data-label="Order #"><strong>${orderNum}</strong></td>
                <td data-label="Date">${formattedDate}</td>
                <td data-label="Customer">${customerName}<br><small>${customerEmail}</small></td>
                <td data-label="Items">${order.items.length} item(s)</td>
                <td data-label="Total">Rs ${order.total.toLocaleString('en-PK')}</td>
                <td data-label="Status"><span class="order-status status-${order.status}">${capitalizeFirst(order.status)}</span></td>
                <td data-label="Tracking" class="tracking-info">${order.tracking || '-'}</td>
                <td data-label="Actions">
                    <button class="btn-view-order" onclick="viewOrderDetails('${orderNum}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: red;">Failed to load orders</td></tr>';
        }
    }
}

// Filter orders by status
async function filterOrders() {
    try {
        const filterValue = document.getElementById('orderStatusFilter').value;
        const response = await fetch('/api/orders');
        const orders = await response.json();
        const tbody = document.getElementById('ordersTableBody');
        
        tbody.innerHTML = '';
        
        const filteredOrders = filterValue === 'all' 
            ? orders 
            : orders.filter(order => order.status === filterValue);
        
        if (filteredOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No orders found</td></tr>';
            return;
        }
        
        // Sort orders by date (newest first)
        filteredOrders.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        
        filteredOrders.forEach((order) => {
            const orderDate = new Date(order.date || order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('en-PK') + ' ' + orderDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Order #"><strong>${order.orderNumber || order.orderId}</strong></td>
                <td data-label="Date">${formattedDate}</td>
                <td data-label="Customer">${order.shipping.fullName}<br><small>${order.shipping.email}</small></td>
                <td data-label="Items">${order.items.length} item(s)</td>
                <td data-label="Total">Rs ${order.total.toLocaleString('en-PK')}</td>
                <td data-label="Status"><span class="order-status status-${order.status}">${capitalizeFirst(order.status)}</span></td>
                <td data-label="Tracking" class="tracking-info">${order.tracking || '-'}</td>
                <td data-label="Actions">
                    <button class="btn-view-order" onclick="viewOrderDetails('${order.orderId || order.orderNumber}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error filtering orders:', error);
    }
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        const order = orders.find(o => (o.orderId || o.orderNumber || o.order_number || o.id) === orderId);
        
        if (!order) {
            alert('Order not found');
            return;
        }
        
        const orderDate = new Date(order.date || order.created_at || order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('en-PK', { dateStyle: 'long' }) + ' at ' + orderDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
        
        // Handle both old format and new database format
        const shippingInfo = order.shipping_address || order.shipping || {};
        const customerName = order.customer_name || `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim() || shippingInfo.fullName || 'N/A';
        const paymentMethod = order.payment_method || order.payment?.method || 'cod';
        const shippingCost = order.shipping || 0;
        const orderNum = order.order_number || order.orderNumber || order.orderId || order.id;
        
        const content = document.getElementById('orderDetailsContent');
        content.innerHTML = `
            <div class="order-detail-section">
                <h3>Order Information</h3>
                <div class="order-detail-row">
                    <span class="order-detail-label">Order Number:</span>
                    <span><strong>${orderNum}</strong></span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Date:</span>
                    <span>${formattedDate}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Status:</span>
                    <span class="order-status status-${order.status}">${capitalizeFirst(order.status)}</span>
                </div>
            </div>

            <div class="order-detail-section">
                <h3>Customer Information</h3>
                <div class="order-detail-row">
                    <span class="order-detail-label">Name:</span>
                    <span>${customerName}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Email:</span>
                    <span>${shippingInfo.email || 'N/A'}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Phone:</span>
                    <span>${shippingInfo.phone || 'N/A'}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Address:</span>
                    <span>${shippingInfo.address || 'N/A'}, ${shippingInfo.city || ''}, ${shippingInfo.zipCode || shippingInfo.postalCode || ''}</span>
                </div>
            </div>

            <div class="order-detail-section">
                <h3>Order Items</h3>
                <ul class="order-items-list">
                    ${order.items.map(item => `
                        <li class="order-item">
                            <div>
                                <span>${item.name} × ${item.quantity}</span>
                                ${item.customRequest ? `<div class="item-custom-request-admin"><i class="fas fa-edit"></i> ${item.customRequest}</div>` : ''}
                            </div>
                            <span>Rs ${(item.price * item.quantity).toLocaleString('en-PK')}</span>
                        </li>
                    `).join('')}
                </ul>
                <div class="order-detail-row" style="margin-top: 15px; padding-top: 15px; border-top: 2px solid var(--border);">
                    <span class="order-detail-label">Subtotal:</span>
                    <span>Rs ${order.subtotal.toLocaleString('en-PK')}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Shipping:</span>
                    <span>Rs ${shippingCost.toLocaleString('en-PK')}</span>
                </div>
                <div class="order-detail-row" style="font-size: 1.1rem; font-weight: 600;">
                    <span class="order-detail-label">Total:</span>
                    <span>Rs ${order.total.toLocaleString('en-PK')}</span>
                </div>
            </div>

            <div class="order-detail-section">
                <h3>Payment Method</h3>
                <div class="order-detail-row">
                    <span class="order-detail-label">Method:</span>
                    <span>${paymentMethod === 'cod' ? 'Cash on Delivery' : 
                           paymentMethod === 'easypaisa' ? 'Easypaisa' : 
                           paymentMethod === 'jazzcash' ? 'JazzCash' : 
                           paymentMethod}</span>
                </div>
                ${order.payment && order.payment.mobileNumber ? `
                    <div class="order-detail-row">
                        <span class="order-detail-label">Mobile Number:</span>
                        <span>${order.payment.mobileNumber}</span>
                    </div>
                ` : ''}
            </div>

            <div class="order-update-form">
                <h3>Update Order</h3>
                <form onsubmit="updateOrder(event, '${orderNum}')">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="orderStatus">Order Status</label>
                            <select id="orderStatus" required>
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="trackingNumber">Tracking Number</label>
                            <input type="text" id="trackingNumber" value="${order.tracking || ''}" placeholder="Enter tracking number">
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-cancel" onclick="closeOrderModal()">Close</button>
                        <button type="submit" class="btn btn-save">Update Order</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('orderModal').style.display = 'block';
    } catch (error) {
        console.error('Error viewing order:', error);
        alert('Failed to load order details');
    }
}

// Update order status and tracking
async function updateOrder(event, orderId) {
    event.preventDefault();
    
    const status = document.getElementById('orderStatus').value;
    const tracking = document.getElementById('trackingNumber').value;
    
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, tracking })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Order updated successfully!');
            closeOrderModal();
            await loadOrders();
            
            // Apply current filter if any
            const filterValue = document.getElementById('orderStatusFilter').value;
            if (filterValue !== 'all') {
                await filterOrders();
            }
        } else {
            throw new Error(data.error || 'Failed to update order');
        }
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Failed to update order: ' + error.message);
    }
}

// Close order modal
function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

// ============ MULTIPLE IMAGES SUPPORT ============

// Global variable to store all product images
let productImages = [];

// Add another image URL input field
function addImageUrlInput() {
    const container = document.getElementById('additionalImagesContainer');
    const inputGroup = document.createElement('div');
    inputGroup.className = 'additional-image-input';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter additional image URL';
    input.className = 'additional-image-url';
    input.addEventListener('change', updateImagePreviews);
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-image';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.onclick = function() {
        inputGroup.remove();
        updateImagePreviews();
    };
    
    inputGroup.appendChild(input);
    inputGroup.appendChild(removeBtn);
    container.appendChild(inputGroup);
}

// Update image previews
function updateImagePreviews() {
    const method = document.querySelector('input[name="imageMethod"]:checked').value;
    const previewsContainer = document.getElementById('imagePreviews');
    
    // Only reset productImages if in URL mode
    // In file upload mode, keep the uploaded S3 URLs
    if (method === 'url') {
        productImages = [];
        
        // Get main image
        const mainImage = document.getElementById('productImage').value.trim();
        if (mainImage) {
            productImages.push(mainImage);
        }
        
        // Get additional images
        document.querySelectorAll('.additional-image-url').forEach(input => {
            const url = input.value.trim();
            if (url) {
                productImages.push(url);
            }
        });
    }
    // If method is 'file', productImages already contains uploaded S3 URLs, don't reset
    
    // Display previews
    if (productImages.length > 0) {
        previewsContainer.innerHTML = '';
        previewsContainer.style.display = 'grid';
        
        productImages.forEach((url, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            
            const img = document.createElement('img');
            img.src = url;
            img.onerror = function() {
                this.src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Crect fill=%27%23ddd%27 width=%27200%27 height=%27200%27/%3E%3Ctext fill=%27%23999%27 font-family=%27Arial%27 font-size=%2714%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EInvalid URL%3C/text%3E%3C/svg%3E';
            };
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-preview';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = function() {
                if (method === 'url') {
                    if (index === 0) {
                        document.getElementById('productImage').value = '';
                    } else {
                        const inputs = document.querySelectorAll('.additional-image-url');
                        if (inputs[index - 1]) {
                            inputs[index - 1].closest('.additional-image-input').remove();
                        }
                    }
                    updateImagePreviews();
                } else {
                    // For file uploads, remove from productImages array
                    productImages.splice(index, 1);
                    updateImagePreviews();
                }
            };
            
            if (index === 0) {
                const mainBadge = document.createElement('span');
                mainBadge.className = 'main-badge';
                mainBadge.textContent = 'Main';
                previewItem.appendChild(mainBadge);
            }
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewsContainer.appendChild(previewItem);
        });
    } else {
        previewsContainer.style.display = 'none';
    }
}

// Update toggleImageInputMethod to support multiple images
function toggleImageInputMethod() {
    const method = document.querySelector('input[name="imageMethod"]:checked').value;
    const urlSection = document.getElementById('urlInputSection');
    const fileSection = document.getElementById('fileInputSection');
    
    if (method === 'url') {
        urlSection.style.display = 'block';
        fileSection.style.display = 'none';
    } else {
        urlSection.style.display = 'none';
        fileSection.style.display = 'block';
    }
}

// Handle multiple file uploads
document.getElementById('productImageFile').addEventListener('change', async function(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const previewsContainer = document.getElementById('imagePreviews');
    
    // Don't reset productImages - keep existing ones and append new uploads
    // Only initialize if empty
    if (productImages.length === 0) {
        previewsContainer.innerHTML = '';
        previewsContainer.style.display = 'grid';
    }
    
    // Store the starting index for new images
    const startIndex = productImages.length;
    
    // Show uploading indicator
    const uploadBtn = document.querySelector('#productForm button[type="submit"]');
    const originalText = uploadBtn.textContent;
    uploadBtn.disabled = true;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
            alert(`File ${file.name} is not an image`);
            continue;
        }
        
        try {
            uploadBtn.textContent = `Uploading ${i + 1}/${files.length}...`;
            
            // Show temporary preview
            const reader = new FileReader();
            const previewPromise = new Promise(resolve => {
                reader.onload = function(event) {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'image-preview-item';
                    
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    
                    // Only mark as main if it's the very first image
                    if (startIndex === 0 && i === 0) {
                        const mainBadge = document.createElement('span');
                        mainBadge.className = 'main-badge';
                        mainBadge.textContent = 'Main';
                        previewItem.appendChild(mainBadge);
                    }
                    
                    previewItem.appendChild(img);
                    previewsContainer.appendChild(previewItem);
                    resolve();
                };
                reader.readAsDataURL(file);
            });
            
            await previewPromise;
            
            // Upload to S3
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed for ${file.name}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                productImages.push(data.url);
                console.log(`✅ Image ${startIndex + i + 1} uploaded:`, data.url);
                
                // Update the preview with actual S3 URL
                const previewItems = previewsContainer.querySelectorAll('.image-preview-item');
                const targetIndex = startIndex + i;
                if (previewItems[targetIndex]) {
                    previewItems[targetIndex].querySelector('img').src = data.url;
                }
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error(`Upload error for ${file.name}:`, error);
            alert(`Failed to upload ${file.name}: ${error.message}`);
        }
    }
    
    uploadBtn.textContent = '✓ Images Uploaded';
    setTimeout(() => {
        uploadBtn.textContent = originalText;
        uploadBtn.disabled = false;
    }, 1500);
    
    // Clear the file input so same files can be selected again if needed
    this.value = '';
    
    // Update previews with remove buttons
    updateImagePreviews();
});

// Add event listeners
document.getElementById('productImage').addEventListener('change', updateImagePreviews);
document.querySelectorAll('input[name="imageMethod"]').forEach(radio => {
    radio.addEventListener('change', toggleImageInputMethod);
});

// ============ CATEGORIES MANAGEMENT ============

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        
        const tbody = document.getElementById('categoriesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px;">No categories yet. Add your first category!</td></tr>';
            return;
        }
        
        // Count products per category
        const categoryCount = {};
        products.forEach(product => {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        });
        
        categories.forEach(category => {
            const row = document.createElement('tr');
            const count = categoryCount[category.name] || 0;
            
            row.innerHTML = `
                <td data-label="Category">${capitalizeFirst(category.name)}</td>
                <td data-label="Product Count">${count} product${count !== 1 ? 's' : ''}</td>
                <td data-label="Actions">
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editCategory('${category.id}', '${category.name}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="deleteCategory('${category.id}', '${category.name}', ${count})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        const tbody = document.getElementById('categoriesTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px; color: red;">Failed to load categories</td></tr>';
        }
    }
}

// Load categories into product form dropdown
async function loadCategoryDropdown() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        
        const select = document.getElementById('productCategory');
        if (!select) return;
        
        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select Category</option>';
        
        // Add categories from database
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = capitalizeFirst(category.name);
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading category dropdown:', error);
    }
}

// Open add category modal
function openAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = 'Add New Category';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryModal').style.display = 'block';
}

// Edit category
function editCategory(id, name) {
    document.getElementById('categoryModalTitle').textContent = 'Edit Category';
    document.getElementById('categoryId').value = id;
    document.getElementById('categoryName').value = name;
    document.getElementById('categoryModal').style.display = 'block';
}

// Delete category
async function deleteCategory(id, name, productCount) {
    if (productCount > 0) {
        if (!confirm(`This category "${name}" has ${productCount} product(s). Deleting it will NOT delete the products, but they will need to be assigned to a new category. Continue?`)) {
            return;
        }
    } else {
        if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
            return;
        }
    }
    
    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadCategories();
            alert('Category deleted successfully!');
        } else {
            throw new Error(data.error || 'Failed to delete');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category: ' + error.message);
    }
}

// Close category modal
function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    document.getElementById('categoryForm').reset();
}

// Category form submit
document.getElementById('categoryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value.trim().toLowerCase();
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }
    
    const categoryData = { name };
    
    try {
        if (id) {
            // Update existing category
            const response = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to update category');
            }
        } else {
            // Add new category
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to create category');
            }
        }
        
        await loadCategories();
        await loadProducts(); // Reload products to update category dropdown
        await loadCategoryDropdown(); // Reload dropdown in product form
        closeCategoryModal();
        alert('Category saved successfully!');
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Failed to save category: ' + error.message);
    }
});

// Update window.onclick to include category modal
const originalWindowClick = window.onclick;
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    const orderModal = document.getElementById('orderModal');
    const categoryModal = document.getElementById('categoryModal');
    const promoCodeModal = document.getElementById('promoCodeModal');
    if (event.target === modal) {
        closeModal();
    }
    if (event.target === orderModal) {
        closeOrderModal();
    }
    if (event.target === categoryModal) {
        closeCategoryModal();
    }
    if (event.target === promoCodeModal) {
        closePromoCodeModal();
    }
};

// ==================== PROMO CODES MANAGEMENT ====================

async function loadPromoCodes() {
    try {
        const response = await fetch('/api/promo-codes');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load promo codes');
        }
        
        const tbody = document.getElementById('promoCodesTableBody');
        
        if (data.promoCodes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No promo codes found</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.promoCodes.map(promo => {
            const discountDisplay = promo.discount_type === 'percentage' 
                ? `${promo.discount_value}%` 
                : `Rs ${promo.discount_value.toLocaleString('en-PK')}`;
            
            const usageDisplay = promo.usage_limit 
                ? `${promo.used_count || 0}/${promo.usage_limit}`
                : `${promo.used_count || 0}/∞`;
            
            const validUntil = promo.valid_until 
                ? new Date(promo.valid_until).toLocaleDateString('en-PK')
                : 'No expiry';
            
            const statusClass = promo.active ? 'status-active' : 'status-inactive';
            const statusText = promo.active ? 'Active' : 'Inactive';
            
            return `
                <tr>
                    <td><strong>${promo.code}</strong></td>
                    <td>${promo.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                    <td>${discountDisplay}</td>
                    <td>Rs ${promo.min_order_amount?.toLocaleString('en-PK') || 0}</td>
                    <td>${usageDisplay}</td>
                    <td>${validUntil}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td class="actions">
                        <button class="btn-edit" onclick="editPromoCode('${promo.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deletePromoCode('${promo.id}', '${promo.code}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading promo codes:', error);
        const tbody = document.getElementById('promoCodesTableBody');
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Failed to load promo codes</td></tr>';
    }
}

function openAddPromoModal() {
    document.getElementById('promoCodeModalTitle').textContent = 'Add Promo Code';
    document.getElementById('promoCodeForm').reset();
    document.getElementById('promoCodeId').value = '';
    
    // Set default values
    document.getElementById('minOrderAmount').value = '0';
    document.getElementById('promoActive').value = 'true';
    document.getElementById('discountType').value = 'percentage';
    toggleMaxDiscount();
    
    document.getElementById('promoCodeModal').classList.add('active');
}

function closePromoCodeModal() {
    document.getElementById('promoCodeModal').classList.remove('active');
    document.getElementById('promoCodeForm').reset();
}

function toggleMaxDiscount() {
    const discountType = document.getElementById('discountType').value;
    const maxDiscountGroup = document.getElementById('maxDiscountGroup');
    
    if (discountType === 'percentage') {
        maxDiscountGroup.style.display = 'block';
    } else {
        maxDiscountGroup.style.display = 'none';
        document.getElementById('maxDiscount').value = '';
    }
}

async function editPromoCode(promoId) {
    try {
        console.log('Editing promo code:', promoId);
        const response = await fetch('/api/promo-codes');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Failed to load promo codes');
        }
        
        console.log('Available promo codes:', data.promoCodes);
        const promo = data.promoCodes.find(p => p.id === promoId);
        
        if (!promo) {
            console.error('Promo code not found. Looking for:', promoId);
            console.error('Available IDs:', data.promoCodes.map(p => p.id));
            throw new Error('Promo code not found');
        }
        
        console.log('Found promo:', promo);
        
        // Populate form
        document.getElementById('promoCodeModalTitle').textContent = 'Edit Promo Code';
        document.getElementById('promoCodeId').value = promo.id;
        document.getElementById('promoCode').value = promo.code;
        document.getElementById('discountType').value = promo.discount_type;
        document.getElementById('discountValue').value = promo.discount_value;
        document.getElementById('minOrderAmount').value = promo.min_order_amount || 0;
        document.getElementById('maxDiscount').value = promo.max_discount || '';
        document.getElementById('usageLimit').value = promo.usage_limit || '';
        document.getElementById('promoActive').value = promo.active.toString();
        document.getElementById('promoDescription').value = promo.description || '';
        
        // Set dates if they exist
        if (promo.valid_from) {
            const validFrom = new Date(promo.valid_from);
            document.getElementById('validFrom').value = validFrom.toISOString().slice(0, 16);
        }
        
        if (promo.valid_until) {
            const validUntil = new Date(promo.valid_until);
            document.getElementById('validUntil').value = validUntil.toISOString().slice(0, 16);
        }
        
        toggleMaxDiscount();
        document.getElementById('promoCodeModal').classList.add('active');
        console.log('Modal should be open now');
    } catch (error) {
        console.error('Error loading promo code:', error);
        alert('Failed to load promo code: ' + error.message);
    }
}

async function deletePromoCode(promoId, promoCode) {
    if (!confirm(`Are you sure you want to delete the promo code "${promoCode}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/promo-codes/${promoId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to delete promo code');
        }
        
        alert('Promo code deleted successfully!');
        await loadPromoCodes();
    } catch (error) {
        console.error('Error deleting promo code:', error);
        alert('Failed to delete promo code: ' + error.message);
    }
}

// Promo Code Form Submit
document.getElementById('promoCodeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const promoId = document.getElementById('promoCodeId').value;
    const isEdit = !!promoId;
    
    const promoData = {
        code: document.getElementById('promoCode').value.toUpperCase(),
        discount_type: document.getElementById('discountType').value,
        discount_value: parseFloat(document.getElementById('discountValue').value),
        min_order_amount: parseFloat(document.getElementById('minOrderAmount').value) || 0,
        max_discount: document.getElementById('maxDiscount').value ? parseFloat(document.getElementById('maxDiscount').value) : null,
        usage_limit: document.getElementById('usageLimit').value ? parseInt(document.getElementById('usageLimit').value) : null,
        active: document.getElementById('promoActive').value === 'true',
        description: document.getElementById('promoDescription').value || null
    };
    
    // Handle dates
    const validFrom = document.getElementById('validFrom').value;
    const validUntil = document.getElementById('validUntil').value;
    
    if (validFrom) {
        promoData.valid_from = new Date(validFrom).toISOString();
    }
    
    if (validUntil) {
        promoData.valid_until = new Date(validUntil).toISOString();
    }
    
    try {
        const url = isEdit ? `/api/promo-codes/${promoId}` : '/api/promo-codes';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promoData)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to save promo code');
        }
        
        await loadPromoCodes();
        closePromoCodeModal();
        alert(isEdit ? 'Promo code updated successfully!' : 'Promo code created successfully!');
    } catch (error) {
        console.error('Error saving promo code:', error);
        alert('Failed to save promo code: ' + error.message);
    }
});
