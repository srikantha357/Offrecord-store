/**
 * OFFRECORD STORE - Master Logic 2026
 * Bonkers Studio Edition
 */

const SLIDESHOW_IMAGES = ['images/ome 1.jpg', 'images/ome2.jpg', 'images/ome3.jpg'];
const ANIME_PRODUCTS = [
    { id: 1, title: "SOLO LEVELING", img: "images/anime1.jpg" },
    { id: 2, title: "JUJUTSU KAISEN", img: "images/anime2.jpg" },
    { id: 3, title: "ATTACK ON TITAN", img: "images/anime3.jpg" }
];

let cart = JSON.parse(localStorage.getItem('offrecord_cart')) || [];
let currentItem = { qty: 1, base: 799, selectedColor: 'White', selectedFit: 'Oversized', selectedSize: 'L' };

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    const page = document.body.dataset.page;
    if (page === 'home') initSlideshow();
    if (page === 'shop') initShop();
    
    // Simple Nav Toggle
    document.getElementById('navToggle')?.addEventListener('click', () => {
        document.getElementById('mainNav').classList.toggle('show');
    });
});

function initSlideshow() {
    const hero = document.getElementById('hero-slideshow');
    let idx = 0;
    setInterval(() => {
        hero.style.backgroundImage = `url('${SLIDESHOW_IMAGES[idx]}')`;
        idx = (idx + 1) % SLIDESHOW_IMAGES.length;
    }, 5000);
}

function initShop() {
    const grid = document.querySelector('.product-display-grid');
    if (!grid) return;

    grid.innerHTML = ANIME_PRODUCTS.map(prod => `
        <div class="product-card" onclick="openCustomizer('tshirts', '${prod.title}')">
            <div class="product-image" style="background-image: url('${prod.img}');"></div>
            <div class="product-info">
                <h3>${prod.title}</h3>
                <p class="price">INR 799.00</p>
            </div>
        </div>
    `).join('');
}

window.openCustomizer = (cat, title) => {
    currentItem.title = title;
    document.getElementById('previewTitle').innerText = title;
    document.getElementById('customizeModal').classList.add('show');
    // Rendering logic for buttons remains the same as before...
};

window.addToCart = () => {
    cart.push({...currentItem, id: Date.now()});
    localStorage.setItem('offrecord_cart', JSON.stringify(cart));
    updateCartCount();
    document.getElementById('customizeModal').classList.remove('show');
    alert("PRODUCT ADDED TO BAG");
};

function updateCartCount() {
    const badge = document.getElementById('cartCount');
    if (badge) badge.innerText = cart.length;
}

window.closeModal = () => document.getElementById('customizeModal').classList.remove('show');
