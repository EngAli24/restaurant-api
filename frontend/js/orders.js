const API_URL = '/api';

const STATUS_FLOW = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
const STATUS_ARABIC = {
    'Pending': 'قيد الانتظار',
    'Preparing': 'جاري التحضير',
    'Out for Delivery': 'في الطريق',
    'Delivered': 'تم التوصيل'
};

async function checkAdminAccess() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, { credentials: 'include' });
        if (!response.ok) { window.location.href = '/login'; return; }
        const user = await response.json();
        if (user.role !== 'admin') { window.location.href = '/'; }
    } catch (error) {
        window.location.href = '/login';
    }
}
checkAdminAccess();

async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`, { credentials: 'include' });
        const orders = await response.json();
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';
        
        if(orders.length === 0) {
            ordersList.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد طلبات حالياً</td></tr>';
            return;
        }

        orders.forEach(order => {
            const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
            const isDelivered = order.status === 'Delivered';
            const shortId = order._id.substring(order._id.length - 6).toUpperCase();

            // 💡 عرض تفاصيل الوجبات والأحجام المطلوبة
            let itemsDetails = '<ul style="list-style:none; padding:0; margin:5px 0 0 0; font-size:0.85em; color:#444; background:#f1f2f6; border-radius:5px; padding:5px;">';
            if (order.orderItems && order.orderItems.length > 0) {
                order.orderItems.forEach(i => {
                    const sizeLabel = i.size && i.size !== 'عادي' ? `<span style="color:#e67e22; font-weight:bold;">(${i.size})</span>` : '';
                    itemsDetails += `<li style="margin-bottom: 3px;">🍔 ${i.quantity}x ${i.name} ${sizeLabel}</li>`;
                });
            } else {
                itemsDetails += '<li>لا توجد تفاصيل</li>';
            }
            itemsDetails += '</ul>';

            let optionsHtml = '';
            STATUS_FLOW.forEach((status, idx) => {
                const disabled = idx < currentStatusIndex ? 'disabled' : '';
                const selected = idx === currentStatusIndex ? 'selected' : '';
                optionsHtml += `<option value="${status}" ${disabled} ${selected}>${STATUS_ARABIC[status]}</option>`;
            });

            const selectDisabled = isDelivered ? 'disabled' : '';
            const actionButton = isDelivered 
                ? `<button class="locked-btn" disabled style="background:#95a5a6; color:#fff; border:none; padding:5px 10px; border-radius:5px;">مكتمل ✔️</button>` 
                : `<button class="update-btn" onclick="updateOrderStatus('${order._id}')">تحديث</button>`;

            ordersList.innerHTML += `
                <tr style="background-color: ${isDelivered ? '#f9f9f9' : 'white'}; opacity: ${isDelivered ? '0.8' : '1'};">
                    <td style="font-family: monospace; font-weight: bold; text-align: right;" dir="ltr">#${shortId}</td>
                    <td>
                        <strong>${order.customerName}</strong><br>
                        <span style="color: #777; font-size: 0.9em;" dir="ltr">${order.customerPhone}</span>
                        ${itemsDetails} </td>
                    <td>${order.shippingAddress}</td>
                    <td style="font-weight: bold; color: var(--primary-color);">${order.totalPrice} ج.م</td>
                    <td><select id="status-${order._id}" class="status-select" ${selectDisabled}>${optionsHtml}</select></td>
                    <td>${actionButton}</td>
                </tr>
            `;
        });
    } catch (error) { console.error('خطأ في جلب الطلبات:', error); }
}

async function updateOrderStatus(orderId) {
    const newStatus = document.getElementById(`status-${orderId}`).value;
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
            credentials: 'include'
        });
        
        if (response.ok) { loadOrders(); } 
        else { alert('حدث خطأ أثناء التحديث'); }
    } catch (error) { alert('خطأ في الاتصال بالسيرفر'); }
}

loadOrders();