// customizer.js - Interactive customizer logic for VD CREATION customizer page

document.addEventListener('DOMContentLoaded', () => {
  initCustomizer();
});

// Customizer state
let currentProduct = null;
let currentCategory = 'acrylic';
let selectedSize = '8x12';
let selectedOrientation = 'vertical'; // vertical, horizontal, square
let selectedLEDTone = 'warm'; // warm, white, cool, off
let selectedQuantity = 1;
let currentPrice = 399;

let uploadedImageBase64 = '';
let isUserUploaded = false;
let isDragging = false;
let startX = 0, startY = 0;
let panX = 0, panY = 0;
let zoomScale = 1.0;
let rotationAngle = 0; // 0, 90, 180, 270

// Price tables matching sizes
const SIZE_PRICES = {
  acrylic: {
    '6x9': 399,
    '8x12': 599,
    '10x15': 899,
    '12x18': 1299
  },
  matte: {
    '6x9': 449,
    '8x12': 649,
    '10x15': 949,
    '12x18': 1399,
    '16x20': 1899,
    '16x24': 2199,
    '18x24': 2599,
    '20x30': 2999,
    '24x36': 3999,
    '24x48': 5499
  },
  classic: {
    '6x9': 299,
    '8x12': 499,
    '10x15': 749,
    '12x18': 999,
    '16x20': 1499,
    '16x24': 1799,
    '18x24': 2199,
    '20x30': 2599,
    '24x36': 3499,
    '24x48': 4899
  },
  led: {
    '6x9': 699,
    '8x12': 999,
    '10x15': 1499,
    '12x18': 1999,
    '16x20': 2699,
    '16x24': 3299
  },
  gifts: {
    '2x2': 99,
    '2.5x2.5': 129,
    '3.5x2': 149,
    '3x4 (Set of 3)': 199
  }
};

function initCustomizer() {
  const params = new URLSearchParams(window.location.search);
  
  // 1. Identify product from catalog or set default
  const productId = params.get('product') || 'acrylic-wall-photo';
  currentProduct = PRODUCTS_DATABASE.find(item => item.productId === productId);
  
  if (currentProduct) {
    currentCategory = currentProduct.category;
    // Set default size based on available sizes
    selectedSize = currentProduct.sizes ? currentProduct.sizes[0] : '8x12';
  } else {
    // Fallback if URL param is custom
    const catParam = params.get('category') || 'acrylic';
    currentCategory = catParam;
    currentProduct = PRODUCTS_DATABASE.find(item => item.category === currentCategory) || PRODUCTS_DATABASE[0];
    selectedSize = currentProduct.sizes ? currentProduct.sizes[0] : '8x12';
  }

  // 2. Setup category UI selection matching database
  populateCategoriesDropdown();
  populateSizesDropdown();
  updateUIOptions();

  // 3. Check for preloaded homepage widget data
  const preloaded = sessionStorage.getItem('vd_preloaded_widget');
  if (preloaded) {
    try {
      const data = JSON.parse(preloaded);
      uploadedImageBase64 = data.preloadedImage;
      isUserUploaded = true;
      zoomScale = data.zoom || 1.0;
      panX = data.panX || 0;
      panY = data.panY || 0;
      currentCategory = data.category || currentCategory;
      
      const img = document.getElementById('customizer-preview-img');
      const placeholder = document.getElementById('customizer-placeholder');
      if (img && placeholder) {
        img.src = uploadedImageBase64;
        img.classList.remove('hidden');
        placeholder.classList.add('hidden');
      }
      
      // Update inputs matching preloaded
      const catSelect = document.getElementById('config-category');
      if (catSelect) {
        catSelect.value = currentCategory;
        onCategoryChanged(currentCategory);
      }
      
      const zoomInput = document.getElementById('customizer-zoom');
      if (zoomInput) zoomInput.value = zoomScale;
      
      applyPreviewTransforms();
      sessionStorage.removeItem('vd_preloaded_widget'); // Clear session
    } catch(e) {
      console.error("Error loading preloaded widget data", e);
    }
  } else {
    // Try to load a fallback product image first as guide
    loadFallbackProductImage();
  }

  // 4. Bind Customizer events
  bindCustomizerEvents();
  calculatePrice();
}

function loadFallbackProductImage() {
  if (currentProduct && currentProduct.productImage) {
    // We show a placeholder description but load product image as guide
    const img = document.getElementById('customizer-preview-img');
    const placeholder = document.getElementById('customizer-placeholder');
    if (img && placeholder) {
      img.src = currentProduct.productImage;
      img.classList.remove('hidden');
      placeholder.classList.add('hidden');
      uploadedImageBase64 = currentProduct.productImage;
      isUserUploaded = false;
      
      // Reset offsets
      zoomScale = 1.0;
      panX = 0;
      panY = 0;
      rotationAngle = 0;
      applyPreviewTransforms();
    }
  }
}

function populateCategoriesDropdown() {
  const catSelect = document.getElementById('config-category');
  if (!catSelect) return;

  const categories = [
    { id: 'acrylic', label: 'Acrylic Frames' },
    { id: 'matte', label: 'Zink Mate Frames' },
    { id: 'classic', label: 'Normal Photo Frames' },
    { id: 'led', label: 'Glowing LED Frames' },
    { id: 'gifts', label: 'Personalized Gifts' }
  ];

  catSelect.innerHTML = categories.map(cat => `
    <option value="${cat.id}" ${cat.id === currentCategory ? 'selected' : ''}>${cat.label}</option>
  `).join('');

  catSelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    onCategoryChanged(currentCategory);
  });
}

function onCategoryChanged(catId) {
  // Find a product in database under this category to update specifications
  currentProduct = PRODUCTS_DATABASE.find(item => item.category === catId) || PRODUCTS_DATABASE[0];
  populateSizesDropdown();
  updateUIOptions();
  calculatePrice();
  loadFallbackProductImage();
}

function populateSizesDropdown() {
  const sizeSelect = document.getElementById('config-size');
  if (!sizeSelect) return;

  const availableSizes = currentProduct.sizes || Object.keys(SIZE_PRICES[currentCategory]);
  selectedSize = availableSizes[0];

  sizeSelect.innerHTML = availableSizes.map(size => {
    const price = SIZE_PRICES[currentCategory][size] || currentProduct.basePrice;
    return `
      <option value="${size}" ${size === selectedSize ? 'selected' : ''}>${size} Inches (₹${price})</option>
    `;
  }).join('');

  sizeSelect.addEventListener('change', (e) => {
    selectedSize = e.target.value;
    calculatePrice();
    updateAspectRatios();
  });
}

function updateUIOptions() {
  // Show/Hide LED tone panel
  const ledPanel = document.getElementById('led-options-panel');
  if (ledPanel) {
    if (currentCategory === 'led') {
      ledPanel.classList.remove('hidden');
    } else {
      ledPanel.classList.add('hidden');
    }
  }

  // Update product specs lists in sidebar
  const descText = document.getElementById('config-desc');
  if (descText) descText.innerText = currentProduct.description;

  const featuresList = document.getElementById('config-features');
  if (featuresList && currentProduct.features) {
    featuresList.innerHTML = currentProduct.features.map(f => `
      <li class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
        <span>${f}</span>
      </li>
    `).join('');
  }

  // Set frame borders style visually
  updateFrameStyleVisual();
  updateAspectRatios();
}

function updateFrameStyleVisual() {
  const frame = document.getElementById('customizer-frame-preview');
  if (!frame) return;

  // Clear existing frame styles
  frame.className = "w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300";
  
  // Hide studs
  const studs = document.querySelectorAll('.acrylic-stud');
  studs.forEach(s => s.classList.add('hidden'));

  // Disable LED glow styling classes
  frame.classList.remove('led-glow-warm', 'led-glow-white', 'led-glow-cool', 'led-glow-off');

  if (currentCategory === 'acrylic') {
    frame.classList.add('frame-acrylic');
    studs.forEach(s => s.classList.remove('hidden'));
  } else if (currentCategory === 'matte') {
    frame.classList.add('frame-matte');
  } else if (currentCategory === 'classic') {
    frame.classList.add('frame-classic');
  } else if (currentCategory === 'led') {
    frame.classList.add('frame-led');
    
    // LED light tone styling
    if (selectedLEDTone === 'warm') {
      frame.classList.add('led-glow-warm');
    } else if (selectedLEDTone === 'white') {
      frame.classList.add('led-glow-white');
    } else if (selectedLEDTone === 'cool') {
      frame.classList.add('led-glow-cool');
    } else {
      frame.classList.add('led-glow-off');
    }
  } else {
    // fallback plain frame
    frame.classList.add('border-8', 'border-slate-800', 'bg-slate-900', 'shadow-2xl');
  }
}

function updateAspectRatios() {
  const wrapper = document.getElementById('customizer-frame-outer-wrapper');
  if (!wrapper) return;

  // Clear width/height constraints
  wrapper.className = "relative mx-auto transition-all duration-300 flex items-center justify-center";

  // Calculate width/height based on size ratios (e.g., 6x9 is 2:3)
  let ratioWidth = 3;
  let ratioHeight = 4; // default

  if (selectedSize && selectedSize.includes('x')) {
    const parts = selectedSize.split(' ')[0].split('x');
    const w = parseInt(parts[0]);
    const h = parseInt(parts[1]);
    if (!isNaN(w) && !isNaN(h)) {
      ratioWidth = w;
      ratioHeight = h;
    }
  }

  // Adjust aspect ratio depending on orientation selected
  if (selectedOrientation === 'vertical') {
    if (ratioWidth > ratioHeight) {
      // Swap
      const tmp = ratioWidth;
      ratioWidth = ratioHeight;
      ratioHeight = tmp;
    }
  } else if (selectedOrientation === 'horizontal') {
    if (ratioWidth < ratioHeight) {
      // Swap
      const tmp = ratioWidth;
      ratioWidth = ratioHeight;
      ratioHeight = tmp;
    }
  } else {
    // Square
    ratioWidth = 1;
    ratioHeight = 1;
  }

  // Calculate styling dimensions
  const maxWidth = 340; // max size in px
  const maxHeight = 340;
  
  let finalWidth = maxWidth;
  let finalHeight = maxHeight;

  if (ratioWidth > ratioHeight) {
    finalHeight = (ratioHeight / ratioWidth) * maxWidth;
  } else if (ratioWidth < ratioHeight) {
    finalWidth = (ratioWidth / ratioHeight) * maxHeight;
  }

  wrapper.style.width = `${finalWidth}px`;
  wrapper.style.height = `${finalHeight}px`;
}

function calculatePrice() {
  const base = SIZE_PRICES[currentCategory][selectedSize] || currentProduct.basePrice;
  currentPrice = base;
  
  const priceLabel = document.getElementById('summary-unit-price');
  const totalLabel = document.getElementById('summary-total-price');
  
  if (priceLabel) priceLabel.innerText = `₹${currentPrice}`;
  if (totalLabel) totalLabel.innerText = `₹${(currentPrice * selectedQuantity).toLocaleString('en-IN')}`;
}

function bindCustomizerEvents() {
  const dropZone = document.getElementById('customizer-drop-zone');
  const fileInput = document.getElementById('customizer-file-input');
  const previewImg = document.getElementById('customizer-preview-img');
  const placeholder = document.getElementById('customizer-placeholder');
  const zoomInput = document.getElementById('customizer-zoom');
  const rotateBtn = document.getElementById('customizer-rotate-btn');
  const canvasWrapper = document.getElementById('customizer-canvas-wrapper');

  // Zipcode check
  const zipInput = document.getElementById('zip-check-input');
  const zipBtn = document.getElementById('zip-check-btn');
  const zipOutput = document.getElementById('zip-check-output');

  if (zipBtn && zipInput && zipOutput) {
    zipBtn.addEventListener('click', () => {
      const code = zipInput.value.trim();
      if (/^\d{6}$/.test(code)) {
        zipOutput.className = "text-xs font-semibold text-green-400 mt-2";
        zipOutput.innerHTML = `<i class="fas fa-check-circle mr-1"></i> Shipping available! Delivered in 3-5 days. Cash on delivery ready.`;
      } else {
        zipOutput.className = "text-xs font-semibold text-red-400 mt-2";
        zipOutput.innerHTML = `<i class="fas fa-times-circle mr-1"></i> Invalid zipcode. Please enter a 6-digit Indian PIN code.`;
      }
    });
  }

  // Category change hooks
  const catSelect = document.getElementById('config-category');
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      // Re-trigger visual updates
      updateFrameStyleVisual();
    });
  }

  // LED tone changes
  const ledTones = document.querySelectorAll('.led-tone-btn');
  ledTones.forEach(btn => {
    btn.addEventListener('click', (e) => {
      ledTones.forEach(b => b.classList.remove('border-[#D4AF37]', 'text-[#D4AF37]'));
      btn.classList.add('border-[#D4AF37]', 'text-[#D4AF37]');
      selectedLEDTone = btn.dataset.tone;
      updateFrameStyleVisual();
    });
  });

  // Orientation toggles
  const orientBtns = document.querySelectorAll('.orient-btn');
  orientBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      orientBtns.forEach(b => b.classList.remove('border-[#D4AF37]', 'text-[#D4AF37]'));
      btn.classList.add('border-[#D4AF37]', 'text-[#D4AF37]');
      selectedOrientation = btn.dataset.orientation;
      updateAspectRatios();
    });
  });

  // Quantity adjusters
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const qtyVal = document.getElementById('qty-val');

  if (qtyMinus && qtyPlus && qtyVal) {
    qtyMinus.addEventListener('click', () => {
      if (selectedQuantity > 1) {
        selectedQuantity--;
        qtyVal.innerText = selectedQuantity;
        calculatePrice();
      }
    });
    qtyPlus.addEventListener('click', () => {
      selectedQuantity++;
      qtyVal.innerText = selectedQuantity;
      calculatePrice();
    });
  }

  // Upload actions
  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleCustomizerImage(file);
    });

    // Drag over bindings
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('border-[#D4AF37]', 'bg-slate-900/60');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-[#D4AF37]', 'bg-slate-900/60');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      if (file) handleCustomizerImage(file);
    });
  }

  function handleCustomizerImage(file) {
    if (!file.type.startsWith('image/')) {
      showNotification("Invalid file format. Please upload an image.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImageBase64 = e.target.result;
      isUserUploaded = true;
      previewImg.src = uploadedImageBase64;
      previewImg.classList.remove('hidden');
      placeholder.classList.add('hidden');
      
      // Reset zoom/pan states
      zoomScale = 1.0;
      if (zoomInput) zoomInput.value = 1.0;
      panX = 0;
      panY = 0;
      rotationAngle = 0;
      applyPreviewTransforms();
      
      showNotification("Photo uploaded successfully! Adjust framing now.", "success");
    };
    reader.readAsDataURL(file);
  }

  // Zoom event
  if (zoomInput) {
    zoomInput.addEventListener('input', (e) => {
      zoomScale = parseFloat(e.target.value);
      applyPreviewTransforms();
    });
  }

  // Rotate event (90 degrees steps)
  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      rotationAngle = (rotationAngle + 90) % 360;
      applyPreviewTransforms();
    });
  }

  // Mouse reposition drag logic
  if (canvasWrapper) {
    canvasWrapper.addEventListener('mousedown', (e) => {
      if (!uploadedImageBase64) return;
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvasWrapper.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      applyPreviewTransforms();
    });

    // Touch support for mobile repositioning
    canvasWrapper.addEventListener('touchstart', (e) => {
      if (!uploadedImageBase64) return;
      isDragging = true;
      const touch = e.touches[0];
      startX = touch.clientX - panX;
      startY = touch.clientY - panY;
    });

    canvasWrapper.addEventListener('touchend', () => {
      isDragging = false;
    });

    canvasWrapper.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      panX = touch.clientX - startX;
      panY = touch.clientY - startY;
      applyPreviewTransforms();
    });
  }

  // Add to Cart action
  const addToCartBtn = document.getElementById('config-add-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      submitToGlobalCart(false);
    });
  }

  // Buy Now action
  const buyNowBtn = document.getElementById('config-buy-now');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      submitToGlobalCart(true);
    });
  }
}

function applyPreviewTransforms() {
  const img = document.getElementById('customizer-preview-img');
  if (img) {
    img.style.transform = `translate(${panX}px, ${panY}px) rotate(${rotationAngle}deg) scale(${zoomScale})`;
  }
}

// ----------------------------------------------------
// Export customizer snapshot using canvas
// ----------------------------------------------------
function submitToGlobalCart(redirectToCheckout = false) {
  if (!uploadedImageBase64 || !isUserUploaded) {
    showNotification("Please upload your own photo before ordering!", "error");
    return;
  }

  // Create an offscreen canvas to render the cropped photo matching frame orientation
  const canvas = document.createElement('canvas');
  const imgElement = document.getElementById('customizer-preview-img');
  const previewWrapper = document.getElementById('customizer-canvas-wrapper');
  
  if (!imgElement || !previewWrapper) return;

  const canvasWidth = 600;
  const canvasHeight = 600;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  // Fill canvas dark navy backdrop
  ctx.fillStyle = '#050e1a';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // We draw the user image on this canvas applying translation, rotation, and scaling offsets
  const tempImg = new Image();
  tempImg.src = uploadedImageBase64;
  
  tempImg.onload = () => {
    ctx.save();
    
    // Center context
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    
    // Rotate canvas context
    ctx.rotate((rotationAngle * Math.PI) / 180);
    
    // Apply scale and translation matching preview sizes
    // Convert preview CSS translation to match canvas scaling factors
    const displayRatio = canvasWidth / previewWrapper.clientWidth;
    const finalScale = zoomScale * displayRatio;
    
    ctx.drawImage(
      tempImg,
      -tempImg.width / 2 + (panX * displayRatio),
      -tempImg.height / 2 + (panY * displayRatio),
      tempImg.width,
      tempImg.height
    );

    ctx.restore();

    // Export cropped image DataURL
    const croppedDataURL = canvas.toDataURL('image/jpeg', 0.85);

    // Build product schema to insert to cart
    const checkoutItem = {
      productId: currentProduct.productId,
      productName: currentProduct.productName,
      category: currentProduct.categoryLabel,
      basePrice: currentProduct.basePrice,
      price: currentPrice,
      productImage: currentProduct.productImage,
      croppedImage: croppedDataURL,
      size: selectedSize,
      quantity: selectedQuantity,
      customization: {
        orientation: selectedOrientation,
        ledTone: currentCategory === 'led' ? selectedLEDTone : null,
        zoom: zoomScale,
        rotation: rotationAngle
      }
    };

    // Add to global cart drawer using app.js function
    window.addItemToCart(checkoutItem, selectedQuantity, selectedSize, croppedDataURL, checkoutItem.customization);

    if (redirectToCheckout) {
      window.location.href = 'checkout.html';
    }
  };

  tempImg.onerror = () => {
    // fallback if base64 load failed
    const fallbackItem = {
      productId: currentProduct.productId,
      productName: currentProduct.productName,
      category: currentProduct.categoryLabel,
      basePrice: currentProduct.basePrice,
      price: currentPrice,
      productImage: currentProduct.productImage,
      croppedImage: currentProduct.productImage,
      size: selectedSize,
      quantity: selectedQuantity,
      customization: {}
    };
    window.addItemToCart(fallbackItem, selectedQuantity, selectedSize, null, {});
    
    if (redirectToCheckout) {
      window.location.href = 'checkout.html';
    }
  };
}
