/* =========================================
   1. THE MASTER INVENTORY (Hardcoded)
   ========================================= */
const carInventory = [
    {
        id: 1,
        year: "2026",
        category: "SUV",
        brand: "Toyota",
        model: "Land Cruiser 300",
        trim: "GR-Sport",
        dealership: "Gweru Central Motors",
        price: "$120,000",
        isVerified: true, 
        phone: "263771111111", 
        image: "assets/lc300.jpg"
    },
    {
        id: 2,
        year: "2025",
        category: "Sedan",
        brand: "Mercedes-Benz",
        model: "C-Class",
        trim: "C300 AMG Line",
        dealership: "Gweru Central Motors",
        price: "$75,000",
        isVerified: true,
        phone: "263771111111",
        image: "assets/c-class.jpg"
    }
];

/* =========================================
   2. SYSTEM SYNC: LIVE INVENTORY
   ========================================= */

// This function merges hardcoded cars with Approved Vendor Hub items
function getLiveAutoInventory() {
    const vendorItems = JSON.parse(localStorage.getItem('musha_vendor_inventory')) || [];
    
    const approvedVendorCars = vendorItems.filter(item => 
        item.status === 'active' && item.placementTag === 'lot'
    );

    // Combine them
    return [...carInventory, ...approvedVendorCars];
}

/* =========================================
   3. RENDERING THE SHOWROOM
   ========================================= */

function displayCars(cars) {
    const carGrid = document.getElementById('car-results-grid');
    const countDisplay = document.getElementById('car-count');
    
    if (!carGrid) return;

    // Update the counter
    if (countDisplay) {
        countDisplay.innerHTML = `<i class="fas fa-car"></i> Showing ${cars.length} Vehicles in Gweru Hub`;
    }

    carGrid.innerHTML = cars.map(car => `
        <div class="car-card ${car.onPromotion ? 'promo-active' : ''}">
            <div class="image-container">
                <img src="${car.image}" alt="${car.model}" onerror="this.src='assets/musha.png'">
                <div class="price-badge">${typeof car.price === 'number' ? '$' + car.price : car.price}</div>
            </div>
            <div class="car-details">
                <h3 class="car-title">${car.brand || ''} ${car.model}</h3>
                <p class="car-meta">${car.year || '2026'} • ${car.trim || 'Standard'}</p>
                
                <p class="vendor-tag">
                    <i class="fas fa-store"></i> ${car.vendorName || car.dealership || "Musha Hub"}
                </p>
                
                <div class="action-buttons">
                    <button class="negotiate-wa" onclick="negotiateWhatsApp('${car.brand || ''} ${car.model}', '${car.phone}')">
                        <i class="fab fa-whatsapp"></i> CONTACT
                    </button>
                    <button class="view-btn" onclick="makeOffer('${car.model}')">
                        MAKE OFFER
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/* =========================================
   4. FILTER ENGINE
   ========================================= */

function filterCars() {
    const fullStock = getLiveAutoInventory();
    
    const brand = document.getElementById('brand-select').value;
    const cat = document.getElementById('category-select').value;
    const dealer = document.getElementById('dealership-select').value;

    const filtered = fullStock.filter(car => {
        return (brand === 'all' || car.brand === brand) &&
               (cat === 'all' || car.category === cat) &&
               (dealer === 'all' || (car.dealership === dealer || car.vendorName === dealer));
    });

    displayCars(filtered);
}

/* =========================================
   5. UTILITIES & INITIALIZATION
   ========================================= */

function negotiateWhatsApp(carName, phone) {
    const targetPhone = phone || "263771111111";
    const msg = `Hi, I saw the ${carName} on StaTech Auto. Is it available for viewing?`;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function makeOffer(carName) {
    const offer = prompt(`Enter your cash offer for the ${carName}:`);
    if (offer) {
        alert(`Offer for ${carName} sent to the Vendor Hub for review!`);
    }
}

function resetFilters() {
    document.getElementById('brand-select').value = 'all';
    document.getElementById('category-select').value = 'all';
    document.getElementById('dealership-select').value = 'all';
    displayCars(getLiveAutoInventory());
}

// THE ENGINE START
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('car-results-grid')) {
        const liveStock = getLiveAutoInventory();
        
        // Sort: Promoted items first
        liveStock.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
        
        displayCars(liveStock);

        // Auto-filter listeners
        const filters = ['brand-select', 'category-select', 'dealership-select'];
        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', filterCars);
        });
    }
});
