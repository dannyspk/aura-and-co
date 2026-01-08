// Shop Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    let currentFilter = 'all';
    let currentSort = 'featured';
    
    // Render products
    function renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        let filteredProducts = products;
        
        // Apply filter
        if (currentFilter !== 'all') {
            filteredProducts = products.filter(p => p.category === currentFilter);
        }
        
        // Apply sort
        filteredProducts = [...filteredProducts].sort((a, b) => {
            switch(currentSort) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'newest':
                    return b.id - a.id;
                case 'featured':
                default:
                    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
            }
        });
        
        // Render product cards
        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image" onclick="window.location.href='product-details.html?id=${product.id}'" style="cursor: pointer;">
                    <img src="${product.image}" alt="${product.name}">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name" onclick="window.location.href='product-details.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                    <div class="product-price">Rs ${product.price.toLocaleString('en-PK')}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id}, event)">
                        <i class="fas fa-shopping-bag"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add animation
        setTimeout(() => {
            document.querySelectorAll('.product-card').forEach((card, index) => {
                card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`;
                card.style.opacity = '0';
            });
        }, 10);
    }
    
    // Filter functionality
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            renderProducts();
        });
    });
    
    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            renderProducts();
        });
    }
    
    // Wait for products to load from API before initial render
    window.addEventListener('productsLoaded', function() {
        renderProducts();
    });
    
    // If products are already loaded, render immediately
    if (products.length > 0 && products[0].updatedAt) {
        renderProducts();
    }
});

// Add to cart function
function addToCart(productId, event) {
    // Prevent navigation to product details page
    if (event) {
        event.stopPropagation();
    }
    
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.addItem(product);
        
        // Visual feedback
        const btn = event ? event.target.closest('button') : null;
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Added!';
            btn.style.background = '#4CAF50';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 1500);
        }
    }
}

// Add fade in animation
if (!document.getElementById('product-animations')) {
    const style = document.createElement('style');
    style.id = 'product-animations';
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}
