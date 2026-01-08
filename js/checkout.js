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
        window.location.href = 'shop.html';
        return;
    }

    // Load order items from cart
    orderData.items = cart.items;
    
    // Display order summary
    displayOrderSummary();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup payment method toggle
    setupPaymentMethodToggle();
});

// Display order summary
function displayOrderSummary() {
    const checkoutItems = document.getElementById('checkoutItems');
    const subtotal = cart.getTotal();
    const shipping = subtotal >= 50000 ? 0 : 500; // Free shipping over Rs 50,000
    const tax = 0; // No tax display for Pakistan
    const total = subtotal + shipping + tax;
    
    // Render items
    checkoutItems.innerHTML = cart.items.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2780%27%3E%3Crect fill=%27%238B7355%27 width=%2780%27 height=%2780%27/%3E%3Ctext fill=%27%23ffffff%27 font-family=%27Arial%27 font-size=%2716%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EAura%3C/text%3E%3C/svg%3E'">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">Qty: ${item.quantity}</div>
            </div>
            <div class="item-price">Rs ${(item.price * item.quantity).toLocaleString('en-PK')}</div>
        </div>
    `).join('');
    
    // Update summary totals
    document.getElementById('summarySubtotal').textContent = `Rs ${subtotal.toLocaleString('en-PK')}`;
    document.getElementById('summaryShipping').textContent = shipping === 0 ? 'FREE' : `Rs ${shipping.toLocaleString('en-PK')}`;
    document.getElementById('summaryTax').textContent = `Rs ${tax.toLocaleString('en-PK')}`;
    document.getElementById('summaryTotal').textContent = `Rs ${total.toLocaleString('en-PK')}`;
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
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    let isValid = true;
    
    if (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') {
        const mobileNumber = document.getElementById('mobileNumber').value;
        const mobilePattern = /^03[0-9]{2}-[0-9]{7}$/;
        
        if (!mobilePattern.test(mobileNumber)) {
            document.getElementById('mobileNumber').classList.add('error');
            showNotification('Please enter a valid mobile number (03XX-XXXXXXX)', 'error');
            isValid = false;
        }
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
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentValue = paymentMethod ? paymentMethod.value : 'cod';
    
    let paymentLabel = 'Cash on Delivery';
    if (paymentValue === 'easypaisa') {
        paymentLabel = 'Easypaisa';
    } else if (paymentValue === 'jazzcash') {
        paymentLabel = 'JazzCash';
    }
    
    orderData.payment = {
        method: paymentValue,
        methodLabel: paymentLabel,
        mobileNumber: document.getElementById('mobileNumber')?.value || ''
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
    let paymentHtml = `<p><strong>${orderData.payment.methodLabel}</strong></p>`;
    if (orderData.payment.mobileNumber) {
        paymentHtml += `<p>Mobile: ${orderData.payment.mobileNumber}</p>`;
    }
    document.getElementById('reviewPayment').innerHTML = paymentHtml;
    
    // Order items
    document.getElementById('reviewItems').innerHTML = cart.items.map(item => `
        <div class="review-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2780%27%3E%3Crect fill=%27%238B7355%27 width=%2780%27 height=%2780%27/%3E%3Ctext fill=%27%23ffffff%27 font-family=%27Arial%27 font-size=%2716%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EAura%3C/text%3E%3C/svg%3E'">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-meta">Quantity: ${item.quantity} × Rs ${item.price.toLocaleString('en-PK')}</div>
            </div>
            <div class="item-total">Rs ${(item.price * item.quantity).toLocaleString('en-PK')}</div>
        </div>
    `).join('');
}

// Place order
async function placeOrder() {
    // Show loading state
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;
    
    // Simulate order processing
    setTimeout(async () => {
        // Generate order number
        const orderNumber = 'AUR' + Date.now().toString().slice(-8);
        
        // Prepare order data
        const order = {
            orderNumber: orderNumber,
            date: new Date().toISOString(),
            shipping: orderData.shipping,
            payment: orderData.payment,
            items: orderData.items,
            subtotal: cart.getTotal(),
            tax: 0,
            shippingCost: cart.getTotal() >= 50000 ? 0 : 500,
            total: cart.getTotal() + (cart.getTotal() >= 50000 ? 0 : 500),
            status: 'pending',
            tracking: ''
        };
        
        // Save order to API
        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Order saved to database:', data.order.orderId);
                
                // Save to last order (for confirmation page)
                localStorage.setItem('lastOrder', JSON.stringify(data.order));
                
                // Clear cart
                cart.clearCart();
                
                // Redirect to confirmation
                window.location.href = 'order-confirmation.html?order=' + orderNumber;
            } else {
                throw new Error(data.error || 'Failed to save order');
            }
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Failed to place order. Please try again.');
            // Re-enable the button
            const submitBtn = document.getElementById('placeOrderBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Place Order';
            }
        }
    }, 2000);
}

// Payment method toggle
function setupPaymentMethodToggle() {
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const mobileWalletSection = document.getElementById('mobileWalletSection');
    const mobileNumberInput = document.getElementById('mobileNumber');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'easypaisa' || this.value === 'jazzcash') {
                mobileWalletSection.classList.remove('hidden');
                mobileNumberInput.setAttribute('required', 'required');
            } else {
                mobileWalletSection.classList.add('hidden');
                mobileNumberInput.removeAttribute('required');
                mobileNumberInput.classList.remove('error');
            }
        });
    });
    
    // Format mobile number
    if (mobileNumberInput) {
        mobileNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) {
                value = value.slice(0, 4) + '-' + value.slice(4, 11);
            }
            e.target.value = value;
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
