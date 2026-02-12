/**
 * OFFRECORD STORE - Master Logic 2026
 * Bright Anime Edition
 */

// --- 1. DATA CONFIGURATION ---
const SLIDESHOW_IMAGES = [
    'images/ome 1.jpg',
    'images/ome2.jpg',
    'images/ome3.jpg'
];

const SHOP_CONFIG = {
    tshirts: { 
        name: "Anime Graphic Tee", 
        base: 799, 
        positions: ['Front', 'Back'], 
        fits: ['Regular', 'Oversized'], 
        colors: ['Black', 'White'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL']
    }
};

const ANIME_PRODUCTS = [
    { id: 1, title: "SOLO LEVELING EDIT", img: "images/anime1.jpg" },
    { id: 2, title: "JUJUTSU KAISEN EDIT", img: "images/anime2.jpg" },
    { id: 3, title: "AOT FREEDOM EDIT", img: "images/anime3.jpg" }
];

// --- 2. STATE MANAGEMENT ---
let cart = JSON.parse(localStorage.getItem('offrecord_cart')) || [];
let currentItem = { qty: 1, base: 799, extra: 0, selectedColor: 'White', selectedFit: 'Oversized', selectedSize: 'L' };
let slideIndex = 0;

// --- 3. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    handleNavigation();

    const pageType = document.body.dataset.page;

    if (pageType === 'home') initSlideshow();
    if (pageType === 'shop') initShop();
    if (pageType === 'cart') renderCart();
});

// --- 4. CORE MODULES ---

function handleNavigation() {
    const navToggle = document.getElementById('navToggle');
    const mainNav = document.getElementById('mainNav');
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => mainNav.classList.toggle('show'));
    }
}

function initSlideshow() {
    const hero = document.getElementById('hero-slideshow');
    if (!hero) return;

    function nextSlide() {
        hero.style.backgroundImage = `url('${SLIDESHOW_IMAGES[slideIndex]}')`;
        slideIndex = (slideIndex + 1) % SLIDESHOW_IMAGES.length;
    }
    nextSlide();
    setInterval(nextSlide, 5000);
}

function initShop() {
    const grid = document.querySelector('.grid');
    const tshirtsSection = document.querySelector('#tshirts .grid');
    
    // Hide unused sections provided in master HTML
    ['joggers', 'hoodies', 'vests'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    if (tshirtsSection) {
        tshirtsSection.innerHTML = ANIME_PRODUCTS.map(prod => `
            <div class="card">
                <div class="product-image" style="background-image: url('${prod.img}'); height:300px; background-size:cover;"></div>
                <div class="card-body" style="text-align:center;">
                    <h3>${prod.title}</h3>
                    <p class="price">₹799</p>
                    <button onclick="openCustomizer('tshirts', '${prod.title}')" class="btn" style="width:100%;">Customize</button>
                </div>
            </div>
        `).join('');
    }
}

window.openCustomizer = (category, title) => {
    const modal = document.getElementById('customizeModal');
    const cfg = SHOP_CONFIG[category];
    if (!modal || !cfg) return;

    currentItem = { ...cfg, category, title, qty: 1, selectedColor: 'White', selectedFit: 'Oversized', selectedSize: 'L' };
    
    document.getElementById('previewTitle').innerText = title;
    document.getElementById('basePrice').innerText = cfg.base;
    document.getElementById('finalPrice').innerText = cfg.base;
    document.getElementById('lineTotal').innerText = cfg.base;

    renderOptions('fitGroup', cfg.fits, 'selectedFit');
    renderOptions('colorGroup', cfg.colors, 'selectedColor');
    renderOptions('sizeGroup', cfg.sizes, 'selectedSize');
    renderOptions('printPositionGroup', cfg.positions, 'selectedPos');

    modal.classList.add('show');
};

function renderOptions(groupId, options, stateKey) {
    const container = document.getElementById(groupId);
    if (!container) return;
    container.innerHTML = options.map(opt => `
        <button class="opt-btn ${currentItem[stateKey] === opt ? 'active' : ''}" 
            onclick="updateSelection(this, '${stateKey}', '${opt}')">${opt}</button>
    `).join('');
}

window.updateSelection = (btn, stateKey, value) => {
    btn.parentElement.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentItem[stateKey] = value;
};

// --- 5. CART LOGIC ---

window.addToCart = () => {
    const item = { id: Date.now(), ...currentItem, price: currentItem.base };
    cart.push(item);
    localStorage.setItem('offrecord_cart', JSON.stringify(cart));
    updateCartCount();
    document.getElementById('customizeModal').classList.remove('show');
    alert("Added to Cart!");
};

function updateCartCount() {
    const badge = document.getElementById('cartCount');
    if (badge) badge.innerText = cart.length;
}

function renderCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    
    if (cart.length === 0) {
        document.getElementById('emptyCart').classList.remove('hidden');
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <li class="card" style="margin-bottom:1rem; padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${item.title}</strong><br>
                    <small>${item.selectedFit} | ${item.selectedColor} | Size: ${item.selectedSize}</small>
                </div>
                <div>₹${item.price}</div>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; cursor:pointer;">✕</button>
            </div>
        </li>
    `).join('');
    
    calculateTotals();
}

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    localStorage.setItem('offrecord_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
};

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const subElement = document.getElementById('subtotal');
    const grandElement = document.getElementById('grandTotal');
    if (subElement) subElement.innerText = subtotal;
    if (grandElement) grandElement.innerText = subtotal;
}

// Close Modal
const closeBtn = document.getElementById('closeCustomize');
if (closeBtn) {
    closeBtn.onclick = () => document.getElementById('customizeModal').classList.remove('show');
}
