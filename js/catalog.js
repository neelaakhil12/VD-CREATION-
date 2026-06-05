// catalog.js - Products listing, filter, search and catalog renderer for VD CREATION services page

const PRODUCTS_DATABASE = [
  // Acrylic Frames
  {
    productId: "acrylic-wall-photo",
    productName: "Acrylic Wall Photo Frame",
    category: "acrylic",
    categoryLabel: "Acrylic Frames",
    basePrice: 399,
    rating: 4.9,
    reviews: 142,
    productImage: "assets/acrylic_frame.png",
    description: "Frameless, premium high-gloss printing on diamond-polished acrylic sheets. Floating wall mount system.",
    sizes: ["6x9", "8x12", "10x15", "12x18"],
    features: ["Diamond Polished Edges", "Moisture Resistant", "Floating Wall Mount", "UV Resistant Printing"]
  },
  {
    productId: "acrylic-fridge-magnets",
    productName: "Acrylic Photo Fridge Magnets (Set of 3)",
    category: "acrylic",
    categoryLabel: "Acrylic Frames",
    basePrice: 199,
    rating: 4.8,
    reviews: 84,
    productImage: "assets/gift_items.png",
    description: "Cute and glossy customized mini acrylic magnets to decorate your refrigerator with memories.",
    sizes: ["3x3", "4x4"],
    features: ["Strong Rubber Magnet", "Crystal Clear Acrylic", "Pack of 3"]
  },
  {
    productId: "aluminum-framed-acrylic",
    productName: "Aluminum Framed Acrylic Photo Frame",
    category: "acrylic",
    categoryLabel: "Acrylic Frames",
    basePrice: 799,
    rating: 4.9,
    reviews: 58,
    productImage: "assets/acrylic_frame.png",
    description: "Glossy acrylic photo mounted inside a premium brushed aluminum border frame. Modern and sleek style.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["Anodized Aluminum Frame", "Acrylic Print Protection", "Heavy-duty hangers"]
  },
  {
    productId: "acrylic-mini-gallery",
    productName: "Acrylic Photo Mini Wall Gallery",
    category: "acrylic",
    categoryLabel: "Acrylic Frames",
    basePrice: 999,
    rating: 5.0,
    reviews: 31,
    productImage: "assets/hero_banner.png",
    description: "Set of 5 mini acrylic frames to design an aesthetic gallery collage wall in your hallway.",
    sizes: ["4x6 (x5)", "6x6 (x5)"],
    features: ["Includes 5 Frame panels", "Aesthetic Collage Layout", "Self-adhesive installation tape"]
  },
  {
    productId: "acrylic-photo-stand",
    productName: "Acrylic Photo Desktop Stand",
    category: "acrylic",
    categoryLabel: "Acrylic Frames",
    basePrice: 299,
    rating: 4.7,
    reviews: 79,
    productImage: "assets/gift_items.png",
    description: "Beautiful vertical acrylic display block with a polished heavy wooden base for office desks and nightstands.",
    sizes: ["6x9", "8x12"],
    features: ["Thick Acrylic Block", "Solid Pine Wood Base", "Perfect Desktop Display"]
  },

  // Zink Mate Frames
  {
    productId: "zink-mate-classic",
    productName: "Zink Mate Classic Photo Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 449,
    rating: 4.8,
    reviews: 110,
    productImage: "assets/matte_frame.png",
    description: "Luxury matte finish border frame protecting your photo with anti-reflective plexiglass. Clean modern look.",
    sizes: ["6x9", "8x12", "10x15", "12x18", "16x20", "16x24", "18x24", "20x30", "24x36", "24x48"],
    features: ["Fingerprint-resistant Matte", "Deep Dark Border Style", "Includes Mount Border card"]
  },
  {
    productId: "zink-mate-collage",
    productName: "Zink Mate Multi-Photo Collage Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 699,
    rating: 4.9,
    reviews: 46,
    productImage: "assets/matte_frame.png",
    description: "Custom layout matte frame supporting 3 to 9 photos inside a premium dark grid structure.",
    sizes: ["12x18", "16x20", "18x24", "20x30", "24x36"],
    features: ["Flexible Grid Layouts", "Solid Backboard Panel", "Pre-installed Hanging Hardware"]
  },

  // Normal Photo Frames
  {
    productId: "classic-wood-normal",
    productName: "Classic Normal Photo Frame (Wood Finish)",
    category: "classic",
    categoryLabel: "Normal Frames",
    basePrice: 299,
    rating: 4.6,
    reviews: 135,
    productImage: "assets/hero_banner.png",
    description: "Traditional bordered photo frame with synthetic wood grains and glass protection. Elegant and warm.",
    sizes: ["6x9", "8x12", "10x15", "12x18", "16x20", "16x24", "18x24", "20x30", "24x36", "24x48"],
    features: ["Textured Synthetic Wood", "Double Beveled Borders", "Sturdy Backstand and Hang brackets"]
  },

  // LED Frames
  {
    productId: "led-table-frame",
    productName: "Glowing LED Table Photo Frame",
    category: "led",
    categoryLabel: "LED Frames",
    basePrice: 699,
    rating: 4.9,
    reviews: 210,
    productImage: "assets/led_frame.png",
    description: "Warm glowing LED backlit table stand frame. Renders an emotional warmth to your family portraits.",
    sizes: ["6x9", "8x12", "10x15", "12x18"],
    features: ["Warm Yellow Micro LEDs", "Handcrafted Pinewood Casing", "1.5m USB Cable with toggle switch"]
  },
  {
    productId: "led-heart-wall-frame",
    productName: "LED Glowing Heart-shape Wall Frame",
    category: "led",
    categoryLabel: "LED Frames",
    basePrice: 1299,
    rating: 4.8,
    reviews: 64,
    productImage: "assets/led_frame.png",
    description: "Beautiful heart shaped glowing border frame. The ultimate romantic anniversary or birthday surprise gift.",
    sizes: ["12x12", "16x16"],
    features: ["Romantic Heart Silhouette", "Warm & Cool Dual Light Mode", "Easy Wall-hook setup"]
  },

  // Personalized Products
  {
    productId: "personalized-keychain",
    productName: "Personalized Acrylic Photo Keychain",
    category: "gifts",
    categoryLabel: "Personalized Gifts",
    basePrice: 99,
    rating: 4.7,
    reviews: 280,
    productImage: "assets/gift_items.png",
    description: "Keep your favorite person close. High density scratch-free double-sided customized acrylic keychain.",
    sizes: ["2x2", "2.5x2.5"],
    features: ["Double sided printing", "Sturdy steel ring loop", "Scratch-resistant clear coat"]
  },
  {
    productId: "luggage-tags",
    productName: "Customized Photo Luggage Tags",
    category: "gifts",
    categoryLabel: "Personalized Gifts",
    basePrice: 149,
    rating: 4.5,
    reviews: 51,
    productImage: "assets/gift_items.png",
    description: "Spot your bags instantly. Waterproof polymer tags printed with your photo and emergency contact details.",
    sizes: ["3.5x2"],
    features: ["Flexy loop strap included", "Writable backing details", "Durable water-resistant coating"]
  },
  {
    productId: "mini-wall-galleries",
    productName: "Desktop Mini Frame Stands (Set of 3)",
    category: "gifts",
    categoryLabel: "Personalized Gifts",
    basePrice: 199,
    rating: 4.8,
    reviews: 90,
    productImage: "assets/gift_items.png",
    description: "Three cute individual mini frames standing together. Ideal to showcase a baby growth tracker or trips.",
    sizes: ["3x4 (Set of 3)"],
    features: ["Sturdy tabletop kickstand", "Compact memory blocks", "Set of 3"]
  }
];

// Active state values
let currentCategoryFilter = 'all';
let currentSearchQuery = '';
let currentSortOrder = 'default';

document.addEventListener('DOMContentLoaded', () => {
  // Parse search queries & tab categories from URLs
  parseURLParams();
  
  // Render Category filter buttons
  setupFilters();
  
  // Render initial catalog products
  renderCatalog();
  
  // Bind select list sort events
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.value = currentSortOrder;
    sortSelect.addEventListener('change', (e) => {
      currentSortOrder = e.target.value;
      renderCatalog();
    });
  }

  // Bind catalog search bar events
  const catalogSearch = document.getElementById('catalog-search-bar');
  if (catalogSearch) {
    catalogSearch.value = currentSearchQuery;
    catalogSearch.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderCatalog();
    });
  }
});

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  
  const categoryParam = params.get('category') || params.get('tab');
  if (categoryParam) {
    currentCategoryFilter = categoryParam.toLowerCase();
  }
  
  const searchParam = params.get('search');
  if (searchParam) {
    currentSearchQuery = searchParam.toLowerCase().trim();
  }
}

function setupFilters() {
  const tabsContainer = document.getElementById('category-tabs-container');
  if (!tabsContainer) return;

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'acrylic', label: 'Acrylic Frames' },
    { id: 'matte', label: 'Zink Mate' },
    { id: 'classic', label: 'Normal Frames' },
    { id: 'led', label: 'LED Frames' },
    { id: 'gifts', label: 'Personalized Gifts' }
  ];

  tabsContainer.innerHTML = categories.map(cat => {
    const isActive = cat.id === currentCategoryFilter;
    return `
      <button onclick="filterCategory('${cat.id}')" id="tab-btn-${cat.id}" class="py-2.5 px-6 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
        isActive 
          ? 'bg-[#D4AF37] text-[#0B1F3A] shadow-lg shadow-yellow-500/10' 
          : 'bg-[#13294B]/50 border border-slate-800 text-gray-400 hover:text-white hover:border-slate-700'
      }">
        ${cat.label}
      </button>
    `;
  }).join('');
}

window.filterCategory = function(catId) {
  // Update state
  currentCategoryFilter = catId;
  
  // Re-render tabs styles
  const allTabs = document.querySelectorAll('[id^="tab-btn-"]');
  allTabs.forEach(tab => {
    tab.className = "py-2.5 px-6 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 bg-[#13294B]/50 border border-slate-800 text-gray-400 hover:text-white hover:border-slate-700";
  });

  const activeTab = document.getElementById(`tab-btn-${catId}`);
  if (activeTab) {
    activeTab.className = "py-2.5 px-6 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 bg-[#D4AF37] text-[#0B1F3A] shadow-lg shadow-yellow-500/10";
  }

  // Render matching products
  renderCatalog();
};

function renderCatalog() {
  const grid = document.getElementById('catalog-products-grid');
  const countText = document.getElementById('catalog-results-count');
  if (!grid) return;

  // Filter logic
  let filtered = PRODUCTS_DATABASE.filter(item => {
    const matchesCategory = currentCategoryFilter === 'all' || item.category === currentCategoryFilter;
    const matchesSearch = !currentSearchQuery || 
      item.productName.toLowerCase().includes(currentSearchQuery) || 
      item.description.toLowerCase().includes(currentSearchQuery) ||
      item.categoryLabel.toLowerCase().includes(currentSearchQuery);
    
    return matchesCategory && matchesSearch;
  });

  // Sorting logic
  if (currentSortOrder === 'price-low') {
    filtered.sort((a, b) => a.basePrice - b.basePrice);
  } else if (currentSortOrder === 'price-high') {
    filtered.sort((a, b) => b.basePrice - a.basePrice);
  } else if (currentSortOrder === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // Render count label
  if (countText) {
    countText.innerText = `${filtered.length} products found`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-20 text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-gray-500 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 class="text-sm font-bold">No Products Found</h3>
        <p class="text-xs text-gray-500 max-w-xs mx-auto">Try clearing your filters or testing other search keywords.</p>
        <button onclick="resetCatalogFilters()" class="inline-block bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-semibold text-xs py-2 px-6 rounded-full hover:bg-[#D4AF37] hover:text-[#0B1F3A] transition-all">Clear Search Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((item, index) => {
    // Check if item is saved in wishlist
    const isInWishlist = window.VDEcommerce.wishlist.some(wish => wish.productId === item.productId);
    
    return `
      <div class="bg-navy-900/60 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl hover:shadow-yellow-500/5 group hover:border-[#D4AF37]/20 transition-all duration-300 flex flex-col justify-between" data-aos="fade-up" data-aos-delay="${(index % 4) * 100}">
        <!-- Image block -->
        <div class="h-56 overflow-hidden relative bg-slate-950/40">
          <img src="${item.productImage}" alt="${item.productName}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          
          <!-- Category Tag -->
          <span class="absolute top-4 left-4 bg-navy-950/80 backdrop-blur-md text-[#D4AF37] text-[9px] font-bold py-1 px-3 rounded-full uppercase tracking-wider border border-slate-700/50">${item.categoryLabel}</span>
          
          <!-- Wishlist Action -->
          <button onclick="toggleWishlistFromCatalog('${item.productId}')" class="wishlist-action-btn absolute top-4 right-4 w-9 h-9 rounded-full bg-navy-950/80 backdrop-blur-md text-gray-400 hover:text-red-500 flex items-center justify-center border border-slate-700/50 transition-colors focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <!-- Text details -->
        <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center space-x-1.5 text-[#D4AF37] text-[10px] font-bold">
              <i class="fas fa-star"></i>
              <span>${item.rating}</span>
              <span class="text-gray-500 font-medium">(${item.reviews} reviews)</span>
            </div>
            <h3 class="text-sm font-bold text-white leading-snug group-hover:text-[#D4AF37] transition-colors">${item.productName}</h3>
            <p class="text-[11px] text-gray-400 leading-relaxed">${item.description}</p>
          </div>

          <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span class="text-[9px] text-gray-500 uppercase block">Starting Price</span>
              <span class="text-base font-bold text-[#D4AF37]">₹${item.basePrice}</span>
            </div>
            <a href="customize.html?product=${item.productId}" class="bg-[#D4AF37] hover:bg-[#F3CD46] text-[#0B1F3A] font-bold text-xs py-2.5 px-4 rounded-lg shadow transition-colors flex items-center space-x-1.5">
              <span>Customize</span>
              <i class="fas fa-magic text-[10px]"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.toggleWishlistFromCatalog = function(prodId) {
  const prod = PRODUCTS_DATABASE.find(item => item.productId === prodId);
  if (prod) {
    window.toggleWishlistGlobal(prod);
    renderCatalog();
  }
};

window.resetCatalogFilters = function() {
  currentCategoryFilter = 'all';
  currentSearchQuery = '';
  currentSortOrder = 'default';
  
  const searchInput = document.getElementById('catalog-search-bar');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'default';

  setupFilters();
  renderCatalog();
};
