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
function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${product.image}" class="product-image" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>${capitalizeFirst(product.category)}</td>
            <td>Rs ${product.price.toLocaleString('en-PK')}</td>
            <td>${product.badge ? `<span class="product-badge">${product.badge}</span>` : '-'}</td>
            <td>${product.featured ? '⭐ Yes' : 'No'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
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
    
    if (product.image && !product.image.startsWith('data:')) {
        document.getElementById('imagePreview').src = product.image;
        document.getElementById('imagePreview').style.display = 'block';
    } else if (product.image) {
        document.getElementById('imagePreview').src = product.image;
        document.getElementById('imagePreview').style.display = 'block';
    }
    
    document.getElementById('productModal').style.display = 'block';
}

// Delete product
function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products.splice(index, 1);
        saveProducts();
        loadProducts();
        alert('Product deleted successfully!');
    }
}

// Close modal
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
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
document.getElementById('productImageFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
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
        
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.src = event.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
});

// Product form submit
document.getElementById('productForm').addEventListener('submit', function(e) {
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
    } else {
        // Get image from file input preview (already converted to base64)
        const preview = document.getElementById('imagePreview');
        if (preview.src && preview.style.display !== 'none') {
            image = preview.src;
        }
    }
    
    // Generate placeholder if no image
    if (!image) {
        const encodedName = encodeURIComponent(name);
        image = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E${encodedName}%3C/text%3E%3C/svg%3E`;
    }
    
    if (id) {
        // Update existing product
        const product = products.find(p => p.id === parseInt(id));
        if (product) {
            product.name = name;
            product.category = category;
            product.price = price;
            product.description = description;
            product.image = image;
            product.badge = badge || undefined;
            product.featured = featured;
        }
    } else {
        // Add new product
        const newId = Math.max(...products.map(p => p.id)) + 1;
        products.push({
            id: newId,
            name,
            category,
            price,
            description,
            image,
            badge: badge || undefined,
            featured
        });
    }
    
    saveProducts();
    loadProducts();
    closeModal();
    alert('Product saved successfully!');
});

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('auraProducts', JSON.stringify(products));
}

// Load products from localStorage on init
function initProducts() {
    const saved = localStorage.getItem('auraProducts');
    if (saved) {
        // Replace the products array with saved data
        products.length = 0;
        products.push(...JSON.parse(saved));
    }
}

// Initialize
checkAuth();
initProducts();

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
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('auraOrders') || '[]');
    const tbody = document.getElementById('ordersTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No orders yet</td></tr>';
        return;
    }
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    orders.forEach((order, index) => {
        const row = document.createElement('tr');
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-PK') + ' ' + orderDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
        
        row.innerHTML = `
            <td><strong>${order.orderNumber}</strong></td>
            <td>${formattedDate}</td>
            <td>${order.shipping.fullName}<br><small>${order.shipping.email}</small></td>
            <td>${order.items.length} item(s)</td>
            <td>Rs ${order.total.toLocaleString('en-PK')}</td>
            <td><span class="order-status status-${order.status}">${capitalizeFirst(order.status)}</span></td>
            <td class="tracking-info">${order.tracking || '-'}</td>
            <td>
                <button class="btn-view-order" onclick="viewOrderDetails(${index})">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filter orders by status
function filterOrders() {
    const filterValue = document.getElementById('orderStatusFilter').value;
    const orders = JSON.parse(localStorage.getItem('auraOrders') || '[]');
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
    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredOrders.forEach((order, index) => {
        const originalIndex = orders.findIndex(o => o.orderNumber === order.orderNumber);
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-PK') + ' ' + orderDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${order.orderNumber}</strong></td>
            <td>${formattedDate}</td>
            <td>${order.shipping.fullName}<br><small>${order.shipping.email}</small></td>
            <td>${order.items.length} item(s)</td>
            <td>Rs ${order.total.toLocaleString('en-PK')}</td>
            <td><span class="order-status status-${order.status}">${capitalizeFirst(order.status)}</span></td>
            <td class="tracking-info">${order.tracking || '-'}</td>
            <td>
                <button class="btn-view-order" onclick="viewOrderDetails(${originalIndex})">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// View order details
function viewOrderDetails(orderIndex) {
    const orders = JSON.parse(localStorage.getItem('auraOrders') || '[]');
    const order = orders[orderIndex];
    
    if (!order) return;
    
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('en-PK', { dateStyle: 'long' }) + ' at ' + orderDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
    
    const content = document.getElementById('orderDetailsContent');
    content.innerHTML = `
        <div class="order-detail-section">
            <h3>Order Information</h3>
            <div class="order-detail-row">
                <span class="order-detail-label">Order Number:</span>
                <span><strong>${order.orderNumber}</strong></span>
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
            <form onsubmit="updateOrder(event, ${orderIndex})">
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
}

// Update order status and tracking
function updateOrder(event, orderIndex) {
    event.preventDefault();
    
    const orders = JSON.parse(localStorage.getItem('auraOrders') || '[]');
    const status = document.getElementById('orderStatus').value;
    const tracking = document.getElementById('trackingNumber').value;
    
    if (orders[orderIndex]) {
        orders[orderIndex].status = status;
        orders[orderIndex].tracking = tracking;
        
        localStorage.setItem('auraOrders', JSON.stringify(orders));
        
        alert('Order updated successfully!');
        closeOrderModal();
        loadOrders();
        
        // Apply current filter if any
        const filterValue = document.getElementById('orderStatusFilter').value;
        if (filterValue !== 'all') {
            filterOrders();
        }
    }
}

// Close order modal
function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}
