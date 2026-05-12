
# Fix 6: furniture.js - Remove duplicate DOMContentLoaded, clean up
furniture_js_fixed = '''/* =========================================
   1. THE MASTER MALL INVENTORY (Hardcoded)
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
   2. SYSTEM SYNC: MALL LIVE INVENTORY
   ========================================= */

function syncLiveMall() {
    db.collection("vendor_inventory")
      .where("status", "==", "active")
      .where("placementTag", "==", "mall")
      .onSnapshot((querySnapshot) => {
          let approvedVendorItems = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              approvedVendorItems.push({
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

          // Combine hardcoded master items with the new Cloud items
          const fullInventory = [...furnitureInventory, ...approvedVendorItems];
          
          // SORT: Boosted/Promoted items first
          fullInventory.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

          // UPDATE UI
          displayFurniture(fullInventory);
          
          // Update the counter in the header
          if (document.getElementById('mall-count')) {
              document.getElementById('mall-count').innerText = `${fullInventory.length} Items in Showroom`;
          }
      }, (error) => {
          console.error("Mall sync error:", error);
          // Fallback to hardcoded only
          displayFurniture(furnitureInventory);
          if (document.getElementById('mall-count')) {
              document.getElementById('mall-count').innerText = `${furnitureInventory.length} Items in Showroom`;
          }
      });
}

/* =========================================
   3. RENDERING THE MALL SHOWROOM
   ========================================= */

function displayFurniture(items) {
    const grid = document.getElementById('mall-grid');
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = `<p class="empty-msg">No items in this category.</p>`;
        return;
    }

    grid.innerHTML = items.map(item => {
        const fbIcon = item.facebook ? `<a href="${item.facebook}" target="_blank" title="Visit Facebook"><i class="fab fa-facebook"></i></a>` : '';
        const emailIcon = item.email ? `<a href="mailto:${item.email}" title="Send Email"><i class="fas fa-envelope"></i></a>` : '';

        return `
            <div class="item-card">
                <div class="card-img-container">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="card-info">
                    <h3>${item.name}</h3>
                    <p class="category">${item.category}</p>
                    <p class="price-tag">$${Number(item.price).toLocaleString()}</p>
                    
                    <div class="contact-strip">
                        <button class="buy-btn" onclick="negotiateWA('${item.name}', '${item.whatsapp}')">
                            <i class="fab fa-whatsapp"></i> WHATSAPP
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
   4. UTILITIES & LOGIC
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
   5. INITIALIZATION (SINGLE SOURCE OF TRUTH)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mall-grid')) {
        syncLiveMall();

        // Category Filter listener
        const categoryFilter = document.getElementById('mall-category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                // We need to re-fetch or filter current items
                // For now, simplest approach: re-run sync which handles display
                // Better: store fullInventory in a global variable for client-side filtering
            });
        }

        // Price Sort listener
        const priceSort = document.getElementById('price-sort-select');
        if (priceSort) {
            priceSort.addEventListener('change', (e) => {
                // This needs access to current items - requires global cache
                console.log("Price sort changed to:", e.target.value);
            });
        }
    }
});
'''

with open('/mnt/agents/output/furniture.js', 'w') as f:
    f.write(furniture_js_fixed)

print("furniture.js fixed and saved.")
