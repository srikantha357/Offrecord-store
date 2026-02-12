const container = document.getElementById("product-container");
const loadMoreBtn = document.getElementById("load-more-btn");

let currentIndex = 0;
const itemsPerLoad = 8;

// LOAD PRODUCTS
function loadProducts() {
  for (let i = currentIndex; i < currentIndex + itemsPerLoad; i++) {
    if (i >= products.length) {
      loadMoreBtn.style.display = "none";
      break;
    }

    const p = products[i];

    container.innerHTML += `
      <div class="product-card">
        <img src="${p.image}" loading="lazy" onclick="addToCart(${p.id})">
        <div class="product-info">
          <h4>${p.name}</h4>
          <p class="old-price">₹${p.oldPrice}</p>
          <p class="price">₹${p.price}</p>
          <button onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    `;
  }

  currentIndex += itemsPerLoad;

  if (currentIndex >= products.length) {
    loadMoreBtn.style.display = "none";
  }
}

// LOAD MORE BUTTON CLICK
loadMoreBtn.addEventListener("click", loadProducts);

// ADD TO CART
function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(products.find(p => p.id === id));
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "cart.html";
}

// UPDATE CART COUNT
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const countElement = document.getElementById("cart-count");
  if (countElement) {
    countElement.innerText = cart.length;
  }
}

// HERO SLIDER
function startSlider() {
  let slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;

  let currentSlide = 0;

  setInterval(() => {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
  }, 4000);
}

// INITIAL LOAD
loadProducts();
updateCartCount();
startSlider();
