// catalog.js - Products listing, filter, search and catalog renderer for VD CREATION services page

let PRODUCTS_DATABASE = [
  // Acrylic Frames
  {
    productId: "acrylic-couple-frame",
    productName: "Premium Couple Acrylic Photo Frame",
    category: "acrylic",
    categoryLabel: "Acrylic Frames",
    basePrice: 399,
    rating: 4.8,
    reviews: 120,
    productImage: "https://res.cloudinary.com/ukftgzjx/image/upload/v1784746240/vd_creations_static_assets/acrylic_couple.png",
    emptyImage: "https://res.cloudinary.com/ukftgzjx/image/upload/v1784746241/vd_creations_static_assets/acrylic_couple_empty.png",
    cropLeft: 9.21,
    cropTop: 5.59,
    cropWidth: 80.11,
    cropHeight: 87.71,
    description: "Elegant couples customized photo frame mounted on high-gloss diamond-polished acrylic sheets. Modern and clean style.",
    sizes: ["6x9", "8x12", "10x15", "12x18"],
    features: ["Diamond Polished Edges", "High-Gloss Crystal Printing", "Couples Floating Mount System"]
  },

  // Normal Photo Frames
  {
    productId: "black-wood-normal",
    productName: "Premium Black Wood Normal Photo Frame",
    category: "classic",
    categoryLabel: "Normal Frames",
    basePrice: 299,
    rating: 4.8,
    reviews: 95,
    productImage: "https://res.cloudinary.com/ukftgzjx/image/upload/v1784746249/vd_creations_static_assets/normal_black_wood.png",
    emptyImage: "https://res.cloudinary.com/ukftgzjx/image/upload/v1784746250/vd_creations_static_assets/normal_black_wood_empty.png",
    cropLeft: 21.12,
    cropTop: 24.82,
    cropWidth: 57.66,
    cropHeight: 57.35,
    description: "Elegant bordered photo frame with synthetic black wood grains and glass protection. Premium and modern style.",
    sizes: ["6x9", "8x12", "10x15", "12x18", "16x20", "16x24", "18x24", "20x30", "24x36", "24x48"],
    features: ["Premium Synthetic Black Wood", "Clear Glass Protection", "Pre-installed Wall Hanging Hooks"]
  },
  {
    productId: "light-wood-normal",
    productName: "Premium Light Wood Normal Photo Frame",
    category: "classic",
    categoryLabel: "Normal Frames",
    basePrice: 299,
    rating: 4.7,
    reviews: 110,
    productImage: "https://res.cloudinary.com/ukftgzjx/image/upload/v1784746251/vd_creations_static_assets/normal_wood_light.png",
    emptyImage: "https://res.cloudinary.com/ukftgzjx/image/upload/v1784746252/vd_creations_static_assets/normal_wood_light_empty.png",
    cropLeft: 21.05,
    cropTop: 11.88,
    cropWidth: 50.00,
    cropHeight: 71.85,
    description: "Elegant bordered photo frame with synthetic light wood grains and glass protection. Premium and warm modern style.",
    sizes: ["6x9", "8x12", "10x15", "12x18", "16x20", "16x24", "18x24", "20x30", "24x36", "24x48"],
    features: ["Premium Synthetic Light Wood", "Clear Glass Protection", "Pre-installed Wall Hanging Hooks"]
  },





  // ── Normal Frames: Black Wood Collage Designs ─────────────────────────────────
  {
    productId: "couple-bw-collage-frame",
    productName: "Couple B&W Story Collage Frame",
    category: "classic",
    categoryLabel: "Normal Frames",
    basePrice: 499,
    rating: 4.9,
    reviews: 86,
    slots: 4,
    productImage: "image copy 7.png",
    description: "A stunning black & white story collage frame featuring multiple couple photos fading into a central portrait cutout — perfect for anniversaries and love gifts.",
    sizes: ["6x9", "8x12", "10x15", "12x18"],
    features: ["B&W + Color Mixed Collage", "Custom Name & Date Text", "White Wood Frame Finish"]
  },
  {
    productId: "bride-solo-collage-frame",
    productName: "Bride Solo Strip Collage Frame",
    category: "classic",
    categoryLabel: "Normal Frames",
    basePrice: 549,
    rating: 4.9,
    reviews: 67,
    slots: 4,
    productImage: "image copy 6.png",
    description: "A glamorous bridal frame with four vertical strip photos fading into a full-color portrait below — perfect for bride gifting or bridal shower memento.",
    sizes: ["6x9", "8x12", "10x15", "12x18"],
    features: ["4-Strip to Portrait Design", "Fade-in Effect", "Custom Name Text", "Black Wood Frame"]
  },
  {
    productId: "baby-minimalist-stats-frame",
    productName: "Minimalist Baby Birth Stats Frame",
    category: "classic",
    categoryLabel: "Normal Frames",
    basePrice: 549,
    rating: 4.9,
    reviews: 108,
    slots: 3,
    productImage: "image copy 13.png",
    description: "A clean, minimal, and elegant baby birth announcement frame with icons for city, date, time, weight and height — paired with three beautiful newborn photos. White wood frame.",
    sizes: ["6x9", "8x12", "10x15", "12x18"],
    features: ["Minimalist Icon Stats Layout", "3-Photo Strip Column", "Custom Baby Name & Details", "White Wood Frame"]
  },
  {
    productId: "baby-botanical-single-frame",
    productName: "Botanical Baby Announcement Frame",
    category: "classic",
    categoryLabel: "Normal Frames",
    basePrice: 499,
    rating: 4.8,
    reviews: 93,
    slots: 3,
    productImage: "image copy 16.png",
    description: "A soft botanical-styled newborn frame with baby name, birth date, time, weight, height and hospital details. Elegant and timeless for nursery walls. Natural wood frame.",
    sizes: ["6x9", "8x12", "10x15", "12x18"],
    features: ["Botanical Leaf Accents", "Birth Stats & Hospital Name", "3-Photo Column", "Natural Wood Frame Finish"]
  },
  {
    productId: "baby-polaroid-announcement-frame",
    productName: "Baby Polaroid Announcement Frame",
    category: "classic",
    categoryLabel: "Normal Frames",
    basePrice: 449,
    rating: 4.8,
    reviews: 74,
    slots: 3,
    productImage: "image copy 23.png",
    description: "A fresh and modern baby announcement frame styled like a polaroid with watercolour botanical accents, baby name, date, time, weight and height details. Natural wood frame.",
    sizes: ["6x9", "8x12", "10x15"],
    features: ["Polaroid-Style Photo Layout", "Watercolour Botanical Design", "Custom Baby Name & Stats", "Natural Wood Frame"]
  },

  // ── Zink Mate Frames: Dark Matte Collage Designs ──────────────────────────────
  {
    productId: "couple-days-of-love-frame",
    productName: "Days of Love Cinematic Couple Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 549,
    rating: 4.8,
    reviews: 73,
    slots: 2,
    productImage: "image copy 9.png",
    description: "Cinematic dual-exposure design merging couple portraits into a breathtaking landscape backdrop. A truly movie-poster style love frame. Premium black matte finish.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["Dual Exposure Cinematic Effect", "Custom Text Overlay", "Premium Black Matte Frame"]
  },
  {
    productId: "couple-together-forever-collage",
    productName: "Together Forever Couple Collage Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 599,
    rating: 4.9,
    reviews: 112,
    slots: 4,
    productImage: "image copy 10.png",
    description: "A bold multi-photo collage with a vibrant central cutout couple — capturing every beautiful moment together in one dark matte frame. Black textured finish.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["Multi-Photo Grid Collage", "Full Color Cutout Portrait", "Custom Quote & Name", "Black Textured Matte Frame"]
  },
  {
    productId: "couple-heart-collage-frame",
    productName: "Heart-Shape Couple Collage Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 549,
    rating: 4.8,
    reviews: 95,
    slots: 4,
    productImage: "image copy 11.png",
    description: "A romantic heart-shaped photo collage arrangement with custom names, date and a love quote on a dark background — ideal for anniversaries and Valentine's Day.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["Heart-shape Photo Arrangement", "Custom Names & Date", "Dark Romantic Background", "Black Matte Frame"]
  },
  {
    productId: "wedding-bw-grid-frame",
    productName: "Wedding B&W Grid Collage Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 649,
    rating: 4.9,
    reviews: 78,
    slots: 5,
    productImage: "image copy 17.png",
    description: "A beautiful black-and-white grid collage frame with a central color-pop couple portrait for wedding day memories. Includes couple name and wedding date. Dark matte frame.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["B&W Grid + Color Center Portrait", "Custom Name & Wedding Date", "Black Matte Frame", "Premium Zink Print Quality"]
  },
  {
    productId: "wedding-story-collage-frame",
    productName: "Wedding Story Collage Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 699,
    rating: 4.9,
    reviews: 54,
    slots: 4,
    productImage: "image copy 18.png",
    description: "A warm-toned wedding story frame with multiple couple portraits in a stacked grid layout — capturing the romance and elegance of your big day. Black matte frame.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["Multi-Photo Story Grid", "Custom Name & Wedding Date", "Wave-style Photo Cutout", "Black Matte Frame"]
  },
  {
    productId: "wedding-honeycomb-calendar-frame",
    productName: "Wedding Style Honeycomb Calendar Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 799,
    rating: 4.8,
    reviews: 42,
    slots: 6,
    productImage: "image copy 15.png",
    description: "A luxurious dark-background wedding frame with honeycomb hexagonal photo layout, embossed calendar, and custom couple names — the perfect wedding gift. Black matte frame.",
    sizes: ["10x15", "12x18", "16x20", "18x24"],
    features: ["Hexagonal Honeycomb Layout", "Calendar with Wedding Date", "Custom Names & Quote", "Gold Accent Typography"]
  },
  {
    productId: "birthday-calendar-collage-frame",
    productName: "Happy Birthday Calendar Collage Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 499,
    rating: 4.9,
    reviews: 138,
    slots: 3,
    productImage: "image copy 19.png",
    description: "A vibrant birthday frame combining a large portrait photo with a birthday-month calendar and smaller photo strips. A memorable personalized birthday gift. Black matte frame.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["Birthday Month Calendar", "Photo Strips Sidebar", "Custom Name & Message", "Dark Matte Background Frame"]
  },
  {
    productId: "birthday-strip-calendar-frame",
    productName: "Birthday Photo Strip Calendar Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 499,
    rating: 4.8,
    reviews: 96,
    slots: 3,
    productImage: "image copy 21.png",
    description: "An elegant birthday frame with vertical photo strips and a birthday-month calendar with a highlighted birthday date. Black matte frame with botanical style.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["Vertical Photo Strips Layout", "Month Calendar with Highlight", "Custom Name Lettering", "Black Matte Frame"]
  },
  {
    productId: "birthday-bw-collage-frame",
    productName: "Happy Birthday B&W Collage Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 449,
    rating: 4.8,
    reviews: 72,
    slots: 4,
    productImage: "image copy 24.png",
    description: "A clean and elegant birthday frame with three top black-and-white portraits fading into a central vibrant color photo — with custom birthday text. Black matte frame.",
    sizes: ["8x12", "10x15", "12x18"],
    features: ["B&W to Color Fade Effect", "Triple Photo Panel Top", "Custom Birthday Name", "Black Matte Frame"]
  },
  {
    productId: "birthday-floral-triple-frame",
    productName: "Birthday Floral Triple Photo Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 549,
    rating: 4.9,
    reviews: 61,
    slots: 3,
    productImage: "image copy 27.png",
    description: "A stunning birthday frame with triple photo view set against a floral purple backdrop — radiating elegance with custom name and date text. Dark matte frame.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["Triple Photo Composition", "Floral Bloom Background", "Custom Name & Date", "Premium Black Matte Frame"]
  },
  {
    productId: "baby-stats-infographic-frame",
    productName: "Baby Birth Stats Infographic Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 599,
    rating: 5.0,
    reviews: 164,
    slots: 3,
    productImage: "image copy 12.png",
    description: "A colorful and fun baby birth announcement frame showcasing birth date, time, weight, blood group, hospital, and parent photos — a cherished keepsake. Black matte frame.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["Birth Stats Icons Layout", "Baby & Parents Photos", "Custom Name & Details", "Black Matte Frame"]
  },
  {
    productId: "baby-calendar-collage-frame",
    productName: "Baby Photo Calendar Collage Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 649,
    rating: 4.9,
    reviews: 87,
    slots: 6,
    productImage: "image copy 14.png",
    description: "A heartwarming frame featuring six adorable baby photos in a grid with an arched center display, birth-month calendar, and custom name. Black matte frame.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["6-Photo Baby Grid Collage", "Birth Month Calendar", "Arched Center Photo", "Custom Name & Parent Message"]
  },
  {
    productId: "solo-cutout-collage-frame",
    productName: "Solo Cutout Multi-Photo Collage Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 499,
    rating: 4.8,
    reviews: 58,
    slots: 4,
    productImage: "image copy 20.png",
    description: "A striking black-and-white photo collage with a central cutout portrait — great for tributes, farewell gifts, and personal milestone celebrations. Dark matte frame.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["B&W Multi-Grid Collage", "Central Cutout Portrait", "Custom Name & Quote", "Black Matte Frame"]
  },
  {
    productId: "solo-rounded-strip-frame",
    productName: "Solo Rounded Strip Photo Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 499,
    rating: 4.8,
    reviews: 49,
    slots: 4,
    productImage: "image copy 22.png",
    description: "An elegant solo portrait frame with four rounded-edge photo strips alongside a large cutout portrait — with floral botanical accents and custom name. Dark matte frame.",
    sizes: ["8x12", "10x15", "12x18"],
    features: ["Rounded Photo Strips", "Botanical Leaf Accents", "Large Portrait Cutout", "Black Matte Frame"]
  },
  {
    productId: "anniversary-number-collage-frame",
    productName: "Anniversary Number Collage Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 699,
    rating: 5.0,
    reviews: 82,
    slots: 4,
    productImage: "image copy 26.png",
    description: "A unique anniversary frame where your milestone number is filled with couple photos — set against a B&W portrait backdrop. Customize any anniversary year. Dark matte frame.",
    sizes: ["8x12", "10x15", "12x18", "16x20"],
    features: ["Number-Shaped Photo Collage", "B&W Background Portrait", "Custom Year & Anniversary Text", "Black Matte Frame"]
  },
  {
    productId: "family-watercolor-merge-frame",
    productName: "Family Watercolour Merge Art Frame",
    category: "matte",
    categoryLabel: "Zink Mate Frames",
    basePrice: 799,
    rating: 5.0,
    reviews: 47,
    slots: 3,
    productImage: "image copy 25.png",
    description: "A stunning watercolour art-style frame that merges multiple family photos into a single painterly portrait — a museum-worthy keepsake for your home. Black matte frame.",
    sizes: ["10x15", "12x18", "16x20", "18x24", "20x30"],
    features: ["Watercolour Art Effect", "Multi-Photo Merge", "Custom Quote Text", "Premium Black Matte Frame"]
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

  // Render homepage dynamic collections grid if present
  renderHomepageCollections();
  
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

let DYNAMIC_CATEGORIES = [
  { id: 'acrylic', label: 'Acrylic Frames' },
  { id: 'matte', label: 'Zink Mate Frames' },
  { id: 'classic', label: 'Normal Frames' },
  { id: 'led', label: 'LED Frames' }
];

function setupFilters() {
  const tabsContainer = document.getElementById('category-tabs-container');
  if (!tabsContainer) return;

  const categories = [
    { id: 'all', label: 'All Products' },
    ...(window.DYNAMIC_CATEGORIES && window.DYNAMIC_CATEGORIES.length > 0 ? window.DYNAMIC_CATEGORIES : DYNAMIC_CATEGORIES)
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
            <button onclick="openCustomizerForProduct('${item.productId}')" class="bg-[#D4AF37] hover:bg-[#F3CD46] text-[#0B1F3A] font-bold text-xs py-2.5 px-4 rounded-lg shadow transition-colors flex items-center space-x-1.5 cursor-pointer">
              <span>Customize</span>
              <i class="fas fa-magic text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.openCustomizerForProduct = function(productId) {
  const prod = typeof PRODUCTS_DATABASE !== 'undefined' ? PRODUCTS_DATABASE.find(item => item.productId === productId) : null;
  if (prod) {
    try {
      sessionStorage.setItem('vd_selected_product', JSON.stringify(prod));
    } catch (e) {}
  }
  window.location.href = `customize.html?product=${productId}`;
};

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

// ====================================================================
// VD Database: Dynamic Supabase Catalog Sync Logic
// ====================================================================
async function loadSupabaseProducts() {
  if (typeof window.supabase === 'undefined') {
    return;
  }

  const SUPABASE_URL = 'https://wctyhhhvksfjqsudqwrm.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjdHloaGh2a3NmanFzdWRxd3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNjc0NDUsImV4cCI6MjA5OTg0MzQ0NX0.hsOQs0V7dSG6SoSEWrH0Gv3bcMx7Voc0SzzwVmwUMJ8';
  
  try {
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Fetch dynamic categories list
    const { data: dbCategories } = await supabaseClient
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    let syncedCategories = [];
    if (dbCategories && dbCategories.length > 0) {
      syncedCategories = dbCategories.map(c => ({
        id: c.id,
        label: c.name || c.id
      }));
    }

    // Fetch products
    const { data: dbProducts, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (dbProducts && dbProducts.length > 0) {
      const mapped = dbProducts.map(p => ({
        productId: p.id,
        productName: p.name,
        category: p.category,
        categoryLabel: p.category_label || p.category,
        basePrice: parseFloat(p.base_price) || 299,
        rating: parseFloat(p.rating) || 5.0,
        reviews: parseInt(p.reviews) || 0,
        productImage: p.product_image,
        emptyImage: p.empty_image || null,
        cropLeft: parseFloat(p.crop_left) || 0,
        cropTop: parseFloat(p.crop_top) || 0,
        cropWidth: parseFloat(p.crop_width) || 100,
        cropHeight: parseFloat(p.crop_height) || 100,
        description: p.description || '',
        sizes: (() => {
          let raw = p.sizes;
          if (typeof raw === 'string') {
            try { raw = JSON.parse(raw); } catch (e) { raw = []; }
          }
          if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            return Object.keys(raw);
          }
          return Array.isArray(raw) ? raw : [];
        })(),
        sizePrices: (() => {
          let raw = p.sizes;
          if (typeof raw === 'string') {
            try { raw = JSON.parse(raw); } catch (e) { raw = null; }
          }
          if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            return raw;
          }
          return null;
        })(),
        slots: p.slots ? (typeof p.slots === 'number' ? p.slots : (parseInt(p.slots) || 1)) : 1,
        features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]')
      }));

      // Override fallback catalog
      PRODUCTS_DATABASE = mapped;
      
      // Also include any categories present on products that aren't in categories table
      mapped.forEach(p => {
        if (p.category && !syncedCategories.some(c => c.id === p.category)) {
          syncedCategories.push({ id: p.category, label: p.categoryLabel || p.category });
        }
      });
      
      if (syncedCategories.length > 0) {
        DYNAMIC_CATEGORIES = syncedCategories;
        window.DYNAMIC_CATEGORIES = syncedCategories;
      }

      console.log(`[VD Database] Synced ${mapped.length} products and ${syncedCategories.length} categories from Supabase.`);
      
      // Trigger category tab & catalog renderers on active catalog view
      if (typeof setupFilters === 'function') {
        setupFilters();
      }
      if (typeof renderCatalog === 'function') {
        renderCatalog();
      }
      if (typeof renderHomepageCollections === 'function') {
        renderHomepageCollections();
      }
      
      // Trigger customizer catalog load on customizer views
      if (typeof window.syncCustomizerWithProduct === 'function') {
        window.syncCustomizerWithProduct();
      } else if (typeof initCustomizer === 'function') {
        const params = new URLSearchParams(window.location.search);
        const prodId = params.get('product') || 'acrylic-wall-photo';
        currentProduct = PRODUCTS_DATABASE.find(item => item.productId === prodId) || PRODUCTS_DATABASE[0];
        if (currentProduct) {
          if (typeof populateSizesDropdown === 'function') populateSizesDropdown();
          if (typeof updateUIOptions === 'function') updateUIOptions();
          if (typeof calculatePrice === 'function') calculatePrice();
          if (typeof loadFallbackProductImage === 'function') loadFallbackProductImage();
        }
      }
    }
  } catch (err) {
    console.error("[VD Database] Sync failed. Falling back to local data.", err);
  }
}

// Global function to render homepage frame collection cards
window.renderHomepageCollections = function() {
  const container = document.getElementById('homepage-collections-grid');
  if (!container) return;

  const categoriesMap = [
    { id: 'acrylic', title: 'Acrylic Wall Photos', badge: 'Glossy Finish', link: 'customize.html?category=acrylic', defaultImg: 'image copy 9.png', desc: 'Frameless crystal-clear acrylic printing. Diamond-polished edges providing a floating premium glass finish.', price: 399, sizes: ["6x9", "8x12", "10x15", "12x18"] },
    { id: 'matte', title: 'Zink Mate Frames', badge: 'Matte Finish', link: 'customize.html?category=matte', defaultImg: 'image copy 10.png', desc: 'Contemporary dark borders with smooth matte coating. Anti-glare and matches perfectly with modern home decors.', price: 449, sizes: ["8x12", "12x18", "18x24", "24x36"] },
    { id: 'classic', title: 'Normal Wood Frames', badge: 'Classic Finish', link: 'customize.html?category=classic', defaultImg: 'assets/normal_black_wood.png', desc: 'Framed photo prints with synthetic black/light wood grains & clear glass protection. Timeless design.', price: 299, sizes: ["6x9", "8x12", "10x15", "12x18"] },
    { id: 'led', title: 'Glowing LED Frames', badge: 'Glowing LED', link: 'customize.html?category=led', defaultImg: 'image copy 18.png', desc: 'Illuminated wooden frame designs. Soft, warm backlights casting a beautiful aura over family and couple portraits.', price: 699, sizes: ["6x9", "8x12", "10x15", "12x18"] }
  ];

  const html = categoriesMap.map((info, index) => {
    const catProduct = PRODUCTS_DATABASE.find(p => p.category === info.id);
    const img = (catProduct && catProduct.productImage) ? catProduct.productImage : info.defaultImg;
    const price = (catProduct && catProduct.basePrice) ? catProduct.basePrice : info.price;
    const sizes = (catProduct && catProduct.sizes && catProduct.sizes.length) ? catProduct.sizes.slice(0, 4) : info.sizes;

    return `
      <div class="bg-navy-950/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-yellow-500/5 group hover:border-[#D4AF37]/30 transition-all duration-300 flex flex-col justify-between" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
        <div class="h-60 overflow-hidden relative bg-slate-950/40">
          <img src="${img}" alt="${info.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="absolute top-4 left-4 bg-[#D4AF37] text-[#0B1F3A] text-[9px] font-bold py-1 px-3 rounded-full uppercase tracking-wider">${info.badge}</span>
        </div>
        <div class="p-6 space-y-4 flex-1 flex flex-col justify-between">
          <div class="space-y-3">
            <h3 class="text-lg font-bold text-white">${info.title}</h3>
            <p class="text-xs text-gray-400 leading-relaxed">${info.desc}</p>
            <div class="text-xs text-gray-400 flex flex-wrap gap-2">
              ${sizes.map(s => `<span class="bg-slate-900 px-2.5 py-1 rounded">${s.includes('"') ? s : s + '"'}</span>`).join('')}
            </div>
          </div>
          <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span class="text-[9px] text-gray-400 uppercase block">Starting at</span>
              <span class="text-base font-bold text-[#D4AF37]">₹${price}</span>
            </div>
            <a href="${info.link}" class="bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B1F3A] font-bold text-xs py-2.5 px-4 rounded-lg transition-all duration-200">Customize</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
};

// Load Supabase Client CDN dynamically if not present
if (typeof window.supabase === 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = () => {
    loadSupabaseProducts();
  };
  document.head.appendChild(script);
} else {
  // If already loaded, run sync immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSupabaseProducts);
  } else {
    loadSupabaseProducts();
  }
}
