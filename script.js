(() => {
  const STORAGE_KEYS = {
    CART: 'offrecord_cart_v2',
    ORDERS: 'offrecord_orders_v2',
    PROFILE: 'offrecord_profile_v2',
    COUPON: 'offrecord_coupon_v2',
  };

  const PRICING = {
    'T-Shirt': 999,
    'Joggers': 1499,
    'Hoodie': 1799,
    'Gym Vest': 799,
  };

  const COUPONS = { OFF10: 0.1, GYM15: 0.15, FIRSTBUY: 0.2 };

  const SHOP_DATA = {
    tshirts: {
      category: 'T-Shirt',
      quotes: [
        { quote: 'Discipline Over Motivation', style: 'Bold Sans / Neon Outline' },
        { quote: 'No Excuses, Just Reps', style: 'Condensed Gothic' },
        { quote: 'Built in Silence', style: 'Minimal Script Contrast' },
      ],
    },
    joggers: {
      category: 'Joggers',
      quotes: [
        { quote: 'Leg Day Legacy', style: 'Monospace Athletic' },
        { quote: 'Pain is Data', style: 'Industrial Typeface' },
        { quote: 'Earned Not Given', style: 'Brush Impact' },
      ],
    },
    hoodies: {
      category: 'Hoodie',
      quotes: [
        { quote: 'Train in the Shadows', style: 'Urban Serif' },
        { quote: 'Heavy Mindset Club', style: 'Bold Slab' },
        { quote: 'One More Set', style: 'Wide Sans' },
      ],
    },
    vests: {
      category: 'Gym Vest',
      quotes: [
        { quote: 'Sweat Equity', style: 'Tight Grotesk' },
        { quote: 'Chase the Pump', style: 'Sport Rounded' },
        { quote: 'Lift. Fuel. Repeat.', style: 'Monoline Tech' },
      ],
    },
  };

  const INVENTORY_RULES = {
    'T-Shirt|Black|XL': 5,
    'Hoodie|*|M': 0,
  };

  const state = {
    currentDesign: null,
    options: {
      printPosition: 'Front',
      fit: 'Regular',
      size: 'M',
      color: 'Black',
      quantity: 1,
      premiumFabric: false,
    },
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const storage = {
    get(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
  };

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  function initBase() {
    initNav();
    markActivePage();
    updateCartBadge();
    setupHomeRedirectLinks();
    initHomeRotators();
    setupContactForm();
    setupProfile();
    renderOrders();
  }

  function initHomeRotators() {
    const rotators = $$('[data-rotator]');
    rotators.forEach((rotator) => {
      const slides = $$('.rotator-slide', rotator);
      if (slides.length < 2) return;

      let active = slides.findIndex((s) => s.classList.contains('is-active'));
      if (active < 0) active = 0;
      slides[active].classList.add('is-active');

      const intervalMs = Number(rotator.dataset.interval) || 2800;
      setInterval(() => {
        slides[active].classList.remove('is-active');
        active = (active + 1) % slides.length;
        slides[active].classList.add('is-active');
      }, intervalMs);
    });
  }

  function initNav() {
    const toggle = $('#navToggle');
    const nav = $('#mainNav');
    toggle?.addEventListener('click', () => nav?.classList.toggle('open'));
  }

  function markActivePage() {
    const page = document.body.dataset.page;
    $$('[data-nav]').forEach((a) => {
      if (a.dataset.nav === page) a.classList.add('active');
    });
  }

  function setupHomeRedirectLinks() {
    $$('[data-shop-link]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const section = el.dataset.shopLink || 'all';
        window.location.href = `shop.html?section=${encodeURIComponent(section)}`;
      });
    });
  }

  function getCart() {
    return storage.get(STORAGE_KEYS.CART, []);
  }

  function setCart(items) {
    storage.set(STORAGE_KEYS.CART, items);
    updateCartBadge();
  }

  function updateCartBadge() {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    const badge = $('#cartCount');
    if (badge) badge.textContent = String(count);
  }

  function computeExtraCharges(item) {
    let extra = 0;
    if (item.fit === 'Oversized') extra += 150;
    if (item.size === 'XXL') extra += 100;
    if (item.category === 'Hoodie' && item.printPosition === 'Back') extra += 200;
    if (item.category === 'Joggers' && item.premiumFabric) extra += 250;
    return extra;
  }

  function computeUnitPrice(item) {
    return item.basePrice + computeExtraCharges(item);
  }

  function getStock(category, color, size) {
    const exact = `${category}|${color}|${size}`;
    const wildcardColor = `${category}|*|${size}`;
    if (Object.hasOwn(INVENTORY_RULES, exact)) return INVENTORY_RULES[exact];
    if (Object.hasOwn(INVENTORY_RULES, wildcardColor)) return INVENTORY_RULES[wildcardColor];
    return 20;
  }

  function initShopPage() {
    if (document.body.dataset.page !== 'shop') return;

    renderShopSection('tshirts');
    renderShopSection('joggers');
    renderShopSection('hoodies');
    renderShopSection('vests');

    initCustomizeModal();
    smoothScrollToQuerySection();
  }

  function renderShopSection(key) {
    const section = SHOP_DATA[key];
    const wrap = $(`#${key} .grid`);
    if (!wrap || !section) return;

    wrap.innerHTML = section.quotes
      .map(
        (q) => `
          <article class="design-card">
            <p class="quote-text">“${q.quote}”</p>
            <p class="quote-style">Style: ${q.style}</p>
            <button class="btn customize-btn"
              data-category="${section.category}"
              data-quote="${q.quote}"
              data-style="${q.style}">
              Customize
            </button>
          </article>
        `,
      )
      .join('');
  }

  function smoothScrollToQuerySection() {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (!section || section === 'all') return;
    const target = document.getElementById(section);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  }

  function initCustomizeModal() {
    const modal = $('#customizeModal');
    if (!modal) return;

    const closeBtn = $('#closeCustomize');
    const openButtons = $$('.customize-btn');

    openButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.currentDesign = {
          category: btn.dataset.category,
          quote: btn.dataset.quote,
          style: btn.dataset.style,
          basePrice: PRICING[btn.dataset.category],
        };
        state.options = {
          printPosition: 'Front',
          fit: 'Regular',
          size: 'M',
          color: 'Black',
          quantity: 1,
          premiumFabric: false,
        };

        modal.classList.add('show');
        renderModalOptions();
        renderModalPreview();
        renderModalPricing();
      });
    });

    closeBtn?.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('show');
    });

    $('#qtyDec')?.addEventListener('click', () => {
      state.options.quantity = Math.max(1, state.options.quantity - 1);
      renderModalPricing();
      $('#qtyValue').textContent = String(state.options.quantity);
    });

    $('#qtyInc')?.addEventListener('click', () => {
      state.options.quantity += 1;
      renderModalPricing();
      $('#qtyValue').textContent = String(state.options.quantity);
    });

    $('#premiumFabric')?.addEventListener('change', (e) => {
      state.options.premiumFabric = Boolean(e.target.checked);
      renderModalPricing();
    });

    $('#addCustomizedToCart')?.addEventListener('click', addCustomizedItemToCart);
  }

  function chipTemplate(group, value) {
    const selected = state.options[group] === value ? 'active' : '';
    return `<button class="option-chip ${selected}" data-group="${group}" data-value="${value}">${value}</button>`;
  }

  function renderModalOptions() {
    $('#previewTitle').textContent = state.currentDesign.quote;
    $('#previewQuote').textContent = state.currentDesign.quote;
    $('#currentCategory').textContent = `${state.currentDesign.category} • ${state.currentDesign.style}`;

    $('#printPositionGroup').innerHTML = ['Front', 'Back'].map((v) => chipTemplate('printPosition', v)).join('');
    $('#fitGroup').innerHTML = ['Regular', 'Oversized'].map((v) => chipTemplate('fit', v)).join('');
    $('#sizeGroup').innerHTML = ['S', 'M', 'L', 'XL', 'XXL'].map((v) => chipTemplate('size', v)).join('');
    $('#colorGroup').innerHTML = ['Blue', 'White', 'Black'].map((v) => chipTemplate('color', v)).join('');

    $$('.option-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const group = chip.dataset.group;
        const value = chip.dataset.value;
        state.options[group] = value;
        renderModalOptions();
        renderModalPreview();
        renderModalPricing();
      });
    });

    const joggerFabric = $('#fabricOptionWrap');
    if (state.currentDesign.category === 'Joggers') {
      joggerFabric.classList.remove('hidden');
    } else {
      joggerFabric.classList.add('hidden');
      state.options.premiumFabric = false;
      $('#premiumFabric').checked = false;
    }

    $('#qtyValue').textContent = String(state.options.quantity);
  }

  function renderModalPreview() {
    const mockup = $('#mockup');
    const quote = $('#previewQuote');
    if (!mockup || !quote) return;

    mockup.classList.remove('front', 'back', 'regular', 'oversized', 'blue', 'white', 'black');
    mockup.classList.add(state.options.printPosition.toLowerCase());
    mockup.classList.add(state.options.fit.toLowerCase());
    mockup.classList.add(state.options.color.toLowerCase());
    quote.textContent = state.currentDesign.quote;
  }

  function renderModalPricing() {
    const snapshot = {
      ...state.options,
      category: state.currentDesign.category,
      basePrice: state.currentDesign.basePrice,
    };

    const extra = computeExtraCharges(snapshot);
    const finalUnit = snapshot.basePrice + extra;
    const line = finalUnit * snapshot.quantity;

    $('#basePrice').textContent = String(snapshot.basePrice);
    $('#extraCharges').textContent = String(extra);
    $('#finalPrice').textContent = String(finalUnit);
    $('#lineTotal').textContent = String(line);

    const stock = getStock(snapshot.category, snapshot.color, snapshot.size);
    const stockNote = $('#stockNote');
    const addBtn = $('#addCustomizedToCart');
    const err = $('#customizeError');

    if (stock <= 0) {
      stockNote.textContent = 'Out of stock for selected variant.';
      addBtn.disabled = true;
      err.textContent = 'Please change size/color to continue.';
    } else {
      stockNote.textContent = `Only ${stock} left for this variant.`;
      addBtn.disabled = snapshot.quantity > stock;
      err.textContent = snapshot.quantity > stock ? `Max available quantity: ${stock}` : '';
    }
  }

  function addCustomizedItemToCart() {
    const item = {
      id: uid(),
      category: state.currentDesign.category,
      quote: state.currentDesign.quote,
      printPosition: state.options.printPosition,
      fit: state.options.fit,
      size: state.options.size,
      color: state.options.color,
      quantity: state.options.quantity,
      premiumFabric: state.options.premiumFabric,
      basePrice: state.currentDesign.basePrice,
    };

    const stock = getStock(item.category, item.color, item.size);
    if (stock <= 0 || item.quantity > stock) return;

    item.extraCharges = computeExtraCharges(item);
    item.finalPrice = computeUnitPrice(item);

    const cart = getCart();
    cart.push(item);
    setCart(cart);
    $('#customizeError').textContent = '';
    $('#stockNote').textContent = 'Added to cart successfully.';
    setTimeout(() => {
      $('#customizeModal')?.classList.remove('show');
    }, 420);
  }

  function initCartPage() {
    if (document.body.dataset.page !== 'cart') return;
    renderCartPage();
    bindCouponActions();
    bindCheckout();
  }

  function getCouponRate() {
    const code = storage.get(STORAGE_KEYS.COUPON, '');
    return COUPONS[code] || 0;
  }

  function calculateCartTotals(cart) {
    const subtotal = cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    const discountRate = getCouponRate();
    const discountAmount = Math.floor(subtotal * discountRate);
    const grand = subtotal - discountAmount;
    return { subtotal, discountAmount, grand };
  }

  function renderCartPage() {
    const list = $('#cartItems');
    if (!list) return;

    const cart = getCart();
    const empty = $('#emptyCart');

    if (!cart.length) {
      list.innerHTML = '';
      empty?.classList.remove('hidden');
      updateCartTotalsUI(0, 0, 0);
      return;
    }

    empty?.classList.add('hidden');

    list.innerHTML = cart
      .map(
        (item, index) => `
          <li class="cart-item">
            <div class="row"><strong>${item.quote}</strong><button class="btn-outline remove-item" data-index="${index}">Remove</button></div>
            <p class="muted">${item.category} • ${item.color} • ${item.size} • ${item.fit} • ${item.printPosition}${item.premiumFabric ? ' • Premium Fabric' : ''}</p>
            <div class="row">
              <div class="qty-control">
                <button class="qty-btn cart-dec" data-index="${index}">−</button>
                <strong>${item.quantity}</strong>
                <button class="qty-btn cart-inc" data-index="${index}">+</button>
              </div>
              <div><strong>₹${item.finalPrice * item.quantity}</strong><br><span class="muted">₹${item.finalPrice} each</span></div>
            </div>
          </li>
        `,
      )
      .join('');

    bindCartItemActions();
    const totals = calculateCartTotals(cart);
    updateCartTotalsUI(totals.subtotal, totals.discountAmount, totals.grand);
  }

  function bindCartItemActions() {
    $$('.remove-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const cart = getCart();
        cart.splice(idx, 1);
        setCart(cart);
        renderCartPage();
      });
    });

    $$('.cart-inc').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const cart = getCart();
        const item = cart[idx];
        const stock = getStock(item.category, item.color, item.size);
        if (item.quantity < stock) item.quantity += 1;
        setCart(cart);
        renderCartPage();
      });
    });

    $$('.cart-dec').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const cart = getCart();
        cart[idx].quantity -= 1;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
        setCart(cart);
        renderCartPage();
      });
    });
  }

  function updateCartTotalsUI(sub, disc, grand) {
    $('#subtotal').textContent = String(sub);
    $('#discountAmount').textContent = String(disc);
    $('#grandTotal').textContent = String(grand);
  }

  function bindCouponActions() {
    const applyBtn = $('#applyCoupon');
    if (!applyBtn) return;

    const saved = storage.get(STORAGE_KEYS.COUPON, '');
    if ($('#couponCode')) $('#couponCode').value = saved;

    applyBtn.addEventListener('click', () => {
      const code = ($('#couponCode')?.value || '').trim().toUpperCase();
      const msg = $('#couponMessage');
      if (!code) {
        storage.set(STORAGE_KEYS.COUPON, '');
        msg.textContent = 'Coupon removed.';
      } else if (!COUPONS[code]) {
        msg.textContent = 'Invalid coupon code.';
        return;
      } else {
        storage.set(STORAGE_KEYS.COUPON, code);
        msg.textContent = `${code} applied successfully.`;
      }
      renderCartPage();
    });
  }

  function bindCheckout() {
    const payBtn = $('#rzpButton');
    if (!payBtn) return;

    payBtn.addEventListener('click', () => {
      const cart = getCart();
      const totals = calculateCartTotals(cart);
      const error = $('#paymentError');
      error.textContent = '';

      if (!cart.length || totals.grand <= 0) {
        error.textContent = 'Cart is empty. Customize items first.';
        return;
      }

      $('#paymentLoading')?.classList.add('show');

      setTimeout(() => {
        const options = {
          key: 'rzp_test_your_key_here',
          amount: totals.grand * 100,
          currency: 'INR',
          name: 'Offrecord Store',
          description: 'Custom Apparel Order',
          handler: () => {
            const orders = storage.get(STORAGE_KEYS.ORDERS, []);
            orders.unshift({
              id: `ORD-${Date.now()}`,
              amount: totals.grand,
              items: cart,
              date: new Date().toLocaleString(),
            });
            storage.set(STORAGE_KEYS.ORDERS, orders);
            setCart([]);
            storage.set(STORAGE_KEYS.COUPON, '');
            window.location.href = 'success.html';
          },
          theme: { color: '#00f5d4' },
        };

        if (window.Razorpay) {
          const rz = new Razorpay(options);
          rz.on('payment.failed', (res) => {
            error.textContent = res?.error?.description || 'Payment failed. Try again.';
          });
          $('#paymentLoading')?.classList.remove('show');
          rz.open();
        } else {
          $('#paymentLoading')?.classList.remove('show');
          error.textContent = 'Razorpay SDK unavailable. Check network.';
        }
      }, 900);
    });
  }

  function setupContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = $('#contactName')?.value.trim() || '';
      const email = $('#contactEmail')?.value.trim() || '';
      const message = $('#contactMessage')?.value.trim() || '';

      $('#nameError').textContent = '';
      $('#emailError').textContent = '';
      $('#messageError').textContent = '';

      let ok = true;
      if (name.length < 2) {
        $('#nameError').textContent = 'Enter valid name';
        ok = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $('#emailError').textContent = 'Enter valid email';
        ok = false;
      }
      if (message.length < 10) {
        $('#messageError').textContent = 'Message should be at least 10 characters';
        ok = false;
      }

      if (!ok) return;
      $('#contactSuccess')?.classList.remove('hidden');
      form.reset();
    });
  }

  function setupProfile() {
    const form = $('#profileForm');
    if (!form) return;

    const profile = storage.get(STORAGE_KEYS.PROFILE, {});
    if ($('#profileName')) $('#profileName').value = profile.name || '';
    if ($('#profileEmail')) $('#profileEmail').value = profile.email || '';
    if ($('#profileAddress')) $('#profileAddress').value = profile.address || '';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      storage.set(STORAGE_KEYS.PROFILE, {
        name: $('#profileName')?.value || '',
        email: $('#profileEmail')?.value || '',
        address: $('#profileAddress')?.value || '',
      });
      alert('Profile updated.');
    });
  }

  function renderOrders() {
    const list = $('#ordersList');
    if (!list) return;
    const orders = storage.get(STORAGE_KEYS.ORDERS, []);
    list.innerHTML = orders.length
      ? orders
          .map((o) => `<li class="cart-item"><div class="row"><strong>${o.id}</strong><strong>₹${o.amount}</strong></div><p class="muted">${o.date}</p></li>`)
          .join('')
      : '<li class="muted">No orders yet.</li>';
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.update();
    }).catch(() => {});
  }

  initBase();
  initShopPage();
  initCartPage();
})();
