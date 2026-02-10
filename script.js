const ACCENTS = ["#ff4f9a", "#6a5cff", "#00a99d", "#ff7a00", "#0f9d58"];

function setAccent(color) {
  document.documentElement.style.setProperty("--accent", color);
  localStorage.setItem("accentColor", color);
}

function randomAccent() {
  return ACCENTS[Math.floor(Math.random() * ACCENTS.length)];
}

function setupConsentModal() {
  const modal = document.getElementById("consentModal");
  if (!modal) return;

  const consentDone = localStorage.getItem("consentDone");
  if (!consentDone) {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }

  document.getElementById("skipRegister")?.addEventListener("click", () => {
    localStorage.setItem("consentDone", "true");
    document.cookie = "offrecord_cookie_consent=true; max-age=31536000; path=/";
    modal.classList.remove("show");
  });

  document.getElementById("registerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = {
      name: document.getElementById("regName").value,
      email: document.getElementById("regEmail").value,
      phone: document.getElementById("regPhone").value,
    };
    localStorage.setItem("userProfile", JSON.stringify(user));
    localStorage.setItem("consentDone", "true");
    document.cookie = "offrecord_cookie_consent=true; max-age=31536000; path=/";
    setAccent(randomAccent());
    modal.classList.remove("show");
  });
}

function setupCarousel() {
  const carousel = document.getElementById("modelCarousel");
  if (!carousel) return;
  const images = [...carousel.querySelectorAll("img")];
  let i = 0;
  setInterval(() => {
    images[i].classList.remove("active");
    i = (i + 1) % images.length;
    images[i].classList.add("active");
  }, 2800);
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function setCart(items) {
  localStorage.setItem("cart", JSON.stringify(items));
}

function setupCartButtons() {
  document.querySelectorAll(".add-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = { product: btn.dataset.product, price: Number(btn.dataset.price) };
      const cart = getCart();
      cart.push(item);
      setCart(cart);
      alert("Added to cart");
    });
  });
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  if (!cartItems || !cartTotal) return;
  const cart = getCart();
  cartItems.innerHTML = cart.map((i) => `<li>${i.product} - ₹${i.price}</li>`).join("");
  cartTotal.textContent = cart.reduce((s, i) => s + i.price, 0);
}

function setupProfile() {
  const form = document.getElementById("profileForm");
  if (!form) return;
  const existing = JSON.parse(localStorage.getItem("userProfile") || "{}");
  document.getElementById("profileName").value = existing.name || "";
  document.getElementById("profileEmail").value = existing.email || "";
  document.getElementById("profileAddress").value = existing.address || "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = {
      name: document.getElementById("profileName").value,
      email: document.getElementById("profileEmail").value,
      address: document.getElementById("profileAddress").value,
    };
    localStorage.setItem("userProfile", JSON.stringify(user));
    setAccent(randomAccent());
    alert("Profile updated");
  });

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const ordersList = document.getElementById("ordersList");
  if (ordersList) {
    ordersList.innerHTML = orders.length
      ? orders.map((o) => `<li>${o.id} - ₹${o.amount}</li>`).join("")
      : "<li>No orders yet.</li>";
  }
}

function setupContactForm() {
  document.getElementById("contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thanks! Your enquiry has been submitted.");
    e.target.reset();
  });
}

function setupRazorpay() {
  const btn = document.getElementById("rzpButton");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const total = getCart().reduce((sum, item) => sum + item.price, 0) || 1;
    const options = {
      key: "rzp_test_your_key_here",
      amount: total * 100,
      currency: "INR",
      name: "Offrecord Store",
      description: "Order Payment",
      handler: function () {
        const orders = JSON.parse(localStorage.getItem("orders") || "[]");
        orders.push({ id: `ORD-${Date.now()}`, amount: total });
        localStorage.setItem("orders", JSON.stringify(orders));
        localStorage.removeItem("cart");
        window.location.href = "account.html";
      },
      theme: { color: localStorage.getItem("accentColor") || ACCENTS[0] },
    };

    if (window.Razorpay) {
      const rzp = new Razorpay(options);
      rzp.open();
    } else {
      alert("Razorpay SDK unavailable. Add your integration or check internet.");
    }
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

const savedAccent = localStorage.getItem("accentColor");
if (savedAccent) setAccent(savedAccent);

setupConsentModal();
setupCarousel();
setupCartButtons();
renderCart();
setupProfile();
setupContactForm();
setupRazorpay();
