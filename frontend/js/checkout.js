const API_URL = '/api';
let cart = JSON.parse(localStorage.getItem('cart')) || [];

if(cart.length === 0) window.location.href = '/';

let isLoggedIn = false;

// 💡 التحقق الآمن من حالة تسجيل الدخول وملء البيانات
async function checkAuthAndPrefill() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            isLoggedIn = true;
            document.getElementById('customer-name').value = user.name || '';
            document.getElementById('customer-phone').value = user.phone || '';
        }
    } catch (error) {
        console.log('مستخدم زائر (Guest)');
    }
}
checkAuthAndPrefill();

function renderOrderSummary() {
    const summaryContainer = document.getElementById('order-summary');
    let total = 0;
    summaryContainer.innerHTML = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        summaryContainer.innerHTML += `
            <div class="summary-item">
                <span>${item.quantity}x ${item.name}</span>
                <span style="font-weight: bold; color: var(--primary-color);">${itemTotal} ج.م</span>
            </div>
        `;
    });
    document.getElementById('checkout-total').innerText = total;
}
renderOrderSummary();

let pendingOrderData = null;

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const address = document.getElementById('address').value;
    const notes = document.getElementById('notes').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    pendingOrderData = {
        customerName, customerPhone, orderItems: cart, shippingAddress: address, notes, totalPrice: total, paymentMethod 
    };

    if (!isLoggedIn) {
        document.getElementById('guest-modal').style.display = 'block';
    } else {
        submitOrder(pendingOrderData);
    }
});

window.submitOrderAsGuest = function() {
    document.getElementById('guest-modal').style.display = 'none';
    submitOrder(pendingOrderData);
};

async function submitOrder(orderData) {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
            credentials: 'include' 
        });

        if(response.ok) {
            localStorage.removeItem('cart'); 
            window.location.href = '/order'; 
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'حدث خطأ أثناء إرسال الطلب');
        }
    } catch(error) {
        alert('خطأ في الاتصال بالسيرفر');
    }
}