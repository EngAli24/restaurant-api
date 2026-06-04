const API_URL = '/api';

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, { credentials: 'include' });
        
        if (!response.ok) {
            window.location.href = '/login';
            return;
        }

        const user = await response.json();
        
        document.getElementById('user-name').innerText = user.name;
        document.getElementById('user-phone').innerText = user.phone;
        document.getElementById('user-role').innerText = user.role === 'admin' ? 'مدير (Admin)' : 'عميل (Customer)';

        if (user.role === 'admin') {
            const navLinks = document.querySelector('.nav-links');
            if(!navLinks.innerHTML.includes('لوحة الإدارة')) {
                navLinks.innerHTML = `<li><a href="/admin" style="font-weight:bold; color:var(--primary-color);">لوحة الإدارة ⚙️</a></li>` + navLinks.innerHTML;
            }
            document.getElementById('admin-add-user-card').style.display = 'block';
        }
    } catch (error) {
        window.location.href = '/login';
    }
}

// ==========================================
// منطق نافذة التعديل وتغيير الباسورد
// ==========================================
let isPasswordChangeActive = false;

async function openProfileModal() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            document.getElementById('edit-name').value = user.name;
            document.getElementById('edit-phone').value = user.phone;
            
            if (isPasswordChangeActive) togglePasswordSection();
            document.getElementById('profile-modal').style.display = 'block';
        }
    } catch (error) {
        alert('حدث خطأ في تحميل البيانات');
    }
}

function closeProfileModal() {
    document.getElementById('profile-modal').style.display = 'none';
}

function togglePasswordSection() {
    isPasswordChangeActive = !isPasswordChangeActive;
    const btn = document.getElementById('toggle-password-btn');
    const section = document.getElementById('password-section');
    const currentPwd = document.getElementById('current-password');
    const newPwd = document.getElementById('new-password');
    const confirmPwd = document.getElementById('confirm-password');

    if (isPasswordChangeActive) {
        btn.innerHTML = 'إلغاء تغيير كلمة المرور ❌';
        btn.style.backgroundColor = '#fadbd8';
        btn.style.borderColor = '#f5b7b1';
        btn.style.color = '#c0392b';
        section.style.display = 'block';
        currentPwd.required = true;
        newPwd.required = true;
        confirmPwd.required = true;
    } else {
        btn.innerHTML = 'اضغط هنا لتغيير كلمة المرور 🔑';
        btn.style.backgroundColor = '#fef9e7';
        btn.style.borderColor = '#d4ac0d';
        btn.style.color = '#004d40';
        section.style.display = 'none';
        currentPwd.required = false;
        newPwd.required = false;
        confirmPwd.required = false;
        currentPwd.value = '';
        newPwd.value = '';
        confirmPwd.value = '';
    }
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('edit-name').value;
    const phone = document.getElementById('edit-phone').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    const updatedData = { name, phone };
    
    if (isPasswordChangeActive) {
        if (newPassword !== confirmPassword) {
            alert('كلمة المرور الجديدة وتأكيدها غير متطابقين!');
            return;
        }
        updatedData.currentPassword = currentPassword;
        updatedData.newPassword = newPassword;
    }

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
            credentials: 'include' 
        });

        if (response.ok) {
            alert('✅ تم حفظ التعديلات بنجاح!');
            closeProfileModal();
            loadUserProfile(); 
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'حدث خطأ أثناء التحديث');
        }
    } catch (error) {
        alert('خطأ في الاتصال بالسيرفر');
    }
});

// ==========================================
// منطق إنشاء حساب بواسطة المدير
// ==========================================
const addUserForm = document.getElementById('add-user-form');
if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('new-user-name').value;
        const phone = document.getElementById('new-user-phone').value;
        const password = document.getElementById('new-user-password').value;
        const confirmPassword = document.getElementById('new-user-confirm-password').value; 
        const role = document.getElementById('new-user-role').value;

        if (password !== confirmPassword) {
            alert('كلمة المرور وتأكيد كلمة المرور غير متطابقين! يرجى التأكد والمحاولة مرة أخرى.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/create-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, password, role }),
                credentials: 'include' 
            });

            if (response.ok) {
                alert('✅ تم إنشاء الحساب بنجاح!');
                addUserForm.reset();
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'حدث خطأ أثناء إنشاء الحساب');
            }
        } catch (error) {
            alert('خطأ في الاتصال بالسيرفر');
        }
    });
}

// ==========================================
// منطق عرض الطلبات وتسجيل الخروج
// ==========================================
async function loadMyOrders() {
    try {
        const response = await fetch(`${API_URL}/orders/myorders`, { credentials: 'include' });
        const ordersList = document.getElementById('my-orders-list');
        
        if (!response.ok) {
            ordersList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">حدث خطأ في جلب الطلبات</td></tr>';
            return;
        }

        const orders = await response.json();
        ordersList.innerHTML = '';

        if(orders.length === 0) {
            ordersList.innerHTML = '<tr><td colspan="4" style="text-align: center;">لم تقم بأي طلبات بعد!</td></tr>';
            return;
        }

        const statusMap = {
            'Pending': { text: 'قيد الانتظار', color: '#e67e22' },
            'Preparing': { text: 'جاري التحضير', color: '#3498db' },
            'Out for Delivery': { text: 'في الطريق', color: '#9b59b6' },
            'Delivered': { text: 'تم التوصيل', color: '#2ecc71' }
        };

        orders.forEach(order => {
            const shortId = order._id.substring(order._id.length - 6).toUpperCase();
            const date = new Date(order.createdAt).toLocaleDateString('ar-EG');
            const statusInfo = statusMap[order.status] || { text: order.status, color: '#333' };

            ordersList.innerHTML += `
                <tr>
                    <td style="font-family: monospace; font-weight: bold; text-align: right;" dir="ltr">#${shortId}</td>
                    <td>${date}</td>
                    <td style="font-weight: bold;">${order.totalPrice} ج.م</td>
                    <td><span class="status-badge" style="background-color: ${statusInfo.color};">${statusInfo.text}</span></td>
                </tr>
            `;
        });
    } catch (error) { console.error(error); }
}

document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
        window.location.href = '/login';
    } catch (error) { console.error(error); }
});

loadUserProfile();
loadMyOrders();