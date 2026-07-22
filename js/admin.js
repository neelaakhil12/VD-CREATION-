// admin.js - Administrative portal control script for VD CREATION
const SUPABASE_URL = 'https://wctyhhhvksfjqsudqwrm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjdHloaGh2a3NmanFzdWRxd3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNjc0NDUsImV4cCI6MjA5OTg0MzQ0NX0.hsOQs0V7dSG6SoSEWrH0Gv3bcMx7Voc0SzzwVmwUMJ8';

// Initialize Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Predefined sizes provided for frames
const PREDEFINED_SIZES = [
  "6x9", "8x12", "10x15", "12x18"
];



// Helper to toggle custom price inputs in modal
window.toggleSizePriceInput = function(checkbox) {
  const size = checkbox.dataset.size;
  const priceInput = document.querySelector(`input[data-size-price="${size}"]`);
  if (priceInput) {
    priceInput.disabled = !checkbox.checked;
    if (checkbox.checked) {
      priceInput.focus();
      // Auto-populate from base price if empty
      const basePrice = document.getElementById('product-price').value;
      if (!priceInput.value && basePrice) {
        priceInput.value = basePrice;
      }
    } else {
      priceInput.value = '';
    }
  }
};

// Active size options list in the current modal session
let currentSessionSizesList = [];

// Helper to add a custom size dynamically to the active list
window.addNewCustomSize = function() {
  const input = document.getElementById('custom-size-input');
  if (!input) return;
  const sizeVal = input.value.trim();
  
  if (!sizeVal) {
    showAdminNotification("Please enter a size (e.g. 12x24).", "error");
    return;
  }
  
  if (currentSessionSizesList.includes(sizeVal)) {
    showAdminNotification(`Size "${sizeVal}" already exists in the list.`, "error");
    return;
  }
  
  // Add directly to active sizes list
  currentSessionSizesList.push(sizeVal);
  
  // Preserve current form checked state and values
  const currentSelections = {};
  const checkboxes = document.querySelectorAll('#size-prices-grid input[type="checkbox"]');
  checkboxes.forEach(cb => {
    if (cb.checked) {
      const size = cb.dataset.size;
      const priceInput = document.querySelector(`input[data-size-price="${size}"]`);
      currentSelections[size] = priceInput ? priceInput.value : '';
    }
  });
  
  // Auto-check and fill newly added size input with current base price
  const basePrice = document.getElementById('product-price').value;
  currentSelections[sizeVal] = basePrice || '';
  
  // Re-render sizes grid
  renderSizePricesGrid(currentSelections);
  
  // Reset custom size input field
  input.value = '';
  showAdminNotification(`Custom size "${sizeVal}" added successfully!`, "success");
};

// Helper to remove any size from the checklist grid
window.deleteSizeFromGrid = function(size) {
  if (!confirm(`Are you sure you want to remove size "${size}" from this frame option list?`)) return;

  // Filter it out from the active session list
  currentSessionSizesList = currentSessionSizesList.filter(s => s !== size);

  // Preserve other checks and values
  const currentSelections = {};
  const checkboxes = document.querySelectorAll('#size-prices-grid input[type="checkbox"]');
  checkboxes.forEach(cb => {
    if (cb.checked) {
      const s = cb.dataset.size;
      if (s !== size) {
        const priceInput = document.querySelector(`input[data-size-price="${s}"]`);
        currentSelections[s] = priceInput ? priceInput.value : '';
      }
    }
  });

  // Re-render sizes grid
  renderSizePricesGrid(currentSelections);
  showAdminNotification(`Size "${size}" removed from list.`, "info");
};

// Auto-saves the current product modal state to localStorage
// Toggle container visibility for Multi-Photo Collage Upload mode
window.toggleCollageSlotOptions = function(isChecked) {
  const container = document.getElementById('product-slots-container');
  if (container) {
    if (isChecked) {
      container.classList.remove('hidden');
    } else {
      container.classList.add('hidden');
    }
  }
  if (window.saveProductDraft) window.saveProductDraft();
};

window.setProductSlots = function(count) {
  const input = document.getElementById('product-slots');
  if (input) {
    input.value = count;
    window.updateSlotCountPreview(count);
  }
};

window.updateSlotCountPreview = function(val) {
  const count = parseInt(val) || 1;
  const hintEl = document.getElementById('slots-hint-count');
  if (hintEl) hintEl.textContent = count;
  if (window.saveProductDraft) window.saveProductDraft();
};

window.saveProductDraft = function() {
  const isEdit = document.getElementById('product-edit-mode').value === 'true';
  const id = document.getElementById('product-id').value.trim();
  const name = document.getElementById('product-name').value.trim();

  // Retrieve sizes
  const sizes = {};
  const checkboxes = document.querySelectorAll('#size-prices-grid input[type="checkbox"]');
  checkboxes.forEach(cb => {
    if (cb.checked) {
      const size = cb.dataset.size;
      const priceInput = document.querySelector(`input[data-size-price="${size}"]`);
      sizes[size] = priceInput ? priceInput.value : '';
    }
  });

  const isCollageToggle = document.getElementById('product-collage-toggle') ? document.getElementById('product-collage-toggle').checked : false;

  const draft = {
    isEdit,
    id,
    name,
    category: document.getElementById('product-category').value,
    base_price: document.getElementById('product-price').value,
    description: document.getElementById('product-description').value,
    features: document.getElementById('product-features').value,
    sizes,
    crop_left: document.getElementById('product-crop-left').value,
    crop_top: document.getElementById('product-crop-top').value,
    crop_width: document.getElementById('product-crop-width').value,
    crop_height: document.getElementById('product-crop-height').value,
    is_collage: isCollageToggle,
    slots: isCollageToggle ? (document.getElementById('product-slots') ? document.getElementById('product-slots').value : '4') : '1',
    product_image: document.getElementById('product-image-url').value,
    empty_image: document.getElementById('product-empty-url').value,
    currentSessionSizesList
  };

  localStorage.setItem('vd_product_form_draft', JSON.stringify(draft));
};

// Check for and display unsaved draft alert
window.checkForProductDraft = function(isEdit, productId = '') {
  const alertEl = document.getElementById('draft-alert');
  if (!alertEl) return;

  const rawDraft = localStorage.getItem('vd_product_form_draft');
  if (!rawDraft) {
    alertEl.classList.add('hidden');
    return;
  }

  try {
    const draft = JSON.parse(rawDraft);
    // If the draft belongs to the editing mode or creation mode of the current session
    if (draft.isEdit === isEdit && (!isEdit || draft.id === productId)) {
      alertEl.classList.remove('hidden');
    } else {
      alertEl.classList.add('hidden');
    }
  } catch (e) {
    alertEl.classList.add('hidden');
  }
};

// Restores form values from local storage draft
window.restoreProductDraft = function() {
  const rawDraft = localStorage.getItem('vd_product_form_draft');
  if (!rawDraft) return;

  try {
    const draft = JSON.parse(rawDraft);
    
    // Restore text inputs
    document.getElementById('product-id').value = draft.id || '';
    document.getElementById('product-name').value = draft.name || '';
    document.getElementById('product-category').value = draft.category || '';
    document.getElementById('product-price').value = draft.base_price || '';
    document.getElementById('product-description').value = draft.description || '';
    document.getElementById('product-features').value = draft.features || '';
    
    document.getElementById('product-crop-left').value = draft.crop_left || '0';
    document.getElementById('product-crop-top').value = draft.crop_top || '0';
    document.getElementById('product-crop-width').value = draft.crop_width || '100';
    document.getElementById('product-crop-height').value = draft.crop_height || '100';

    const isCollage = !!draft.is_collage;
    const toggleEl = document.getElementById('product-collage-toggle');
    if (toggleEl) {
      toggleEl.checked = isCollage;
      window.toggleCollageSlotOptions(isCollage);
    }
    if (document.getElementById('product-slots')) {
      document.getElementById('product-slots').value = draft.slots || '4';
    }

    // Restore Images
    document.getElementById('product-image-url').value = draft.product_image || '';
    if (draft.product_image) {
      document.getElementById('cover-preview-img').src = draft.product_image;
      document.getElementById('product-cover-preview').classList.remove('hidden');
    } else {
      document.getElementById('product-cover-preview').classList.add('hidden');
    }

    document.getElementById('product-empty-url').value = draft.empty_image || '';
    if (draft.empty_image) {
      document.getElementById('empty-preview-img').src = draft.empty_image;
      document.getElementById('product-empty-preview').classList.remove('hidden');
    } else {
      document.getElementById('product-empty-preview').classList.add('hidden');
    }

    // Restore sizes list
    if (draft.currentSessionSizesList) {
      currentSessionSizesList = draft.currentSessionSizesList;
    }

    // Restore grid checkboxes and prices
    renderSizePricesGrid(draft.sizes || {});

    // Hide draft alert
    document.getElementById('draft-alert').classList.add('hidden');
    showAdminNotification("Draft restored successfully!", "success");
  } catch (e) {
    showAdminNotification("Failed to restore draft.", "error");
  }
};

// Discards local storage draft
window.discardProductDraft = function() {
  if (!confirm("Are you sure you want to discard this draft? You will lose any unsaved progress.")) return;
  localStorage.removeItem('vd_product_form_draft');
  document.getElementById('draft-alert').classList.add('hidden');
  showAdminNotification("Draft discarded.", "info");
};

// Bind inputs and events for draft autosaving
function bindDraftAutoSave() {
  const fields = [
    'product-id', 'product-name', 'product-category', 
    'product-price', 'product-description', 'product-features',
    'product-crop-left', 'product-crop-top', 'product-crop-width', 'product-crop-height', 
    'product-slots', 'product-collage-toggle'
  ];
  
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', window.saveProductDraft);
      el.addEventListener('change', window.saveProductDraft);
    }
  });

  // Delegate grid events
  const grid = document.getElementById('size-prices-grid');
  if (grid) {
    grid.addEventListener('input', window.saveProductDraft);
    grid.addEventListener('change', window.saveProductDraft);
  }
}

// State tracking
let activeTab = 'overview';
let allCategories = [];
let allProducts = [];
let allOrders = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

// ====================================================================
// Initialization & Authentication Listeners
// ====================================================================
async function initAdmin() {
  // Bind standard layout event listeners
  bindAuthEvents();
  bindNavigationEvents();
  bindModalEvents();
  bindDraftAutoSave();
  
  // Update current live time display on dashboard
  setInterval(updateLiveTime, 1000);
  updateLiveTime();

  // Check current session
  const localSession = localStorage.getItem('vd_admin_session');
  if (localSession) {
    const user = JSON.parse(localSession);
    showDashboard(user);
    return;
  }

  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (session) {
    showDashboard(session.user);
  } else {
    showLogin();
  }

  // Session state change listener
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (localStorage.getItem('vd_admin_session')) return;
    
    if (session) {
      showDashboard(session.user);
    } else {
      showLogin();
    }
  });
}

function showLogin() {
  document.getElementById('login-container').classList.remove('hidden');
  document.getElementById('dashboard-container').classList.add('hidden');
}

function showDashboard(user) {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('dashboard-container').classList.remove('hidden');
  document.getElementById('admin-user-email').textContent = user.email;
  
  // Fetch database entries
  fetchData();
}

function updateLiveTime() {
  const timeEl = document.getElementById('dashboard-time');
  if (timeEl) {
    const now = new Date();
    timeEl.innerHTML = `<i class="fa-regular fa-clock text-[#D4AF37] mr-1.5"></i>Live Status: ${now.toLocaleTimeString()}`;
  }
}

// ====================================================================
// Authentication Event Handlers
// ====================================================================
// Authentication Event Handlers & Nodemailer SMTP Password Reset
// ====================================================================
function bindAuthEvents() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          showAdminNotification("Signed in successfully to Admin Control Center!", 'success');
          localStorage.setItem('vd_admin_session', JSON.stringify(data.user));
          showDashboard(data.user);
          return;
        } else {
          // Fallback to local check
          if (email === 'vdcreationz02@gmail.com' || email === 'admin@vdcreation.com') {
            const localSession = localStorage.getItem('vd_admin_session');
            if (localSession) {
              const user = JSON.parse(localSession);
              showDashboard(user);
              return;
            }
          }
          throw new Error(data.error || "Invalid admin email or password.");
        }
      } catch (err) {
        showAdminNotification(err.message, 'error');
      }
    });
  }

  // Direct event bindings for Forgot Password buttons
  const forgotBtn = document.getElementById('forgot-password-btn');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.showForgotPasswordForm(e);
    });
  }

  const backBtn = document.getElementById('back-to-login-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.hideForgotPasswordForm(e);
    });
  }

  // Check URL query parameters for reset token
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('reset_token');
  if (resetToken) {
    window.showResetPasswordFormWithToken(resetToken);
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      localStorage.removeItem('vd_admin_session');
      showAdminNotification("Signed out successfully.", 'success');
      showLogin();
    });
  }
}

window.showForgotPasswordForm = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const loginForm = document.getElementById('login-form');
  const forgotForm = document.getElementById('forgot-password-form');
  const resetForm = document.getElementById('reset-password-form');
  if (loginForm) loginForm.classList.add('hidden');
  if (forgotForm) forgotForm.classList.remove('hidden');
  if (resetForm) resetForm.classList.add('hidden');
};

window.hideForgotPasswordForm = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const loginForm = document.getElementById('login-form');
  const forgotForm = document.getElementById('forgot-password-form');
  const resetForm = document.getElementById('reset-password-form');
  if (forgotForm) forgotForm.classList.add('hidden');
  if (resetForm) resetForm.classList.add('hidden');
  if (loginForm) loginForm.classList.remove('hidden');
};

window.showResetPasswordFormWithToken = function(token) {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('forgot-password-form').classList.add('hidden');
  const resetForm = document.getElementById('reset-password-form');
  resetForm.classList.remove('hidden');
  const tokenInput = document.getElementById('reset-token-input');
  if (tokenInput && token) tokenInput.value = token;
};

window.handleForgotPasswordSubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  showAdminNotification("Sending password reset email via Nodemailer SMTP...", "info");

  try {
    const res = await fetch('/api/admin/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showAdminNotification(data.message, "success");
      document.getElementById('forgot-password-form').classList.add('hidden');
      document.getElementById('reset-password-form').classList.remove('hidden');
    } else {
      throw new Error(data.error || "Failed to send reset email.");
    }
  } catch (err) {
    showAdminNotification(err.message, "error");
  }
};

window.handleResetPasswordSubmit = async function(e) {
  e.preventDefault();
  const tokenOrOtp = document.getElementById('reset-token-input').value.trim();
  const newPassword = document.getElementById('reset-new-password').value;

  showAdminNotification("Updating admin password in database...", "info");

  try {
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenOrOtp, newPassword })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showAdminNotification(data.message, "success");
      
      // Auto login with new password
      const emailInput = document.getElementById('login-email');
      const email = emailInput ? emailInput.value : 'vdcreationz02@gmail.com';
      
      const adminUser = { email: email, id: 'admin-1' };
      localStorage.setItem('vd_admin_session', JSON.stringify(adminUser));
      
      document.getElementById('reset-password-form').classList.add('hidden');
      document.getElementById('login-form').classList.remove('hidden');
      showDashboard(adminUser);
    } else {
      throw new Error(data.error || "Failed to reset password.");
    }
  } catch (err) {
    showAdminNotification(err.message, "error");
  }
};

// ====================================================================
// Navigation Tab Controls
// ====================================================================
function bindNavigationEvents() {
  const navTabs = document.getElementById('nav-tabs');
  if (navTabs) {
    const links = navTabs.querySelectorAll('.tab-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;
        switchTab(tab);
      });
    });
  }
}

function switchTab(tabId) {
  activeTab = tabId;
  
  // Update sidebar active layout state
  const links = document.querySelectorAll('.tab-link');
  links.forEach(link => {
    if (link.dataset.tab === tabId) {
      link.className = "tab-link flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 transition-all";
    } else {
      link.className = "tab-link flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-slate-900/50 transition-all";
    }
  });

  // Toggle visible panels
  const panels = document.querySelectorAll('.tab-content');
  panels.forEach(panel => {
    if (panel.id === `tab-${tabId}`) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });

  // Re-fetch data on active views
  fetchData();
}

// ====================================================================
// Database Fetch & Analytics Processing
// ====================================================================
async function fetchData() {
  try {
    // 1. Fetch categories
    const { data: categories, error: catError } = await supabaseClient
      .from('categories')
      .select('*')
      .order('name');
    if (catError) throw catError;
    allCategories = categories || [];

    // 2. Fetch products
    const { data: products, error: prodError } = await supabaseClient
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (prodError) throw prodError;
    allProducts = products || [];

    // 3. Fetch orders from Supabase & Local Backup
    let supabaseOrders = [];
    try {
      const { data: orders } = await supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      supabaseOrders = orders || [];
    } catch (e) {
      console.warn("Supabase orders fetch notice:", e);
    }

    let localOrders = [];
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        localOrders = data.orders || [];
      }
    } catch (e) {}

    // Merge orders smoothly without duplicates
    const ordersMap = new Map();
    [...localOrders, ...supabaseOrders].forEach(ord => {
      const key = ord.id || ord.supabase_id || ord.customer_email + ord.total_price;
      if (key && !ordersMap.has(key)) {
        ordersMap.set(key, ord);
      }
    });

    allOrders = Array.from(ordersMap.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    // Render components depending on active tabs
    renderOverview();
    renderCategories();
    renderProducts();
    renderOrders();
    populateCategoryDropdowns();
  } catch (error) {
    console.error("Database fetch failed:", error);
    showAdminNotification("Failed to fetch database information.", "error");
  }
}

function renderOverview() {
  const todayStr = new Date().toISOString().split('T')[0];
  
  let todayRevenue = 0;
  let totalRevenue = 0;
  let pendingCount = 0;
  let completedCount = 0;

  allOrders.forEach(order => {
    const orderDateStr = new Date(order.created_at).toISOString().split('T')[0];
    const price = parseFloat(order.total_price) || 0;
    
    totalRevenue += price;
    if (orderDateStr === todayStr) {
      todayRevenue += price;
    }

    if (order.status === 'pending') {
      pendingCount++;
    } else {
      completedCount++;
    }
  });

  // Update stat cards
  document.getElementById('stat-today-revenue').textContent = `₹${todayRevenue.toLocaleString()}`;
  document.getElementById('stat-total-revenue').textContent = `₹${totalRevenue.toLocaleString()}`;
  document.getElementById('stat-pending-orders').textContent = pendingCount;
  document.getElementById('stat-completed-orders').textContent = completedCount;

  // Update navbar badge
  const badge = document.getElementById('orders-badge');
  if (badge) {
    if (pendingCount > 0) {
      badge.textContent = pendingCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // Render recent orders list (top 5)
  const listEl = document.getElementById('recent-orders-list');
  if (!listEl) return;

  const recents = allOrders.slice(0, 5);
  if (recents.length === 0) {
    listEl.innerHTML = `
      <tr>
        <td colspan="5" class="p-8 text-center text-xs text-gray-500">No orders registered yet.</td>
      </tr>
    `;
    return;
  }

  listEl.innerHTML = recents.map(order => {
    const date = new Date(order.created_at).toLocaleDateString();
    const statusClass = order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400';
    return `
      <tr class="border-b border-slate-800/40 text-xs hover:bg-slate-950/20">
        <td class="p-4 font-bold text-white">${order.customer_name}</td>
        <td class="p-4 text-gray-400">${order.customer_phone}</td>
        <td class="p-4 text-gray-400">${date}</td>
        <td class="p-4 text-[#D4AF37] font-semibold">₹${order.total_price}</td>
        <td class="p-4">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass}">${order.status}</span>
        </td>
      </tr>
    `;
  }).join('');
}

// ====================================================================
// Categories CRUD Actions
// ====================================================================
function renderCategories() {
  const container = document.getElementById('admin-categories-list');
  if (!container) return;

  if (allCategories.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="3" class="p-8 text-center text-xs text-gray-500">No categories found. Click Add Category to create one.</td>
      </tr>
    `;
    return;
  }

  container.innerHTML = allCategories.map(cat => `
    <tr class="border-b border-slate-800/40 text-xs hover:bg-slate-950/20">
      <td class="p-4 font-semibold text-gray-400">${cat.id}</td>
      <td class="p-4 font-bold text-white">${cat.name}</td>
      <td class="p-4 text-right space-x-2">
        <button onclick="editCategory('${cat.id}', '${cat.name}')" class="text-blue-400 hover:text-blue-300 p-1.5" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
        <button onclick="deleteCategory('${cat.id}')" class="text-red-400 hover:text-red-300 p-1.5" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function populateCategoryDropdowns() {
  const selects = ['product-category'];
  selects.forEach(selectId => {
    const el = document.getElementById(selectId);
    if (el) {
      el.innerHTML = allCategories.map(cat => `
        <option value="${cat.id}">${cat.name}</option>
      `).join('');
    }
  });
}

function openCategoryModal() {
  document.getElementById('category-edit-mode').value = 'false';
  document.getElementById('category-id').value = '';
  document.getElementById('category-id').disabled = false;
  document.getElementById('category-name').value = '';
  document.getElementById('category-modal-title').textContent = 'Add New Category';
  document.getElementById('category-modal').classList.remove('hidden');
}

function closeCategoryModal() {
  document.getElementById('category-modal').classList.add('hidden');
}

function editCategory(id, name) {
  document.getElementById('category-edit-mode').value = 'true';
  document.getElementById('category-id').value = id;
  document.getElementById('category-id').disabled = true;
  document.getElementById('category-name').value = name;
  document.getElementById('category-modal-title').textContent = 'Edit Category';
  document.getElementById('category-modal').classList.remove('hidden');
}

async function deleteCategory(id) {
  if (!confirm(`Are you sure you want to delete category "${id}"? This will delete all products under this category!`)) return;

  const { error } = await supabaseClient.from('categories').delete().eq('id', id);
  if (error) {
    showAdminNotification(error.message, 'error');
  } else {
    showAdminNotification("Category deleted successfully!", 'success');
    fetchData();
  }
}

// ====================================================================
// Products CRUD Actions & Image Uploads to Cloudinary
// ====================================================================
function renderProducts() {
  const container = document.getElementById('admin-products-list');
  if (!container) return;

  if (allProducts.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-xs text-gray-500">No frames registered yet. Click Add New Frame to create one.</div>
    `;
    return;
  }

  container.innerHTML = allProducts.map(p => {
    // Formats sizes and features to tags
    let sizes = [];
    let sizePrices = null;
    let rawSizes = p.sizes;
    if (typeof rawSizes === 'string') {
      try { rawSizes = JSON.parse(rawSizes); } catch(e) {}
    }
    if (rawSizes && typeof rawSizes === 'object' && !Array.isArray(rawSizes)) {
      sizes = Object.keys(rawSizes);
      sizePrices = rawSizes;
    } else {
      sizes = Array.isArray(rawSizes) ? rawSizes : [];
    }
    
    const sizeTags = sizes.map(s => {
      const priceStr = sizePrices ? ` (₹${sizePrices[s]})` : '';
      return `<span class="bg-navy-700/60 border border-slate-800 text-[9px] text-gray-400 font-bold px-1.5 py-0.5 rounded-md uppercase">${s}${priceStr}</span>`;
    }).join(' ');
    
    return `
      <div class="bg-navy-900/35 border border-slate-800/80 p-5 rounded-2xl flex gap-4 relative hover:border-[#D4AF37]/50 transition-all duration-300">
        <!-- Thumbnail -->
        <div class="w-24 h-24 rounded-xl border border-slate-800/80 bg-slate-950/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
          <img src="${p.product_image}" class="w-full h-full object-cover">
        </div>

        <!-- Information -->
        <div class="flex-grow space-y-2 min-w-0">
          <div class="flex items-center justify-between">
            <span class="bg-[#D4AF37]/15 text-[#D4AF37] text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full">${p.category_label}</span>
            <div class="space-x-1 flex-shrink-0">
              <button onclick="editProduct('${p.id}')" class="text-blue-400 hover:text-blue-300 p-1 text-xs" title="Edit Frame"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="deleteProduct('${p.id}')" class="text-red-400 hover:text-red-300 p-1 text-xs" title="Delete Frame"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
          <h4 class="text-sm font-bold text-white truncate pr-1">${p.name}</h4>
          <p class="text-xs text-gray-400 line-clamp-1">${p.description || 'No description provided.'}</p>
          <div class="flex items-center justify-between border-t border-slate-800/50 pt-2">
            <p class="text-xs font-bold text-[#D4AF37]">Starting at ₹${p.base_price}</p>
            <div class="flex gap-1 flex-wrap justify-end max-w-[200px]">
              ${sizeTags}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSizePricesGrid(selectedSizesObj = {}) {
  const container = document.getElementById('size-prices-grid');
  if (!container) return;

  const sizesMap = {};
  if (Array.isArray(selectedSizesObj)) {
    selectedSizesObj.forEach(size => {
      sizesMap[size] = '';
    });
  } else if (selectedSizesObj && typeof selectedSizesObj === 'object') {
    Object.keys(selectedSizesObj).forEach(size => {
      sizesMap[size] = selectedSizesObj[size];
    });
  }

  container.innerHTML = currentSessionSizesList.map(size => {
    const isChecked = size in sizesMap;
    const priceValue = isChecked ? sizesMap[size] : '';
    const inputDisabled = isChecked ? '' : 'disabled';
    
    return `
      <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/60 transition-colors animate-fadeIn group">
        <label class="flex items-center space-x-2.5 text-xs text-gray-300 font-medium cursor-pointer select-none">
          <input type="checkbox" data-size="${size}" ${isChecked ? 'checked' : ''} onchange="toggleSizePriceInput(this)" class="w-3.5 h-3.5 rounded border-slate-800 bg-slate-950 text-[#D4AF37] focus:ring-0 focus:ring-offset-0 cursor-pointer">
          <span>${size}</span>
        </label>
        <div class="flex items-center space-x-2">
          <div class="flex items-center space-x-1 w-20">
            <span class="text-[9px] text-gray-500">₹</span>
            <input type="number" data-size-price="${size}" value="${priceValue}" ${inputDisabled} placeholder="Price" class="w-full px-1 py-0.5 bg-slate-950 border border-slate-800 text-white text-[11px] rounded focus:outline-none focus:border-[#D4AF37] disabled:opacity-30 disabled:border-slate-800/40">
          </div>
          <button type="button" onclick="deleteSizeFromGrid('${size}')" class="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity text-[11px]" title="Remove Size">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openProductModal() {
  // Initialize currentSessionSizesList with defaults
  currentSessionSizesList = [...PREDEFINED_SIZES];
  
  document.getElementById('product-edit-mode').value = 'false';
  document.getElementById('product-id').value = '';
  document.getElementById('product-id').disabled = false;
  document.getElementById('product-name').value = '';
  document.getElementById('product-price').value = '';
  document.getElementById('product-description').value = '';
  renderSizePricesGrid({});
  document.getElementById('product-features').value = '';
  
  // Reset Crop Alignment Coordinates
  document.getElementById('product-crop-left').value = '0';
  document.getElementById('product-crop-top').value = '0';
  document.getElementById('product-crop-width').value = '100';
  document.getElementById('product-crop-height').value = '100';
  
  const toggleEl = document.getElementById('product-collage-toggle');
  if (toggleEl) {
    toggleEl.checked = false;
    window.toggleCollageSlotOptions(false);
  }
  if (document.getElementById('product-slots')) {
    document.getElementById('product-slots').value = '3';
    window.updateSlotCountPreview(3);
  }
  
  // Clear image fields & previews
  document.getElementById('product-image-url').value = '';
  document.getElementById('product-cover-preview').classList.add('hidden');
  document.getElementById('product-empty-url').value = '';
  document.getElementById('product-empty-preview').classList.add('hidden');
  
  document.getElementById('product-modal-title').textContent = 'Add New Photo Frame';
  document.getElementById('product-modal').classList.remove('hidden');
  window.checkForProductDraft(false);
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

function editProduct(productId) {
  const p = allProducts.find(item => item.id === productId);
  if (!p) return;

  document.getElementById('product-edit-mode').value = 'true';
  document.getElementById('product-id').value = p.id;
  document.getElementById('product-id').disabled = true;
  document.getElementById('product-name').value = p.name;
  document.getElementById('product-category').value = p.category;
  document.getElementById('product-price').value = p.base_price;
  document.getElementById('product-description').value = p.description || '';
  
  let sizesData = {};
  try {
    sizesData = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes;
  } catch (e) {
    sizesData = p.sizes || {};
  }
  
  // Initialize currentSessionSizesList with predefined values
  currentSessionSizesList = [...PREDEFINED_SIZES];
  
  // Merge any size dimensions from product metadata that aren't defaults
  if (sizesData && typeof sizesData === 'object' && !Array.isArray(sizesData)) {
    Object.keys(sizesData).forEach(size => {
      if (!currentSessionSizesList.includes(size)) {
        currentSessionSizesList.push(size);
      }
    });
  } else if (Array.isArray(sizesData)) {
    sizesData.forEach(size => {
      if (!currentSessionSizesList.includes(size)) {
        currentSessionSizesList.push(size);
      }
    });
  }
  
  renderSizePricesGrid(sizesData);
  
  const features = Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]');
  document.getElementById('product-features').value = features.join(', ');

  // Set Crop Alignment Coordinates
  document.getElementById('product-crop-left').value = p.crop_left ?? 0;
  document.getElementById('product-crop-top').value = p.crop_top ?? 0;
  document.getElementById('product-crop-width').value = p.crop_width ?? 100;
  document.getElementById('product-crop-height').value = p.crop_height ?? 100;
  
  let slotsVal = 1;
  if (p.slots) {
    if (typeof p.slots === 'number') slotsVal = p.slots;
    else if (typeof p.slots === 'string' && !isNaN(parseInt(p.slots))) slotsVal = parseInt(p.slots);
    else if (Array.isArray(p.slots)) slotsVal = p.slots.length;
  }
  const isCollage = slotsVal > 1;
  const editToggleEl = document.getElementById('product-collage-toggle');
  if (editToggleEl) {
    editToggleEl.checked = isCollage;
    window.toggleCollageSlotOptions(isCollage);
  }
  if (document.getElementById('product-slots')) {
    const finalVal = isCollage ? slotsVal : 3;
    document.getElementById('product-slots').value = finalVal.toString();
    window.updateSlotCountPreview(finalVal);
  }

  // Show cover image
  document.getElementById('product-image-url').value = p.product_image;
  if (p.product_image) {
    document.getElementById('cover-preview-img').src = p.product_image;
    document.getElementById('product-cover-preview').classList.remove('hidden');
  } else {
    document.getElementById('product-cover-preview').classList.add('hidden');
  }

  // Show empty template image
  document.getElementById('product-empty-url').value = p.empty_image || '';
  if (p.empty_image) {
    document.getElementById('empty-preview-img').src = p.empty_image;
    document.getElementById('product-empty-preview').classList.remove('hidden');
  } else {
    document.getElementById('product-empty-preview').classList.add('hidden');
  }

  document.getElementById('product-modal-title').textContent = 'Edit Photo Frame';
  document.getElementById('product-modal').classList.remove('hidden');
  window.checkForProductDraft(true, productId);
}

async function deleteProduct(productId) {
  if (!confirm(`Are you sure you want to delete the frame "${productId}"?`)) return;

  const { error } = await supabaseClient.from('products').delete().eq('id', productId);
  if (error) {
    showAdminNotification(error.message, 'error');
  } else {
    showAdminNotification("Frame deleted successfully!", 'success');
    fetchData();
  }
}

// UPLOADER FUNCTION TO CLOUDINARY (calls server endpoint securely)
function autoDetectCropCoordinates(file) {
  const img = new Image();
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    img.src = e.target.result;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        function getPixelAt(x, y) {
          const idx = (canvas.width * y + x) << 2;
          return {
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: data[idx + 3]
          };
        }

        function isTargetPixel(pixel) {
          if (pixel.a < 15) return true;
          if (pixel.r > 200 && pixel.g > 200 && pixel.b > 200) return true;
          if (pixel.a > 240 && pixel.r < 45 && pixel.g < 45 && pixel.b < 45) return true;
          return false;
        }

        let maxArea = 0;
        let bestBox = null;

        const step = Math.max(10, Math.floor(canvas.width / 80));
        const visited = new Uint8Array(canvas.width * canvas.height);

        for (let y = step; y < canvas.height - step; y += step) {
          for (let x = step; x < canvas.width - step; x += step) {
            const pixelIdx = canvas.width * y + x;
            if (visited[pixelIdx]) continue;

            const pixel = getPixelAt(x, y);
            if (isTargetPixel(pixel)) {
              let minX = x;
              while (minX > 0 && isTargetPixel(getPixelAt(minX - 1, y))) minX--;
              let maxX = x;
              while (maxX < canvas.width - 1 && isTargetPixel(getPixelAt(maxX + 1, y))) maxX++;

              const midX = Math.floor((minX + maxX) / 2);
              let minY = y;
              while (minY > 0 && isTargetPixel(getPixelAt(midX, minY - 1))) minY--;
              let maxY = y;
              while (maxY < canvas.height - 1 && isTargetPixel(getPixelAt(midX, maxY + 1))) maxY++;

              for (let sy = minY; sy <= maxY; sy += step) {
                for (let sx = minX; sx <= maxX; sx += step) {
                  visited[canvas.width * sy + sx] = 1;
                }
              }

              const area = (maxX - minX) * (maxY - minY);
              if (area > maxArea && (maxX - minX) > 30 && (maxY - minY) > 30) {
                maxArea = area;
                bestBox = { minX, maxX, minY, maxY };
              }
            }
          }
        }

        if (bestBox) {
          const left = ((bestBox.minX / canvas.width) * 100).toFixed(2);
          const top = ((bestBox.minY / canvas.height) * 100).toFixed(2);
          const width = (((bestBox.maxX - bestBox.minX) / canvas.width) * 100).toFixed(2);
          const height = (((bestBox.maxY - bestBox.minY) / canvas.height) * 100).toFixed(2);

          document.getElementById('product-crop-left').value = left;
          document.getElementById('product-crop-top').value = top;
          document.getElementById('product-crop-width').value = width;
          document.getElementById('product-crop-height').value = height;

          showAdminNotification(`Autodetected photo slot coordinates!`, 'info');
          window.saveProductDraft();
        }
      } catch (err) {
        console.warn("Autodetection failed:", err.message);
      }
    };
  };
}

function uploadImageToServer(fileInput, type) {
  const file = fileInput.files[0];
  if (!file) return;

  // Auto-detect crop window coordinates if uploading an empty frame template
  if (type === 'empty') {
    autoDetectCropCoordinates(file);
  }

  const loader = document.getElementById(`product-${type}-loader`);
  if (loader) loader.classList.remove('hidden');

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    try {
      const base64Data = reader.result;
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Data,
          folder: 'vd_creations_catalog'
        })
      });

      const data = await response.json();
      if (response.ok && data.url) {
        const urlInputId = type === 'cover' ? 'product-image-url' : `product-${type}-url`;
        const urlInput = document.getElementById(urlInputId);
        if (urlInput) urlInput.value = data.url;
        document.getElementById(`${type}-preview-img`).src = data.url;
        document.getElementById(`product-${type}-preview`).classList.remove('hidden');
        window.saveProductDraft();
        showAdminNotification(`Successfully uploaded ${type} image to Cloudinary!`, 'success');
      } else {
        throw new Error(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error(err);
      showAdminNotification(`Uploader failed: ${err.message}`, 'error');
    } finally {
      if (loader) loader.classList.add('hidden');
      fileInput.value = ''; // clear input
    }
  };
}

// Clears uploaded images from the product modal inputs and previews
window.clearProductImage = function(type) {
  const urlInputId = type === 'cover' ? 'product-image-url' : `product-${type}-url`;
  const urlInput = document.getElementById(urlInputId);
  if (urlInput) urlInput.value = '';
  
  const previewDiv = document.getElementById(`product-${type}-preview`);
  if (previewDiv) previewDiv.classList.add('hidden');
  
  const imgElement = document.getElementById(`${type}-preview-img`);
  if (imgElement) imgElement.src = '';
  
  // Trigger draft autosave so this gets updated in draft storage too!
  if (window.saveProductDraft) window.saveProductDraft();
  
  showAdminNotification(`Cleared ${type === 'cover' ? 'catalog cover' : 'empty template'} image.`, "info");
};

// ====================================================================
// Orders Management Actions
// ====================================================================
function extractItemPhotos(item) {
  if (item.uploadedPhotos && Array.isArray(item.uploadedPhotos) && item.uploadedPhotos.length > 0) {
    return item.uploadedPhotos;
  }
  if (item.uploaded_photos && Array.isArray(item.uploaded_photos) && item.uploaded_photos.length > 0) {
    return item.uploaded_photos;
  }
  if (item.customization && item.customization.uploadedPhotos && Array.isArray(item.customization.uploadedPhotos)) {
    return item.customization.uploadedPhotos;
  }
  if (item.photos && Array.isArray(item.photos)) {
    return item.photos;
  }
  return [];
}

window.generateOrderPDF = function(orderId) {
  const ord = allOrders.find(o => o.id === orderId);
  if (!ord) return;

  const date = new Date(ord.created_at).toLocaleString();
  const items = Array.isArray(ord.items) ? ord.items : JSON.parse(ord.items || '[]');

  let itemsRows = '';
  let photosGallery = '';

  items.forEach((item, index) => {
    itemsRows += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${index + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.productName}</strong><br>
          <small>Size: ${item.size || 'Standard'}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;"><strong>₹${item.price * item.quantity}</strong></td>
      </tr>
    `;

    const mainImg = item.croppedImage || item.productImage;
    if (mainImg) {
      photosGallery += `
        <div style="margin-bottom: 20px; page-break-inside: avoid; border: 1px solid #ddd; padding: 12px; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #13294B;">Item #${index + 1}: ${item.productName} (Main Print Layout)</h4>
          <img src="${mainImg}" style="max-width: 280px; max-height: 280px; border: 1px solid #ccc; border-radius: 6px; object-fit: contain; display: block; margin-bottom: 8px;">
          <a href="${mainImg}" target="_blank" style="font-size: 11px; color: #D4AF37; font-weight: bold;">Download Main Print Image</a>
        </div>
      `;
    }

    const collagePhotos = extractItemPhotos(item);
    if (collagePhotos.length > 0) {
      photosGallery += `
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h4 style="margin: 5px 0 10px 0; color: #D4AF37;">Customer Uploaded Collage Photos (${collagePhotos.length}):</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 12px;">
      `;
      collagePhotos.forEach((p, pIdx) => {
        const photoUrl = typeof p === 'string' ? p : (p.url || p.src);
        const photoName = typeof p === 'object' && p.name ? p.name : `Image ${pIdx + 1}`;
        if (photoUrl) {
          photosGallery += `
            <div style="border: 1px solid #ccc; padding: 8px; border-radius: 8px; text-align: center; background: #fafafa;">
              <img src="${photoUrl}" style="width: 140px; height: 140px; object-fit: cover; border-radius: 6px; display: block; margin-bottom: 6px;">
              <strong style="font-size: 11px; display: block; margin-bottom: 4px;">${photoName}</strong>
              <a href="${photoUrl}" target="_blank" download style="font-size: 10px; color: #0B1F3A; font-weight: bold; text-decoration: underline;">Download Photo</a>
            </div>
          `;
        }
      });
      photosGallery += `</div></div>`;
    }
  });

  const printWindow = window.open('', '_blank', 'width=850,height=950');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Invoice - ${ord.id}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #0B1F3A; }
        .badge { background: #e6f4ea; color: #137333; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
        th { background: #0B1F3A; color: #fff; padding: 10px; text-align: left; }
        .total-box { text-align: right; font-size: 16px; margin-top: 15px; padding-top: 10px; border-top: 2px solid #0B1F3A; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">VD CREATION</div>
          <small>Custom Photo Frames & Gifts Studio</small>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0; color: #D4AF37;">ORDER INVOICE SUMMARY</h3>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Order ID: ${ord.id}</p>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #666;">Date: ${date}</p>
        </div>
      </div>

      <div class="grid">
        <div>
          <h4 style="margin-top: 0; color: #13294B;">CUSTOMER DETAILS</h4>
          <p style="margin: 3px 0;"><strong>Name:</strong> ${ord.customer_name}</p>
          <p style="margin: 3px 0;"><strong>Phone:</strong> ${ord.customer_phone}</p>
          <p style="margin: 3px 0;"><strong>Email:</strong> ${ord.customer_email}</p>
        </div>
        <div>
          <h4 style="margin-top: 0; color: #13294B;">SHIPPING ADDRESS & PAYMENT</h4>
          <p style="margin: 3px 0;"><strong>Address:</strong> ${ord.address}, ${ord.city}, ${ord.state} - ${ord.pincode}</p>
          <p style="margin: 3px 0;"><strong>Payment Method:</strong> ${ord.payment_method || 'Online Payment'}</p>
          <p style="margin: 3px 0;"><strong>Payment Ref ID:</strong> ${ord.payment_id || 'N/A'}</p>
          <p style="margin: 3px 0;"><strong>Payment Status:</strong> <span class="badge">${ord.payment_status || 'PAID'}</span></p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item / Frame Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="total-box">
        <strong>Grand Total Charged: <span style="color: #D4AF37;">₹${ord.total_price}</span></strong>
      </div>

      <div style="margin-top: 30px;">
        <h3 style="border-bottom: 2px solid #D4AF37; padding-bottom: 8px; color: #0B1F3A;">CUSTOMER UPLOADED PHOTOS & PRINT LAYOUTS</h3>
        ${photosGallery}
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

window.uploadOrderProof = function(orderId, fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  showAdminNotification("Uploading print proof file to Cloudinary...", "info");

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: reader.result,
          folder: 'vd_creations_proofs'
        })
      });

      const data = await response.json();
      if (response.ok && data.url) {
        const ord = allOrders.find(o => o.id === orderId);
        if (ord) {
          ord.proof_url = data.url;
        }

        await supabaseClient
          .from('orders')
          .update({ proof_url: data.url })
          .eq('id', orderId);

        renderOrders();
        showAdminNotification("Print proof uploaded successfully for order!", "success");
      } else {
        throw new Error(data.error || "Proof upload failed");
      }
    } catch (err) {
      showAdminNotification(`Failed to upload proof: ${err.message}`, "error");
    } finally {
      fileInput.value = '';
    }
  };
};

window.downloadImageFile = function(url, filename) {
  if (!url) return;

  // Cloudinary Attachment URL transformation (Forces Content-Disposition: attachment download)
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const cleanFilename = (filename || 'image').replace(/[^a-zA-Z0-9_-]/g, '_');
    const downloadUrl = url.replace('/upload/', `/upload/fl_attachment:${cleanFilename}/`);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${cleanFilename}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  // Blob fetch fallback for local / data URLs
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${filename || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    })
    .catch(() => {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.download = filename || 'image';
      a.click();
    });
};

function renderOrders() {
  const container = document.getElementById('admin-orders-list');
  if (!container) return;

  if (allOrders.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-xs text-gray-500">No orders registered in the system yet.</div>
    `;
    return;
  }

  container.innerHTML = allOrders.map(ord => {
    const date = new Date(ord.created_at).toLocaleString();
    const items = Array.isArray(ord.items) ? ord.items : JSON.parse(ord.items || '[]');
    
    // Build items display
    const itemsHtml = items.map(item => {
      let collagePhotosHtml = '';
      const photos = extractItemPhotos(item);
      if (photos && photos.length > 0) {
        collagePhotosHtml = `
          <div class="mt-2 pt-2 border-t border-slate-800/60 w-full">
            <span class="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider block mb-1.5"><i class="fa-solid fa-layer-group mr-1"></i> Uploaded Frame Photos (${photos.length}):</span>
            <div class="flex flex-wrap gap-2">
              ${photos.map((p, pIdx) => {
                const photoUrl = typeof p === 'string' ? p : (p.url || p.src);
                const photoName = typeof p === 'object' && p.name ? p.name : `Image ${pIdx + 1}`;
                return `
                  <button type="button" onclick="downloadImageFile('${photoUrl}', '${photoName}')" class="flex items-center space-x-1.5 bg-slate-900 hover:bg-[#D4AF37]/20 border border-slate-700/80 px-2.5 py-1 rounded-lg text-[9px] text-white hover:text-[#D4AF37] transition-all group cursor-pointer">
                    <span class="font-bold">${photoName}:</span>
                    <i class="fa-solid fa-download text-[9px] text-[#D4AF37]"></i>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      return `
        <div class="p-3 bg-navy-950/40 border border-slate-800/40 rounded-xl space-y-2">
          <div class="flex items-center gap-3">
            <!-- User cropped thumbnail preview -->
            <div class="w-16 h-16 rounded-lg border border-slate-800 bg-slate-900 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img src="${item.croppedImage || item.productImage}" class="w-full h-full object-cover">
            </div>
            <div class="flex-grow min-w-0">
              <h5 class="text-xs font-bold text-white truncate">${item.productName}</h5>
              <p class="text-[10px] text-gray-400">Size: ${item.size || 'Standard'} | Qty: ${item.quantity}</p>
              <p class="text-[10px] text-[#D4AF37] font-semibold">₹${item.price} each</p>
            </div>
            <div class="flex-shrink-0">
              <button type="button" onclick="downloadImageFile('${item.croppedImage || item.productImage}', 'Main_Print_Photo')" class="bg-navy-700 hover:bg-[#D4AF37] hover:text-navy-950 text-white border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer" title="Download Main Image">
                <i class="fa-solid fa-download"></i>
                <span class="text-[10px] font-bold">Main Photo</span>
              </button>
            </div>
          </div>
          ${collagePhotosHtml}
        </div>
      `;
    }).join(' ');

    const statusClass = ord.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/30';
    const statusBtnLabel = ord.status === 'pending' ? 'Mark Completed' : 'Mark Pending';
    const statusIcon = ord.status === 'pending' ? 'fa-circle-check text-green-400' : 'fa-spinner text-yellow-400';

    const paymentModeLabel = ord.payment_method || 'Online Payment (Razorpay)';
    const paymentRef = ord.payment_id && ord.payment_id !== 'N/A' ? `Ref ID: ${ord.payment_id}` : '';
    const isPaid = ord.payment_status === 'PAID' || ord.payment_id !== 'N/A';
    const payBadgeClass = isPaid ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    const payBadgeText = isPaid ? 'PAID SUCCESSFUL' : (ord.payment_status || 'COD');

    let proofHtml = '';
    if (ord.proof_url) {
      proofHtml = `
        <div class="flex items-center space-x-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 mt-2">
          <img src="${ord.proof_url}" class="w-12 h-12 object-cover rounded-lg border border-slate-700">
          <div class="flex-grow min-w-0">
            <span class="text-[9px] text-green-400 font-bold uppercase block"><i class="fa-solid fa-circle-check mr-1"></i> Print Proof Uploaded</span>
            <a href="${ord.proof_url}" target="_blank" class="text-[10px] text-[#D4AF37] hover:underline font-semibold truncate block">View / Download Proof Image</a>
          </div>
        </div>
      `;
    }

    return `
      <div class="bg-navy-900/35 border border-slate-800 p-5 rounded-2xl space-y-4">
        <!-- Order Header info -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/50 pb-3">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold text-white">${ord.customer_name}</span>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusClass}">${ord.status}</span>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${payBadgeClass}">${payBadgeText}</span>
            </div>
            <p class="text-[10px] text-gray-400"><i class="fa-regular fa-calendar mr-1"></i> ${date} | Order ID: <span class="font-mono text-[9px] text-[#D4AF37]">${ord.id}</span></p>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="toggleOrderStatus('${ord.id}', '${ord.status}')" class="bg-navy-700 hover:bg-slate-800 text-white border border-slate-700/60 text-[10px] font-bold uppercase py-2 px-3 rounded-xl transition-all flex items-center gap-1.5">
              <i class="fa-solid ${statusIcon}"></i>
              <span>${statusBtnLabel}</span>
            </button>
            <button onclick="deleteOrder('${ord.id}')" class="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/25 p-2 rounded-xl text-xs transition-all" title="Delete Order">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Address Grid & Payment info -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div class="space-y-0.5">
            <span class="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Contact Details</span>
            <p class="text-gray-300">${ord.customer_email}</p>
            <p class="text-gray-300">${ord.customer_phone}</p>
          </div>
          <div class="space-y-0.5">
            <span class="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Delivery Address</span>
            <p class="text-gray-300 truncate">${ord.address}, ${ord.city}, ${ord.state} - ${ord.pincode}</p>
            ${(ord.location_link || (items[0] && items[0].locationLink)) ? `
              <a href="${ord.location_link || items[0].locationLink}" target="_blank" class="inline-flex items-center space-x-1.5 text-[#D4AF37] hover:underline text-[9px] font-bold mt-1 bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                <i class="fa-solid fa-map-location-dot text-xs"></i>
                <span>Open GPS Location</span>
              </a>
            ` : ''}
          </div>
          <div class="space-y-0.5">
            <span class="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Payment Info</span>
            <p class="text-gray-300 font-semibold">${paymentModeLabel}</p>
            ${paymentRef ? `<p class="text-[10px] text-gray-400 font-mono">${paymentRef}</p>` : ''}
          </div>
        </div>

        <!-- Items grid container -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          ${itemsHtml}
        </div>

        ${proofHtml}

        <!-- Courier Tracking Controls for Admin -->
        <div class="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3 mt-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider flex items-center gap-1">
              <i class="fa-solid fa-truck-fast"></i> Courier Tracking Setup (DTDC / SpeedPost / BlueDart / Delhivery)
            </span>
            ${ord.tracking_id ? `<span class="text-[9px] bg-green-500/15 text-green-400 border border-green-500/30 font-bold px-2 py-0.5 rounded-full"><i class="fa-solid fa-circle-check mr-1"></i> Tracking Active</span>` : '<span class="text-[9px] text-gray-500 font-semibold">Not Shared Yet</span>'}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label class="text-[9px] text-gray-400 font-bold block mb-1">Courier Service</label>
              <input type="text" id="courier-name-${ord.id}" value="${ord.courier_name || 'DTDC Express'}" placeholder="e.g. DTDC, BlueDart, Delhivery" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none">
            </div>
            <div>
              <label class="text-[9px] text-gray-400 font-bold block mb-1">Tracking ID / AWB Number</label>
              <input type="text" id="tracking-id-${ord.id}" value="${ord.tracking_id || ''}" placeholder="e.g. D12345678" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none font-mono">
            </div>
            <div>
              <label class="text-[9px] text-gray-400 font-bold block mb-1">Courier Tracking Portal Link</label>
              <input type="url" id="tracking-link-${ord.id}" value="${ord.tracking_link || 'https://www.dtdc.in/tracking.asp'}" placeholder="e.g. https://www.dtdc.in/tracking.asp" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-[#D4AF37] focus:border-[#D4AF37] focus:outline-none font-mono">
            </div>
          </div>

          <div class="flex items-center justify-end space-x-2 pt-1">
            <button onclick="saveOrderTrackingInfo('${ord.id}')" class="bg-[#D4AF37] hover:bg-[#F3CD46] text-[#0B1F3A] font-bold text-xs py-1.5 px-4 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow">
              <i class="fa-solid fa-paper-plane"></i>
              <span>Save & Share Courier Tracking</span>
            </button>
          </div>
        </div>

        <!-- Action Toolbar & Pricing details -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/50 pt-3">
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="generateOrderPDF('${ord.id}')" class="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[10px] font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5" title="Generate printable PDF summary">
              <i class="fa-solid fa-file-pdf text-red-400"></i>
              <span>Download Order PDF</span>
            </button>
            <input type="file" id="proof-input-${ord.id}" onchange="uploadOrderProof('${ord.id}', this)" class="hidden" accept="image/*">
            <button onclick="document.getElementById('proof-input-${ord.id}').click()" class="bg-navy-800 hover:bg-[#D4AF37] hover:text-navy-950 text-white border border-slate-700 text-[10px] font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5" title="Upload finished frame proof">
              <i class="fa-solid fa-cloud-arrow-up text-[#D4AF37]"></i>
              <span>Upload Print Proof</span>
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-400 font-semibold">Total Charged:</span>
            <p class="text-base font-black text-[#D4AF37]">₹${ord.total_price}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.saveOrderTrackingInfo = async function(orderId) {
  const courierNameInput = document.getElementById(`courier-name-${orderId}`);
  const trackingIdInput = document.getElementById(`tracking-id-${orderId}`);
  const trackingLinkInput = document.getElementById(`tracking-link-${orderId}`);

  const courierName = courierNameInput ? courierNameInput.value.trim() : 'DTDC Express';
  const trackingId = trackingIdInput ? trackingIdInput.value.trim() : '';
  const trackingLink = trackingLinkInput ? trackingLinkInput.value.trim() : '';

  if (!trackingId || !trackingLink) {
    showAdminNotification("Please enter both Tracking ID and Courier Portal Link.", "error");
    return;
  }

  showAdminNotification("Saving courier tracking info...", "info");

  // Update in-memory order object immediately
  const memOrd = allOrders.find(o => o.id === orderId);
  if (memOrd) {
    memOrd.courier_name = courierName || 'DTDC Express';
    memOrd.tracking_id = trackingId;
    memOrd.tracking_link = trackingLink;
    memOrd.status = 'completed';
  }

  // Sync to local orders store
  try {
    const res = await fetch('/api/admin/update-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderId,
        courier_name: courierName || 'DTDC Express',
        tracking_id: trackingId,
        tracking_link: trackingLink,
        status: 'completed'
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.order) {
        if (memOrd) Object.assign(memOrd, data.order);
      }
    }
  } catch(e) {}

  // Sync to Supabase root columns & JSONB items
  try {
    await supabaseClient
      .from('orders')
      .update({
        courier_name: courierName || 'DTDC Express',
        tracking_id: trackingId,
        tracking_link: trackingLink,
        status: 'completed'
      })
      .eq('id', orderId);
  } catch(e) {}

  try {
    if (memOrd && memOrd.items && Array.isArray(memOrd.items)) {
      const updatedItems = memOrd.items.map(item => ({
        ...item,
        courier_name: courierName || 'DTDC Express',
        tracking_id: trackingId,
        tracking_link: trackingLink
      }));
      await supabaseClient
        .from('orders')
        .update({ items: updatedItems, status: 'completed' })
        .eq('id', orderId);
    }
  } catch(e) {}

  showAdminNotification("Courier Tracking info saved & shared with customer!", "success");
  await fetchData();
};

async function toggleOrderStatus(orderId, currentStatus) {
  const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
  
  // Sync to local order store
  fetch('/api/admin/update-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: orderId, status: nextStatus })
  }).catch(() => {});

  const { error } = await supabaseClient
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', orderId);

  showAdminNotification(`Order updated to ${nextStatus}!`, 'success');
  fetchData();
}

async function deleteOrder(orderId) {
  if (!confirm("Are you sure you want to delete this order permanently?")) return;

  const { error } = await supabaseClient.from('orders').delete().eq('id', orderId);
  if (error) {
    showAdminNotification(error.message, 'error');
  } else {
    showAdminNotification("Order deleted successfully!", 'success');
    fetchData();
  }
}

// ====================================================================
// Modals Submission Handling
// ====================================================================
function bindModalEvents() {
  // Category Form Submit
  const catForm = document.getElementById('category-form');
  if (catForm) {
    catForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const isEdit = document.getElementById('category-edit-mode').value === 'true';
      const id = document.getElementById('category-id').value.trim().toLowerCase();
      const name = document.getElementById('category-name').value.trim();

      let error;
      if (isEdit) {
        // Update category name
        const { error: err } = await supabaseClient
          .from('categories')
          .update({ name })
          .eq('id', id);
        error = err;
      } else {
        // Insert category
        const { error: err } = await supabaseClient
          .from('categories')
          .insert([{ id, name }]);
        error = err;
      }

      if (error) {
        showAdminNotification(error.message, 'error');
      } else {
        showAdminNotification(`Category saved successfully!`, 'success');
        closeCategoryModal();
        fetchData();
      }
    });
  }

  // Product Form Submit
  const prodForm = document.getElementById('product-form');
  if (prodForm) {
    prodForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const isEdit = document.getElementById('product-edit-mode').value === 'true';
      const id = document.getElementById('product-id').value.trim().toLowerCase();
      const name = document.getElementById('product-name').value.trim();
      const category = document.getElementById('product-category').value;
      const base_price = parseFloat(document.getElementById('product-price').value);
      const description = document.getElementById('product-description').value.trim();
      
      // Select label matches
      const catObj = allCategories.find(c => c.id === category);
      const category_label = catObj ? catObj.name : 'Photo Frames';

      // Retrieve selected sizes and custom prices
      const sizes = {};
      const checkboxes = document.querySelectorAll('#size-prices-grid input[type="checkbox"]');
      checkboxes.forEach(cb => {
        if (cb.checked) {
          const size = cb.dataset.size;
          const priceInput = document.querySelector(`input[data-size-price="${size}"]`);
          const price = priceInput ? parseFloat(priceInput.value) : 0;
          sizes[size] = isNaN(price) ? 0 : price;
        }
      });

      // Validation
      if (Object.keys(sizes).length === 0) {
        showAdminNotification("Please select at least one size option.", "error");
        return;
      }
      
      const featuresStr = document.getElementById('product-features').value;
      const features = featuresStr.split(',').map(f => f.trim()).filter(f => f.length > 0);

      const product_image = document.getElementById('product-image-url').value;
      const empty_image = document.getElementById('product-empty-url').value.trim() || null;
      
      const crop_left = parseFloat(document.getElementById('product-crop-left').value) || 0;
      const crop_top = parseFloat(document.getElementById('product-crop-top').value) || 0;
      const crop_width = parseFloat(document.getElementById('product-crop-width').value) || 100;
      const crop_height = parseFloat(document.getElementById('product-crop-height').value) || 100;

      let slots = 1;
      const toggleEl = document.getElementById('product-collage-toggle');
      const slotsInput = document.getElementById('product-slots');
      if (toggleEl && toggleEl.checked && slotsInput) {
        slots = parseInt(slotsInput.value) || 4;
      } else {
        slots = 1;
      }

      let error;
      const payload = {
        name,
        category,
        category_label,
        base_price,
        description,
        sizes,
        features,
        product_image,
        empty_image,
        crop_left,
        crop_top,
        crop_width,
        crop_height,
        slots
      };

      if (isEdit) {
        const { error: err } = await supabaseClient
          .from('products')
          .update(payload)
          .eq('id', id);
        error = err;
      } else {
        // Insert product
        const { error: err } = await supabaseClient
          .from('products')
          .insert([{ id, ...payload }]);
        error = err;
      }

      if (error) {
        showAdminNotification(error.message, 'error');
      } else {
        localStorage.removeItem('vd_product_form_draft');
        showAdminNotification(`Photo frame saved successfully!`, 'success');
        closeProductModal();
        fetchData();
      }
    });
  }
}

// ====================================================================
// Administrative Custom Notifications Display
// ====================================================================
function showAdminNotification(message, type = 'info') {
  const banner = document.getElementById('admin-notification');
  const iconEl = document.getElementById('admin-notification-icon');
  const msgEl = document.getElementById('admin-notification-msg');

  if (!banner || !iconEl || !msgEl) return;

  msgEl.textContent = message;
  
  if (type === 'success') {
    banner.className = "fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 shadow-2xl transition-all duration-300";
    iconEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
  } else if (type === 'error') {
    banner.className = "fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 shadow-2xl transition-all duration-300";
    iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
  } else {
    banner.className = "fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-2xl transition-all duration-300";
    iconEl.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
  }

  // Slide In
  banner.classList.remove('translate-y-24', 'opacity-0');

  // Hide after 4 seconds
  setTimeout(() => {
    banner.classList.add('translate-y-24', 'opacity-0');
  }, 4000);
}
