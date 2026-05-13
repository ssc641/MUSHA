/* =========================================
   MOOSHA AUTO LOT ENGINE v3.0
   With Price Comparison + Direct WhatsApp Chat
   ========================================= */

const carInventory = [
    { id: 1, year: "2026", category: "SUV", brand: "Toyota", model: "Land Cruiser 300", trim: "GR-Sport", dealership: "Gweru Central Motors", price: 120000, isVerified: true, phone: "263771111111", image: "assets/lc300.jpg" },
    { id: 2, year: "2025", category: "Sedan", brand: "Mercedes-Benz", model: "C-Class", trim: "C300 AMG Line", dealership: "Gweru Central Motors", price: 75000, isVerified: true, phone: "263771111111", image: "assets/c-class.jpg" }
];

let liveCarInventory = [];

function syncLiveAutoLot() {
    db.collection("vendor_inventory").where("status", "==", "active").where("placementTag", "==", "lot")
      .onSnapshot((querySnapshot) => {
          let vendorCars = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              vendorCars.push({ id: doc.id, year: data.year || "", category: data.category || "Vehicle", brand: data.brand || (data.name ? data.name.split(' ')[0] : "Unknown"), model: data.model || data.name || "Unknown", trim: data.trim || "", dealership: data.vendorName || data.dealership || "Independent", price: Number(data.price) || 0, isVerified: true, phone: data.whatsapp || data.phone || "263771111111", email: data.email || null, facebook: data.facebook || null, image: data.image || "assets/musha.png", priorityScore: data.priorityScore || 0 });
          });
          liveCarInventory = [...carInventory, ...vendorCars];
          liveCarInventory.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
          displayCars(liveCarInventory);
          updateCarCount(liveCarInventory.length);
      }, (error) => {
          console.error("Auto lot sync error:", error);
          liveCarInventory = [...carInventory];
          displayCars(liveCarInventory);
          updateCarCount(liveCarInventory.length);
      });
}

function updateCarCount(count) {
    const el = document.getElementById('car-count');
    if (el) el.innerHTML = `<i class="fas fa-info-circle"></i> ${count} Vehicle${count !== 1 ? 's' : ''} in Stock`;
}

function displayCars(cars) {
    const grid = document.getElementById('car-results-grid');
    if (!grid) return;
    if (cars.length === 0) {
        grid.innerHTML = `<div class="empty-msg"><i class="fas fa-car" style="font-size:2rem; display:block; margin-bottom:15px; color:var(--musha-gold);"></i>No vehicles match your filters.</div>`;
        return;
    }
    grid.innerHTML = cars.map((car, index) => {
        const fbIcon = car.facebook ? `<a href="${car.facebook}" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>` : '';
        const emailIcon = car.email ? `<a href="mailto:${car.email}" title="Email"><i class="fas fa-envelope"></i></a>` : '';
        const delay = index * 0.05;
        return `
            <div class="car-card animate-fade" style="animation-delay: ${delay}s">
                <div class="car-image-container">
                    <img src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy">
                    ${car.isVerified ? '<span class="verified-badge"><i class="fas fa-check"></i> Verified</span>' : ''}
                    ${car.priorityScore > 0 ? '<span class="promo-badge">FEATURED</span>' : ''}
                </div>
                <div class="car-info">
                    <h3>${car.year} ${car.brand} ${car.model}</h3>
                    <p class="car-specs">${car.trim} | ${car.dealership} | ${car.category}</p>
                    <span class="car-price">$${Number(car.price).toLocaleString()}</span>
                    <button class="negotiate-btn-main" onclick="negotiateWhatsApp('${car.brand} ${car.model}', '${car.phone}')"><i class="fab fa-whatsapp"></i> CHAT TO BUY</button>
                    <div class="card-actions-row">
                        <button class="compare-btn" onclick="showCompareCarPrices('${car.id}')"><i class="fas fa-balance-scale"></i> Compare Price</button>
                        <button class="view-btn" onclick="makeOffer('${car.brand} ${car.model}')"><i class="fas fa-hand-holding-usd"></i> Make Offer</button>
                    </div>
                    <div class="extra-channels" style="margin-top:12px;">${fbIcon}${emailIcon}</div>
                </div>
            </div>`;
    }).join('');
}

function showCompareCarPrices(carId) {
    const selectedCar = liveCarInventory.find(c => String(c.id) === String(carId));
    if (!selectedCar) { showToast("Vehicle not found", "error"); return; }
    const similarCars = liveCarInventory.filter(car => {
        if (String(car.id) === String(carId)) return false;
        if (car.category !== selectedCar.category) return false;
        return (Math.abs(car.price - selectedCar.price) / selectedCar.price) <= 0.4;
    }).slice(0, 6);
    const body = document.getElementById('compare-modal-body');
    if (!body) { showToast("Comparison system loading...", "info"); return; }
    let similarHTML = '';
    if (similarCars.length === 0) {
        similarHTML = `<div class="compare-empty"><i class="fas fa-search"></i><p>No similar ${selectedCar.category}s found.</p></div>`;
    } else {
        similarHTML = `<div class="compare-divider"><span>Similar ${selectedCar.category}s (${similarCars.length})</span></div><div class="compare-grid">` +
            similarCars.map(car => {
                const diff = car.price - selectedCar.price;
                const diffPercent = ((diff / selectedCar.price) * 100).toFixed(0);
                let diffClass = diff < 0 ? 'cheaper' : diff > 0 ? 'expensive' : 'same';
                let diffText = diff < 0 ? `Save ${Math.abs(diffPercent)}% ($${Math.abs(diff).toLocaleString()})` : diff > 0 ? `+${diffPercent}% more ($${diff.toLocaleString()})` : 'Same price range';
                return `<div class="compare-item"><img src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy"><div class="compare-item-info"><h4>${car.year} ${car.brand} ${car.model}</h4><p class="price">$${Number(car.price).toLocaleString()}</p><p class="price-diff ${diffClass}">${diffText}</p><p class="vendor"><i class="fas fa-car"></i> ${car.dealership || 'Independent'}</p><button class="compare-wa-btn" onclick="negotiateWhatsApp('${car.brand} ${car.model}', '${car.phone}'); closeCompareModal();"><i class="fab fa-whatsapp"></i> Chat Seller</button></div></div>`;
            }).join('') + '</div>';
    }
    body.innerHTML = `
        <div class="compare-selected"><img src="${selectedCar.image}" alt="${selectedCar.brand} ${selectedCar.model}"><div class="compare-selected-info"><h3>${selectedCar.year} ${selectedCar.brand} ${selectedCar.model}</h3><p class="compare-price">$${Number(selectedCar.price).toLocaleString()}</p><p style="color:var(--text-secondary); font-size:0.9rem;">${selectedCar.dealership || 'Independent'} | ${selectedCar.category}</p><span class="compare-badge">Selected Vehicle</span></div></div>
        ${similarHTML}
        <div style="text-align:center; margin-top:25px; padding-top:20px; border-top:1px solid var(--border-subtle);"><button class="negotiate-btn-main" onclick="negotiateWhatsApp('${selectedCar.brand} ${selectedCar.model}', '${selectedCar.phone}'); closeCompareModal();" style="max-width:300px; margin:0 auto;"><i class="fab fa-whatsapp"></i> NEGOTIATE THIS CAR</button></div>`;
    openCompareModal();
}

function filterCars() {
    const brand = document.getElementById('brand-select').value;
    const cat = document.getElementById('category-select').value;
    const dealer = document.getElementById('dealership-select').value;
    const year = document.getElementById('year-select').value;
    const filtered = liveCarInventory.filter(car => {
        return (brand === 'all' || (car.brand && car.brand.toLowerCase() === brand.toLowerCase())) &&
               (cat === 'all' || (car.category && car.category.toLowerCase() === cat.toLowerCase())) &&
               (dealer === 'all' || (car.dealership && car.dealership.toLowerCase().includes(dealer.toLowerCase()))) &&
               (year === 'all' || (car.year && car.year === year));
    });
    displayCars(filtered);
    updateCarCount(filtered.length);
}

function negotiateWhatsApp(carName, phone) {
    const targetPhone = phone || "263771111111";
    const msg = `Hi, I saw the ${carName} on StaTech Auto. Is it available for viewing?`;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function makeOffer(carName) {
    const offer = prompt(`Enter your cash offer for the ${carName} (USD):`);
    if (offer && !isNaN(offer) && Number(offer) > 0) showToast(`Offer of $${Number(offer).toLocaleString()} sent to vendor!`, 'success');
}

function resetFilters() {
    document.getElementById('brand-select').value = 'all';
    document.getElementById('category-select').value = 'all';
    document.getElementById('dealership-select').value = 'all';
    document.getElementById('year-select').value = 'all';
    displayCars(liveCarInventory);
    updateCarCount(liveCarInventory.length);
}

document.addEventListener('DOMContentLoaded', () => { if (document.getElementById('car-results-grid')) syncLiveAutoLot(); });
