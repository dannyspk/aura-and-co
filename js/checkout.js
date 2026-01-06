// Checkout Page Functionality
let currentStep = 1;
let orderData = {
    shipping: {},
    payment: {},
    items: []
};

document.addEventListener('DOMContentLoaded', function() {
    // Check if cart is empty
    if (cart.getCount() === 0) {
        window.location.href = '/shop';
        return;
    }

    // Load order items from cart
    orderData.items = cart.items;
    
    // Display order summary
    displayOrderSummary();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup card formatting
    setupCardFormatting();
});

// Display order summary
function displayOrderSummary() {
    const checkoutItems = document.getElementById('checkoutItems');
    const subtotal = cart.getTotal();
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    // Render items
    checkoutItems.innerHTML = cart.items.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80/8B7355/ffffff?text=Aura'">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">Qty: ${item.quantity}</div>
            </div>
            <div class="item-price">$${(item.price * item.quantity).toLocaleString()}</div>
        </div>
    `).join('');
    
    // Update summary totals
    document.getElementById('summarySubtotal').textContent = `$${subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('summaryShipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
}

// Navigation functions
function goToShipping() {
    showSection('shippingSection', 1);
}

function goToPayment() {
    if (currentStep === 1) {
        if (validateShippingForm()) {
            saveShippingData();
            showSection('paymentSection', 2);
        }
    } else {
        showSection('paymentSection', 2);
    }
}

function goToReview() {
    if (validatePaymentForm()) {
        savePaymentData();
        displayReview();
        showSection('reviewSection', 3);
    }
}

// Show section
function showSection(sectionId, step) {
    // Hide all sections
    document.querySelectorAll('.checkout-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.remove('hidden');
    
    // Update step indicators
    updateStepIndicators(step);
    currentStep = step;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update step indicators
function updateStepIndicators(activeStep) {
    const steps = document.querySelectorAll('.checkout-steps .step');
    steps.forEach((step, index) => {
        if (index + 1 <= activeStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Form validation
function setupFormValidation() {
    // Real-time validation
    document.querySelectorAll('input[required], select[required]').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

function validateField(field) {
    if (!field.value.trim()) {
        field.classList.add('error');
        return false;
    } else {
        field.classList.remove('error');
        return true;
    }
}

function validateShippingForm() {
    const form = document.getElementById('shippingForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

function validatePaymentForm() {
    const form = document.getElementById('paymentForm');
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;
    
    let isValid = true;
    
    // Validate card number (basic check)
    if (cardNumber.length < 15 || cardNumber.length > 16) {
        document.getElementById('cardNumber').classList.add('error');
        isValid = false;
    }
    
    // Validate expiry (MM/YY format)
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        document.getElementById('expiry').classList.add('error');
        isValid = false;
    }
    
    // Validate CVV
    if (cvv.length < 3 || cvv.length > 4) {
        document.getElementById('cvv').classList.add('error');
        isValid = false;
    }
    
    if (!isValid) {
        showNotification('Please check your payment details', 'error');
    }
    
    return isValid;
}

// Save form data
function saveShippingData() {
    const form = document.getElementById('shippingForm');
    const formData = new FormData(form);
    
    orderData.shipping = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country')
    };
}

function savePaymentData() {
    const cardNumber = document.getElementById('cardNumber').value;
    const lastFour = cardNumber.slice(-4);
    
    orderData.payment = {
        cardLast4: lastFour,
        cardName: document.getElementById('cardName').value
    };
}

// Display review
function displayReview() {
    // Shipping info
    const shipping = orderData.shipping;
    document.getElementById('reviewShipping').innerHTML = `
        <p><strong>${shipping.firstName} ${shipping.lastName}</strong></p>
        <p>${shipping.address}</p>
        <p>${shipping.city}, ${shipping.state} ${shipping.zipCode}</p>
        <p>${shipping.country}</p>
        <p>Email: ${shipping.email}</p>
        <p>Phone: ${shipping.phone}</p>
    `;
    
    // Payment info
    document.getElementById('reviewPayment').innerHTML = `
        <p><strong>${orderData.payment.cardName}</strong></p>
        <p>Card ending in •••• ${orderData.payment.cardLast4}</p>
    `;
    
    // Order items
    document.getElementById('reviewItems').innerHTML = cart.items.map(item => `
        <div class="review-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80/8B7355/ffffff?text=Aura'">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-meta">Quantity: ${item.quantity} × $${item.price.toLocaleString()}</div>
            </div>
            <div class="item-total">$${(item.price * item.quantity).toLocaleString()}</div>
        </div>
    `).join('');
}

// Place order
function placeOrder() {
    // Show loading state
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;
    
    // Simulate order processing
    setTimeout(() => {
        // Generate order number
        const orderNumber = 'AUR' + Date.now().toString().slice(-8);
        
        // Save order to localStorage
        const order = {
            orderNumber: orderNumber,
            date: new Date().toISOString(),
            shipping: orderData.shipping,
            payment: orderData.payment,
            items: orderData.items,
            subtotal: cart.getTotal(),
            tax: cart.getTotal() * 0.08,
            shipping: 0,
            total: cart.getTotal() * 1.08
        };
        
        localStorage.setItem('lastOrder', JSON.stringify(order));
        
        // Clear cart
        cart.clearCart();
        
        // Redirect to confirmation
        window.location.href = '/order-confirmation?order=' + orderNumber;
    }, 2000);
}

// Card formatting
function setupCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    const expiry = document.getElementById('expiry');
    const cvv = document.getElementById('cvv');
    
    // Format card number
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Format expiry
    if (expiry) {
        expiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV numbers only
    if (cvv) {
        cvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

// Notification helper
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
