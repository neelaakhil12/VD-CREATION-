// ====================================================================
// VD CREATION - Customer Account Profile & Order History Manager
// ====================================================================

const SUPABASE_URL = 'https://wctyhhhvksfjqsudqwrm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjdHloaGh2a3NmanFzdWRxd3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNjc0NDUsImV4cCI6MjA5OTg0MzQ0NX0.hsOQs0V7dSG6SoSEWrH0Gv3bcMx7Voc0SzzwVmwUMJ8';

window.VDProfile = {
  userOrders: [],

  init: function() {
    const user = window.VDAuth ? window.VDAuth.getCurrentUser() : null;
    if (!user) {
      // Redirect unauthenticated user to home and prompt login
      if (window.VDAuth) {
        window.VDAuth.openAuthModal();
      }
      setTimeout(() => {
        if (!window.VDAuth.getCurrentUser()) {
          window.location.href = 'index.html';
        }
      }, 500);
      return;
    }

    this.renderHeaderUser(user);
    this.populateSettingsForm(user);
    this.loadUserOrders();
  },

  renderHeaderUser: function(user) {
    const nameEl = document.getElementById('profile-display-name');
    const emailEl = document.getElementById('profile-display-email');
    const avatarEl = document.getElementById('profile-avatar');

    if (nameEl) nameEl.textContent = user.name || user.email.split('@')[0];
    if (emailEl) emailEl.textContent = user.email;
    if (avatarEl) avatarEl.textContent = (user.name || user.email).charAt(0).toUpperCase();
  },

  populateSettingsForm: function(user) {
    if (document.getElementById('settings-name')) document.getElementById('settings-name').value = user.name || '';
    if (document.getElementById('settings-email')) document.getElementById('settings-email').value = user.email || '';
    if (document.getElementById('settings-phone')) document.getElementById('settings-phone').value = user.phone || '';
    if (document.getElementById('settings-address')) document.getElementById('settings-address').value = user.address || '';
    if (document.getElementById('settings-city')) document.getElementById('settings-city').value = user.city || '';
    if (document.getElementById('settings-state')) document.getElementById('settings-state').value = user.state || '';
    if (document.getElementById('settings-zip')) document.getElementById('settings-zip').value = user.zip || '';
  },

  saveSettings: function(e) {
    e.preventDefault();
    const user = window.VDAuth.getCurrentUser();
    if (!user) return;

    user.name = document.getElementById('settings-name').value.trim();
    user.phone = document.getElementById('settings-phone').value.trim();
    user.address = document.getElementById('settings-address').value.trim();
    user.city = document.getElementById('settings-city').value.trim();
    user.state = document.getElementById('settings-state').value.trim();
    user.zip = document.getElementById('settings-zip').value.trim();

    localStorage.setItem('vd_current_user', JSON.stringify(user));
    
    // Update local accounts db
    const accounts = JSON.parse(localStorage.getItem('vd_user_accounts') || '[]');
    const idx = accounts.findIndex(a => a.email.toLowerCase() === user.email.toLowerCase());
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...user };
      localStorage.setItem('vd_user_accounts', JSON.stringify(accounts));
    }

    if (window.VDAuth) window.VDAuth.updateNavbarAuthUI();
    this.renderHeaderUser(user);
    if (window.showNotification) window.showNotification("Profile details updated successfully!", "success");
  },

  switchTab: function(tab) {
    const btnOrders = document.getElementById('tab-btn-orders');
    const btnSettings = document.getElementById('tab-btn-settings');
    const secOrders = document.getElementById('tab-section-orders');
    const secSettings = document.getElementById('tab-section-settings');

    if (tab === 'orders') {
      btnOrders.className = "pb-3 border-b-2 border-[#D4AF37] text-[#D4AF37] flex items-center space-x-2";
      btnSettings.className = "pb-3 border-b-2 border-transparent text-gray-400 hover:text-white flex items-center space-x-2";
      secOrders.classList.remove('hidden');
      secSettings.classList.add('hidden');
    } else {
      btnSettings.className = "pb-3 border-b-2 border-[#D4AF37] text-[#D4AF37] flex items-center space-x-2";
      btnOrders.className = "pb-3 border-b-2 border-transparent text-gray-400 hover:text-white flex items-center space-x-2";
      secSettings.classList.remove('hidden');
      secOrders.classList.add('hidden');
    }
  },

  loadUserOrders: async function() {
    const user = window.VDAuth ? window.VDAuth.getCurrentUser() : null;
    const container = document.getElementById('user-orders-list');
    if (!user || !container) return;

    container.innerHTML = `
      <div class="py-12 text-center text-gray-500 space-y-3 bg-navy-900/40 rounded-2xl border border-slate-800">
        <div class="w-8 h-8 border-2 border-t-[#D4AF37] border-slate-700 rounded-full animate-spin mx-auto"></div>
        <p class="text-xs">Fetching your order history...</p>
      </div>
    `;

    try {
      let supabaseOrders = [];
      if (typeof window.supabase !== 'undefined') {
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data, error } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('customer_email', user.email)
          .order('created_at', { ascending: false });

        if (!error && data) {
          supabaseOrders = data;
        }
      }

      let localOrders = [];
      try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const data = await res.json();
          const allLocal = data.orders || [];
          localOrders = allLocal.filter(o => o.customer_email && o.customer_email.toLowerCase() === user.email.toLowerCase());
        }
      } catch (e) {}

      // Merge without duplicates
      const map = new Map();
      [...localOrders, ...supabaseOrders].forEach(o => {
        const key = o.id || o.supabase_id;
        if (key && !map.has(key)) {
          map.set(key, o);
        }
      });

      const mergedOrders = Array.from(map.values()).sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));

      this.userOrders = mergedOrders;
      this.renderOrders(mergedOrders);
    } catch(err) {
      console.error("Error loading user orders:", err);
      container.innerHTML = `
        <div class="p-8 text-center bg-navy-900/40 rounded-2xl border border-slate-800 text-xs text-red-400">
          Failed to fetch orders. Please try again.
        </div>
      `;
    }
  },

  copyTrackingId: function(trackingId) {
    if (!trackingId) return;
    navigator.clipboard.writeText(trackingId).then(() => {
      if (window.showNotification) {
        window.showNotification(`Tracking ID "${trackingId}" copied to clipboard!`, "success");
      } else {
        alert(`Tracking ID "${trackingId}" copied to clipboard!`);
      }
    }).catch(() => {
      if (window.showNotification) window.showNotification(`Tracking ID: ${trackingId}`, "info");
    });
  },

  renderOrders: function(orders) {
    const container = document.getElementById('user-orders-list');
    if (!container) return;

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center space-y-4 bg-navy-900/40 rounded-3xl border border-slate-800">
          <div class="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-gray-500 mx-auto text-xl">
            <i class="fas fa-box-open"></i>
          </div>
          <h3 class="text-sm font-bold text-white">No Orders Placed Yet</h3>
          <p class="text-xs text-gray-400 max-w-xs mx-auto">Explore our premium acrylic frames and customize your first memory frame!</p>
          <a href="services.html" class="inline-block bg-[#D4AF37] hover:bg-[#F3CD46] text-[#0B1F3A] font-bold text-xs py-2.5 px-6 rounded-full shadow transition-all">Explore Frames</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map((order, idx) => {
      const formattedDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      const items = Array.isArray(order.items) ? order.items : [];
      const paymentStatus = order.payment_status || (order.payment_id !== 'N/A' ? 'PAID' : 'COD_PENDING');

      // Check if Admin has shared Tracking Information
      const trackingId = order.tracking_id || (items[0] && items[0].tracking_id);
      const trackingLink = order.tracking_link || (items[0] && items[0].tracking_link);
      const courierName = order.courier_name || (items[0] && items[0].courier_name) || 'DTDC Express';
      const hasTrackingInfo = Boolean(trackingId && trackingLink);

      let trackingBlockHtml = '';
      if (hasTrackingInfo) {
        trackingBlockHtml = `
          <!-- Live Courier Tracking Info (Visible ONLY when admin adds link & ID) -->
          <div class="bg-slate-950 p-4 rounded-2xl border border-[#D4AF37]/30 space-y-3 mt-4">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div class="flex items-center space-x-2">
                <i class="fa-solid fa-truck-fast text-[#D4AF37]"></i>
                <span class="text-xs font-bold text-white">Courier: <span class="text-[#D4AF37]">${courierName}</span></span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-400 font-mono">Tracking ID:</span>
                <span class="text-xs font-bold text-white font-mono bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">${trackingId}</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
              <!-- Copy Tracking ID Button -->
              <button onclick="VDProfile.copyTrackingId('${trackingId}')" class="bg-slate-900 hover:bg-slate-800 text-gray-200 border border-slate-700 font-bold text-xs py-2 px-4 rounded-xl transition-all flex items-center space-x-2 cursor-pointer shadow">
                <i class="fa-solid fa-copy text-[#D4AF37]"></i>
                <span>Copy Tracking ID</span>
              </button>

              <!-- Track Order Status Button -->
              <a href="${trackingLink}" target="_blank" rel="noopener noreferrer" class="bg-gradient-to-r from-[#D4AF37] to-[#F3CD46] hover:from-[#F3CD46] hover:to-[#D4AF37] text-[#0B1F3A] font-bold text-xs py-2.5 px-5 rounded-xl transition-all flex items-center space-x-2 shadow cursor-pointer">
                <span>Track Your Order Status</span>
                <i class="fa-solid fa-arrow-right text-xs"></i>
              </a>
            </div>
          </div>
        `;
      }

      return `
        <div class="bg-navy-900/80 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl hover:border-slate-700 transition-all">
          
          <!-- Order Top Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4 text-xs">
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="font-bold text-white text-sm">Order ID: #${order.id.slice(0, 8)}</span>
                <span class="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  ${order.status || 'Pending Production'}
                </span>
              </div>
              <p class="text-[11px] text-gray-400">Placed on ${formattedDate}</p>
            </div>

            <div class="flex items-center space-x-3">
              <span class="text-xs font-bold text-white">Total: <span class="text-[#D4AF37]">₹${order.total_price}</span></span>
              <span class="py-1 px-3 rounded-full text-[10px] font-bold ${paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'}">
                ${paymentStatus === 'PAID' ? 'PAID SUCCESSFUL' : 'COD PENDING'}
              </span>
            </div>
          </div>

          <!-- Items Grid -->
          <div class="space-y-4">
            ${items.map(item => `
              <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 gap-4">
                <div class="flex items-center space-x-4">
                  <img src="${item.croppedImage || item.productImage || 'https://res.cloudinary.com/ukftgzjx/image/upload/v1784746240/vd_creations_static_https://res.cloudinary.com/ukftgzjx/image/upload/v1784747215/vd_creations_all_images/assets_acrylic_couple.png'}" class="w-16 h-16 object-cover rounded-xl border border-slate-800 bg-slate-900">
                  <div class="space-y-1 text-xs">
                    <h4 class="font-bold text-white">${item.productName || 'Custom Photo Frame'}</h4>
                    <p class="text-[11px] text-gray-400">Size: <span class="text-white">${item.size || 'Standard'}</span> | Qty: ${item.quantity || 1}</p>
                    <p class="text-[11px] text-[#D4AF37] font-semibold">₹${(item.price || 0) * (item.quantity || 1)}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          ${trackingBlockHtml}

          <!-- Action Controls -->
          <div class="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800">
            <button onclick="VDProfile.downloadInvoicePDF('${order.id}')" class="bg-slate-900 hover:bg-slate-800 text-gray-200 border border-slate-700 font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center space-x-2">
              <i class="fas fa-file-invoice text-red-400"></i>
              <span>Download PDF Invoice</span>
            </button>
          </div>

        </div>
      `;
    }).join('');
  },

  openTrackModal: function(orderId) {
    const modal = document.getElementById('track-order-modal');
    const titleEl = document.getElementById('track-order-id');
    if (titleEl) titleEl.textContent = `Order #${orderId.slice(0, 8)}`;
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  closeTrackModal: function() {
    const modal = document.getElementById('track-order-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  downloadInvoicePDF: function(orderId) {
    const order = this.userOrders.find(o => o.id === orderId);
    if (!order) return;

    const formattedDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    const items = Array.isArray(order.items) ? order.items : [];

    const printContainer = document.createElement('div');
    printContainer.style.padding = '40px';
    printContainer.style.fontFamily = 'Arial, sans-serif';
    printContainer.style.color = '#000';
    printContainer.style.background = '#fff';

    printContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; border-bottom:2px solid #D4AF37; padding-bottom:15px; margin-bottom:20px;">
        <div>
          <h1 style="margin:0; font-size:24px; color:#0B1F3A;">VD CREATION</h1>
          <p style="margin:4px 0 0 0; font-size:12px; color:#666;">Custom Acrylic Photo Frames & Gifts</p>
        </div>
        <div style="text-align:right;">
          <h3 style="margin:0; font-size:18px; color:#D4AF37;">TAX INVOICE</h3>
          <p style="margin:4px 0 0 0; font-size:12px; color:#666;">Invoice ID: #${order.id.slice(0, 8)}</p>
          <p style="margin:2px 0 0 0; font-size:12px; color:#666;">Date: ${formattedDate}</p>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; margin-bottom:25px; font-size:12px;">
        <div>
          <strong>Billed To:</strong><br>
          Name: ${order.customer_name}<br>
          Email: ${order.customer_email}<br>
          Phone: ${order.customer_phone}
        </div>
        <div style="text-align:right;">
          <strong>Shipping Address:</strong><br>
          ${order.address}<br>
          ${order.city}, ${order.state} - ${order.pincode}
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:25px; font-size:12px;">
        <thead>
          <tr style="background:#f4f4f4; border-bottom:1px solid #ccc;">
            <th style="padding:10px; text-align:left;">Item Description</th>
            <th style="padding:10px; text-align:center;">Size</th>
            <th style="padding:10px; text-align:center;">Qty</th>
            <th style="padding:10px; text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:10px;">${item.productName || 'Custom Frame'}</td>
              <td style="padding:10px; text-align:center;">${item.size || 'Standard'}</td>
              <td style="padding:10px; text-align:center;">${item.quantity || 1}</td>
              <td style="padding:10px; text-align:right;">₹${(item.price || 0) * (item.quantity || 1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align:right; font-size:14px; margin-bottom:30px;">
        <p style="margin:5px 0;"><strong>Total Amount Paid: ₹${order.total_price}</strong></p>
        <p style="margin:5px 0; font-size:12px; color:green;">Payment Method: ${order.payment_method || 'Online Payment'}</p>
      </div>

      <div style="border-top:1px solid #ddd; padding-top:15px; text-align:center; font-size:11px; color:#888;">
        Thank you for choosing VD Creation! For assistance, contact support@vdcreations.com
      </div>
    `;

    const opt = {
      margin:       0.5,
      filename:     `VD_Invoice_${order.id.slice(0, 8)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(printContainer).save();
    } else {
      window.print();
    }
  }
};

// DOM Init
document.addEventListener('DOMContentLoaded', () => {
  window.VDProfile.init();
});
