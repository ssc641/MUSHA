/* =========================================
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

// NEW MISSION: Listen to the Cloud for Active Mall Items
function syncLiveMall() {
    db.collection("vendor_inventory")
      .where("status", "==", "active")
      .where("placementTag", "==", "mall")
      .onSnapshot((querySnapshot) => {
          let approvedVendorItems = [];
          querySnapshot.forEach((doc) => {
              approvedVendorItems.push({ id: doc.id, ...doc.data() });
          });

          // Combine hardcoded master items with the new Cloud items
          const fullInventory = [...furnitureInventory, ...approvedVendorItems];
          
          // SORT: Boosted/Promoted items first
          fullInventory.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

          // UPDATE UI: This automatically refreshes the grid when data changes
          displayFurniture(fullInventory);
          
          // Update the counter in the header
          if (document.getElementById('mall-count')) {
              document.getElementById('mall-count').innerText = `${fullInventory.length} Items in Showroom`;
          }
      });
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the mall grid page
    if (document.getElementById('mall-grid')) {
        
        // START THE CLOUD ENGINE
        syncLiveMall(); 

        // Optional: Category Filter listener
        const categoryFilter = document.getElementById('mall-category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                // Since syncLiveMall handles the main display, 
                // you might need a global variable to store fullInventory 
                // if you want to filter without re-fetching from the cloud.
            });
        }
    }
});

/* =========================================
   3. RENDERING THE MALL SHOWROOM
   ========================================= */

function displayFurniture(items) {
    const grid = document.getElementById('mall-grid');
    grid.innerHTML = items.map(item => {
        // Logic: Only show icons if the vendor provided the data
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
                    <p class="price-tag">$${item.price.toLocaleString()}</p>
                    
                    <div class="contact-strip">
                        <button class="buy-btn" onclick="contactVendor('${item.vendorName}', '${item.name}', '${item.whatsapp}')">
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
    const msg = `Hi Musha Mall, I'm interested in the ${itemName}. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function showProductDetails(id) {
    const allItems = getLiveMallInventory();
    const item = allItems.find(i => i.id === id);
    if (item) {
        alert(`Product: ${item.name}\nCategory: ${item.category}\nPrice: $${item.price}\nSeller: ${item.vendorName || 'Musha Official'}`);
    }
}

/* =========================================
   5. INITIALIZATION
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mall-grid')) {
        const liveMall = getLiveMallInventory();

        // SORT: Boosted/Promoted items first (The Monetization Rule)
        liveMall.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

        displayFurniture(liveMall);

        // Optional: Category Filter listener
        const categoryFilter = document.getElementById('mall-category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                const filtered = liveMall.filter(item => 
                    e.target.value === 'all' || item.category === e.target.value
                );
                displayFurniture(filtered);
            });
        }
    }
});

// Add this inside the DOMContentLoaded block in furniture.js
const priceSort = document.getElementById('price-sort-select');
if (priceSort) {
    priceSort.addEventListener('change', (e) => {
        const currentItems = getLiveMallInventory(); // Get everything
        
        if (e.target.value === 'low') {
            currentItems.sort((a, b) => a.price - b.price); // Lowest Price First
        } else if (e.target.value === 'high') {
            currentItems.sort((a, b) => b.price - a.price); // Highest Price First
        }
        
        displayFurniture(currentItems);
    });
}
 
