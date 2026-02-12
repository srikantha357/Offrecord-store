/**
 * OFFRECORD STORE - Core Logic 2026
 * Bright Streetwear Edition
 */

// --- 1. SLIDESHOW CONFIGURATION ---
const SLIDESHOW_IMAGES = [
    'images/ome 1.jpg',
    'images/ome2.jpg',
    'images/ome3.jpg'
];

let slideIndex = 0;

function initSlideshow() {
    const hero = document.getElementById('hero-slideshow');
    if (!hero) return;

    function changeBg() {
        // UPDATED: Removed the dark linear-gradient for a bright look
        hero.style.backgroundImage = `url('${SLIDESHOW_IMAGES[slideIndex]}')`;
        slideIndex = (slideIndex + 1) % SLIDESHOW_IMAGES.length;
    }

    changeBg(); // Initial load
    setInterval(changeBg, 5000); // Change every 5 seconds
}

// --- 2. PRODUCT & CONFIG DATA ---
const CONFIG = {
    tshirts: { name: "Oversized Tee", base: 799, positions: ['Front', 'Back', 'Pocket'], fits: ['Regular', 'Oversized'], colors: ['Black', 'White', 'Blue'] },
    joggers: { name: "Baggy Lowers", base: 1299, positions: ['Left Thigh', 'Full Leg'], fits: ['Tapered', 'Baggy'], colors: ['Black', 'Grey'] },
    hoodies: { name: "Heavyweight Hoodie", base: 1899, positions: ['Chest', 'Back'], fits: ['Heavyweight'], colors: ['Black', 'Oatmeal'] },
    vests: { name: "Gym Vest", base: 699, positions: ['Center'], fits: ['Stringer', 'Standard'], colors: ['Black', 'Red'] }
};

let cart = JSON.parse(localStorage.getItem('offrecord_cart')) || [];
let currentItem = { qty: 1, base: 0, extra: 0, selectedColor: 'Black' };

// --- 3. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initSlideshow(); // Start the background rotation
    
    // Mobile Nav Toggle
    const navToggle = document.getElementById('navToggle');
    const mainNav = document.getElementById('mainNav');
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('show');
        });
    }

    // Initialize Shop if on Shop Page
    if (document.body.dataset.page === 'shop') {
        initShop();
    }
});

// --- 4. SHOP & CUSTOMIZATION LOGIC ---
function initShop() {
    const closeModal = document.getElementById('closeCustomize');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('customizeModal').classList.remove('show');
        });
    }
}

window.openCustomize = (category, title = "CUSTOM DESIGN") => {
    const modal = document.getElementById('customizeModal');
    const cfg = CONFIG[category];
    
    if (!cfg) return;

    currentItem = { 
        ...cfg, 
        category, 
        title, 
        qty: 1, 
        extra: 0, 
        selectedColor: cfg.colors[0],
        selectedFit: cfg.fits[0],
        selectedPos: cfg.positions[0]
    };
    
    document.getElementById('previewTitle').innerText = title;
    document.getElementById('currentCategory').innerText = cfg.name;
    document.getElementById('basePrice').innerText = cfg.base;
    
    renderOptions('positionGroup', cfg.positions, 'selectedPos');
    renderOptions('fitGroup', cfg.fits, 'selectedFit');
    renderOptions('colorGroup', cfg.colors, 'selectedColor');
    
    calculatePrice();
    modal.classList.add('show');
};

function renderOptions(groupId, options, stateKey) {
    const container = document.getElementById(groupId);
    if (!container) return;

    container.innerHTML = options.map((opt, i) => 
        `<button class="opt-btn ${i === 0 ? 'active' : ''}" 
            onclick="updateSelection(this, '${stateKey}', '${opt}')">${opt}</button>`
    ).join('');
}

window.updateSelection = (btn, stateKey, value) => {
    btn.parentElement.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentItem[stateKey] = value;

    if (stateKey === 'selectedColor') {
        const mockup = document.getElementById('mockup');
        if (mockup) {
            mockup.className = `mockup ${value.toLowerCase()}`;
        }
    }
    calculatePrice();
};

function calculatePrice() {
    const total = (currentItem.base + currentItem.extra) * currentItem.qty;
    const finalPriceElement = document.getElementById('finalPrice');
    const lineTotalElement = document.getElementById('lineTotal');

    if (finalPriceElement) finalPriceElement.innerText = currentItem.base + currentItem.extra;
    if (lineTotalElement) lineTotalElement.innerText = total;
}

// --- 5. CART ACTIONS ---
window.addToCart = () => {
    const cartItem = {
        id: Date.now(),
        category: currentItem.category,
        name: currentItem.name,
        title: currentItem.title,
        color: currentItem.selectedColor,
        fit: currentItem.selectedFit,
        position: currentItem.selectedPos,
        price: currentItem.base + currentItem.extra,
        qty: currentItem.qty
    };

    cart.push(cartItem);
    localStorage.setItem('offrecord_cart', JSON.stringify(cart));
    updateCartCount();
    document.getElementById('customizeModal').classList.remove('show');
    alert(`${currentItem.name} added to cart!`);
};

function updateCartCount() {
    const badge = document.getElementById('cartCount');
    if (badge) badge.innerText = cart.length;
}

window.changeQty = (num) => {
    currentItem.qty = Math.max(1, currentItem.qty + num);
    const qtyDisplay = document.getElementById('itemQty');
    if (qtyDisplay) qtyDisplay.innerText = currentItem.qty;
    calculatePrice();
};
