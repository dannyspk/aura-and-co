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
    loadProducts();
    loadOrders();
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
            
            // Create cells
            const cellId = document.createElement('td');
            cellId.textContent = product.id;
            
            const cellImage = document.createElement('td');
            const img = document.createElement('img');
            img.src = product.image || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27%3E%3Crect fill=%27%23ddd%27 width=%2760%27 height=%2760%27/%3E%3C/svg%3E';
            img.alt = product.name;
            img.className = 'product-image';
            img.setAttribute('width', '60');
            img.setAttribute('height', '60');
            img.style.cssText = 'width: 60px !important; height: 60px !important; min-width: 60px !important; min-height: 60px !important; display: block !important; object-fit: contain !important; background: #f5f5f5; border-radius: 8px; border: 2px solid #ddd;';
            cellImage.appendChild(img);
            
            const cellName = document.createElement('td');
            cellName.textContent = product.name;
            
            const cellCategory = document.createElement('td');
            cellCategory.textContent = capitalizeFirst(product.category);
            
            const cellPrice = document.createElement('td');
            cellPrice.textContent = `Rs ${product.price.toLocaleString('en-PK')}`;
            
            const cellBadge = document.createElement('td');
            if (product.badge) {
                const badge = document.createElement('span');
                badge.className = 'product-badge';
                badge.textContent = product.badge;
                cellBadge.appendChild(badge);
            } else {
                cellBadge.textContent = '-';
            }
            
            const cellFeatured = document.createElement('td');
            cellFeatured.textContent = product.featured ? '⭐ Yes' : 'No';
            
            const cellActions = document.createElement('td');
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
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('productModal').style.display = 'block';
    
    // Reset to URL method by default
    document.querySelector('input[name="imageMethod"][value="url"]').checked = true;
    toggleImageInputMethod();
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
    document.getElementById('productImage').value = product.image.startsWith('data:') ? '' : product.image;
    document.getElementById('productBadge').value = product.badge || '';
    document.getElementById('productFeatured').checked = product.featured || false;
    
    // Show URL method by default for editing
    document.querySelector('input[name="imageMethod"][value="url"]').checked = true;
    toggleImageInputMethod();
    
    const preview = document.getElementById('imagePreview');
    if (product.image && !product.image.startsWith('data:')) {
        preview.src = product.image;
        preview.style.display = 'block';
        // If it's an S3 URL, store it in the dataset
        if (product.image.includes('s3.amazonaws.com')) {
            preview.dataset.s3Url = product.image;
        }
    } else if (product.image) {
        preview.src = product.image;
        preview.style.display = 'block';
    }
    
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
    const preview = document.getElementById('imagePreview');
    preview.style.display = 'none';
    preview.src = '';
    preview.dataset.s3Url = '';
}

// Image preview
document.getElementById('productImage').addEventListener('input', function() {
    const url = this.value;
    const preview = document.getElementById('imagePreview');
    
    if (url) {
        preview.src = url;
        preview.style.display = 'block';
        preview.onerror = function() {
            this.style.display = 'none';
        };
    } else {
        preview.style.display = 'none';
    }
});

// Toggle between URL and file upload
function toggleImageInputMethod() {
    const method = document.querySelector('input[name="imageMethod"]:checked').value;
    const urlInput = document.getElementById('productImage');
    const fileInput = document.getElementById('productImageFile');
    const preview = document.getElementById('imagePreview');
    
    if (method === 'url') {
        urlInput.style.display = 'block';
        fileInput.style.display = 'none';
        fileInput.value = '';
    } else {
        urlInput.style.display = 'none';
        fileInput.style.display = 'block';
        urlInput.value = '';
        preview.style.display = 'none';
    }
}

// Add event listeners for radio buttons
document.querySelectorAll('input[name="imageMethod"]').forEach(radio => {
    radio.addEventListener('change', toggleImageInputMethod);
});

// Handle file upload and convert to base64
document.getElementById('productImageFile').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            this.value = '';
            preview.style.display = 'none';
            return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            this.value = '';
            preview.style.display = 'none';
            return;
        }
        
        // Upload to S3
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            // Show uploading indicator
            const uploadBtn = document.querySelector('#productForm button[type="submit"]');
            const originalText = uploadBtn.textContent;
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Uploading to S3...';
            
            // Show temporary preview while uploading
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Store the S3 URL for form submission
                preview.dataset.s3Url = data.url;
                // Update preview to show S3 image
                preview.src = data.url;
                console.log('✅ Image uploaded to S3:', data.url);
                uploadBtn.textContent = '✓ Image Uploaded';
                setTimeout(() => {
                    uploadBtn.textContent = originalText;
                    uploadBtn.disabled = false;
                }, 1500);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image to S3: ' + error.message);
            this.value = '';
            preview.style.display = 'none';
            const uploadBtn = document.querySelector('#productForm button[type="submit"]');
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Add Product';
        }
    } else {
        preview.style.display = 'none';
        preview.dataset.s3Url = '';
    }
});

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
    
    // Get image based on selected method
    const imageMethod = document.querySelector('input[name="imageMethod"]:checked').value;
    let image = '';
    
    if (imageMethod === 'url') {
        image = document.getElementById('productImage').value;
        if (!image) {
            alert('Please enter an image URL');
            return;
        }
    } else {
        // Get S3 URL from uploaded image
        const preview = document.getElementById('imagePreview');
        if (preview.dataset.s3Url) {
            image = preview.dataset.s3Url;
            console.log('Using S3 URL:', image);
        } else if (preview.src && preview.style.display !== 'none' && !preview.src.startsWith('data:')) {
            // Use existing image URL (for editing products)
            image = preview.src;
        } else {
            alert('Please upload an image or wait for the upload to complete');
            return;
        }
    }
    
    // Generate placeholder if no image
    if (!image) {
        const encodedName = encodeURIComponent(name);
        image = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E${encodedName}%3C/text%3E%3C/svg%3E`;
    }
    
    const productData = {
        name,
        category,
        price,
        description,
        image,
        badge: badge || undefined,
        featured
    };
    
    try {
        if (id) {
            // Update existing product
            console.log('Updating product:', { id, name, image });
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to update product');
            }
        } else {
            // Add new product
            console.log('Adding new product:', { name, image });
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
    }
}

// Load orders into table
async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        
        const tbody = document.getElementById('ordersTableBody');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No orders yet</td></tr>';
            return;
        }
        
        // Sort orders by date (newest first)
        orders.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        
        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.date || order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('en-PK') + ' ' + orderDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
            
            row.innerHTML = `
                <td><strong>${order.orderNumber || order.orderId}</strong></td>
                <td>${formattedDate}</td>
                <td>${order.shipping.fullName}<br><small>${order.shipping.email}</small></td>
                <td>${order.items.length} item(s)</td>
                <td>Rs ${order.total.toLocaleString('en-PK')}</td>
                <td><span class="order-status status-${order.status}">${capitalizeFirst(order.status)}</span></td>
                <td class="tracking-info">${order.tracking || '-'}</td>
                <td>
                    <button class="btn-view-order" onclick="viewOrderDetails('${order.orderId || order.orderNumber}')">
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
                <td><strong>${order.orderNumber || order.orderId}</strong></td>
                <td>${formattedDate}</td>
                <td>${order.shipping.fullName}<br><small>${order.shipping.email}</small></td>
                <td>${order.items.length} item(s)</td>
                <td>Rs ${order.total.toLocaleString('en-PK')}</td>
                <td><span class="order-status status-${order.status}">${capitalizeFirst(order.status)}</span></td>
                <td class="tracking-info">${order.tracking || '-'}</td>
                <td>
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
        const order = orders.find(o => (o.orderId || o.orderNumber) === orderId);
        
        if (!order) {
            alert('Order not found');
            return;
        }
        
        const orderDate = new Date(order.date || order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('en-PK', { dateStyle: 'long' }) + ' at ' + orderDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
        
        const content = document.getElementById('orderDetailsContent');
        content.innerHTML = `
            <div class="order-detail-section">
                <h3>Order Information</h3>
                <div class="order-detail-row">
                    <span class="order-detail-label">Order Number:</span>
                    <span><strong>${order.orderNumber || order.orderId}</strong></span>
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
                    <span>${order.shipping.fullName}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Email:</span>
                    <span>${order.shipping.email}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Phone:</span>
                    <span>${order.shipping.phone}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Address:</span>
                    <span>${order.shipping.address}, ${order.shipping.city}, ${order.shipping.postalCode}</span>
                </div>
            </div>

            <div class="order-detail-section">
                <h3>Order Items</h3>
                <ul class="order-items-list">
                    ${order.items.map(item => `
                        <li class="order-item">
                            <span>${item.name} × ${item.quantity}</span>
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
                    <span>Rs ${order.shippingCost.toLocaleString('en-PK')}</span>
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
                    <span>${order.payment.method === 'cod' ? 'Cash on Delivery' : 
                           order.payment.method === 'easypaisa' ? 'Easypaisa' : 
                           order.payment.method === 'jazzcash' ? 'JazzCash' : 
                           order.payment.method}</span>
                </div>
                ${order.payment.mobileNumber ? `
                    <div class="order-detail-row">
                        <span class="order-detail-label">Mobile Number:</span>
                        <span>${order.payment.mobileNumber}</span>
                    </div>
                ` : ''}
            </div>

            <div class="order-update-form">
                <h3>Update Order</h3>
                <form onsubmit="updateOrder(event, '${order.orderId || order.orderNumber}')">
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
