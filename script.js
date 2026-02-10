const ACCENTS = ["#ff4f9a", "#6a5cff", "#00a99d", "#ff7a00", "#0f9d58"];
const SHIPPING_FLAT = 99;

const byId = (id) => document.getElementById(id);

function setAccent(color) {
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--accent-dark", shadeColor(color, -8));
  localStorage.setItem("accentColor", color);
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const r = (num >> 16) + amt;
  const g = ((num >> 8) & 0x00ff) + amt;
  const b = (num & 0x0000ff) + amt;
  return `#${(0x1000000 + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1)}`;
}

function clamp(v) {
  return Math.max(0, Math.min(255, v));
}

function randomAccent() {
  return ACCENTS[Math.floor(Math.random() * ACCENTS.length)];
}

function initNav() {
  const page = document.body?.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) link.classList.add("active");
  });

  const toggle = byId("navToggle");
  const nav = byId("mainNav");
  toggle?.addEventListener("click", () => nav?.classList.toggle("open"));
}

function setupConsentModal() {
  const modal = byId("consentModal");
  if (!modal) return;

  const consentDone = localStorage.getItem("consentDone");
  if (!consentDone) {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }

  byId("skipRegister")?.addEventListener("click", () => {
    localStorage.setItem("consentDone", "true");
    document.cookie = "offrecord_cookie_consent=true; max-age=31536000; path=/";
    modal.classList.remove("show");
  });

  byId("registerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = {
      name: byId("regName")?.value || "",
      email: byId("regEmail")?.value || "",
      phone: byId("regPhone")?.value || "",
    };
    localStorage.setItem("userProfile", JSON.stringify(user));
    localStorage.setItem("consentDone", "true");
    document.cookie = "offrecord_cookie_consent=true; max-age=31536000; path=/";
    setAccent(randomAccent());
    modal.classList.remove("show");
  });
}

function setupCarousel() {
  const rightCarousel = byId("modelCarousel");
  const leftCarousel = byId("leftCarousel");
  if (!rightCarousel && !leftCarousel) return;

  const rightImages = rightCarousel ? [...rightCarousel.querySelectorAll("img")] : [];
  const leftImages = leftCarousel ? [...leftCarousel.querySelectorAll("img")] : [];
  const frameCount = Math.max(rightImages.length, leftImages.length);
  if (!frameCount) return;

  let i = 0;
  setInterval(() => {
    rightImages.forEach((img) => img.classList.remove("active"));
    leftImages.forEach((img) => img.classList.remove("active"));

    i = (i + 1) % frameCount;

    if (rightImages[i % rightImages.length]) rightImages[i % rightImages.length].classList.add("active");
    if (leftImages[i % leftImages.length]) leftImages[i % leftImages.length].classList.add("active");
  }, 3000);
}

function normalizeCart(cart) {
  const map = new Map();
  cart.forEach((item) => {
    const key = `${item.product}-${item.price}`;
    const existing = map.get(key);
    if (existing) existing.qty += item.qty || 1;
    else map.set(key, { product: item.product, price: Number(item.price), qty: item.qty || 1 });
  });
  return [...map.values()];
}

function getCart() {
  const raw = JSON.parse(localStorage.getItem("cart") || "[]");
  return normalizeCart(raw);
}

function setCart(items) {
  localStorage.setItem("cart", JSON.stringify(items));
  renderCartCount();
}

function renderCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  const badge = byId("cartCount");
  if (badge) badge.textContent = String(count);
}

function setupCartButtons() {
  document.querySelectorAll(".add-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = btn.dataset.product;
      const price = Number(btn.dataset.price || 0);
      const cart = getCart();
      const found = cart.find((item) => item.product === product && item.price === price);
      if (found) found.qty += 1;
      else cart.push({ product, price, qty: 1 });
      setCart(cart);
      btn.classList.add("added");
      setTimeout(() => btn.classList.remove("added"), 450);
      btn.textContent = "Added ✓";
      setTimeout(() => (btn.textContent = "Add to Cart"), 900);
    });
  });
}

function updateQuantity(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  setCart(cart);
  renderCart();
}

function renderCart() {
  const cartItems = byId("cartItems");
  const subtotalEl = byId("subtotal");
  const shippingEl = byId("shipping");
  const totalEl = byId("cartTotal");
  const empty = byId("emptyCart");

  if (!cartItems || !subtotalEl || !totalEl) return;

  const cart = getCart();
  if (!cart.length) {
    cartItems.innerHTML = "";
    empty?.classList.remove("hidden");
    subtotalEl.textContent = "0";
    if (shippingEl) shippingEl.textContent = "0";
    totalEl.textContent = "0";
    return;
  }

  empty?.classList.add("hidden");
  cartItems.innerHTML = cart
    .map(
      (item, index) => `
        <li class="cart-item">
          <div>
            <strong>${item.product}</strong><br />
            <span class="muted">₹${item.price} each</span>
          </div>
          <div class="cart-controls">
            <button class="qty-btn" data-index="${index}" data-action="dec">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-index="${index}" data-action="inc">+</button>
          </div>
        </li>
      `,
    )
    .join("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? SHIPPING_FLAT : 0;
  subtotalEl.textContent = String(subtotal);
  if (shippingEl) shippingEl.textContent = String(shipping);
  totalEl.textContent = String(subtotal + shipping);

  cartItems.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const action = btn.dataset.action;
      updateQuantity(index, action === "inc" ? 1 : -1);
    });
  });
}

function setupProfile() {
  const form = byId("profileForm");
  if (!form) return;

  const existing = JSON.parse(localStorage.getItem("userProfile") || "{}");
  byId("profileName").value = existing.name || "";
  byId("profileEmail").value = existing.email || "";
  byId("profileAddress").value = existing.address || "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = {
      name: byId("profileName").value,
      email: byId("profileEmail").value,
      address: byId("profileAddress").value,
    };
    localStorage.setItem("userProfile", JSON.stringify(user));
    setAccent(randomAccent());
    alert("Profile updated successfully.");
  });

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const ordersList = byId("ordersList");
  if (ordersList) {
    ordersList.innerHTML = orders.length
      ? orders.map((o) => `<li class="cart-item"><span><strong>${o.id}</strong><br/><span class='muted'>${o.date}</span></span><strong>₹${o.amount}</strong></li>`).join("")
      : "<li class='muted'>No orders yet.</li>";
  }
}

function validateContact() {
  const name = byId("contactName");
  const email = byId("contactEmail");
  const message = byId("contactMessage");

  if (!name || !email || !message) return true;

  let valid = true;
  byId("nameError").textContent = "";
  byId("emailError").textContent = "";
  byId("messageError").textContent = "";

  if (!name.value.trim() || name.value.trim().length < 2) {
    byId("nameError").textContent = "Please enter a valid name.";
    valid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    byId("emailError").textContent = "Please enter a valid email address.";
    valid = false;
  }

  if (!message.value.trim() || message.value.trim().length < 10) {
    byId("messageError").textContent = "Message should be at least 10 characters.";
    valid = false;
  }

  return valid;
}

function setupContactForm() {
  const form = byId("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateContact()) return;
    byId("contactSuccess")?.classList.remove("hidden");
    form.reset();
  });
}

function toggleLoader(show) {
  const loader = byId("paymentLoader");
  if (!loader) return;
  loader.classList.toggle("show", show);
}

function setupRazorpay() {
  const btn = byId("rzpButton");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = subtotal + (subtotal ? SHIPPING_FLAT : 0);
    const paymentError = byId("paymentError");
    if (paymentError) paymentError.textContent = "";

    if (!total) {
      if (paymentError) paymentError.textContent = "Cart is empty. Add products before checkout.";
      return;
    }

    toggleLoader(true);

    setTimeout(() => {
      const options = {
        key: "rzp_test_your_key_here",
        amount: total * 100,
        currency: "INR",
        name: "Offrecord Store",
        description: "Order Payment",
        handler() {
          const orders = JSON.parse(localStorage.getItem("orders") || "[]");
          orders.push({ id: `ORD-${Date.now()}`, amount: total, date: new Date().toLocaleString() });
          localStorage.setItem("orders", JSON.stringify(orders));
          localStorage.removeItem("cart");
          renderCartCount();
          window.location.href = "success.html";
        },
        theme: { color: localStorage.getItem("accentColor") || ACCENTS[0] },
      };

      if (window.Razorpay) {
        const rzp = new Razorpay(options);
        rzp.on("payment.failed", (response) => {
          const msg = response?.error?.description || "Payment failed. Please retry.";
          if (paymentError) paymentError.textContent = msg;
        });
        toggleLoader(false);
        rzp.open();
      } else {
        toggleLoader(false);
        if (paymentError) paymentError.textContent = "Razorpay SDK unavailable. Check internet or key.";
      }
    }, 900);
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

const savedAccent = localStorage.getItem("accentColor");
if (savedAccent) setAccent(savedAccent);

initNav();
setupConsentModal();
setupCarousel();
setupCartButtons();
renderCart();
renderCartCount();
setupProfile();
setupContactForm();
setupRazorpay();
