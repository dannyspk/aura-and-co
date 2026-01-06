// Order Confirmation Page
document.addEventListener('DOMContentLoaded', function() {
    // Get order number from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');
    
    // Retrieve order from localStorage
    const orderData = JSON.parse(localStorage.getItem('lastOrder') || '{}');
    
    if (!orderNumber || !orderData.orderNumber) {
        // No order found, redirect to shop
        window.location.href = '/shop';
        return;
    }
    
    // Display order information
    displayOrderConfirmation(orderData);
});

function displayOrderConfirmation(order) {
    // Order number
    document.getElementById('orderNumber').textContent = order.orderNumber;
    
    // Customer email
    document.getElementById('customerEmail').textContent = order.shipping.email;
    
    // Order items
    const orderItemsContainer = document.getElementById('orderItems');
    orderItemsContainer.innerHTML = order.items.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80/8B7355/ffffff?text=Aura'">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">Quantity: ${item.quantity}</div>
            </div>
            <div class="item-price">$${(item.price * item.quantity).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>
    `).join('');
    
    // Order totals
    document.getElementById('orderSubtotal').textContent = `$${order.subtotal.toFixed(2)}`;
    document.getElementById('orderShipping').textContent = order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`;
    document.getElementById('orderTax').textContent = `$${order.tax.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${order.total.toFixed(2)}`;
    
    // Shipping address
    const shippingDiv = document.getElementById('shippingAddress');
    shippingDiv.innerHTML = `
        <p><strong>${order.shipping.firstName} ${order.shipping.lastName}</strong></p>
        <p>${order.shipping.address}</p>
        <p>${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}</p>
        <p>${order.shipping.country}</p>
        <p>Email: ${order.shipping.email}</p>
        <p>Phone: ${order.shipping.phone}</p>
    `;
}
