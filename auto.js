const carInventory = [
    { id: 1, year: "2026", brand: "Toyota", model: "Land Cruiser 300", dealership: "Gweru Central Motors", price: "$120,000", image: "assets/lc300.jpg" },
    // ... add the rest of your cars here
];

function filterCars() {
    const dealerVal = document.getElementById('dealership-select').value;
    const yearVal = document.getElementById('year-select').value;
    const brandVal = document.getElementById('brand-select').value;

    const filtered = carInventory.filter(car => {
        return (dealerVal === "all" || car.dealership === dealerVal) &&
               (yearVal === "all" || car.year === yearVal) &&
               (brandVal === "all" || car.brand === brandVal);
    });
    displayCars(filtered);
}

function displayCars(cars) {
    const grid = document.getElementById('car-results-grid');
    if (!grid) return;

    grid.innerHTML = cars.map(car => `
        <div class="car-card">
            <div class="price-badge">${car.price}</div>
            <img src="${car.image}" alt="${car.model}">
            <div class="car-details">
                <h3>${car.brand} ${car.model}</h3>
                <p>📍 ${car.dealership}</p>
            </div>
        </div>
    `).join('');
}

// Auto-load cars when page opens
document.addEventListener('DOMContentLoaded', () => displayCars(carInventory));
