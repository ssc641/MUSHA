/* =========================================
   MOOSHA MALL ENGINE v3.0
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
                  whatsapp: data.whatsapp || data.phone || "263771111111",
                  facebook: data.facebook || null,
                  email: data.email || null,
                  vendorName: data.vendorName || "Musha Official",
                  priorityScore: data.priorityScore || 0
              });
          });

          const fullInventory = [...furnitureInventory, ...vendorItems];
          fullInventory.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

          window._currentMallInventory = fullInventory; // cache for filtering
          displayFurniture(fullInventory);

          if (countEl) {
              countEl.innerText = `${fullInventory.length} Items in Showroom`;
          }
      }, (error) => {
          console.error("Mall sync error:", error);
          window._currentMallInventory = furnitureInventory;
          displayFurniture(furnitureInventory);
          if (countEl) countEl.innerText = `${furnitureInventory.length} Items in Showroom`;
      });
}

/* =========================================
   RENDERING
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
        const delay = index * 0.05; // stagger animation

        return `
            <div class="item-card" style="animation-delay: ${delay}s">
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
   UTILITIES
   ========================================= */

function negotiateWA(itemName, phone) {
    const targetPhone = phone || "263771111111";
    const msg = `Hi Musha Mall, I'm interested in the ${itemName}. Is it still available?`;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
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
