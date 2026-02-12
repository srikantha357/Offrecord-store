// Dummy Data
const DUMMY_PRODUCTS = [
    { id: 1, name: "Oversized Anime Tee", price: 799, oldPrice: 1299, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800" },
    { id: 2, name: "Urban Cargo Joggers", price: 1499, oldPrice: 1999, img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800" },
    { id: 3, name: "Street Graffiti Hoodie", price: 2499, oldPrice: 2999, img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800" },
    { id: 4, name: "Boxy Fit Denim Jacket", price: 3999, oldPrice: 4999, img: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800" }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let page = 1;

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    const grid = document.getElementById('productGrid');
    if (grid) {
        loadProducts(); // Initial Load
        window.addEventListener('scroll', handleInfiniteScroll);
    }
    if (document.getElementById('cartItems')) renderCart();
});

// Load Products with Fade-in
function loadProducts() {
    const grid = document.getElementById('productGrid');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'block';

    setTimeout(() => {
        DUMMY_PRODUCTS.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.onclick = () => addToCart(p);
            card.innerHTML = `
                <div class="img-wrap">
                    <span class="discount-badge">SAVE 20%</span>
                    <img src="${p.img}" alt="${p.name}">
                </div>
                <div class="product-info">
                    <div class="product-name">${p.name}</div>
                    <div class="price-row">
                        <span class="new-price">₹${p.price}</span>
                        <span class="old-price">₹${p.oldPrice}</span>
                    </div>
                    <button class="add-btn">ADD TO CART</button>
                </div>
            `;
            grid.appendChild(card);
        });
        loading.style.display = 'none';
        page++;
    }, 1000);
}

// Infinite Scroll Logic
function handleInfiniteScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        if (page < 5) loadProducts(); // Limit for dummy data
    }
}

// Cart Functionality
function addToCart(product) {
    cart.push({ ...product, cartId: Date.now(), qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'cart.html'; // Direct redirect as requested
}

function updateCartCount() {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(b => b.innerText = cart.length);
}

function renderCart() {
    const container = document.getElementById('cartItems');
    let total = 0;
    
    if (cart.length === 0) {
        container.innerHTML = "<h2>Your bag is empty.</h2>";
        return;
    }

    container.innerHTML = cart.map((item, idx) => {
        total += item.price;
        return `
            <div class="cart-item">
                <img src="${item.img}" class="cart-img">
                <div style="flex:1">
                    <div class="product-name">${item.name}</div>
                    <div class="new-price">₹${item.price}</div>
                    <select class="add-btn" style="width:100px; margin: 10px 0;">
                        <option>Size: L</option><option>Size: M</option>
                    </select>
                    <button onclick="removeItem(${idx})" style="display:block; font-size:0.7rem; cursor:pointer;">REMOVE</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('grandTotal').innerText = `₹${total}`;
}

function removeItem(idx) {
    cart.splice(idx, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

function placeOrder() {
    alert("Order placed successfully!");
    localStorage.removeItem('cart');
    window.location.href = 'index.html';
}
