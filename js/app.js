// app.js - VD CREATION Global JavaScript state and UI manager

document.addEventListener('DOMContentLoaded', () => {
  // Initialize dynamic header and footer
  injectHeaderAndFooter();
  
  // Load state from localstorage
  initGlobalState();
  
  // Bind common UI events (sticky nav, mobile menu, cart drawer, etc.)
  bindGlobalEvents();
});

// Global state variables
window.VDEcommerce = {
  cart: [],
  wishlist: [],
  coupons: {
    'VD10': 0.10,
    'MEMORIES': 0.15,
    'WELCOME20': 0.20
  },
  activeCoupon: null
};

// ----------------------------------------------------
// Inject Header and Footer dynamically
// ----------------------------------------------------
function injectHeaderAndFooter() {
  const header = document.getElementById('global-header');
  const footer = document.getElementById('global-footer');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  if (header) {
    header.className = "sticky top-0 z-50 transition-all duration-300";
    header.innerHTML = `
      <nav class="glass-nav text-white py-4 px-6 md:px-12 flex items-center justify-between">
        <!-- Logo -->
        <a href="index.html" class="flex items-center space-x-3 group">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#D4AF37] to-[#F3CD46] flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#0B1F3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span class="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-[#D4AF37]">VD CREATION</span>
            <p class="text-[9px] text-gray-400 tracking-widest uppercase -mt-1 font-semibold">Custom Frames & Gifts</p>
          </div>
        </a>

        <!-- Desktop Menu -->
        <div class="hidden lg:flex items-center space-x-8 font-medium">
          <a href="index.html" class="nav-link text-sm hover:text-[#D4AF37] transition-colors duration-200 ${currentPath === 'index.html' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' : 'text-gray-200'}">Home</a>
          <a href="services.html" class="nav-link text-sm hover:text-[#D4AF37] transition-colors duration-200 ${currentPath === 'services.html' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' : 'text-gray-200'}">Our Services</a>
          <a href="about.html" class="nav-link text-sm hover:text-[#D4AF37] transition-colors duration-200 ${currentPath === 'about.html' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' : 'text-gray-200'}">About Us</a>
          <a href="contact.html" class="nav-link text-sm hover:text-[#D4AF37] transition-colors duration-200 ${currentPath === 'contact.html' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' : 'text-gray-200'}">Contact</a>
        </div>

        <!-- Icons Panel -->
        <div class="flex items-center space-x-4">
          <!-- Search Toggle -->
          <div class="relative hidden sm:block">
            <input type="text" id="search-input" placeholder="Search frames..." class="bg-slate-900/60 border border-slate-700 text-white rounded-full py-1.5 px-4 pr-9 text-xs focus:outline-none focus:border-[#D4AF37] w-48 transition-all duration-300 focus:w-64">
            <button id="search-btn" class="absolute right-3 top-2.5 text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          <!-- Wishlist -->
          <button id="wishlist-toggle-btn" class="relative p-2 text-gray-300 hover:text-[#D4AF37] transition-colors focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span id="wishlist-badge" class="absolute top-0 right-0 bg-[#D4AF37] text-[#0B1F3A] font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center transform translate-x-1.5 -translate-y-1.5 scale-0 transition-transform duration-300">0</span>
          </button>

          <!-- Auth Slot -->
          <div class="nav-auth-slot"></div>

          <!-- Cart -->
          <button id="cart-toggle-btn" class="relative p-2 text-gray-300 hover:text-[#D4AF37] transition-colors focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span id="cart-badge" class="absolute top-0 right-0 bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center transform translate-x-1.5 -translate-y-1.5 scale-0 transition-transform duration-300">0</span>
          </button>

          <!-- Mobile Menu Burger -->
          <button id="mobile-menu-btn" class="lg:hidden p-2 text-gray-300 hover:text-white focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      <!-- Mobile Dropdown Menu -->
      <div id="mobile-menu-panel" class="hidden lg:hidden bg-[#0B1F3A]/95 border-b border-slate-700/50 backdrop-blur-md px-6 py-4 flex flex-col space-y-4">
        <a href="index.html" class="text-white hover:text-[#D4AF37] font-medium py-2">Home</a>
        <a href="services.html" class="text-white hover:text-[#D4AF37] font-medium py-2">Our Services</a>
        <a href="about.html" class="text-white hover:text-[#D4AF37] font-medium py-2">About Us</a>
        <a href="contact.html" class="text-white hover:text-[#D4AF37] font-medium py-2">Contact</a>
        <div class="relative pt-2">
          <input type="text" id="mobile-search" placeholder="Search frames..." class="bg-slate-950 border border-slate-800 text-white rounded-full py-2 px-4 pr-9 text-sm focus:outline-none w-full">
          <button class="absolute right-3 top-4.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    `;

    if (window.VDAuth) {
      window.VDAuth.updateNavbarAuthUI();
    }
  }

  if (footer) {
    footer.className = "bg-[#0B1F3A] border-t border-slate-800 text-gray-300 py-16 px-6 md:px-12";
    footer.innerHTML = `
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <!-- Brand Info -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded bg-gradient-to-tr from-[#D4AF37] to-[#F3CD46] flex items-center justify-center shadow">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#0B1F3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-lg font-bold text-white tracking-widest">VD CREATION</span>
          </div>
          <p class="text-xs text-gray-400 leading-relaxed">
            Beautifully crafted customizable photo frames and premium personalized gifts for birthdays, weddings, anniversaries, and all your special moments.
          </p>
          <div class="flex space-x-4 pt-2">
            <a href="#" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#D4AF37] hover:text-[#0B1F3A] flex items-center justify-center transition-all duration-300"><i class="fab fa-facebook-f text-sm"></i></a>
            <a href="#" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#D4AF37] hover:text-[#0B1F3A] flex items-center justify-center transition-all duration-300"><i class="fab fa-instagram text-sm"></i></a>
            <a href="#" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#D4AF37] hover:text-[#0B1F3A] flex items-center justify-center transition-all duration-300"><i class="fab fa-twitter text-sm"></i></a>
            <a href="#" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#D4AF37] hover:text-[#0B1F3A] flex items-center justify-center transition-all duration-300"><i class="fab fa-pinterest text-sm"></i></a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-4">
          <h4 class="text-white font-semibold text-sm tracking-wider uppercase">Quick Links</h4>
          <ul class="space-y-2 text-xs">
            <li><a href="index.html" class="hover:text-[#D4AF37] hover:underline transition-colors">Home</a></li>
            <li><a href="services.html" class="hover:text-[#D4AF37] hover:underline transition-colors">Our Services</a></li>
            <li><a href="about.html" class="hover:text-[#D4AF37] hover:underline transition-colors">About Us</a></li>
            <li><a href="contact.html" class="hover:text-[#D4AF37] hover:underline transition-colors">Contact Us</a></li>
            <li><a href="customize.html" class="hover:text-[#D4AF37] hover:underline transition-colors">Frame Customizer</a></li>
          </ul>
        </div>

        <!-- Frame Categories -->
        <div class="space-y-4">
          <h4 class="text-white font-semibold text-sm tracking-wider uppercase">Frame Categories</h4>
          <ul class="space-y-2 text-xs">
            <li><a href="services.html?tab=acrylic" class="hover:text-[#D4AF37] hover:underline transition-colors">Acrylic Frames</a></li>
            <li><a href="services.html?tab=matte" class="hover:text-[#D4AF37] hover:underline transition-colors">Zink Mate Frames</a></li>
            <li><a href="services.html?tab=classic" class="hover:text-[#D4AF37] hover:underline transition-colors">Normal/Wood Frames</a></li>
            <li><a href="services.html?tab=led" class="hover:text-[#D4AF37] hover:underline transition-colors">Glowing LED Frames</a></li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div class="space-y-4">
          <h4 class="text-white font-semibold text-sm tracking-wider uppercase">Contact Info</h4>
          <ul class="space-y-3 text-xs">
            <li class="flex items-start space-x-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-[#D4AF37] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>102, Memory Lane, Creative Studio, Creative City, Pin - 400001</span>
            </li>
            <li class="flex items-center space-x-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:+919876543210" class="hover:text-[#D4AF37] transition-colors">+91 98765 43210</a>
            </li>
            <li class="flex items-center space-x-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:support@vdcreation.com" class="hover:text-[#D4AF37] transition-colors">support@vdcreation.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="max-w-7xl mx-auto border-t border-slate-800/80 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
        <p>&copy; ${new Date().getFullYear()} VD CREATION. All rights reserved. Crafted with ❤️ for precious memories.</p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" class="hover:text-white transition-colors">Refund Policy</a>
        </div>
      </div>
    `;
  }
}

// ----------------------------------------------------
// Cart and Wishlist Global State Init
// ----------------------------------------------------
function initGlobalState() {
  const savedCart = localStorage.getItem('vd_cart');
  const savedWishlist = localStorage.getItem('vd_wishlist');
  
  if (savedCart) {
    try {
      window.VDEcommerce.cart = JSON.parse(savedCart);
    } catch(e) {
      window.VDEcommerce.cart = [];
    }
  }
  
  if (savedWishlist) {
    try {
      window.VDEcommerce.wishlist = JSON.parse(savedWishlist);
    } catch(e) {
      window.VDEcommerce.wishlist = [];
    }
  }

  // Create Cart Drawer Element dynamically on load
  createCartDrawerHTML();
  createWishlistPanelHTML();
  
  updateCartBadge();
  updateWishlistBadge();
}

// ----------------------------------------------------
// Event Bindings
// ----------------------------------------------------
function bindGlobalEvents() {
  // Sticky Nav trigger
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('nav');
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.remove('py-4');
        navbar.classList.add('py-2', 'bg-[#0B1F3A]/95', 'shadow-2xl');
      } else {
        navbar.classList.remove('py-2', 'bg-[#0B1F3A]/95', 'shadow-2xl');
        navbar.classList.add('py-4');
      }
    }
    
    // Scroll to top button visibility
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
      if (window.scrollY > 400) {
        scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        scrollToTopBtn.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
      } else {
        scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        scrollToTopBtn.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
      }
    }
  });

  // Scroll to Top action
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Floating WhatsApp button action
  const waFloatingBtn = document.getElementById('whatsapp-floating-btn');
  if (waFloatingBtn) {
    waFloatingBtn.addEventListener('click', () => {
      window.open('https://api.whatsapp.com/send?phone=918249906764&text=Hello%20VD%20Creation!%20I%20have%20a%20query%20regarding%20custom%20photo%20frames.', '_blank');
    });
  }

  // Mobile menu toggle
  document.addEventListener('click', (e) => {
    const mobilePanel = document.getElementById('mobile-menu-panel');
    const burgerBtn = document.getElementById('mobile-menu-btn');
    if (burgerBtn && burgerBtn.contains(e.target)) {
      mobilePanel.classList.toggle('hidden');
    } else if (mobilePanel && !mobilePanel.contains(e.target) && !e.target.closest('#mobile-menu-btn')) {
      mobilePanel.classList.add('hidden');
    }
  });

  // Cart open/close triggers
  document.addEventListener('click', (e) => {
    const cartToggle = document.getElementById('cart-toggle-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const closeCart = document.getElementById('close-cart-btn');
    
    if (cartToggle && cartToggle.contains(e.target)) {
      openCartDrawer();
    } else if (closeCart && closeCart.contains(e.target)) {
      closeCartDrawer();
    } else if (cartDrawer && !cartDrawer.contains(e.target) && !e.target.closest('#cart-toggle-btn') && !e.target.closest('.add-to-cart-action')) {
      closeCartDrawer();
    }
  });

  // Wishlist open/close triggers
  document.addEventListener('click', (e) => {
    const wishlistToggle = document.getElementById('wishlist-toggle-btn');
    const wishlistPanel = document.getElementById('wishlist-panel');
    const closeWishlist = document.getElementById('close-wishlist-btn');
    
    if (wishlistToggle && wishlistToggle.contains(e.target)) {
      openWishlistPanel();
    } else if (closeWishlist && closeWishlist.contains(e.target)) {
      closeWishlistPanel();
    } else if (wishlistPanel && !wishlistPanel.contains(e.target) && !e.target.closest('#wishlist-toggle-btn') && !e.target.closest('.wishlist-action-btn')) {
      closeWishlistPanel();
    }
  });

  // Search input processing
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `services.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // Floating WhatsApp functionality
  const waBtn = document.getElementById('whatsapp-floating-btn');
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      const textMsg = encodeURIComponent("Hi VD CREATION, I am interested in customizing a premium photo frame. Please guide me!");
      window.open(`https://wa.me/919876543210?text=${textMsg}`, '_blank');
    });
  }
}

// ----------------------------------------------------
// Cart Drawer Creation & Management
// ----------------------------------------------------
function createCartDrawerHTML() {
  if (document.getElementById('cart-drawer-container')) return;

  const container = document.createElement('div');
  container.id = 'cart-drawer-container';
  container.className = 'fixed inset-0 z-[100] pointer-events-none';
  container.innerHTML = `
    <!-- Overlay background -->
    <div id="cart-overlay" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300"></div>
    
    <!-- Sliding Panel -->
    <div id="cart-drawer" class="absolute right-0 top-0 bottom-0 w-full sm:w-[450px] glass-panel text-white translate-x-full pointer-events-auto transition-transform duration-300 ease-out shadow-2xl flex flex-col">
      <!-- Drawer Header -->
      <div class="p-6 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 class="text-lg font-bold">Your Memory Cart</h3>
        </div>
        <button id="close-cart-btn" class="p-1 hover:text-[#D4AF37] transition-colors focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Drawer Items List -->
      <div id="cart-items-list" class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Dynamic Content Injected here -->
      </div>

      <!-- Drawer Footer -->
      <div class="p-6 border-t border-slate-700/60 bg-slate-950/40 space-y-4">
        <div class="flex items-center justify-between text-sm text-gray-400">
          <span>Subtotal</span>
          <span id="cart-subtotal" class="text-white font-bold text-lg">₹0.00</span>
        </div>
        
        <div class="flex flex-col gap-2">
          <button onclick="proceedToCheckoutGuard(event)" class="w-full bg-gradient-to-r from-[#D4AF37] to-[#F3CD46] hover:from-[#F3CD46] hover:to-[#D4AF37] text-[#0B1F3A] font-bold text-center py-3 rounded-lg shadow-lg hover:shadow-yellow-500/20 transform hover:-translate-y-0.5 transition-all duration-300">
            Proceed to Checkout
          </button>
          <button onclick="closeCartDrawer()" class="w-full text-center text-xs text-gray-400 hover:text-white transition-colors py-2">
            Continue Customizing
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);
}

function proceedToCheckoutGuard(e) {
  if (e) e.preventDefault();
  const user = window.VDAuth ? window.VDAuth.getCurrentUser() : null;
  if (!user) {
    closeCartDrawer();
    if (window.VDAuth) {
      window.VDAuth.openAuthModal('checkout.html');
      if (window.showNotification) {
        window.showNotification("Please login or create an account to proceed with your order.", "info");
      }
    }
  } else {
    window.location.href = 'checkout.html';
  }
}
window.proceedToCheckoutGuard = proceedToCheckoutGuard;

function openCartDrawer() {
  const container = document.getElementById('cart-drawer-container');
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  
  if (container && overlay && drawer) {
    container.classList.remove('pointer-events-none');
    overlay.classList.remove('pointer-events-none');
    overlay.classList.add('opacity-100');
    drawer.classList.remove('translate-x-full');
    
    renderCartItems();
  }
}

function closeCartDrawer() {
  const container = document.getElementById('cart-drawer-container');
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  
  if (container && overlay && drawer) {
    container.classList.add('pointer-events-none');
    overlay.classList.add('pointer-events-none');
    overlay.classList.remove('opacity-100');
    drawer.classList.add('translate-x-full');
  }
}

function renderCartItems() {
  const list = document.getElementById('cart-items-list');
  const subtotalText = document.getElementById('cart-subtotal');
  if (!list || !subtotalText) return;

  if (window.VDEcommerce.cart.length === 0) {
    list.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
        <div class="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p class="text-gray-400 text-sm font-medium">Your cart feels a bit light.</p>
        <a href="services.html" class="inline-block bg-[#D4AF37]/20 border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1F3A] text-[#D4AF37] font-semibold text-xs py-2 px-6 rounded-full transition-all duration-300">Start Customizing</a>
      </div>
    `;
    subtotalText.innerText = "₹0";
    return;
  }

  let subtotal = 0;
  list.innerHTML = window.VDEcommerce.cart.map((item, index) => {
    subtotal += item.price * item.quantity;
    
    // Fallback image if custom cropped image is not provided
    const imgUrl = item.croppedImage || item.productImage || 'https://res.cloudinary.com/ukftgzjx/image/upload/v1784746242/vd_creations_static_assets/acrylic_frame.jpg';

    // Build frame style details
    let sizeDetails = item.size ? `Size: ${item.size} Inches` : '';
    let categoryDetails = item.category ? `[${item.category}]` : '';

    return `
      <div class="flex items-center space-x-4 bg-slate-900/50 border border-slate-800 p-3 rounded-lg relative group hover:border-[#D4AF37]/30 transition-all duration-300">
        <!-- Thumbnail wrapped in matching frame style preview -->
        <div class="w-16 h-16 rounded overflow-hidden bg-slate-950 flex-shrink-0 relative border border-slate-700">
          <img src="${imgUrl}" alt="${item.productName}" class="w-full h-full object-cover">
        </div>
        
        <!-- Details -->
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-white truncate">${item.productName}</h4>
          <p class="text-[10px] text-gray-400 mt-0.5">${categoryDetails} ${sizeDetails}</p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-sm font-semibold text-[#D4AF37]">₹${item.price}</span>
            <!-- Quantity Toggles -->
            <div class="flex items-center space-x-1.5 bg-slate-950 rounded border border-slate-800 px-1 py-0.5 scale-90">
              <button onclick="updateCartQty(${index}, -1)" class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white font-bold text-xs">-</button>
              <span class="text-xs text-white font-bold px-1">${item.quantity}</span>
              <button onclick="updateCartQty(${index}, 1)" class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white font-bold text-xs">+</button>
            </div>
          </div>
        </div>

        <!-- Delete button -->
        <button onclick="removeCartItem(${index})" class="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `;
  }).join('');

  subtotalText.innerText = `₹${subtotal.toLocaleString('en-IN')}`;
}

window.updateCartQty = function(index, change) {
  const item = window.VDEcommerce.cart[index];
  if (!item) return;
  
  item.quantity += change;
  if (item.quantity <= 0) {
    window.VDEcommerce.cart.splice(index, 1);
    showNotification("Item removed from cart", "info");
  } else {
    showNotification(`Quantity updated to ${item.quantity}`, "info");
  }
  
  localStorage.setItem('vd_cart', JSON.stringify(window.VDEcommerce.cart));
  updateCartBadge();
  renderCartItems();

  // If checkout page is active, trigger update there too
  if (window.updateCheckoutSummary) {
    window.updateCheckoutSummary();
  }
};

window.removeCartItem = function(index) {
  window.VDEcommerce.cart.splice(index, 1);
  localStorage.setItem('vd_cart', JSON.stringify(window.VDEcommerce.cart));
  showNotification("Item removed from cart", "info");
  updateCartBadge();
  renderCartItems();

  if (window.updateCheckoutSummary) {
    window.updateCheckoutSummary();
  }
};

// ----------------------------------------------------
// Wishlist Panel Creation & Management
// ----------------------------------------------------
function createWishlistPanelHTML() {
  if (document.getElementById('wishlist-panel-container')) return;

  const container = document.createElement('div');
  container.id = 'wishlist-panel-container';
  container.className = 'fixed inset-0 z-[100] pointer-events-none';
  container.innerHTML = `
    <!-- Overlay background -->
    <div id="wishlist-overlay" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300"></div>
    
    <!-- Sliding Panel -->
    <div id="wishlist-panel" class="absolute right-0 top-0 bottom-0 w-full sm:w-[450px] glass-panel text-white translate-x-full pointer-events-auto transition-transform duration-300 ease-out shadow-2xl flex flex-col">
      <!-- Drawer Header -->
      <div class="p-6 border-b border-slate-700/60 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 class="text-lg font-bold">Your Wishlist</h3>
        </div>
        <button id="close-wishlist-btn" class="p-1 hover:text-[#D4AF37] transition-colors focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Drawer Items List -->
      <div id="wishlist-items-list" class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Dynamic Content Injected here -->
      </div>
    </div>
  `;
  document.body.appendChild(container);
}

function openWishlistPanel() {
  const container = document.getElementById('wishlist-panel-container');
  const overlay = document.getElementById('wishlist-overlay');
  const panel = document.getElementById('wishlist-panel');
  
  if (container && overlay && panel) {
    container.classList.remove('pointer-events-none');
    overlay.classList.remove('pointer-events-none');
    overlay.classList.add('opacity-100');
    panel.classList.remove('translate-x-full');
    
    renderWishlistItems();
  }
}

function closeWishlistPanel() {
  const container = document.getElementById('wishlist-panel-container');
  const overlay = document.getElementById('wishlist-overlay');
  const panel = document.getElementById('wishlist-panel');
  
  if (container && overlay && panel) {
    container.classList.add('pointer-events-none');
    overlay.classList.add('pointer-events-none');
    overlay.classList.remove('opacity-100');
    panel.classList.add('translate-x-full');
  }
}

function renderWishlistItems() {
  const list = document.getElementById('wishlist-items-list');
  if (!list) return;

  if (window.VDEcommerce.wishlist.length === 0) {
    list.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
        <div class="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p class="text-gray-400 text-sm font-medium">Your Wishlist is empty.</p>
        <p class="text-xs text-gray-500 max-w-[200px]">Save items you love here to easily customize them later.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = window.VDEcommerce.wishlist.map((item, index) => {
    return `
      <div class="flex items-center space-x-4 bg-slate-900/50 border border-slate-800 p-3 rounded-lg relative group hover:border-[#D4AF37]/30 transition-all duration-300">
        <!-- Thumbnail -->
        <div class="w-16 h-16 rounded overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
          <img src="${item.productImage || 'https://res.cloudinary.com/ukftgzjx/image/upload/v1784747217/vd_creations_all_images/assets_acrylic_frame.jpg'}" alt="${item.productName}" class="w-full h-full object-cover">
        </div>
        
        <!-- Details -->
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-white truncate">${item.productName}</h4>
          <p class="text-[10px] text-gray-400 mt-0.5">${item.category}</p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-sm font-semibold text-[#D4AF37]">Starting at ₹${item.basePrice}</span>
            <a href="customize.html?product=${encodeURIComponent(item.productId)}" class="bg-[#D4AF37] hover:bg-[#F3CD46] text-[#0B1F3A] font-bold text-[10px] py-1 px-3 rounded transition-colors duration-200">
              Customize
            </a>
          </div>
        </div>

        <!-- Delete button -->
        <button onclick="removeWishlistItem(${index})" class="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `;
  }).join('');
}

window.toggleWishlistGlobal = function(product) {
  const index = window.VDEcommerce.wishlist.findIndex(item => item.productId === product.productId);
  if (index > -1) {
    window.VDEcommerce.wishlist.splice(index, 1);
    showNotification("Removed from wishlist", "info");
  } else {
    window.VDEcommerce.wishlist.push(product);
    showNotification("Saved to wishlist!", "success");
  }
  
  localStorage.setItem('vd_wishlist', JSON.stringify(window.VDEcommerce.wishlist));
  updateWishlistBadge();
  renderWishlistItems();
};

window.removeWishlistItem = function(index) {
  window.VDEcommerce.wishlist.splice(index, 1);
  localStorage.setItem('vd_wishlist', JSON.stringify(window.VDEcommerce.wishlist));
  showNotification("Removed from wishlist", "info");
  updateWishlistBadge();
  renderWishlistItems();
};

// ----------------------------------------------------
// UI Badges & Notifications Helper
// ----------------------------------------------------
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const totalCount = window.VDEcommerce.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = totalCount;
    if (totalCount > 0) {
      badge.classList.remove('scale-0');
      badge.classList.add('scale-100');
    } else {
      badge.classList.remove('scale-100');
      badge.classList.add('scale-0');
    }
  }
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-badge');
  if (badge) {
    const totalCount = window.VDEcommerce.wishlist.length;
    badge.innerText = totalCount;
    if (totalCount > 0) {
      badge.classList.remove('scale-0');
      badge.classList.add('scale-100');
    } else {
      badge.classList.remove('scale-100');
      badge.classList.add('scale-0');
    }
  }
}

window.showNotification = function(message, type = 'success') {
  // Create toast list container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-20 right-6 z-[110] flex flex-col space-y-3 pointer-events-none max-w-sm w-full';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `p-4 rounded-lg shadow-2xl flex items-center space-x-3 pointer-events-auto transform translate-x-12 opacity-0 transition-all duration-300 border ${
    type === 'success' ? 'bg-[#0B1F3A] border-green-500 text-white' : 
    type === 'error' ? 'bg-red-950 border-red-500 text-white' :
    'bg-[#0B1F3A] border-slate-700 text-white'
  }`;

  const icon = type === 'success' ? `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ` : type === 'error' ? `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ` : `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#D4AF37] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `;

  toast.innerHTML = `
    ${icon}
    <p class="text-xs font-semibold flex-1">${message}</p>
    <button class="text-gray-400 hover:text-white focus:outline-none" onclick="this.parentElement.remove()">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `;

  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-12', 'opacity-0');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-x-12', 'opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
};

window.addItemToCart = function(product, quantity = 1, size = null, croppedImage = null, customization = {}) {
  const uploadedPhotos = product.uploadedPhotos || (customization && customization.uploadedPhotos) || [];

  // Check if item already exists with exact same configurations (size and product ID)
  const existingIndex = window.VDEcommerce.cart.findIndex(
    item => item.productId === product.productId && item.size === size
  );

  if (existingIndex > -1) {
    window.VDEcommerce.cart[existingIndex].quantity += quantity;
    if (croppedImage) {
      window.VDEcommerce.cart[existingIndex].croppedImage = croppedImage;
    }
    if (uploadedPhotos.length > 0) {
      window.VDEcommerce.cart[existingIndex].uploadedPhotos = uploadedPhotos;
    }
  } else {
    window.VDEcommerce.cart.push({
      productId: product.productId,
      productName: product.productName,
      category: product.category,
      basePrice: product.basePrice,
      price: product.price || product.basePrice,
      productImage: product.productImage,
      croppedImage: croppedImage,
      uploadedPhotos: uploadedPhotos,
      size: size,
      quantity: quantity,
      customization: customization
    });
  }

  localStorage.setItem('vd_cart', JSON.stringify(window.VDEcommerce.cart));
  updateCartBadge();
  showNotification(`"${product.productName}" added to cart!`, 'success');
  openCartDrawer();
};
