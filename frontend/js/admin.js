const API_URL = '/api';
let customersData = []; 
let itemsData = []; 

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

document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
        window.location.href = '/login';
    } catch (error) { console.error(error); }
});

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/menu/categories`);
        const categories = await response.json();
        const categorySelect = document.getElementById('item-category');
        const editCategorySelect = document.getElementById('edit-item-category');
        categorySelect.innerHTML = '<option value="">-- اختر الفئة --</option>';
        editCategorySelect.innerHTML = '<option value="">-- اختر الفئة --</option>';
        categories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat._id}">${cat.name}</option>`;
            editCategorySelect.innerHTML += `<option value="${cat._id}">${cat.name}</option>`;
        });
    } catch (error) { console.error('خطأ:', error); }
}
loadCategories();

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/orders/stats`, { credentials: 'include' });
        if (response.ok) {
            const data = await response.json();
            itemsData = data.topItems || [];
            customersData = data.allCustomers || [];
        }
    } catch (error) { console.error('خطأ في الإحصائيات:', error); }
}
loadStats();

// 💡 تفعيل إظهار وإخفاء مربعات الأحجام
document.getElementById('item-has-sizes').addEventListener('change', function() {
    document.getElementById('item-sizes-container').style.display = this.checked ? 'grid' : 'none';
});

document.getElementById('edit-item-has-sizes').addEventListener('change', function() {
    document.getElementById('edit-item-sizes-container').style.display = this.checked ? 'grid' : 'none';
});

function openItemsModal() {
    const list = document.getElementById('all-items-list');
    list.innerHTML = '';
    
    if(itemsData.length === 0) {
        list.innerHTML = '<tr><td colspan="2" style="text-align: center;">لا يوجد مبيعات حتى الآن</td></tr>';
    } else {
        itemsData.forEach(item => {
            list.innerHTML += `
                <tr>
                    <td><strong>${item._id}</strong></td>
                    <td style="color: var(--primary-color); font-weight: bold; font-size: 1.1em;">${item.totalSold} مرة</td>
                </tr>
            `;
        });
    }
    document.getElementById('items-modal').style.display = 'block';
}

function closeItemsModal() { document.getElementById('items-modal').style.display = 'none'; }

function openCustomersModal() {
    document.getElementById('customers-modal').style.display = 'block';
    renderCustomers(); 
}

function closeCustomersModal() { document.getElementById('customers-modal').style.display = 'none'; }

window.renderCustomers = function() {
    const list = document.getElementById('all-customers-list');
    list.innerHTML = '';
    
    if(customersData.length === 0) {
        list.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا يوجد عملاء حتى الآن</td></tr>';
        return;
    }

    const groupBy = document.getElementById('customer-group-select').value;
    let grouped = {};

    customersData.forEach(c => {
        const cPhone = (c._id.phone || '').toString().trim() || 'بدون رقم';
        const cName = (c._id.name || '').toString().trim() || 'غير مسجل';
        
        let key;
        if (groupBy === 'phone') key = cPhone;
        else if (groupBy === 'name') key = cName;
        else key = cPhone + '-' + cName; 

        if (!grouped[key]) {
            grouped[key] = { totalOrders: 0, totalSpent: 0, isRegistered: c.isRegistered, names: new Set(), phones: new Set() };
        }
        
        grouped[key].totalOrders += c.totalOrders;
        grouped[key].totalSpent += c.totalSpent;
        grouped[key].isRegistered = grouped[key].isRegistered || c.isRegistered;
        grouped[key].names.add(cName);
        grouped[key].phones.add(cPhone);
    });

    const sorted = Object.values(grouped).sort((a, b) => b.totalOrders - a.totalOrders);

    sorted.forEach(customer => {
        const accountStatus = customer.isRegistered 
            ? '<span style="background: #2ecc71; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8em; white-space: nowrap;">مسجل ✔️</span>'
            : '<span style="background: #95a5a6; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8em; white-space: nowrap;">زائر 👤</span>';

        const finalNames = Array.from(customer.names).join(' <span style="color:#e74c3c; font-weight:bold;">/</span> ');
        const finalPhones = Array.from(customer.phones).join('<br>');

        list.innerHTML += `
            <tr>
                <td><strong>${finalNames}</strong></td>
                <td dir="ltr" style="font-family: monospace; text-align: right;">${finalPhones}</td>
                <td>${accountStatus}</td>
                <td style="color: var(--primary-color); font-weight: bold;">${customer.totalOrders} طلب</td>
                <td style="color: #27ae60; font-weight: bold;">${customer.totalSpent} ج.م</td>
            </tr>
        `;
    });
}

document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('cat-name').value);
    try {
        const response = await fetch(`${API_URL}/menu/categories`, { method: 'POST', body: formData, credentials: 'include' });
        if (response.ok) { alert('تم الإضافة بنجاح!'); document.getElementById('category-form').reset(); loadCategories(); }
    } catch (error) { alert('خطأ في الاتصال'); }
});

document.getElementById('menu-item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('item-name').value);
    formData.append('description', document.getElementById('item-desc').value);
    formData.append('price', document.getElementById('item-price').value);
    formData.append('category', document.getElementById('item-category').value);
    
    // 💡 إرسال بيانات الأحجام للباك إند
    const hasSizes = document.getElementById('item-has-sizes').checked;
    formData.append('hasSizes', hasSizes);
    if(hasSizes) {
        formData.append('priceSmall', document.getElementById('item-price-small').value);
        formData.append('priceMedium', document.getElementById('item-price-medium').value);
        formData.append('priceLarge', document.getElementById('item-price-large').value);
    }

    const imageFile = document.getElementById('item-image').files[0];
    if (imageFile) formData.append('image', imageFile);

    try {
        const response = await fetch(`${API_URL}/menu/items`, { method: 'POST', body: formData, credentials: 'include' });
        if (response.ok) { 
            alert('تم إضافة الوجبة!'); 
            document.getElementById('menu-item-form').reset(); 
            document.getElementById('item-sizes-container').style.display = 'none'; // إخفاء المربع بعد الحفظ
            loadAdminMenuItems(); 
        }
    } catch (error) { alert('خطأ في الاتصال'); }
});

async function loadAdminMenuItems() {
    try {
        const response = await fetch(`${API_URL}/menu/items`);
        const items = await response.json();
        const itemsList = document.getElementById('menu-items-list');
        itemsList.innerHTML = '';

        if(items.length === 0) {
            itemsList.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا توجد وجبات حالياً</td></tr>';
            return;
        }

        items.forEach(item => {
            const catName = item.category ? item.category.name : 'بدون فئة';
            const catId = item.category ? item.category._id : '';
            const safeName = item.name ? item.name.replace(/'/g, "\\'") : '';
            const safeDesc = item.description ? item.description.replace(/'/g, "\\'") : '';
            const safeImage = item.imageUrl ? item.imageUrl : ''; 
            
            // 💡 تحديد شكل السعر المعروض
            const displayPrice = item.hasSizes ? '<span style="color: #e67e22; font-size: 0.9em;">متعدد الأحجام 🍔</span>' : `${item.price} ج.م`;
            
            // 💡 تجهيز بيانات الأحجام لتمريرها للتعديل
            const hasSizesArg = item.hasSizes ? true : false;
            const pSmall = item.sizes?.small || '';
            const pMedium = item.sizes?.medium || '';
            const pLarge = item.sizes?.large || '';

            itemsList.innerHTML += `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${safeImage ? `<img src="${safeImage}" style="width: 40px; height: 40px; border-radius: 5px; object-fit: cover;">` : '🍔'}
                            <strong>${item.name}</strong>
                        </div>
                    </td>
                    <td>${catName}</td>
                    <td style="font-weight: bold;">${displayPrice}</td>
                    <td>
                        <button class="update-btn" onclick="openEditModal('${item._id}', '${safeName}', '${safeDesc}', ${item.price}, '${catId}', '${safeImage}', ${hasSizesArg}, '${pSmall}', '${pMedium}', '${pLarge}')">تعديل ✏️</button>
                        <button class="delete-btn" onclick="deleteMenuItem('${item._id}')">حذف 🗑️</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) { console.error(error); }
}

async function deleteMenuItem(id) {
    if(!confirm('هل أنت متأكد من حذف هذه الوجبة نهائياً؟')) return;
    try {
        const response = await fetch(`${API_URL}/menu/items/${id}`, { method: 'DELETE', credentials: 'include' });
        if(response.ok) { alert('تم الحذف بنجاح!'); loadAdminMenuItems(); }
        else alert('خطأ في الحذف');
    } catch (error) { alert('خطأ في الاتصال'); }
}

// 💡 استقبال بيانات الأحجام في نافذة التعديل
function openEditModal(id, name, desc, price, catId, imageUrl, hasSizes, pSmall, pMedium, pLarge) {
    document.getElementById('edit-item-id').value = id;
    document.getElementById('edit-item-name').value = name;
    document.getElementById('edit-item-desc').value = desc;
    document.getElementById('edit-item-price').value = price;
    document.getElementById('edit-item-category').value = catId;
    
    // تظبيط الأحجام
    const hasSizesCheckbox = document.getElementById('edit-item-has-sizes');
    hasSizesCheckbox.checked = hasSizes;
    document.getElementById('edit-item-sizes-container').style.display = hasSizes ? 'grid' : 'none';
    document.getElementById('edit-item-price-small').value = pSmall;
    document.getElementById('edit-item-price-medium').value = pMedium;
    document.getElementById('edit-item-price-large').value = pLarge;

    const imgPreview = document.getElementById('edit-current-image');
    if (imageUrl && imageUrl.startsWith('http')) {
        imgPreview.src = imageUrl;
        imgPreview.style.display = 'block';
    } else {
        imgPreview.src = '';
        imgPreview.style.display = 'none';
    }

    document.getElementById('edit-item-image').value = '';
    document.getElementById('edit-modal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-item-form').reset();
}

document.getElementById('edit-item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-item-id').value;
    const formData = new FormData();
    formData.append('name', document.getElementById('edit-item-name').value);
    formData.append('description', document.getElementById('edit-item-desc').value);
    formData.append('price', document.getElementById('edit-item-price').value);
    formData.append('category', document.getElementById('edit-item-category').value);
    
    // 💡 إرسال بيانات الأحجام عند التعديل
    const hasSizes = document.getElementById('edit-item-has-sizes').checked;
    formData.append('hasSizes', hasSizes);
    if(hasSizes) {
        formData.append('priceSmall', document.getElementById('edit-item-price-small').value);
        formData.append('priceMedium', document.getElementById('edit-item-price-medium').value);
        formData.append('priceLarge', document.getElementById('edit-item-price-large').value);
    }

    const imageFile = document.getElementById('edit-item-image').files[0];
    if (imageFile) formData.append('image', imageFile);

    try {
        const response = await fetch(`${API_URL}/menu/items/${id}`, { method: 'PUT', body: formData, credentials: 'include' });
        if (response.ok) { alert('تم التعديل بنجاح!'); closeEditModal(); loadAdminMenuItems(); }
        else alert('خطأ في التعديل');
    } catch (error) { alert('خطأ'); }
});

loadAdminMenuItems();