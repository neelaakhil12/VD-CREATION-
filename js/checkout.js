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
  
  if (!list || !subtotalText || !shippingText || !totalText) return;

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
    if (discountText) discountText.innerText = "-₹0";
    shippingText.innerText = "₹0";
    totalText.innerText = "₹0";
    return;
  }

  checkoutSubtotal = 0;
  list.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    checkoutSubtotal += itemTotal;
    
    const imgUrl = item.croppedImage || item.productImage || 'https://res.cloudinary.com/ukftgzjx/image/upload/v1784746242/vd_creations_static_assets/acrylic_frame.jpg';
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

  // Shipping calculation
  if (checkoutSubtotal >= 999) {
    checkoutShipping = 0; // Free shipping above 999
  } else {
    checkoutShipping = 50;
  }

  checkoutDiscount = 0;
  checkoutTotal = checkoutSubtotal + checkoutShipping;

  subtotalText.innerText = `₹${checkoutSubtotal.toLocaleString('en-IN')}`;
  if (discountText) discountText.innerText = `-₹0`;
  shippingText.innerText = checkoutShipping === 0 ? "FREE" : `₹${checkoutShipping}`;
  totalText.innerText = `₹${checkoutTotal.toLocaleString('en-IN')}`;
}

// Global reference to re-update summary if cart quantity changes
window.updateCheckoutSummary = function() {
  renderCheckoutSummary();
};

function bindCheckoutEvents() {
  // Geolocation "Locate Me" button event listener
  const locateBtn = document.getElementById('locate-me-btn');
  const locateText = document.getElementById('locate-me-text');
  const mapsLinkInput = document.getElementById('chk-maps-link');

  if (locateBtn) {
    locateBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        if (window.showNotification) showNotification("Geolocation is not supported by your browser.", "error");
        return;
      }

      locateBtn.disabled = true;
      if (locateText) locateText.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-1"></i> Locating...';

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

          if (mapsLinkInput) mapsLinkInput.value = mapsUrl;

          // Reverse Geocode to fill address fields
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                const addr = data.address;
                const streetParts = [addr.house_number, addr.road, addr.suburb, addr.neighbourhood, addr.residential].filter(Boolean);
                const street = streetParts.length > 0 ? streetParts.join(', ') : (data.display_name || '');
                const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
                const state = addr.state || '';
                const postcode = addr.postcode ? addr.postcode.replace(/\s+/g, '') : '';

                const addrInput = document.getElementById('chk-address');
                const cityInput = document.getElementById('chk-city');
                const stateInput = document.getElementById('chk-state');
                const zipInput = document.getElementById('chk-zip');

                if (street && addrInput && !addrInput.value) addrInput.value = street;
                if (city && cityInput) cityInput.value = city;
                if (state && stateInput) stateInput.value = state;
                if (postcode && zipInput) zipInput.value = postcode;
              }
            }
          } catch (e) {
            console.warn("Reverse geocoding notice:", e);
          }

          if (locateText) locateText.innerHTML = '<i class="fa-solid fa-check text-green-400 mr-1"></i> Located!';
          locateBtn.disabled = false;
          if (window.showNotification) showNotification("Location detected & Google Maps link attached!", "success");
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          if (locateText) locateText.innerHTML = 'Locate Me (Auto-fill)';
          locateBtn.disabled = false;
          if (window.showNotification) showNotification("Unable to retrieve location. Please allow browser location access.", "error");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // Checkout submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const currentUser = window.VDAuth ? window.VDAuth.getCurrentUser() : null;
      if (!currentUser) {
        if (window.VDAuth) window.VDAuth.openAuthModal('checkout.html');
        showNotification("Please login or create an account to complete your purchase.", "info");
        return;
      }

      if (window.VDEcommerce.cart.length === 0) {
        showNotification("Your cart is empty. Please customize a product first.", "error");
        return;
      }

      // Collect customer details
      const name = document.getElementById('chk-name').value;
      const phone = document.getElementById('chk-phone').value;
      const email = document.getElementById('chk-email').value;
      const address = document.getElementById('chk-address').value;
      const city = document.getElementById('chk-city').value;
      const state = document.getElementById('chk-state').value;
      const zip = document.getElementById('chk-zip').value;
      const locationLink = document.getElementById('chk-maps-link') ? document.getElementById('chk-maps-link').value.trim() : '';
      
      const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
      const paymentLabel = paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (UPI/Card)';

      try {
        const SUPABASE_URL = 'https://wctyhhhvksfjqsudqwrm.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjdHloaGh2a3NmanFzdWRxd3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNjc0NDUsImV4cCI6MjA5OTg0MzQ0NX0.hsOQs0V7dSG6SoSEWrH0Gv3bcMx7Voc0SzzwVmwUMJ8';
        
        // Dynamically load Supabase client CDN if not loaded
        if (typeof window.supabase === 'undefined') {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Background non-blocking Cloudinary Uploader
        const uploadCartImagesAsync = async (cartItems, insertedOrderId) => {
          try {
            const updatedCart = await Promise.all((cartItems || []).map(async (item) => {
              const itemCopy = { ...item };
              if (itemCopy.croppedImage && itemCopy.croppedImage.startsWith('data:image')) {
                try {
                  const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: itemCopy.croppedImage, folder: 'vd_creations_orders' })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.url) itemCopy.croppedImage = data.url;
                  }
                } catch (e) {}
              }

              if (itemCopy.uploadedPhotos && Array.isArray(itemCopy.uploadedPhotos)) {
                itemCopy.uploadedPhotos = await Promise.all(itemCopy.uploadedPhotos.map(async (photo) => {
                  const photoCopy = { ...photo };
                  if (photoCopy.url && photoCopy.url.startsWith('data:image')) {
                    try {
                      const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: photoCopy.url, folder: 'vd_creations_orders' })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.url) photoCopy.url = data.url;
                      }
                    } catch (e) {}
                  }
                  return photoCopy;
                }));
              }
              return itemCopy;
            }));

            // Update order record in Supabase asynchronously with Cloudinary URLs
            if (insertedOrderId) {
              await supabaseClient
                .from('orders')
                .update({ items: updatedCart })
                .eq('id', insertedOrderId);
            }
          } catch (err) {
            console.warn("Async Cloudinary upload completed with warnings:", err);
          }
        };

        const saveOrderToDatabase = async (paymentId = null, rzpOrderId = null) => {
          const finalPaymentMethod = paymentMethod === 'online' ? 'Online Payment (Razorpay)' : 'Cash on Delivery (COD)';
          const generatedOrderId = `VD-${Math.floor(100000 + Math.random() * 900000)}-IN`;

          const initialCart = JSON.parse(JSON.stringify(window.VDEcommerce.cart || []));

          // Attach payment details into cart metadata for admin view
          initialCart.forEach(item => {
            item.paymentMethod = finalPaymentMethod;
            item.paymentId = paymentId || 'N/A';
            item.paymentStatus = paymentId ? 'PAID' : 'COD_PENDING';
            item.locationLink = locationLink;
          });

          // Insert order into Supabase & Local backup safely
          let insertedId = null;
          const orderRecord = {
            id: generatedOrderId,
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            address: address,
            city: city,
            state: state,
            pincode: zip,
            location_link: locationLink,
            total_price: checkoutTotal,
            payment_method: finalPaymentMethod,
            payment_id: paymentId || 'N/A',
            payment_status: paymentId ? 'PAID' : 'COD_PENDING',
            status: 'pending',
            items: initialCart,
            created_at: new Date().toISOString()
          };

          // Save to local backend store for 100% reliability
          try {
            fetch('/api/save-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderRecord)
            }).catch(e => console.warn("Local order sync warning:", e));
          } catch(e) {}

          try {
            const supabasePayload = {
              customer_name: name,
              customer_email: email,
              customer_phone: phone,
              address: address,
              city: city,
              state: state,
              pincode: zip,
              total_price: checkoutTotal,
              status: 'pending',
              items: initialCart
            };

            if (locationLink) {
              supabasePayload.location_link = locationLink;
            }

            let { data, error } = await supabaseClient
              .from('orders')
              .insert([supabasePayload])
              .select();

            if (error && locationLink) {
              // Retry without root location_link if schema lacks column
              delete supabasePayload.location_link;
              const res = await supabaseClient
                .from('orders')
                .insert([supabasePayload])
                .select();
              data = res.data;
              error = res.error;
            }

            if (error) {
              console.warn("Supabase order insert notice:", error.message);
            } else if (data && data.length > 0) {
              insertedId = data[0].id;
              orderRecord.supabase_id = insertedId;
              fetch('/api/save-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderRecord)
              }).catch(() => {});
            }
          } catch (err) {
            console.warn("Order save notice:", err.message);
          }

          // Trigger Success Modal & WhatsApp Redirect IMMEDIATELY
          showSuccessModal(name, phone, email, address, city, zip, finalPaymentMethod, paymentId, generatedOrderId, locationLink);

          // Run Cloudinary image upload non-blockingly in the background
          uploadCartImagesAsync(initialCart, insertedId);
        };

        // 2. Handle Online Payment (Razorpay) vs Cash on Delivery (COD)
        if (paymentMethod === 'online') {
          // Create Razorpay Order on server (< 50ms)
          const rzpResponse = await fetch('/api/create-razorpay-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: checkoutTotal })
          });

          if (!rzpResponse.ok) {
            throw new Error("Failed to initialize Razorpay payment order.");
          }

          const rzpData = await rzpResponse.json();

          const rzpOptions = {
            key: rzpData.key || 'rzp_test_TGUiQdpbxC35Go',
            amount: rzpData.amount,
            currency: rzpData.currency || 'INR',
            name: 'VD CREATION',
            description: 'Custom Photo Frame Order Payment',
            image: 'https://res.cloudinary.com/ukftgzjx/image/upload/v1784747215/vd_creations_all_images/assets_acrylic_couple.png',
            order_id: rzpData.orderId,
            prefill: {
              name: name,
              email: email,
              contact: phone
            },
            notes: {
              address: `${address}, ${city}, ${state} - ${zip}`
            },
            theme: {
              color: '#D4AF37'
            },
            handler: async function (response) {
              console.log("[Razorpay] Payment successful! Payment ID:", response.razorpay_payment_id);
              try {
                // Verify payment signature on backend
                fetch('/api/verify-razorpay-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  })
                }).catch(() => {});
              } catch (e) {}

              // Call saveOrderToDatabase & trigger WhatsApp redirect unconditionally!
              await saveOrderToDatabase(response.razorpay_payment_id, response.razorpay_order_id);
            },
            modal: {
              ondismiss: function () {
                showNotification("Payment process cancelled. You can retry anytime.", "info");
              }
            }
          };

          const rzp1 = new window.Razorpay(rzpOptions);
          rzp1.on('payment.failed', function (resp) {
            showNotification(`Payment failed: ${resp.error.description}`, "error");
          });
          
          // Launch Razorpay popup INSTANTLY!
          rzp1.open();

        } else {
          // COD Payment Mode
          await saveOrderToDatabase();
        }
      } catch (err) {
        console.error("Order processing failed:", err);
        if (document.getElementById('checkout-loading-overlay')) {
          document.getElementById('checkout-loading-overlay').remove();
        }
        showNotification(`Order submission failed: ${err.message}. Please try again.`, "error");
      }
    });
  }
}

function showSuccessModal(name, phone, email, address, city, zip, paymentLabel, paymentId = null, orderId = null, locationLink = '') {
  const finalOrderId = orderId || `VD-${Math.floor(100000 + Math.random() * 900000)}-IN`;

  const orderItemsSummary = (window.VDEcommerce.cart || []).map((item, idx) => {
    const photoCount = item.uploadedPhotos ? item.uploadedPhotos.length : 1;
    return `• ${item.productName} (Size: ${item.size || 'Standard'}, ${photoCount} Photo(s)) x${item.quantity} = ₹${item.price * item.quantity}`;
  }).join('\n');

  const waText = encodeURIComponent(
    `NEW ORDER PLACED ON VD CREATION\n\n` +
    `ORDER INFO\n` +
    `• Order ID: ${finalOrderId}\n` +
    `• Customer Name: ${name}\n` +
    `• Phone: ${phone}\n` +
    `• Email: ${email}\n` +
    `• Delivery Address: ${address}, ${city} - ${zip}\n` +
    (locationLink ? `• GPS Location: ${locationLink}\n\n` : `\n`) +
    `PAYMENT DETAILS\n` +
    `• Mode: ${paymentLabel}\n` +
    (paymentId ? `• Razorpay Payment ID: ${paymentId}\n• Payment Status: PAID SUCCESSFUL\n` : `• Payment Status: Cash on Delivery\n`) +
    `• Total Amount: ₹${checkoutTotal.toLocaleString('en-IN')}\n\n` +
    `ORDERED FRAMES\n` +
    `${orderItemsSummary}\n\n` +
    `Please process my order and share design confirmation. Thank you!`
  );

  const waUrl = `https://api.whatsapp.com/send?phone=918249906764&text=${waText}`;

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
          <span class="text-[#D4AF37]">${finalOrderId}</span>
        </div>
        <div class="space-y-1.5 border-b border-slate-800 pb-2">
          <p><strong class="text-gray-400">Deliver To:</strong> ${address}, ${city} - ${zip}</p>
          <p><strong class="text-gray-400">Phone:</strong> ${phone}</p>
          <p><strong class="text-gray-400">Payment Mode:</strong> ${paymentLabel}</p>
          ${paymentId ? `<p><strong class="text-gray-400">Razorpay Payment ID:</strong> <span class="text-green-400 font-mono">${paymentId}</span></p>` : ''}
        </div>
        <div class="flex justify-between font-bold pt-1 text-sm">
          <span>Total Amount Paid:</span>
          <span class="text-white">₹${checkoutTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div class="space-y-3">
        <!-- WhatsApp Action Button -->
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" id="wa-redirect-btn" class="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 animate-pulse">
          <i class="fab fa-whatsapp text-xl"></i>
          <span>Send Details & Chat on WhatsApp</span>
        </a>

        <button id="success-modal-close" class="w-full bg-[#D4AF37] hover:bg-[#F3CD46] text-[#0B1F3A] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-colors">
          Continue Gifting & Shopping
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modalContainer);

  // Trigger entrance anim
  setTimeout(() => {
    const modalBox = modalContainer.querySelector('div');
    if (modalBox) {
      modalBox.classList.remove('scale-95', 'opacity-0');
      modalBox.classList.add('scale-100', 'opacity-100');
    }
  }, 10);

  // Auto-click WhatsApp button after 600ms
  setTimeout(() => {
    const waBtn = document.getElementById('wa-redirect-btn');
    if (waBtn) {
      waBtn.click();
    }
  }, 600);

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
