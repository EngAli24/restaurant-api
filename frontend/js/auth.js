const API_URL = '/api';

// ==========================================
// 1. التبديل بين واجهة الدخول والتسجيل
// ==========================================
function toggleAuth(type) {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    if (type === 'register') {
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
    } else {
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    }
}

// ==========================================
// 2. معالجة تسجيل الدخول (Login)
// ==========================================
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('تم تسجيل الدخول بنجاح!');
            window.location.href = data.role === 'admin' ? '/admin' : '/';
        } else {
            alert(data.message || 'خطأ في تسجيل الدخول');
        }
    } catch (error) {
        console.error(error);
        alert('حدث خطأ في الاتصال بالسيرفر');
    }
});

// ==========================================
// 3. معالجة إنشاء حساب جديد (Register)
// ==========================================
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-password-confirm').value; 

    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phone)) {
        alert("عفواً، يجب أن يتكون رقم الهاتف من 11 رقماً صحيحاً");
        return; 
    }

    if (password !== confirmPassword) {
        alert("عفواً، كلمتا المرور غير متطابقتين!");
        return; 
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, password, role: 'user' }) 
        });

        const data = await response.json();

        if (response.ok) {
            alert('تم إنشاء الحساب بنجاح! جاري التوجيه...');
            window.location.href = '/'; 
        } else {
            alert(data.message || 'خطأ في إنشاء الحساب');
        }
    } catch (error) {
        console.error(error);
        alert('حدث خطأ في الاتصال بالسيرفر');
    }
});