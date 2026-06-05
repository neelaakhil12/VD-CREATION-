// checkout.js - Checkout logic, coupon validations and order summaries for VD CREATION checkout page

let checkoutSubtotal = 0;
let checkoutDiscount = 0;
let checkoutShipping = 50; // default shipping
let checkoutTotal = 0;

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutSummary();
  bindCheckoutEvents();
});

function renderCheckoutSummary() {
  const list = document.getElementById('checkout-items-list');
  const subtotalText = document.getElementById('checkout-subtotal');
  const discountText = document.getElementById('checkout-discount');
  const shippingText = document.getElementById('checkout-shipping');
  const totalText = document.getElementById('checkout-total');
  
  if (!list || !subtotalText || !discountText || !shippingText || !totalText) return;

  const cart = window.VDEcommerce.cart;

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="py-12 text-center text-gray-500 space-y-4">
        <i class="fas fa-shopping-bag text-3xl text-gray-700"></i>
        <p class="text-xs">Your shopping cart is currently empty.</p>
        <a href="services.html" class="inline-block bg-[#D4AF37] text-[#0B1F3A] font-bold text-xs py-2 px-6 rounded-lg transition-colors">Start Customizing</a>
      </div>
    `;
    subtotalText.innerText = "₹0";
    discountText.innerText = "-₹0";
    shippingText.innerText = "₹0";
    totalText.innerText = "₹0";
    return;
  }

  checkoutSubtotal = 0;
  list.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    checkoutSubtotal += itemTotal;
    
    const imgUrl = item.croppedImage || item.productImage || 'assets/acrylic_frame.png';
    const sizeDetails = item.size ? `Size: ${item.size} In` : '';
    const orientationDetails = item.customization && item.customization.orientation 
      ? `(${item.customization.orientation})` 
      : '';
    const toneDetails = item.customization && item.customization.ledTone 
      ? `LED: ${item.customization.ledTone}` 
      : '';
    
    return `
      <div class="flex items-center space-x-4 border-b border-slate-800 pb-3">
        <!-- Image with frame border -->
        <div class="w-14 h-14 rounded overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
          <img src="${imgUrl}" alt="${item.productName}" class="w-full h-full object-cover">
        </div>
        <!-- Details -->
        <div class="flex-grow min-w-0">
          <h4 class="text-xs font-bold text-white truncate">${item.productName}</h4>
          <p class="text-[9px] text-gray-400 mt-0.5">${sizeDetails} ${orientationDetails} ${toneDetails}</p>
          <div class="flex items-center justify-between mt-1.5">
            <span class="text-[10px] text-gray-500 font-semibold">Qty: ${item.quantity}</span>
            <span class="text-xs font-bold text-[#D4AF37]">₹${itemTotal}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Shipping discount calculation
  if (checkoutSubtotal >= 999) {
    checkoutShipping = 0; // Free shipping above 999
  } else {
    checkoutShipping = 50;
  }

  // Coupon discount calculation
  if (window.VDEcommerce.activeCoupon) {
    const couponRate = window.VDEcommerce.coupons[window.VDEcommerce.activeCoupon] || 0;
    checkoutDiscount = Math.round(checkoutSubtotal * couponRate);
  } else {
    checkoutDiscount = 0;
  }

  checkoutTotal = checkoutSubtotal - checkoutDiscount + checkoutShipping;

  subtotalText.innerText = `₹${checkoutSubtotal.toLocaleString('en-IN')}`;
  discountText.innerText = `-₹${checkoutDiscount.toLocaleString('en-IN')}`;
  shippingText.innerText = checkoutShipping === 0 ? "FREE" : `₹${checkoutShipping}`;
  totalText.innerText = `₹${checkoutTotal.toLocaleString('en-IN')}`;
}

// Global reference to re-update summary if cart quantity changes
window.updateCheckoutSummary = function() {
  renderCheckoutSummary();
};

function bindCheckoutEvents() {
  // Coupon validation
  const couponBtn = document.getElementById('coupon-apply-btn');
  const couponInput = document.getElementById('coupon-code-input');
  const couponFeedback = document.getElementById('coupon-feedback');

  if (couponBtn && couponInput && couponFeedback) {
    couponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (!code) return;

      if (window.VDEcommerce.coupons[code]) {
        window.VDEcommerce.activeCoupon = code;
        const discRate = Math.round(window.VDEcommerce.coupons[code] * 100);
        
        couponFeedback.className = "text-[10px] font-semibold text-green-400 mt-1";
        couponFeedback.innerHTML = `<i class="fas fa-check-circle mr-1"></i> Coupon "${code}" applied successfully! Save ${discRate}%`;
        
        // Re-render
        renderCheckoutSummary();
      } else {
        couponFeedback.className = "text-[10px] font-semibold text-red-400 mt-1";
        couponFeedback.innerHTML = `<i class="fas fa-times-circle mr-1"></i> Invalid coupon code. Try WELCOME20 or VD10.`;
      }
    });
  }

  // Checkout submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (window.VDEcommerce.cart.length === 0) {
        showNotification("Your cart is empty. Please customize a product first.", "error");
        return;
      }

      // Collect values for confirmation summary
      const name = document.getElementById('chk-name').value;
      const phone = document.getElementById('chk-phone').value;
      const email = document.getElementById('chk-email').value;
      const address = document.getElementById('chk-address').value;
      const city = document.getElementById('chk-city').value;
      const zip = document.getElementById('chk-zip').value;
      
      const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
      const paymentLabel = paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (UPI/Card)';

      // Trigger Confetti Order Success Modal
      showSuccessModal(name, phone, email, address, city, zip, paymentLabel);
    });
  }
}

function showSuccessModal(name, phone, email, address, city, zip, paymentLabel) {
  // Generate randomized Order ID
  const orderId = `VD-${Math.floor(100000 + Math.random() * 900000)}-IN`;

  const modalContainer = document.createElement('div');
  modalContainer.id = 'success-modal-container';
  modalContainer.className = 'fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md';
  
  modalContainer.innerHTML = `
    <div class="bg-navy-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden transform scale-95 opacity-0 transition-all duration-300">
      
      <!-- Ambient Glow decoration -->
      <div class="absolute top-[-50px] left-1/2 -translate-x-1/2 w-48 h-48 bg-[#D4AF37]/10 rounded-full filter blur-xl"></div>
      
      <!-- Success Icon -->
      <div class="w-16 h-16 rounded-full bg-green-500/10 border border-green-500 flex items-center justify-center text-green-400 text-3xl mx-auto animate-bounce">
        <i class="fas fa-check"></i>
      </div>

      <div class="space-y-2">
        <h2 class="text-xl md:text-2xl font-black text-white">Order Placed Successfully!</h2>
        <p class="text-xs text-gray-400">Thank you, <span class="text-white font-bold">${name}</span>! Your memory frame order is heading to production.</p>
      </div>

      <!-- Order details box -->
      <div class="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-3">
        <div class="flex justify-between font-bold border-b border-slate-800 pb-2">
          <span class="text-gray-400">Order ID:</span>
          <span class="text-[#D4AF37]">${orderId}</span>
        </div>
        <div class="space-y-1.5 border-b border-slate-800 pb-2">
          <p><strong class="text-gray-400">Deliver To:</strong> ${address}, ${city} - ${zip}</p>
          <p><strong class="text-gray-400">Phone:</strong> ${phone}</p>
          <p><strong class="text-gray-400">Payment Mode:</strong> ${paymentLabel}</p>
        </div>
        <div class="flex justify-between font-bold pt-1 text-sm">
          <span>Amount Paid:</span>
          <span class="text-white">₹${checkoutTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <p class="text-[10px] text-gray-400 leading-relaxed">
        *An order confirmation invoice with custom frame mockups has been dispatched to your email <strong class="text-white">${email}</strong>. Our design editors will message you on WhatsApp shortly to confirm print sizing.
      </p>

      <button id="success-modal-close" class="w-full bg-[#D4AF37] hover:bg-[#F3CD46] text-[#0B1F3A] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-colors">
        Continue Gifting & Shopping
      </button>

    </div>
  `;

  document.body.appendChild(modalContainer);

  // Trigger anims
  setTimeout(() => {
    const modalBox = modalContainer.querySelector('div');
    if (modalBox) {
      modalBox.classList.remove('scale-95', 'opacity-0');
      modalBox.classList.add('scale-100', 'opacity-100');
    }
  }, 10);

  // Bind close action
  const closeBtn = document.getElementById('success-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // Clear cart
      window.VDEcommerce.cart = [];
      localStorage.setItem('vd_cart', JSON.stringify([]));
      
      modalContainer.remove();
      
      // Redirect
      window.location.href = 'index.html';
    });
  }
}
