const API_URL = '/api';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allCategories = [];
let allMenuItems = [];

async function updateNavbar() {
    const navLinks = document.querySelector('.nav-links');
    try {
        const response = await fetch(`${API_URL}/auth/profile`, { credentials: 'include' });
        
        if (response.ok) {
            const user = await response.json();
            const adminLink = user.role === 'admin' 
                ? `<li><a href="/admin" style="font-size: 1.2rem;" title="لوحة الإدارة">⚙️</a></li>` 
                : ``;
                
            navLinks.innerHTML = `
                ${adminLink}
                <li><a href="/profile" style="font-size: 1.2rem;" title="البروفايل">👤</a></li>
                <li><a href="javascript:void(0)" id="cart-btn" onclick="toggleCart()" style="font-size: 1.2rem;" title="السلة">🛒 (<span id="cart-count">0</span>)</a></li>
                <li><a href="javascript:void(0)" onclick="logoutUser()" class="login-btn" style="background-color: #2b2d42;">تسجيل الخروج</a></li>
            `;
        } else {
            navLinks.innerHTML = `
                <li><a href="/login" style="font-size: 1.2rem;" title="البروفايل">👤</a></li>
                <li><a href="javascript:void(0)" id="cart-btn" onclick="toggleCart()" style="font-size: 1.2rem;" title="السلة">🛒 (<span id="cart-count">0</span>)</a></li>
                <li><a href="/login" class="login-btn">تسجيل الدخول</a></li>
            `;
        }
    } catch (error) { console.error("Auth check failed:", error); }
}

async function logoutUser() {
    try {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
        window.location.reload(); 
    } catch (error) { console.error(error); }
}

async function fetchAndDisplayMenu() {
    const menuContainer = document.getElementById('menu-container');
    const filtersContainer = document.getElementById('category-filters');
    if (!menuContainer || !filtersContainer) return;

    try {
        const [catRes, itemsRes] = await Promise.all([
            fetch(`${API_URL}/menu/categories`),
            fetch(`${API_URL}/menu/items`)
        ]);

        if (!itemsRes.ok) throw new Error('خطأ في جلب البيانات');
        
        allCategories = await catRes.json();
        allMenuItems = await itemsRes.json();

        renderCategoryFilters();
        renderMenuItems('all');
    } catch (error) {
        menuContainer.innerHTML = '<p style="color: red; text-align: center;">عذراً، لا يمكن تحميل المنيو الآن.</p>';
    }
}

function renderCategoryFilters() {
    const filtersContainer = document.getElementById('category-filters');
    let html = `<button class="filter-btn active" onclick="filterMenu('all', this)">الكل</button>`;
    allCategories.forEach(cat => {
        html += `<button class="filter-btn" onclick="filterMenu('${cat._id}', this)">${cat.name}</button>`;
    });
    filtersContainer.innerHTML = html;
}

window.filterMenu = function(categoryId, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    renderMenuItems(categoryId);
}

function renderMenuItems(categoryId) {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = '';

    let filteredItems = allMenuItems;
    if (categoryId !== 'all') {
        filteredItems = allMenuItems.filter(item => item.category && item.category._id === categoryId);
    }

    if(filteredItems.length === 0) {
        menuContainer.innerHTML = '<p style="text-align: center; width:100%; padding: 20px;">لا توجد وجبات في هذا القسم حالياً.</p>';
        return;
    }

    let sectionHtml = `<div class="menu-grid">`;

    filteredItems.forEach(item => {
        const imagePath = item.imageUrl ? item.imageUrl : 'https://via.placeholder.com/150';
        const safeName = item.name.replace(/'/g, "\\'");
        
        // إعداد السعر الافتراضي وزر الإضافة
        let priceDisplay = `<span class="price">${item.price} ج.م</span>`;
        let optionsHtml = '';
        let buttonAction = `onclick="addToCart('${item._id}', '${safeName}', ${item.price}, 'عادي')"`;

        // لو الوجبة ليها أحجام، هنضيف قائمة منسدلة
        if (item.hasSizes && item.sizes) {
            let selectOptions = `<option value="" disabled selected>-- اختر الحجم --</option>`;
            let minPrice = 99999;
            
            if (item.sizes.small) { selectOptions += `<option value="${item.sizes.small}" data-size="صغير">صغير - ${item.sizes.small} ج.م</option>`; minPrice = Math.min(minPrice, item.sizes.small); }
            if (item.sizes.medium) { selectOptions += `<option value="${item.sizes.medium}" data-size="وسط">وسط - ${item.sizes.medium} ج.م</option>`; minPrice = Math.min(minPrice, item.sizes.medium); }
            if (item.sizes.large) { selectOptions += `<option value="${item.sizes.large}" data-size="كبير">كبير - ${item.sizes.large} ج.م</option>`; minPrice = Math.min(minPrice, item.sizes.large); }
            
            // إعطاء السعر ID ليتم تعديله لاحقاً
            priceDisplay = `<span id="price-display-${item._id}" class="price" style="color:#e67e22; font-size: 0.9em;">تبدأ من ${minPrice} ج.م</span>`;
            
            // إضافة onchange للقائمة المنسدلة
            optionsHtml = `
                <div style="margin-top: 10px; padding: 0 15px;">
                    <select id="size-select-${item._id}" onchange="updatePriceDisplay('${item._id}')" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc; font-family: 'Cairo', sans-serif; font-weight: bold; color: #333; outline: none;">
                        ${selectOptions}
                    </select>
                </div>
            `;
            
            buttonAction = `onclick="addWithSize('${item._id}', '${safeName}')"`;
        }

        sectionHtml += `
            <div class="menu-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <img src="${imagePath}" alt="${item.name}">
                    <div class="card-content">
                        <div class="card-title-flex">
                            <h3>${item.name}</h3>
                            ${priceDisplay}
                        </div>
                        <p class="description" style="color: #666; font-size: 0.9em;">${item.description || 'لا يوجد وصف'}</p>
                    </div>
                </div>
                <div>
                    ${optionsHtml}
                    <div style="padding: 15px;">
                        <button class="add-to-cart-btn" ${buttonAction}>أضف للسلة 🛒</button>
                    </div>
                </div>
            </div>
        `;
    });

    sectionHtml += `</div>`;
    menuContainer.innerHTML = sectionHtml;
}

// تحديث السعر أوتوماتيك عند اختيار الحجم
window.updatePriceDisplay = function(id) {
    const selectElement = document.getElementById(`size-select-${id}`);
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const priceDisplay = document.getElementById(`price-display-${id}`);
    
    if (selectedOption.value && priceDisplay) {
        priceDisplay.innerHTML = `${selectedOption.value} ج.م`;
        priceDisplay.style.color = 'var(--primary-color)';
        priceDisplay.style.fontSize = '1.1em';
        priceDisplay.style.fontWeight = 'bold';
        selectElement.style.borderColor = '#ccc'; // إرجاع اللون الطبيعي لو كان أحمر
    }
};

// الإضافة والتأكد إن العميل اختار الحجم فعلاً
window.addWithSize = function(id, name) {
    const selectElement = document.getElementById(`size-select-${id}`);
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    
    if (!selectedOption.value) {
        alert('برجاء اختيار الحجم أولاً قبل الإضافة للسلة!');
        selectElement.style.borderColor = 'red'; 
        return;
    }
    
    selectElement.style.borderColor = '#ccc'; 
    const price = parseFloat(selectedOption.value);
    const size = selectedOption.getAttribute('data-size');
    addToCart(id, name, price, size);
};

// تحديث الإضافة للسلة لتستقبل الحجم
window.addToCart = function(id, name, price, size = 'عادي') {
    const existingItem = cart.find(item => item.menuItem === id && item.size === size);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ menuItem: id, name: name, price: price, quantity: 1, size: size });
    }
    saveCartAndRender(); 
    
    const sizeText = size !== 'عادي' ? ` (حجم ${size})` : '';
    alert(`تم إضافة ${name}${sizeText} للسلة بنجاح!`);
}

// تحديث تغيير الكمية ليعتمد على الحجم أيضاً
window.changeQuantity = function(id, size, amount) {
    const item = cart.find(i => i.menuItem === id && i.size === size);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) cart = cart.filter(i => !(i.menuItem === id && i.size === size)); 
        saveCartAndRender();
    }
}

function saveCartAndRender() { localStorage.setItem('cart', JSON.stringify(cart)); updateCartUI(); }

// عرض الحجم داخل السلة
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('cart-count');
    if(countElement) countElement.innerText = totalItems;
    
    const cartItemsContainer = document.getElementById('cart-items');
    if(!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">السلة فارغة حالياً</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            const sizeLabel = item.size !== 'عادي' ? `<span style="font-size: 0.8em; color: #e67e22; display:block; margin-top: 3px;">حجم: ${item.size}</span>` : '';
            
            cartItemsContainer.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4 style="margin-bottom: 2px;">${item.name}</h4>
                        ${sizeLabel}
                        <p style="margin-top: 5px; font-weight: bold;">${item.price} ج.م</p>
                    </div>
                    <div class="cart-item-actions">
                        <button onclick="changeQuantity('${item.menuItem}', '${item.size || 'عادي'}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity('${item.menuItem}', '${item.size || 'عادي'}', 1)">+</button>
                    </div>
                </div>`;
        });
    }
    const totalElement = document.getElementById('cart-total');
    if(totalElement) totalElement.innerText = totalPrice;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = modal.style.display === "block" ? "none" : "block";
}

function checkout() {
    if (cart.length === 0) { alert("السلة فارغة!"); return; }
    window.location.href = '/checkout';
}

if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    window.onload = () => { updateNavbar(); fetchAndDisplayMenu(); updateCartUI(); };
} else {
    window.onload = () => { updateNavbar(); updateCartUI(); };
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(err => console.log(err)); });
}
