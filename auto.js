/* =========================================
   1. THE MASTER INVENTORY (The Database)
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
    },
    {
        id: 3,
        year: "2024",
        category: "Hatchback",
        brand: "Volkswagen",
        model: "Golf 7",
        trim: "TSI",
        dealership: "Independent Seller",
        price: "$12,500",
        isVerified: false,
        phone: "263782222222",
        image: "assets/golf.jpg"
    }
];

/* =========================================
   2. THE FILTERING ENGINE
   ========================================= */
function filterCars() {
    const dealerVal = document.getElementById('dealership-select').value;
    const yearVal = document.getElementById('year-select').value;
    const brandVal = document.getElementById('brand-select').value;
    const catVal = document.getElementById('category-select').value;

    const filteredResults = carInventory.filter(car => {
        const matchesDealer = (dealerVal === "all" || car.dealership === dealerVal);
        const matchesYear = (yearVal === "all" || car.year === yearVal);
        const matchesBrand = (brandVal === "all" || car.brand === brandVal);
        const matchesCat = (catVal === "all" || car.category === catVal);

        return matchesDealer && matchesYear && matchesBrand && matchesCat;
    });

    displayCars(filteredResults);
}

/* =========================================
   3. THE RENDER ENGINE (UI Generator)
   ========================================= */
function displayCars(cars) {
    const grid = document.getElementById('car-results-grid');
    const countDisplay = document.getElementById('car-count');

    if (!grid) return; 

    // Update the counter
    if (countDisplay) {
        countDisplay.innerHTML = `<i class="fas fa-car"></i> Showing ${cars.length} Verified Vehicles`;
    }

    if (cars.length === 0) {
        grid.innerHTML = `
            <div class="empty-lot" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <i class="fas fa-search fa-3x" style="color: #444;"></i>
                <p style="margin-top: 15px;">No vehicles found. Try adjusting your filters.</p>
            </div>`;
        return;
    }

    grid.innerHTML = cars.map(car => `
        <div class="car-card">
            <div class="car-image-container">
                ${car.isVerified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Vetted</span>' : ''}
                <img src="${car.image}" alt="${car.brand} ${car.model}" onerror="this.src='assets/musha.png'">
            </div>
            <div class="car-info">
                <span class="car-specs">${car.year} | ${car.category}</span>
                <h3 class="car-title">${car.brand} ${car.model}</h3>
                <span class="car-price">${car.price}</span>
                
                <p class="car-location"><i class="fas fa-map-marker-alt"></i> ${car.dealership}</p>
                
                ${!car.isVerified ? 
                    `<p class="safety-warning" style="color: #ff4b2b; font-size: 0.8rem; margin: 10px 0;"><b>Safety:</b> Meet in public. No deposits.</p>` : 
                    `<p class="safety-verified" style="color: var(--musha-green); font-size: 0.8rem; margin: 10px 0;"><i class="fas fa-shield-alt"></i> Hub Verified Stock</p>`
                }

                <div class="car-actions">
                    <button class="negotiate-wa" onclick="negotiateWhatsApp('${car.brand} ${car.model}', '${car.phone}')">
                        <i class="fab fa-whatsapp"></i> WHATSAPP
                    </button>
                    <button class="view-btn" onclick="makeOffer('${car.brand} ${car.model}')">
                        OFFER
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function displayCars(cars) {
    const grid = document.getElementById('car-results-grid');
    grid.innerHTML = cars.map(car => `
        <div class="car-card ${car.onPromotion ? 'promo-active' : ''}">
            <div class="card-image">
                <img src="${car.image}" alt="${car.model}">
                ${car.onPromotion ? '<span class="promo-badge">HOT DEAL</span>' : ''}
            </div>
            <div class="card-content">
                <div class="vendor-tag"><i class="fas fa-store"></i> ${car.vendorName || 'StaTech Official'}</div>
                <h3>${car.brand} ${car.model}</h3>
                <p class="price-text">$${car.price}</p>
                
                <div class="card-actions">
                    <button class="wa-btn" onclick="contactVendor('${car.vendorName}', '${car.model}', '${car.phone}')">
                        <i class="fab fa-whatsapp"></i> CONTACT SHOP
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/* =========================================
   4. INTERACTION & UTILITY
   ========================================= */
function negotiateWhatsApp(carName, phone) {
    const msg = `Hi StaTech, I am interested in the ${carName}. Is it available at the Hub?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function makeOffer(carName) {
    const offer = prompt(`Enter your cash offer for the ${carName}:`);
    if (offer) {
        alert(`Your offer of ${offer} has been sent to the hub for review!`);
    }
}

function resetFilters() {
    document.getElementById('dealership-select').value = 'all';
    document.getElementById('year-select').value = 'all';
    document.getElementById('brand-select').value = 'all';
    document.getElementById('category-select').value = 'all';
    displayCars(carInventory);
}

// Initial Load and Auto-Filtering Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('car-results-grid')) {
        displayCars(carInventory);
        
        // Add listeners to dropdowns so it filters automatically
        const filters = ['dealership-select', 'year-select', 'brand-select', 'category-select'];
        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', filterCars);
        });
    }
});

// Add this logic to your display function
const liveAutoInventory = [
    ...carInventory, // Your hardcoded master list
    ...JSON.parse(localStorage.getItem('musha_vendor_inventory')) || []
].filter(item => item.status === 'active' && item.placementTag === 'lot');

// Now call displayCars with this filtered list
displayCars(liveAutoInventory);

// Inside the .map() for your car cards
<div class="car-card">
    <div class="car-details">
        <h3 class="car-title">${car.brand} ${car.model}</h3>
        <p class="vendor-tag"><i class="fas fa-store"></i> ${car.vendorName}</p>
        
        <div class="action-buttons">
            <button class="negotiate-wa" onclick="negotiateWhatsApp('${car.brand} ${car.model}', '${car.phone}')">
                <i class="fab fa-whatsapp"></i> CONTACT SHOP
            </button>
        </div>
    </div>
</div>
