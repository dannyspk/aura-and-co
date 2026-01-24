// Order Confirmation Page
document.addEventListener('DOMContentLoaded', function() {
    // Get order number from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');
    
    // Retrieve order from localStorage
    const orderData = JSON.parse(localStorage.getItem('lastOrder') || '{}');
    
    if (!orderNumber || (!orderData.order_number && !orderData.orderNumber)) {
        // No order found, redirect to shop
        window.location.href = '/shop';
        return;
    }
    
    // Display order information
    displayOrderConfirmation(orderData);
});

function displayOrderConfirmation(order) {
    // Support both camelCase and snake_case formats
    const orderNumber = order.order_number || order.orderNumber;
    const shippingAddress = order.shipping_address || order.shipping;
    const shippingCost = order.shipping || 0;
    const subtotal = order.subtotal || 0;
    const tax = order.tax || 0;
    const total = order.total || 0;
    
    // Order number
    document.getElementById('orderNumber').textContent = orderNumber;
    
    // Customer email
    document.getElementById('customerEmail').textContent = shippingAddress.email;
    
    // Order items
    const orderItemsContainer = document.getElementById('orderItems');
    orderItemsContainer.innerHTML = order.items.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2780%27%3E%3Crect fill=%27%238B7355%27 width=%2780%27 height=%2780%27/%3E%3Ctext fill=%27%23ffffff%27 font-family=%27Arial%27 font-size=%2716%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EAura%3C/text%3E%3C/svg%3E'">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">Quantity: ${item.quantity}</div>
                ${item.customRequest ? `<div class="item-custom-note"><i class="fas fa-edit"></i> ${item.customRequest}</div>` : ''}
            </div>
            <div class="item-price">Rs ${(item.price * item.quantity).toLocaleString('en-PK')}</div>
        </div>
    `).join('');
    
    // Order totals
    document.getElementById('orderSubtotal').textContent = `Rs ${subtotal.toLocaleString('en-PK')}`;
    document.getElementById('orderShipping').textContent = shippingCost === 0 ? 'FREE' : `Rs ${shippingCost.toLocaleString('en-PK')}`;
    document.getElementById('orderTax').textContent = `Rs ${tax.toLocaleString('en-PK')}`;
    document.getElementById('orderTotal').textContent = `Rs ${total.toLocaleString('en-PK')}`;
    
    // Shipping address
    const shippingDiv = document.getElementById('shippingAddress');
    shippingDiv.innerHTML = `
        <p><strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong></p>
        <p>${shippingAddress.address}</p>
        <p>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
        <p>${shippingAddress.country}</p>
        <p>Email: ${shippingAddress.email}</p>
        <p>Phone: ${shippingAddress.phone}</p>
    `;
}
