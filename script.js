/**
 * OFFRECORD STORE - Core Logic 2026
 */

// 1. PRODUCT & CONFIG DATA
const CONFIG = {
    tshirts: { base: 799, positions: ['Front', 'Back', 'Pocket'], fits: ['Regular', 'Oversized'], colors: ['Black', 'White', 'Blue'] },
    joggers: { base: 1299, positions: ['Left Thigh', 'Full Leg'], fits: ['Tapered', 'Baggy'], colors: ['Black', 'Grey'] },
    hoodies: { base: 1899, positions: ['Chest', 'Back'], fits: ['Heavyweight'], colors: ['Black', 'Oatmeal'] },
    vests: { base: 699, positions: ['Center'], fits: ['Stringer', 'Standard'], colors: ['Black', 'Red'] }
};

let cart = JSON.parse(localStorage.getItem('off_cart')) || [];
let currentItem = { qty: 1, base: 0, extra: 0 };

// 2. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initRotators();
    if (document.body.dataset.page === 'shop') initShop();
    if (document.body.dataset.page === 'cart') renderCart();
    
    // Mobile Nav Toggle
    document.getElementById('navToggle')?.addEventListener('click', () => {
        document.getElementById('mainNav').classList.toggle('show');
    });
});

// 3. SHOP & CUSTOMIZATION LOGIC
function initShop() {
    // Example: This would normally be an API call or a larger array
    const designs = [
        { id: 'd1', title: 'DISCIPLINE', category: 'tshirts' },
        { id: 'd2', title: 'OFF THE RECORD', category: 'hoodies' },
        { id: 'd3', title: 'LIMITLESS', category: 'vests' }
    ];

    // Close Modal
    document.getElementById('closeCustomize')?.addEventListener('click', () => {
        document.getElementById('customizeModal').classList.remove('show');
    });
}

window.openCustomize = (category, title) => {
    const modal = document.getElementById('customizeModal');
    const cfg = CONFIG[category];
    currentItem = { ...cfg, category, title, qty: 1, extra: 0, selectedColor: cfg.colors[0] };
    
    document.getElementById('previewTitle').innerText = title;
    document.getElementById('basePrice').innerText = cfg.base;
    renderOptions('printPositionGroup', cfg.positions);
    renderOptions('fitGroup', cfg.fits);
    renderOptions('colorGroup', cfg.colors);
    
    calculatePrice();
    modal.classList.add('show');
};

function renderOptions(groupId, options) {
    const container = document.getElementById(groupId);
    container.innerHTML = options.map((opt, i) => 
        `<button class="opt-btn ${i===0?'active':''}" onclick="selectOpt(this, '${groupId}', '${opt}')">${opt}</button>`
    ).join('');
}

window.selectOpt = (btn, groupId, value) => {
    btn.parentElement.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Update preview logic here (e.g., change mockup color)
    if(groupId === 'colorGroup') {
        const mockup = document.getElementById('mockup');
        mockup.className = `mockup ${value.toLowerCase()}`;
    }
};

function calculatePrice() {
    const total = (currentItem.base + currentItem.extra) * currentItem.qty;
    document.getElementById('finalPrice').innerText = currentItem.base + currentItem.extra;
    document.getElementById('lineTotal').innerText = total;
}

// 4. CART LOGIC
window.addToCart = () => {
    cart.push({ ...currentItem, id: Date.now() });
    localStorage.setItem('off_cart', JSON.stringify(cart));
    updateCartCount();
    document.getElementById('customizeModal').classList.remove('show');
    alert('Added to cart!');
};

function updateCartCount() {
    const badge = document.getElementById('cartCount');
    if (badge) badge.innerText = cart.length;
}

// 5. HERO ROTATOR
function initRotators() {
    document.querySelectorAll('[data-rotator]').forEach(rotator => {
        const slides = rotator.querySelectorAll('.rotator-slide');
        let current = 0;
        setInterval(() => {
            slides[current].classList.remove('is-active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('is-active');
        }, rotator.dataset.interval || 3000);
    });
}
