// Shop Page Functionality
console.log('🏪 Shop.js loaded');
console.log('📦 Products available:', typeof products !== 'undefined' ? products.length : 'products not defined yet');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Shop page DOM loaded');
    console.log('📦 Products in DOM ready:', typeof products !== 'undefined' ? products.length : 'products not defined yet');
    
    // Check for category parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    console.log('🔗 URL category parameter:', categoryParam);
    
    let currentFilter = categoryParam || 'all';
    let currentSort = 'featured';
    
    // Set active filter button based on URL param
    if (categoryParam) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === categoryParam) {
                btn.classList.add('active');
            }
        });
    }
    
    // Render products
    function renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        let filteredProducts = products;
        
        // Apply filter
        if (currentFilter !== 'all') {
            console.log('🔍 Filtering by category:', currentFilter);
            filteredProducts = products.filter(p => {
                const productCategory = (p.category || '').toLowerCase().trim();
                const filterCategory = currentFilter.toLowerCase().trim();
                return productCategory === filterCategory;
            });
            console.log(`📦 Found ${filteredProducts.length} products in category "${currentFilter}"`);
        } else {
            console.log('📦 Showing all products:', products.length);
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
    
    // Filter functionality with event delegation
    const filtersContainer = document.querySelector('.filters');
    console.log('📂 Filters container found:', !!filtersContainer);
    
    if (filtersContainer) {
        filtersContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.filter-btn');
            if (btn) {
                console.log('🔘 Filter button clicked:', btn.dataset.category);
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.category;
                renderProducts();
            }
        });
    }
    
    // Backup: Direct event listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    console.log('🔘 Found filter buttons:', filterButtons.length);
    
    filterButtons.forEach(btn => {
        console.log('🔘 Attaching listener to button:', btn.dataset.category);
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔘 Filter button clicked (direct):', this.dataset.category);
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
        console.log('✅ Products loaded event received, rendering products...');
        renderProducts();
    });
    
    // If products are already loaded, render immediately
    if (products.length > 0) {
        console.log('✅ Products already loaded, rendering immediately...');
        renderProducts();
    } else {
        console.log('⏳ Waiting for products to load...');
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
        window.cart.addItem(product);
        
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
