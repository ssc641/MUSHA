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
        isVerified: true, // Tier 1 Seller
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
        isVerified: false, // Tier 2 Seller (Shows Warning)
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

    if (!grid) return; // Safety check

    countDisplay.innerText = `Found ${cars.length} vehicles matching your search`;

    if (cars.length === 0) {
        grid.innerHTML = `
            <div class="empty-lot">
                <p>No vehicles found. Try adjusting your filters.</p>
            </div>`;
        return;
    }

    grid.innerHTML = cars.map(car => `
        <div class="car-card ${car.isVerified ? 'verified-card' : 'unverified-card'}">
            
            <div class="trust-badge ${car.isVerified ? 'verified' : 'warning'}">
                <i class="fas ${car.isVerified ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                ${car.isVerified ? 'Verified Hub' : 'Unverified Seller'}
            </div>

            <div class="price-badge">${car.price}</div>
            
            <div class="car-img-container">
                <img src="${car.image}" alt="${car.model}" onerror="this.src='assets/placeholder.jpg'">
            </div>

            <div class="car-details">
                <span class="car-meta">${car.year} | ${car.category}</span>
                <h3 class="car-title">${car.brand} ${car.model}</h3>
                <p class="car-location"><i class="fas fa-map-marker-alt"></i> ${car.dealership}</p>
                
                ${!car.isVerified ? 
                    `<p class="safety-warning">Safety Tip: Meet in a public place. No deposits.</p>` : 
                    `<p class="safety-verified">Vetted by StaTech Logistics.</p>`
                }

                <div class="action-buttons">
                    <button class="negotiate-wa" onclick="negotiateWhatsApp('${car.brand} ${car.model}', '${car.phone}')">
                        <i class="fab fa-whatsapp"></i> Negotiate
                    </button>
                    <button class="view-btn" onclick="makeOffer('${car.model}')">
                        Make Offer
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/* =========================================
   4. INTERACTION FUNCTIONS
   ========================================= */
function negotiateWhatsApp(carName, phone) {
    const msg = `Hi, I saw the ${carName} on Musha Virtual Mall. Is it still available for negotiation?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function makeOffer(carName) {
    const offer = prompt(`Enter your cash offer for the ${carName}:`);
    if (offer) {
        alert(`Offer of ${offer} received! The seller will be notified.`);
    }
}

function resetFilters() {
    document.querySelectorAll('select').forEach(s => s.value = 'all');
    displayCars(carInventory);
}

/* =========================================
   5. INITIALIZE
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    displayCars(carInventory);
});
