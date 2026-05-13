
# Update furniture.js with COMPARE PRICE feature and LOUD negotiate button
furniture_js_v3 = '''/* =========================================
   MOOSHA MALL ENGINE v3.0
   With Price Comparison + Direct WhatsApp Chat
   ========================================= */

const furnitureInventory = [
    {
        id: 101,
        name: "Luxury L-Shape Sofa",
        category: "Living Room",
        price: 850,
        image: "assets/sofa1.jpg",
        whatsapp: "263771111111",
        description: "Premium velvet finish, 5-seater luxury."
    },
    {
        id: 102,
        name: "Modern Kitchen Island",
        category: "Kitchen",
        price: 450,
        image: "assets/island1.jpg",
        whatsapp: "263771111111",
        description: "Marble top with built-in storage."
    }
];

/* =========================================
   LIVE SYNC FROM FIRESTORE
   ========================================= */

function syncLiveMall() {
    const grid = document.getElementById('mall-grid');
    const countEl = document.getElementById('mall-count');
    
    if (!grid) return;

    db.collection("vendor_inventory")
      .where("status", "==", "active")
      .where("placementTag", "==", "mall")
      .onSnapshot((querySnapshot) => {
          let vendorItems = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              vendorItems.push({
                  id: doc.id,
                  name: data.name || "Unnamed Item",
                  category: data.category || "General",
                  price: Number(data.price) || 0,
                  image: data.image || "assets/musha.png",
                  whatsapp: data.whatsapp || "263771111111",
                  facebook: data.facebook || null,
                  email: data.email || null,
                  vendorName: data.vendorName || "Musha Official",
                  priorityScore: data.priorityScore || 0
              });
          });

          const fullInventory = [...furnitureInventory, ...vendorItems];
          fullInventory.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

          window._currentMallInventory = fullInventory;
          displayFurniture(fullInventory);
          
          if (countEl) {
              countEl.innerText = `${fullInventory.length} Items in Showroom`;
          }
      }, (error) => {
          console.error("Mall sync error:", error);
          window._currentMallInventory = furnitureInventory;
          displayFurniture(furnitureInventory);
          if (countEl) {
              countEl.innerText = `${furnitureInventory.length} Items in Showroom`;
          }
      });
}

/* =========================================
   RENDERING WITH COMPARE + NEGOTIATE
   ========================================= */

function displayFurniture(items) {
    const grid = document.getElementById('mall-grid');
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = `<div class="empty-msg"><i class="fas fa-box-open" style="font-size:2rem; display:block; margin-bottom:15px; color:var(--musha-gold);"></i>No items found in this category.</div>`;
        return;
    }

    grid.innerHTML = items.map((item, index) => {
        const fbIcon = item.facebook ? `<a href="${item.facebook}" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>` : '';
        const emailIcon = item.email ? `<a href="mailto:${item.email}" title="Email"><i class="fas fa-envelope"></i></a>` : '';
        const delay = index * 0.05;

        return `
            <div class="item-card animate-fade" style="animation-delay: ${delay}s">
                <div class="card-img-container">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    ${item.priorityScore > 0 ? '<span class="promo-badge">HOT</span>' : ''}
                </div>
                <div class="card-info">
                    <div class="vendor-tag">
                        <i class="fas fa-store"></i> ${item.vendorName || 'Musha Official'}
                    </div>
                    <h3>${item.name}</h3>
                    <p class="category">${item.category}</p>
                    <p class="price-tag">$${Number(item.price).toLocaleString()}</p>
                    
                    <!-- MAIN NEGOTIATE BUTTON - LOUD AND CLEAR -->
                    <button class="negotiate-btn-main" onclick="negotiateWA('${item.name}', '${item.whatsapp}')">
                        <i class="fab fa-whatsapp"></i> CHAT TO BUY
                    </button>
                    
                    <!-- SECONDARY ACTIONS ROW -->
                    <div class="card-actions-row">
                        <button class="compare-btn" onclick="showComparePrices('${item.id}')">
                            <i class="fas fa-balance-scale"></i> Compare Price
                        </button>
                        <div class="extra-channels">
                            ${fbIcon}
                            ${emailIcon}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/* =========================================
   COMPARE PRICES LOGIC
   ========================================= */

function showComparePrices(itemId) {
    const allItems = window._currentMallInventory || furnitureInventory;
    const selectedItem = allItems.find(i => String(i.id) === String(itemId));
    
    if (!selectedItem) {
        showToast("Item not found", "error");
        return;
    }
    
    // Find similar items: same category, within 50% price range, exclude self
    const similarItems = allItems.filter(item => {
        if (String(item.id) === String(itemId)) return false;
        if (item.category !== selectedItem.category) return false;
        
        const priceDiff = Math.abs(item.price - selectedItem.price) / selectedItem.price;
        return priceDiff <= 0.5; // Within 50% price range
    }).slice(0, 6); // Max 6 comparisons
    
    // Build modal content
    const body = document.getElementById('compare-modal-body');
    if (!body) {
        showToast("Comparison system loading...", "info");
        return;
    }
    
    let similarHTML = '';
    
    if (similarItems.length === 0) {
        similarHTML = `
            <div class="compare-empty">
                <i class="fas fa-search"></i>
                <p>No similar items found in ${selectedItem.category} category.</p>
                <p style="font-size:0.85rem; margin-top:10px;">This item is unique in our showroom!</p>
            </div>
        `;
    } else {
        similarHTML = `
            <div class="compare-divider">
                <span>Similar ${selectedItem.category} Items (${similarItems.length} found)</span>
            </div>
            <div class="compare-grid">
                ${similarItems.map(item => {
                    const diff = item.price - selectedItem.price;
                    const diffPercent = ((diff / selectedItem.price) * 100).toFixed(0);
                    let diffClass, diffText;
                    
                    if (diff < 0) {
                        diffClass = 'cheaper';
                        diffText = `${Math.abs(diffPercent)}% cheaper`;
                    } else if (diff > 0) {
                        diffClass = 'expensive';
                        diffText = `${diffPercent}% more expensive`;
                    } else {
                        diffClass = 'same';
                        diffText = 'Same price';
                    }
                    
                    return `
                        <div class="compare-item">
                            <img src="${item.image}" alt="${item.name}" loading="lazy">
                            <div class="compare-item-info">
                                <h4>${item.name}</h4>
                                <p class="price">$${Number(item.price).toLocaleString()}</p>
                                <p class="price-diff ${diffClass}">${diffText}</p>
                                <p class="vendor"><i class="fas fa-store"></i> ${item.vendorName || 'Musha'}</p>
                                <button class="compare-wa-btn" onclick="negotiateWA('${item.name}', '${item.whatsapp}'); closeCompareModal();">
                                    <i class="fab fa-whatsapp"></i> Chat Seller
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    body.innerHTML = `
        <div class="compare-selected">
            <img src="${selectedItem.image}" alt="${selectedItem.name}">
            <div class="compare-selected-info">
                <h3>${selectedItem.name}</h3>
                <p class="compare-price">$${Number(selectedItem.price).toLocaleString()}</p>
                <p style="color:var(--text-secondary); font-size:0.9rem;">${selectedItem.category} | ${selectedItem.vendorName || 'Musha Official'}</p>
                <span class="compare-badge">Selected Item</span>
            </div>
        </div>
        ${similarHTML}
        <div style="text-align:center; margin-top:25px; padding-top:20px; border-top:1px solid var(--border-subtle);">
            <button class="negotiate-btn-main" onclick="negotiateWA('${selectedItem.name}', '${selectedItem.whatsapp}'); closeCompareModal();" style="max-width:300px; margin:0 auto;">
                <i class="fab fa-whatsapp"></i> NEGOTIATE THIS ITEM
            </button>
        </div>
    `;
    
    openCompareModal();
}

/* =========================================
   UTILITIES
   ========================================= */

function negotiateWA(itemName, phone) {
    const targetPhone = phone || "263771111111";
    const msg = `Hi Musha Mall, I'm interested in the ${itemName}. Is it still available?`;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function showProductDetails(id) {
    alert(`Product ID: ${id}`);
}

/* =========================================
   INITIALIZATION
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mall-grid')) {
        syncLiveMall();

        const categoryFilter = document.getElementById('mall-category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                const all = window._currentMallInventory || furnitureInventory;
                const filtered = e.target.value === 'all' 
                    ? all 
                    : all.filter(item => item.category === e.target.value);
                displayFurniture(filtered);
            });
        }

        const priceSort = document.getElementById('price-sort-select');
        if (priceSort) {
            priceSort.addEventListener('change', (e) => {
                const all = [...(window._currentMallInventory || furnitureInventory)];
                if (e.target.value === 'low') {
                    all.sort((a, b) => a.price - b.price);
                } else if (e.target.value === 'high') {
                    all.sort((a, b) => b.price - a.price);
                } else {
                    all.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
                }
                displayFurniture(all);
            });
        }
    }
});
'''

with open('/mnt/agents/output/furniture.js', 'w') as f:
    f.write(furniture_js_v3)

print("furniture.js updated with COMPARE PRICE + CHAT TO BUY button")
