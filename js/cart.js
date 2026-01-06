// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        // Note: updateCartUI() should be called manually after DOM is ready
    }

    // Load cart from localStorage
    loadCart() {
        const saved = localStorage.getItem('auraCart');
        return saved ? JSON.parse(saved) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('auraCart', JSON.stringify(this.items));
        this.updateCartUI();
    }

    // Add item to cart
    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity: quantity
            });
        }
        
        localStorage.setItem('auraCart', JSON.stringify(this.items));
        this.updateCartCount();
        this.updateCartTotal();
        
        // Only re-render cart items if cart sidebar is open
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            this.renderCartItems();
        }
        
        this.showNotification(`${product.name} added to cart!`);
        return true;
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        
        if (item && quantity > 0) {
            item.quantity = quantity;
            localStorage.setItem('auraCart', JSON.stringify(this.items));
            
            // Update only the specific item's quantity display and price
            const quantitySpan = document.querySelector(`.cart-item[data-product-id="${productId}"] .cart-item-quantity span`);
            if (quantitySpan) {
                quantitySpan.textContent = quantity;
            }
            
            // Update the item's subtotal if displayed
            const itemSubtotal = document.querySelector(`.cart-item[data-product-id="${productId}"] .item-subtotal`);
            if (itemSubtotal) {
                itemSubtotal.textContent = `$${(item.price * quantity).toLocaleString()}`;
            }
            
            this.updateCartCount();
            this.updateCartTotal();
        } else if (item && quantity <= 0) {
            // If quantity becomes 0 or negative, remove the item
            this.removeItem(productId);
        }
    }

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        localStorage.setItem('auraCart', JSON.stringify(this.items));
        
        // Smoothly remove the item element
        const itemElement = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
        if (itemElement) {
            itemElement.style.transition = 'opacity 0.3s, transform 0.3s';
            itemElement.style.opacity = '0';
            itemElement.style.transform = 'translateX(100px)';
            setTimeout(() => {
                this.renderCartItems();
                this.updateCartCount();
                this.updateCartTotal();
            }, 300);
        } else {
            this.renderCartItems();
            this.updateCartCount();
            this.updateCartTotal();
        }
    }

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get cart count
    getCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Clear cart
    clearCart() {
        this.items = [];
        localStorage.setItem('auraCart', JSON.stringify(this.items));
        this.updateCartCount();
        this.renderCartItems();
        this.updateCartTotal();
    }

    // Update cart UI (only call when needed, not on every change)
    updateCartUI() {
        this.updateCartCount();
        this.updateCartTotal();
        
        // Only render items if cart sidebar exists and is open
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar) {
            this.renderCartItems();
        }
    }

    // Update cart count badge
    updateCartCount() {
        const countElement = document.querySelector('.cart-count');
        if (countElement) {
            const count = this.getCount();
            countElement.textContent = count;
            
            // Hide badge if count is 0
            if (count === 0) {
                countElement.style.display = 'none';
            } else {
                countElement.style.display = 'flex';
            }
        }
    }

    // Render cart items
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 0; color: #999;">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Rs ${item.price.toLocaleString('en-PK')}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item-btn" onclick="cart.removeItem(${item.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Update cart total
    updateCartTotal() {
        const totalElement = document.getElementById('cartTotal');
        if (totalElement) {
            const total = this.getTotal();
            totalElement.textContent = `Rs ${total.toLocaleString('en-PK')}`;
        }
    }

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 30px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Add animation styles
if (!document.getElementById('cart-animations')) {
    const style = document.createElement('style');
    style.id = 'cart-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize cart
const cart = new ShoppingCart();

// Toggle cart sidebar
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    if (sidebar && overlay) {
        const isOpening = !sidebar.classList.contains('open');
        
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        
        // Render cart items when opening
        if (isOpening) {
            cart.renderCartItems();
        }
    }
}

// Go to checkout
function goToCheckout() {
    if (cart.items.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    window.location.href = 'checkout.html';
}

// Export cart for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingCart;
}
