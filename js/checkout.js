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
    
    // Load add-ons if applicable
    loadAddOns();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup payment method toggle
    setupPaymentMethodToggle();
    
    // Listen for city changes to update shipping
    const cityField = document.getElementById('city');
    if (cityField) {
        cityField.addEventListener('change', updateShippingCost);
    }
});

// ==================== ADD-ONS FUNCTIONALITY ====================

async function loadAddOns() {
    // Check if cart has any "customised jewellery" items (case-insensitive)
    const hasCustomJewellery = cart.items.some(item => {
        const category = item.category?.toLowerCase() || '';
        return category === 'customised jewellery' || category === 'custom jewellery';
    });
    
    if (!hasCustomJewellery) {
        document.getElementById('addOnsSection').style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch('/api/add-ons?applicable_to=customised jewellery');
        const data = await response.json();
        
        if (!data.success || !data.addOns || data.addOns.length === 0) {
            document.getElementById('addOnsSection').style.display = 'none';
            return;
        }
        
        // Filter only active add-ons with stock
        const activeAddOns = data.addOns.filter(addon => addon.active && addon.stock_quantity > 0);
        
        if (activeAddOns.length === 0) {
            document.getElementById('addOnsSection').style.display = 'none';
            return;
        }
        
        // Display add-ons
        displayAddOns(activeAddOns);
        document.getElementById('addOnsSection').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading add-ons:', error);
        document.getElementById('addOnsSection').style.display = 'none';
    }
}

function displayAddOns(addOns) {
    const addOnsList = document.getElementById('addOnsList');
    
    addOnsList.innerHTML = addOns.map(addon => {
        const imageHtml = addon.image_url 
            ? `<img src="${addon.image_url}" alt="${addon.name}" class="addon-image">`
            : `<div class="addon-image-placeholder"><i class="fas fa-gem"></i></div>`;
        
        const currentQty = selectedAddOns[addon.id]?.quantity || 0;
        
        return `
            <div class="addon-item" data-addon-id="${addon.id}">
                ${imageHtml}
                <div class="addon-details">
                    <div class="addon-name">${addon.name}</div>
                    ${addon.description ? `<div class="addon-description">${addon.description}</div>` : ''}
                    <div class="addon-price">Rs ${addon.price.toLocaleString('en-PK')}</div>
                    <div class="addon-stock-info">In stock: ${addon.stock_quantity}</div>
                </div>
                <div class="addon-quantity-control">
                    <button class="addon-qty-btn" onclick="changeAddonQuantity('${addon.id}', -1)" ${currentQty === 0 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <div class="addon-qty-display" id="addon-qty-${addon.id}">${currentQty}</div>
                    <button class="addon-qty-btn" onclick="changeAddonQuantity('${addon.id}', 1)" ${currentQty >= addon.stock_quantity ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function changeAddonQuantity(addonId, change) {
    // Get addon data
    const addonElement = document.querySelector(`[data-addon-id="${addonId}"]`);
    if (!addonElement) return;
    
    // Fetch current addon data from API (we need the full object)
    fetch(`/api/add-ons`)
        .then(res => res.json())
        .then(data => {
            const addon = data.addOns.find(a => a.id === addonId);
            if (!addon) return;
            
            // Calculate new quantity
            const currentQty = selectedAddOns[addonId]?.quantity || 0;
            const newQty = Math.max(0, Math.min(addon.stock_quantity, currentQty + change));
            
            if (newQty === 0) {
                // Remove from selection
                delete selectedAddOns[addonId];
            } else {
                // Update selection
                selectedAddOns[addonId] = {
                    addon: addon,
                    quantity: newQty
                };
            }
            
            // Update display
            document.getElementById(`addon-qty-${addonId}`).textContent = newQty;
            
            // Update buttons
            const minusBtn = addonElement.querySelector('.addon-qty-btn:first-of-type');
            const plusBtn = addonElement.querySelector('.addon-qty-btn:last-of-type');
            
            minusBtn.disabled = newQty === 0;
            plusBtn.disabled = newQty >= addon.stock_quantity;
            
            // Update order summary
            updateOrderSummary();
        })
        .catch(error => {
            console.error('Error updating addon quantity:', error);
        });
}

function getAddOnsTotal() {
    let total = 0;
    for (const addonId in selectedAddOns) {
        const { addon, quantity } = selectedAddOns[addonId];
        total += addon.price * quantity;
    }
    return total;
}

// Calculate shipping cost based on city
function calculateShipping(city = null) {
    const subtotal = cart.getTotal();
    
    // Free shipping over Rs 5,000
    if (subtotal >= 5000) {
        return 0;
    }
    
    // Default shipping for Karachi
    if (!city || city === 'Karachi') {
        return 250;
    }
    
    // Higher shipping for outside Karachi
    return 300;
}

// Update shipping cost when city changes
function updateShippingCost() {
    const city = document.getElementById('city')?.value;
    const subtotal = cart.getTotal();
    const shipping = calculateShipping(city);
    const tax = 0;
    const total = subtotal + shipping + tax;
    
    // Update summary
    document.getElementById('summaryShipping').textContent = shipping === 0 ? 'FREE' : `Rs ${shipping.toLocaleString('en-PK')}`;
    document.getElementById('summaryTotal').textContent = `Rs ${total.toLocaleString('en-PK')}`;
}

// Display order summary
function displayOrderSummary() {
    const checkoutItems = document.getElementById('checkoutItems');
    
    // Render items
    checkoutItems.innerHTML = cart.items.map(item => {
        let itemTotal = item.price * item.quantity;
        let addOnsHtml = '';
        
        // Display add-ons from cart item if any
        if (item.addOns && Array.isArray(item.addOns) && item.addOns.length > 0) {
            const addOnsTotal = item.addOns.reduce((sum, addon) => {
                return sum + (addon.price * addon.quantity);
            }, 0);
            itemTotal += addOnsTotal * item.quantity;
            
            addOnsHtml = `
                <div class="item-addons" style="margin-top: 5px; padding-left: 10px; border-left: 2px solid #c9a66b;">
                    <div style="font-size: 0.85rem; color: #7d6c4e; margin-bottom: 3px;">
                        <i class="fas fa-star"></i> Add-ons:
                    </div>
                    ${item.addOns.map(addon => `
                        <div style="font-size: 0.8rem; color: #666;">
                            ${addon.name} (${addon.quantity}x) - Rs ${(addon.price * addon.quantity).toLocaleString('en-PK')}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2780%27%3E%3Crect fill=%27%238B7355%27 width=%2780%27 height=%2780%27/%3E%3Ctext fill=%27%23ffffff%27 font-family=%27Arial%27 font-size=%2716%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EAura%3C/text%3E%3C/svg%3E'">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Qty: ${item.quantity}</div>
                    ${item.customRequest ? `<div class="item-custom-request"><i class="fas fa-edit"></i> ${item.customRequest}</div>` : ''}
                    ${addOnsHtml}
                </div>
                <div class="item-price">Rs ${itemTotal.toLocaleString('en-PK')}</div>
            </div>
        `;
    }).join('');
    
    // Update summary totals using the new function
    updateOrderSummary();
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
                ${item.customRequest ? `<div class="item-custom-note"><i class="fas fa-edit"></i> ${item.customRequest}</div>` : ''}
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
        const subtotal = cart.getTotal(); // This now includes add-ons from cart items
        const shipping = calculateShipping(orderData.shipping.city);
        const discount = appliedPromo ? appliedPromo.discount : 0;
        const total = subtotal + shipping - discount;
        
        // Collect all add-ons from cart items
        const addOnsArray = [];
        cart.items.forEach(item => {
            if (item.addOns && Array.isArray(item.addOns)) {
                item.addOns.forEach(addon => {
                    // Multiply addon quantity by product quantity
                    addOnsArray.push({
                        id: addon.id,
                        name: addon.name,
                        price: addon.price,
                        quantity: addon.quantity * item.quantity,
                        total: addon.price * addon.quantity * item.quantity
                    });
                });
            }
        });
        
        const order = {
            order_number: orderNumber,
            customer_name: `${orderData.shipping.firstName} ${orderData.shipping.lastName}`,
            customer_email: orderData.shipping.email,
            customer_phone: orderData.shipping.phone,
            shipping_address: orderData.shipping,
            items: orderData.items,
            add_ons: addOnsArray,
            subtotal: subtotal,
            shipping: shipping,
            tax: 0,
            discount: discount,
            promo_code: appliedPromo ? appliedPromo.code : null,
            total: total,
            payment_method: orderData.payment.method,
            status: 'pending'
        };
        
        // Save order to API
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Order saved to database:', data.order);
                
                // Save to last order (for confirmation page)
                localStorage.setItem('lastOrder', JSON.stringify(data.order));
                
                // Clear cart
                cart.clearCart();
                
                // Redirect to confirmation
                window.location.href = '/order-confirmation?order=' + orderNumber;
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

// Promo Code Functionality
let appliedPromo = null;
let selectedAddOns = {}; // Store selected add-ons with quantities { addonId: { addon: object, quantity: number } }

document.addEventListener('DOMContentLoaded', function() {
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const promoInput = document.getElementById('promoCodeInput');
    
    if (applyPromoBtn && promoInput) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyPromoCode();
            }
        });
    }
});

async function applyPromoCode() {
    const promoInput = document.getElementById('promoCodeInput');
    const promoMessage = document.getElementById('promoMessage');
    const applyBtn = document.getElementById('applyPromoBtn');
    
    const code = promoInput.value.trim().toUpperCase();
    
    if (!code) {
        showPromoMessage('Please enter a promo code', 'error');
        return;
    }
    
    // Disable button while processing
    applyBtn.disabled = true;
    applyBtn.textContent = 'Applying...';
    
    try {
        const subtotal = cart.getTotal();
        const response = await fetch('/api/promo-codes/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, orderAmount: subtotal })
        });
        
        const data = await response.json();
        
        if (response.ok && data.valid) {
            appliedPromo = data;
            showPromoMessage(
                `<i class="fas fa-check-circle"></i> ${data.description || 'Promo code applied!'} - You save Rs ${data.discount.toLocaleString('en-PK')}`,
                'success'
            );
            updateOrderSummary();
            applyBtn.textContent = 'Applied';
        } else {
            appliedPromo = null;
            showPromoMessage(
                `<i class="fas fa-times-circle"></i> ${data.error || 'Invalid promo code'}`,
                'error'
            );
            applyBtn.textContent = 'Apply';
            applyBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error applying promo code:', error);
        showPromoMessage(
            '<i class="fas fa-times-circle"></i> Failed to apply promo code. Please try again.',
            'error'
        );
        applyBtn.textContent = 'Apply';
        applyBtn.disabled = false;
    }
}

function showPromoMessage(message, type) {
    const promoMessage = document.getElementById('promoMessage');
    promoMessage.innerHTML = message;
    promoMessage.className = `promo-message ${type}`;
}

function updateOrderSummary() {
    const subtotal = cart.getTotal(); // Now includes add-ons from cart items
    const city = document.getElementById('city')?.value;
    const shipping = calculateShipping(city);
    const discount = appliedPromo ? appliedPromo.discount : 0;
    const tax = 0;
    const total = subtotal + shipping - discount + tax;
    
    document.getElementById('summarySubtotal').textContent = `Rs ${subtotal.toLocaleString('en-PK')}`;
    
    // Remove old add-ons row if exists (no longer needed as add-ons are in subtotal)
    const existingAddOnsRow = document.querySelector('.summary-row-addons');
    if (existingAddOnsRow) {
        existingAddOnsRow.remove();
    }
    
    document.getElementById('summaryShipping').textContent = shipping === 0 ? 'FREE' : `Rs ${shipping.toLocaleString('en-PK')}`;
    document.getElementById('summaryTax').textContent = `Rs ${tax.toLocaleString('en-PK')}`;
    document.getElementById('summaryTotal').textContent = `Rs ${total.toLocaleString('en-PK')}`;
    
    // Show/hide discount row
    const discountRow = document.getElementById('discountRow');
    if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('summaryDiscount').textContent = `-Rs ${discount.toLocaleString('en-PK')}`;
        document.getElementById('promoCodeLabel').textContent = `(${appliedPromo.code})`;
    } else {
        discountRow.style.display = 'none';
    }
}

