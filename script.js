/**
 * OFFRECORD STORE - Core Logic 2026
 * Streetwear Edition
 */

// 1. PRODUCT & CONFIG DATA
const CONFIG = {
    tshirts: { name: "Oversized Tee", base: 799, positions: ['Front', 'Back', 'Pocket'], fits: ['Regular', 'Oversized'], colors: ['Black', 'White', 'Blue'] },
    joggers: { name: "Baggy Lowers", base: 1299, positions: ['Left Thigh', 'Full Leg'], fits: ['Tapered', 'Baggy'], colors: ['Black', 'Grey'] },
    hoodies: { name: "Heavyweight Hoodie", base: 1899, positions: ['Chest', 'Back'], fits: ['Heavyweight'], colors: ['Black', 'Oatmeal'] },
    vests: { name: "Gym Vest", base: 699, positions: ['Center'], fits: ['Stringer', 'Standard'], colors: ['Black', 'Red'] }
};

let cart = JSON.parse(localStorage.getItem('offrecord_cart')) || [];
let currentItem = { qty: 1, base: 0, extra: 0, selectedColor: 'Black' };

// 2. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
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

// 3. SHOP & CUSTOMIZATION LOGIC
function initShop() {
    // Close Modal Logic
    const closeModal = document.getElementById('closeCustomize');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('customizeModal').classList.remove('show');
        });
    }
}

/**
 * Triggered when a user clicks "Customize" on a product card
 */
window.openCustomize = (category, title = "CUSTOM DESIGN") => {
    const modal = document.getElementById('customizeModal');
    const cfg = CONFIG[category];
    
    if (!cfg) return;

    // Set Initial Item State
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
    
    // Update Modal UI
    document.getElementById('previewTitle').innerText = title;
    document.getElementById('currentCategory').innerText = cfg.name;
    document.getElementById('basePrice').innerText = cfg.base;
    
    // Render Selection Buttons
    renderOptions('positionGroup', cfg.positions, 'selectedPos');
    renderOptions('fitGroup', cfg.fits, 'selectedFit');
    renderOptions('colorGroup', cfg.colors, 'selectedColor');
    
    calculatePrice();
    modal.classList.add('show');
};

/**
 * Renders the toggle buttons inside the modal
 */
function renderOptions(groupId, options, stateKey) {
    const container = document.getElementById(groupId);
    if (!container) return;

    container.innerHTML = options.map((opt, i) => 
        `<button class="opt-btn ${i === 0 ? 'active' : ''}" 
            onclick="updateSelection(this, '${stateKey}', '${opt}')">${opt}</button>`
    ).join('');
}

/**
 * Handles clicking on options (Color, Fit, Position)
 */
window.updateSelection = (btn, stateKey, value) => {
    // Update active UI state
    btn.parentElement.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update Data
    currentItem[stateKey] = value;

    // Visual Feedback: Change Mockup Color
    if (stateKey === 'selectedColor') {
        const mockup = document.getElementById('mockup');
        if (mockup) {
            // Remove previous color classes and add new one
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

// 4. CART ACTIONS
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
    
    // Close modal and show success
    document.getElementById('customizeModal').classList.remove('show');
    
    // Custom Toast or Alert
    alert(`${currentItem.name} added to cart!`);
};

function updateCartCount() {
    const badge = document.getElementById('cartCount');
    if (badge) badge.innerText = cart.length;
}

// 5. QUANTITY LOGIC (Optional helper)
window.changeQty = (num) => {
    currentItem.qty = Math.max(1, currentItem.qty + num);
    const qtyDisplay = document.getElementById('itemQty');
    if (qtyDisplay) qtyDisplay.innerText = currentItem.qty;
    calculatePrice();
};
