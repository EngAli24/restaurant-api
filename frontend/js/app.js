const API_URL = '/api';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allCategories = [];
let allMenuItems = [];

// 💡 تحديث القائمة بناءً على رد السيرفر المشفر
async function updateNavbar() {
    const navLinks = document.querySelector('.nav-links');
    try {
        const response = await fetch(`${API_URL}/auth/profile`, { credentials: 'include' });
        
        if (response.ok) {
            const user = await response.json();
            const adminLink = user.role === 'admin' 
                ? `<li><a href="/admin" style="color: var(--primary-color); font-weight: bold;">⚙️ لوحة الإدارة</a></li><li><a href="/profile">البروفايل</a></li>` 
                : `<li><a href="/profile">البروفايل</a></li>`;
                
            navLinks.innerHTML = `<li><a href="/" class="active">المنيو</a></li>${adminLink}<li><a href="javascript:void(0)" id="cart-btn" onclick="toggleCart()">🛒 السلة (<span id="cart-count">0</span>)</a></li><li><a href="javascript:void(0)" onclick="logoutUser()" class="login-btn" style="background-color: #2b2d42;">تسجيل الخروج</a></li>`;
        } else {
            navLinks.innerHTML = `<li><a href="/" class="active">المنيو</a></li><li><a href="/login">البروفايل</a></li><li><a href="javascript:void(0)" id="cart-btn" onclick="toggleCart()">🛒 السلة (<span id="cart-count">0</span>)</a></li><li><a href="/login" class="login-btn">تسجيل الدخول</a></li>`;
        }
    } catch (error) {
        console.error("Auth check failed:", error);
    }
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
        sectionHtml += `
            <div class="menu-card">
                <img src="${imagePath}" alt="${item.name}">
                <div class="card-content">
                    <div class="card-title-flex">
                        <h3>${item.name}</h3>
                        <span class="price">${item.price} ج.م</span>
                    </div>
                    <p class="description" style="color: #666; font-size: 0.9em;">${item.description || ''}</p>
                    <button class="add-to-cart-btn" onclick="addToCart('${item._id}', '${item.name}', ${item.price})">أضف للسلة</button>
                </div>
            </div>
        `;
    });

    sectionHtml += `</div>`;
    menuContainer.innerHTML = sectionHtml;
}

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.menuItem === id);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ menuItem: id, name: name, price: price, quantity: 1 });
    saveCartAndRender(); alert(`تم إضافة ${name} للسلة بنجاح!`);
}

function changeQuantity(id, amount) {
    const item = cart.find(i => i.menuItem === id);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) cart = cart.filter(i => i.menuItem !== id); 
        saveCartAndRender();
    }
}

function saveCartAndRender() { localStorage.setItem('cart', JSON.stringify(cart)); updateCartUI(); }

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
            cartItemsContainer.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info"><h4>${item.name}</h4><p>${item.price} ج.م</p></div>
                    <div class="cart-item-actions">
                        <button onclick="changeQuantity('${item.menuItem}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity('${item.menuItem}', 1)">+</button>
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

window.onload = () => { updateNavbar(); fetchAndDisplayMenu(); updateCartUI(); };

// ==========================================
// تسجيل الـ Service Worker (لتحويل الموقع لتطبيق PWA)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch((error) => {
                console.log('❌ ServiceWorker registration failed: ', error);
            });
    });
}