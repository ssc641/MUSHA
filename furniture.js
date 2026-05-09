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

function getLiveMallInventory() {
    // 1. Get vendor items from local storage
    const vendorItems = JSON.parse(localStorage.getItem('musha_vendor_inventory')) || [];
    
    // 2. Filter for Approved Mall items only
    const approvedMallItems = vendorItems.filter(item => 
        item.status === 'active' && item.placementTag === 'mall'
    );

    // 3. Combine with hardcoded furniture
    return [...furnitureInventory, ...approvedMallItems];
}

/* =========================================
   3. RENDERING THE MALL SHOWROOM
   ========================================= */

function displayFurniture(items) {
    const mallGrid = document.getElementById('mall-grid');
    const countDisplay = document.getElementById('mall-count');

    if (!mallGrid) return;

    if (countDisplay) {
        countDisplay.innerHTML = `<i class="fas fa-store"></i> ${items.length} Items in the Grand Mall`;
    }

    mallGrid.innerHTML = items.map(item => `
        <div class="furniture-card ${item.onPromotion ? 'promo-active' : ''}">
            <div class="f-image-container">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/musha.png'">
                ${item.onPromotion ? '<span class="promo-badge">PROMO</span>' : ''}
            </div>
            
            <div class="f-details">
                <h3 class="f-title">${item.name}</h3>
                <p class="f-category">${item.category}</p>
                <p class="f-price">$${item.price}</p>
                
                <p class="vendor-tag">
                    <i class="fas fa-user-tag"></i> ${item.vendorName || "Musha Official"}
                </p>

                <div class="f-actions">
                    <button class="mall-contact-btn" onclick="negotiateWA('${item.name}', '${item.whatsapp || item.phone || '263771111111'}')">
                        <i class="fab fa-whatsapp"></i> CONTACT
                    </button>
                    <button class="f-view-btn" onclick="showProductDetails(${item.id})">
                        DETAILS
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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
 
