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
let uploadedPhotosMap = {}; // { 1: base64, 2: base64, ... }
let currentUploadingSlot = 1;
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
  }
};

// Refresh and synchronize Customizer state when database sync completes
window.syncCustomizerWithProduct = function() {
  const params = new URLSearchParams(window.location.search);
  const prodId = params.get('product') || params.get('id') || 'acrylic-wall-photo';
  const found = PRODUCTS_DATABASE.find(item => item.productId === prodId || item.id === prodId);
  if (found) {
    currentProduct = found;
    currentCategory = currentProduct.category;
    
    try {
      sessionStorage.setItem('vd_selected_product', JSON.stringify(found));
    } catch(e) {}

    // Populate select values and options
    populateCategoriesDropdown();
    populateSizesDropdown();
    updateUIOptions();
    updateFrameStyleVisual();
    calculatePrice();
    loadFallbackProductImage();
  }
};

function initCustomizer() {
  const params = new URLSearchParams(window.location.search);
  
  // 1. Identify target product from URL or sessionStorage
  const targetProductId = params.get('product') || params.get('id');
  let foundProduct = null;

  if (targetProductId) {
    // Check if product object was saved in sessionStorage on click
    try {
      const storedStr = sessionStorage.getItem('vd_selected_product');
      if (storedStr) {
        const storedObj = JSON.parse(storedStr);
        if (storedObj && (storedObj.productId === targetProductId || storedObj.id === targetProductId)) {
          foundProduct = storedObj;
        }
      }
    } catch (e) {}

    // Check PRODUCTS_DATABASE
    if (!foundProduct && typeof PRODUCTS_DATABASE !== 'undefined' && Array.isArray(PRODUCTS_DATABASE)) {
      foundProduct = PRODUCTS_DATABASE.find(item => item.productId === targetProductId || item.id === targetProductId);
    }
  }

  if (foundProduct) {
    currentProduct = foundProduct;
    currentCategory = currentProduct.category;
    selectedSize = currentProduct.sizes && currentProduct.sizes.length > 0 ? currentProduct.sizes[0] : '8x12';
  } else if (targetProductId) {
    // Product specified in URL but Supabase is still loading!
    // Set to null so we don't display a WRONG fallback image while waiting
    currentProduct = null;
    const catParam = params.get('category') || 'acrylic';
    currentCategory = catParam;
  } else {
    // Default fallback when no product parameter is given at all
    currentProduct = (typeof PRODUCTS_DATABASE !== 'undefined' && PRODUCTS_DATABASE.length > 0) ? PRODUCTS_DATABASE[0] : null;
    currentCategory = currentProduct ? currentProduct.category : 'acrylic';
    selectedSize = currentProduct && currentProduct.sizes ? currentProduct.sizes[0] : '8x12';
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
    const transformBox = document.getElementById('customizer-transform-box');
    const canvasWrapper = document.getElementById('customizer-canvas-wrapper');

    if (img && placeholder) {
      isUserUploaded = false;
      img.src = currentProduct.productImage;
      img.classList.remove('hidden');
      placeholder.classList.add('hidden');
      uploadedImageBase64 = currentProduct.productImage;
      if (canvasWrapper) {
        canvasWrapper.style.backgroundColor = '#171d26';
      }
      
      if (transformBox) transformBox.classList.add('hidden');
      
      // Reset offsets
      zoomScale = 1.0;
      panX = 0;
      panY = 0;
      rotationAngle = 0;
      applyPreviewTransforms();
      
      // Synchronize frame layout immediately
      updateFrameStyleVisual();
    }
  } else if (!currentProduct) {
    // Waiting for Supabase to finish loading the target product
    const img = document.getElementById('customizer-preview-img');
    const placeholder = document.getElementById('customizer-placeholder');
    if (img) img.classList.add('hidden');
    if (placeholder) placeholder.classList.remove('hidden');
  }
}



function populateCategoriesDropdown() {
  const catSelect = document.getElementById('config-category');
  if (!catSelect) return;

  let categories = window.DYNAMIC_CATEGORIES && window.DYNAMIC_CATEGORIES.length > 0
    ? window.DYNAMIC_CATEGORIES
    : [
        { id: 'acrylic', label: 'Acrylic Frames' },
        { id: 'matte', label: 'Zink Mate Frames' },
        { id: 'classic', label: 'Normal Photo Frames' },
        { id: 'led', label: 'Glowing LED Frames' }
      ];

  // Also include any categories present in PRODUCTS_DATABASE
  if (typeof PRODUCTS_DATABASE !== 'undefined' && Array.isArray(PRODUCTS_DATABASE)) {
    PRODUCTS_DATABASE.forEach(p => {
      if (p.category && !categories.some(c => c.id === p.category)) {
        categories.push({ id: p.category, label: p.categoryLabel || p.category });
      }
    });
  }

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
    let price;
    if (currentProduct && currentProduct.sizePrices && currentProduct.sizePrices[size] !== undefined) {
      price = currentProduct.sizePrices[size];
    } else {
      price = SIZE_PRICES[currentCategory][size] || currentProduct.basePrice;
    }
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
  updateMultiPhotoUploadUI();
}

window.triggerSlotUpload = function(slotIndex) {
  currentUploadingSlot = slotIndex;
  const fileInput = document.getElementById('customizer-file-input');
  if (fileInput) fileInput.click();
};

function updateMultiPhotoUploadUI() {
  const dropZone = document.getElementById('customizer-drop-zone');
  const collageContainer = document.getElementById('customizer-collage-uploads-container');
  const canvasWrapper = document.getElementById('customizer-canvas-wrapper');
  
  const slotsCount = (currentProduct && currentProduct.slots) ? (typeof currentProduct.slots === 'number' ? currentProduct.slots : (parseInt(currentProduct.slots) || 1)) : 1;

  let noticeOverlay = document.getElementById('collage-notice-overlay');

  if (slotsCount > 1) {
    if (dropZone) dropZone.classList.add('hidden');
    if (collageContainer) {
      collageContainer.classList.remove('hidden');
      
      let slotsHtml = `
        <div class="bg-[#D4AF37]/10 border border-[#D4AF37]/40 p-3 rounded-xl mb-3 text-center">
          <span class="text-xs font-bold text-[#D4AF37] block uppercase tracking-wider"><i class="fas fa-layer-group mr-1.5"></i> ${slotsCount}-Photo Collage Frame</span>
          <span class="text-[10px] text-gray-300">Upload all ${slotsCount} photos below to customize your frame.</span>
        </div>
      `;
      
      for (let i = 1; i <= slotsCount; i++) {
        const photoData = uploadedPhotosMap[i];
        const isUploaded = !!photoData;
        
        slotsHtml += `
          <div class="bg-slate-950/80 border ${isUploaded ? 'border-green-500/50 bg-green-500/5' : 'border-slate-800'} p-3 rounded-2xl flex items-center justify-between gap-3 transition-all">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="w-12 h-12 rounded-xl bg-navy-900 border border-slate-800 overflow-hidden flex items-center justify-center text-gray-500 flex-shrink-0 relative">
                ${isUploaded 
                  ? `<img src="${photoData}" class="w-full h-full object-cover">` 
                  : `<span class="text-xs font-bold text-[#D4AF37]">${i}</span>`}
              </div>
              <div class="truncate">
                <span class="text-xs font-bold text-white block">Image ${i} <span class="text-red-400">*</span></span>
                <span class="text-[9px] ${isUploaded ? 'text-green-400 font-bold' : 'text-gray-500'}">
                  ${isUploaded ? '<i class="fas fa-check-circle mr-1"></i> Uploaded' : 'Required'}
                </span>
              </div>
            </div>
            
            <button type="button" onclick="window.triggerSlotUpload(${i})" class="flex-shrink-0 ${isUploaded ? 'bg-slate-800 text-gray-300 hover:text-white' : 'bg-[#D4AF37] text-navy-950 hover:bg-[#F3CD46]'} text-[10px] font-bold py-2 px-3 rounded-xl transition-all shadow">
              <i class="fas ${isUploaded ? 'fa-pen' : 'fa-upload'} mr-1"></i>
              <span>${isUploaded ? 'Change' : `Upload ${i}`}</span>
            </button>
          </div>
        `;
      }
      
      collageContainer.innerHTML = slotsHtml;
    }

    if (canvasWrapper && canvasWrapper.parentElement) {
      if (!noticeOverlay) {
        noticeOverlay = document.createElement('div');
        noticeOverlay.id = 'collage-notice-overlay';
        noticeOverlay.className = 'absolute inset-x-4 bottom-4 bg-navy-950/95 border border-[#D4AF37]/40 p-4 rounded-2xl text-center space-y-1 z-30 shadow-2xl backdrop-blur-md animate-fadeIn';
        canvasWrapper.parentElement.appendChild(noticeOverlay);
      }
      noticeOverlay.innerHTML = `
        <p class="text-[11px] font-extrabold text-[#D4AF37] uppercase tracking-wider"><i class="fas fa-magic mr-1.5"></i> Multi-Photo Collage (${slotsCount} Photos)</p>
        <p class="text-[10px] text-gray-300 leading-relaxed">Upload Image 1 to Image ${slotsCount} on the right panel. Our design studio will arrange & center all photos perfectly in this frame layout!</p>
      `;
      noticeOverlay.classList.remove('hidden');
    }
  } else {
    if (dropZone) dropZone.classList.remove('hidden');
    if (collageContainer) collageContainer.classList.add('hidden');
    if (noticeOverlay) noticeOverlay.classList.add('hidden');
  }
}

function updateFrameStyleVisual() {
  const frame = document.getElementById('customizer-frame-preview');
  if (!frame) return;

  // Clear existing frame styles - Add relative positioning for overlays
  frame.className = "w-full h-full relative flex items-center justify-center overflow-hidden transition-all duration-300";
  
  // Hide studs
  const studs = document.querySelectorAll('.acrylic-stud');
  studs.forEach(s => s.classList.add('hidden'));

  // Disable LED glow styling classes
  frame.classList.remove('led-glow-warm', 'led-glow-white', 'led-glow-cool', 'led-glow-off');

  // Handle overlay for custom frame templates (e.g. Premium Black Wood frame)
  const overlay = document.getElementById('customizer-frame-overlay');
  const isCustomOverlay = currentProduct && currentProduct.emptyImage;
  const transformBox = document.getElementById('customizer-transform-box');
  const canvasWrapper = document.getElementById('customizer-canvas-wrapper');
  
  if (overlay) {
    if (isCustomOverlay && isUserUploaded) {
      // Show the frame border immediately so it's always visible
      overlay.src = currentProduct.emptyImage;
      overlay.classList.remove('hidden');

      // Attempt canvas-based cutout for opaque frames (enhances blending)
      const tempImg = new Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.onload = function() {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = tempImg.naturalWidth;
          canvas.height = tempImg.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(tempImg, 0, 0);
          
          // Check if the image already has transparent pixels (alpha < 255)
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          let hasTransparency = false;
          for (let i = 3; i < data.length; i += 40) {
            if (data[i] < 255) {
              hasTransparency = true;
              break;
            }
          }

          let leftPercent = currentProduct.cropLeft ?? 0;
          let topPercent = currentProduct.cropTop ?? 0;
          let widthPercent = currentProduct.cropWidth ?? 100;
          let heightPercent = currentProduct.cropHeight ?? 100;

          // Autodetect crop boundaries dynamically if coordinates are unset (0, 0, 100, 100)
          if (leftPercent === 0 && topPercent === 0 && widthPercent === 100 && heightPercent === 100) {
            const cx = Math.floor(canvas.width / 2);
            const cy = Math.floor(canvas.height / 2);

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
              if (pixel.a < 10) return true;
              if (pixel.r > 200 && pixel.g > 200 && pixel.b > 200) return true;
              return false;
            }

            const centerPixel = getPixelAt(cx, cy);
            if (isTargetPixel(centerPixel)) {
              let minX = cx;
              while (minX > 0 && isTargetPixel(getPixelAt(minX - 1, cy))) minX--;
              let maxX = cx;
              while (maxX < canvas.width - 1 && isTargetPixel(getPixelAt(maxX + 1, cy))) maxX++;
              let minY = cy;
              while (minY > 0 && isTargetPixel(getPixelAt(cx, minY - 1))) minY--;
              let maxY = cy;
              while (maxY < canvas.height - 1 && isTargetPixel(getPixelAt(cx, maxY + 1))) maxY++;

              leftPercent = (minX / canvas.width) * 100;
              topPercent = (minY / canvas.height) * 100;
              widthPercent = ((maxX - minX) / canvas.width) * 100;
              heightPercent = ((maxY - minY) / canvas.height) * 100;

              const oL = `${leftPercent}%`;
              const oT = `${topPercent}%`;
              const oW = `${widthPercent}%`;
              const oH = `${heightPercent}%`;

              if (canvasWrapper) {
                canvasWrapper.style.left = oL;
                canvasWrapper.style.top = oT;
                canvasWrapper.style.width = oW;
                canvasWrapper.style.height = oH;
              }
              if (transformBox) {
                transformBox.style.left = oL;
                transformBox.style.top = oT;
                transformBox.style.width = oW;
                transformBox.style.height = oH;
              }
            }
          }

          // Only cut out a rectangle if coordinates define a sub-area (less than 100%)
          const hasCutout = leftPercent > 0 || topPercent > 0 || widthPercent < 100 || heightPercent < 100;
          if (!hasTransparency && hasCutout) {
            const x = (leftPercent / 100) * canvas.width;
            const y = (topPercent / 100) * canvas.height;
            const w = (widthPercent / 100) * canvas.width;
            const h = (heightPercent / 100) * canvas.height;
            ctx.clearRect(x, y, w, h);
            overlay.src = canvas.toDataURL('image/png');
          }
          // If transparent or no sub-area cutout is defined, show emptyImage directly
        } catch (e) {
          // CORS or canvas error — keep the emptyImage src already set above
          console.warn("Canvas cutout skipped (CORS):", e.message);
        }
      };
      tempImg.onerror = function() {
        // Image load failed — keep the emptyImage src already set above
      };
      tempImg.src = currentProduct.emptyImage + (currentProduct.emptyImage.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
    } else {
      overlay.src = '#';
      overlay.classList.add('hidden');
    }
  }



  // Position transform tools and photo wrapper to match transparent frame center
  let overlayLeft = '0%';
  let overlayTop = '0%';
  let overlayWidth = '100%';
  let overlayHeight = '100%';

  if (currentProduct && isCustomOverlay && isUserUploaded) {
    overlayLeft = `${currentProduct.cropLeft ?? 0}%`;
    overlayTop = `${currentProduct.cropTop ?? 0}%`;
    overlayWidth = `${currentProduct.cropWidth ?? 100}%`;
    overlayHeight = `${currentProduct.cropHeight ?? 100}%`;
  }

  if (isCustomOverlay && isUserUploaded) {
    if (canvasWrapper) {
      canvasWrapper.style.position = 'absolute';
      canvasWrapper.style.left = overlayLeft;
      canvasWrapper.style.top = overlayTop;
      canvasWrapper.style.width = overlayWidth;
      canvasWrapper.style.height = overlayHeight;
    }
    if (transformBox) {
      transformBox.style.left = overlayLeft;
      transformBox.style.top = overlayTop;
      transformBox.style.width = overlayWidth;
      transformBox.style.height = overlayHeight;
    }
  } else {
    // Restore default layouts for other products or when showing default product image
    if (canvasWrapper) {
      canvasWrapper.style.position = 'absolute';
      canvasWrapper.style.left = '0%';
      canvasWrapper.style.top = '0%';
      canvasWrapper.style.width = '100%';
      canvasWrapper.style.height = '100%';
    }
    if (transformBox) {
      transformBox.style.left = '0%';
      transformBox.style.top = '0%';
      transformBox.style.width = '100%';
      transformBox.style.height = '100%';
    }
  }

  if (currentCategory === 'acrylic') {
    if (isCustomOverlay) {
      frame.classList.add('border-0');
    } else {
      frame.classList.add('frame-acrylic');
      studs.forEach(s => s.classList.remove('hidden'));
    }
  } else if (currentCategory === 'matte') {
    frame.classList.add('frame-matte');
  } else if (currentCategory === 'classic') {
    if (isCustomOverlay) {
      // Remove all CSS borders to let the PNG overlay act as the entire frame
      frame.classList.add('border-0');
    } else {
      frame.classList.add('frame-classic');
    }
  } else if (currentCategory === 'led') {
    if (isCustomOverlay) {
      frame.classList.add('border-0');
    } else {
      frame.classList.add('frame-led');
    }
    
    // Sync LED button active highlights to prevent Tailwind specificity conflicts
    const ledTones = document.querySelectorAll('.led-tone-btn');
    ledTones.forEach(btn => {
      if (btn.dataset.tone === selectedLEDTone) {
        btn.classList.add('border-[#D4AF37]', 'text-[#D4AF37]');
        btn.classList.remove('border-slate-800', 'text-gray-400');
      } else {
        btn.classList.remove('border-[#D4AF37]', 'text-[#D4AF37]');
        btn.classList.add('border-slate-800', 'text-gray-400');
      }
    });

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

  // Sync orientation button active highlights to prevent Tailwind specificity conflicts
  const orientBtns = document.querySelectorAll('.orient-btn');
  orientBtns.forEach(btn => {
    if (btn.dataset.orientation === selectedOrientation) {
      btn.classList.add('border-[#D4AF37]', 'text-[#D4AF37]');
      btn.classList.remove('border-slate-800', 'text-gray-400');
    } else {
      btn.classList.remove('border-[#D4AF37]', 'text-[#D4AF37]');
      btn.classList.add('border-slate-800', 'text-gray-400');
    }
  });

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
  const maxWidth = 480; // max size in px
  const maxHeight = 480;
  
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
  let base;
  if (currentProduct && currentProduct.sizePrices && currentProduct.sizePrices[selectedSize] !== undefined) {
    base = currentProduct.sizePrices[selectedSize];
  } else {
    base = SIZE_PRICES[currentCategory][selectedSize] || currentProduct.basePrice;
  }
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
      selectedLEDTone = btn.dataset.tone;
      updateFrameStyleVisual();
    });
  });

  // Orientation toggles
  const orientBtns = document.querySelectorAll('.orient-btn');
  orientBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
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

    const slotsCount = (currentProduct && currentProduct.slots) ? (typeof currentProduct.slots === 'number' ? currentProduct.slots : (parseInt(currentProduct.slots) || 1)) : 1;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      
      if (slotsCount > 1) {
        uploadedPhotosMap[currentUploadingSlot] = base64;
        uploadedImageBase64 = base64;
        isUserUploaded = true;
        
        updateMultiPhotoUploadUI();
        showNotification(`Image ${currentUploadingSlot} uploaded successfully!`, "success");
      } else {
        uploadedImageBase64 = base64;
        isUserUploaded = true;
        previewImg.src = uploadedImageBase64;
        previewImg.classList.remove('hidden');
        placeholder.classList.add('hidden');
        
        const canvasWrapper = document.getElementById('customizer-canvas-wrapper');
        if (canvasWrapper) {
          canvasWrapper.style.backgroundColor = '#171d26';
        }
        
        // Reset zoom/pan states
        zoomScale = 1.0;
        if (zoomInput) zoomInput.value = 1.0;
        panX = 0;
        panY = 0;
        rotationAngle = 0;
        applyPreviewTransforms();
        
        // Synchronize frame style layout visual
        updateFrameStyleVisual();
        showNotification("Photo uploaded successfully! Adjust framing now.", "success");
      }
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

  // Mouse/Touch Drag Variables
  let activeHandle = null;
  let initMouseX = 0;
  let initMouseY = 0;
  let initZoom = 1.0;
  let initPanX = 0;
  let initPanY = 0;
  let initRotation = 0;
  let initDist = 0;
  let initAngle = 0;

  // Mouse / Touch Start Repositioning (Photo)
  if (canvasWrapper) {
    const startPhotoDrag = (clientX, clientY) => {
      if (!uploadedImageBase64) return;
      isDragging = true;
      startX = clientX - panX;
      startY = clientY - panY;
      
      const cropGuide = document.getElementById('customizer-crop-guide');
      if (cropGuide) cropGuide.classList.remove('hidden');
    };

    canvasWrapper.addEventListener('mousedown', (e) => {
      startPhotoDrag(e.clientX, e.clientY);
    });

    canvasWrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        startPhotoDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
  }

  // Add handle drag logic for Canva-style transform box
  const transformBox = document.getElementById('customizer-transform-box');
  let getFrameCenter = null;
  let onMove = null;

  if (transformBox) {
    const handles = transformBox.querySelectorAll('[data-handle]');

    getFrameCenter = function() {
      const rect = transformBox.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    };

    handles.forEach(handle => {
      const startHandleDrag = (clientX, clientY) => {
        if (!isUserUploaded) return;
        activeHandle = handle.dataset.handle;
        initMouseX = clientX;
        initMouseY = clientY;
        initZoom = zoomScale;
        initPanX = panX;
        initPanY = panY;
        initRotation = rotationAngle;

        const center = getFrameCenter();
        if (activeHandle === 'rotate') {
          initAngle = Math.atan2(clientY - center.y, clientX - center.x);
        } else {
          initDist = Math.sqrt(Math.pow(clientX - center.x, 2) + Math.pow(clientY - center.y, 2));
        }

        isDragging = false; // Disable normal image panning
      };

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startHandleDrag(e.clientX, e.clientY);
      });

      handle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        if (e.touches.length > 0) {
          startHandleDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
      });
    });

    onMove = function(clientX, clientY) {
      if (!activeHandle) return;
      const center = getFrameCenter();

      if (activeHandle === 'rotate') {
        const curAngle = Math.atan2(clientY - center.y, clientX - center.x);
        let angleDiff = (curAngle - initAngle) * (180 / Math.PI);
        rotationAngle = (initRotation + angleDiff) % 360;
        if (rotationAngle < 0) rotationAngle += 360;
        applyPreviewTransforms();
      } else {
        // Scaling (zoom) from any handle
        const curDist = Math.sqrt(Math.pow(clientX - center.x, 2) + Math.pow(clientY - center.y, 2));
        if (initDist > 10) {
          zoomScale = initZoom * (curDist / initDist);
          if (zoomScale < 1.0) zoomScale = 1.0;
          if (zoomScale > 4.0) zoomScale = 4.0;

          const zoomInput = document.getElementById('customizer-zoom');
          if (zoomInput) zoomInput.value = zoomScale;

          applyPreviewTransforms();
        }
      }
    };
  }

  // Unified Global Mouse/Touch Move and End Listeners
  window.addEventListener('mousemove', (e) => {
    if (activeHandle && onMove) {
      onMove(e.clientX, e.clientY);
    } else if (isDragging) {
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      applyPreviewTransforms();
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    if (activeHandle && onMove) {
      onMove(touch.clientX, touch.clientY);
    } else if (isDragging) {
      panX = touch.clientX - startX;
      panY = touch.clientY - startY;
      applyPreviewTransforms();
    }
  });

  const stopDrag = () => {
    isDragging = false;
    activeHandle = null;
    const cropGuide = document.getElementById('customizer-crop-guide');
    if (cropGuide) cropGuide.classList.add('hidden');
  };

  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);

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

  // Click outside listener to show/hide selection box/handles
  const handleOutsideClick = (e) => {
    if (!isUserUploaded) return;

    const wrapper = document.getElementById('customizer-frame-outer-wrapper');
    const zoomInput = document.getElementById('customizer-zoom');
    const rotateBtn = document.getElementById('customizer-rotate-btn');
    const configPanel = document.querySelector('.lg\\:col-span-5');

    const target = e.target;
    if (!target) return;

    const clickedFrame = wrapper && wrapper.contains(target);
    const clickedZoom = zoomInput && zoomInput.contains(target);
    const clickedRotate = rotateBtn && rotateBtn.contains(target);
    const clickedConfig = configPanel && configPanel.contains(target);

    const transformBox = document.getElementById('customizer-transform-box');
    if (transformBox) {
      if (isUserUploaded && (clickedFrame || clickedZoom || clickedRotate || clickedConfig)) {
        transformBox.classList.remove('hidden');
      } else {
        transformBox.classList.add('hidden');
      }
    }
  };

  document.addEventListener('mousedown', handleOutsideClick);
  document.addEventListener('touchstart', handleOutsideClick);
}

function applyPreviewTransforms() {
  const img = document.getElementById('customizer-preview-img');
  if (img) {
    img.style.transform = `translate(${panX}px, ${panY}px) rotate(${rotationAngle}deg) scale(${zoomScale})`;
  }

  const transformBox = document.getElementById('customizer-transform-box');
  if (transformBox) {
    transformBox.style.transform = `translate(${panX}px, ${panY}px) rotate(${rotationAngle}deg) scale(${zoomScale})`;
  }
}

// ----------------------------------------------------
// Export customizer snapshot using canvas
// ----------------------------------------------------
function submitToGlobalCart(redirectToCheckout = false) {
  const slotsCount = (currentProduct && currentProduct.slots) ? (typeof currentProduct.slots === 'number' ? currentProduct.slots : (parseInt(currentProduct.slots) || 1)) : 1;

  if (slotsCount > 1) {
    const missing = [];
    for (let i = 1; i <= slotsCount; i++) {
      if (!uploadedPhotosMap[i]) missing.push(`Image ${i}`);
    }
    
    if (missing.length > 0) {
      showNotification(`Please upload all ${slotsCount} photos before ordering! Missing: ${missing.join(', ')}`, "error");
      return;
    }

    const uploadedPhotosList = Object.keys(uploadedPhotosMap).map(k => ({
      slot: parseInt(k),
      name: `Image ${k}`,
      url: uploadedPhotosMap[k]
    }));

    const checkoutItem = {
      productId: currentProduct.productId,
      productName: currentProduct.productName,
      category: currentProduct.categoryLabel,
      basePrice: currentProduct.basePrice,
      price: currentPrice,
      productImage: currentProduct.productImage,
      croppedImage: uploadedPhotosMap[1] || currentProduct.productImage,
      uploadedPhotos: uploadedPhotosList,
      size: selectedSize,
      quantity: selectedQuantity,
      customization: {
        orientation: selectedOrientation,
        ledTone: currentCategory === 'led' ? selectedLEDTone : null,
        slotsCount: slotsCount
      }
    };

    window.addItemToCart(checkoutItem, selectedQuantity, selectedSize, checkoutItem.croppedImage, checkoutItem.customization);
    if (redirectToCheckout) {
      window.location.href = 'checkout.html';
    }
    return;
  }

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
      uploadedPhotos: [{ name: 'Uploaded Photo 1', url: uploadedImageBase64 }],
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


