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

// NEW MISSION: Listen to the Cloud for Active Vehicles
function syncAutoLot() {
    db.collection("vendor_inventory")
      .where("status", "==", "active")
      .where("placementTag", "==", "lot")
      .onSnapshot((querySnapshot) => {
          let vendorCars = [];
          querySnapshot.forEach((doc) => {
              vendorCars.push({ id: doc.id, ...doc.data() });
          });

          const totalStock = [...carInventory, ...vendorCars];
          displayCars(totalStock);
          
          if(document.getElementById('car-count')) {
              document.getElementById('car-count').innerText = `${totalStock.length} Vehicles Available`;
          }
      });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('car-results-grid')) {
        syncLiveAutoLot(); // START THE AUTO SYNC
    }
});
/* =========================================
   3. RENDERING THE SHOWROOM
   ========================================= */

function displayCars(cars) {
    const grid = document.getElementById('car-results-grid');
    grid.innerHTML = cars.map(car => {
        const fbIcon = car.facebook ? `<a href="${car.facebook}" target="_blank"><i class="fab fa-facebook"></i></a>` : '';
        const emailIcon = car.email ? `<a href="mailto:${car.email}"><i class="fas fa-envelope"></i></a>` : '';

        return `
            <div class="car-card">
                <img src="${car.image}" alt="${car.brand}">
                <div class="car-details">
                    <h4>${car.year} ${car.brand} ${car.model}</h4>
                    <p class="price">${car.price}</p>
                    
                    <div class="contact-strip">
                        <button class="buy-btn" onclick="negotiateWhatsApp('${car.brand} ${car.model}', '${car.phone}')">
                            <i class="fab fa-whatsapp"></i> NEGOTIATE
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
