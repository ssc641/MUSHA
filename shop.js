/* =========================================
   STA-TECH SHOP ENGINE: VENDOR HUB LOGIC
   ========================================= */

let myShopInventory = JSON.parse(localStorage.getItem('musha_vendor_inventory')) || [];

/**
 * THE ANALYTICS ENGINE
 * Calculates Stock Value vs Actual Sales
 */
function updateVendorStats() {
    const totalPotential = myShopInventory
        .filter(item => !item.isSold)
        .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    const actualSales = myShopInventory
        .filter(item => item.isSold)
        .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    const liveCount = myShopInventory.filter(item => item.status === 'active' && !item.isSold).length;

    // Update UI Elements
    if(document.getElementById('total-stock-value')) {
        document.getElementById('total-stock-value').innerText = `$${totalPotential.toLocaleString()}`;
        document.getElementById('total-sales-revenue').innerText = `$${actualSales.toLocaleString()}`;
        document.getElementById('live-items-count').innerText = liveCount;
    }
}

/**
 * Mark as Sold: Moves item to "Profit" category
 */
function markAsSold(id) {
    const item = myShopInventory.find(i => i.id === id);
    if (item) {
        item.isSold = true;
        item.status = 'sold'; // Removes it from Mall/Auto Lot
        localStorage.setItem('musha_vendor_inventory', JSON.stringify(myShopInventory));
        renderMyShop();
    }
}

/**
 * Render the "My Shop" Dashboard
 */
function renderMyShop() {
    const container = document.getElementById('my-shop-grid');
    if (!container) return;

    updateVendorStats(); // Refresh stats on every render

    if (myShopInventory.length === 0) {
        container.innerHTML = `<p class="empty-msg">Your shop is empty.</p>`;
        return;
    }

    container.innerHTML = myShopInventory.map(item => {
        if (item.isSold) return ''; // We can create a 'History' tab for these later

        let statusClass = item.status === 'active' ? 'status-active' : 'status-pending';
        let statusText = item.status === 'active' ? 'LIVE' : 'VETTING';

        return `
            <div class="shop-item-card ${item.onPromotion ? 'promo-active' : ''}">
                <img src="${item.image}" alt="preview">
                <div class="shop-item-details">
                    <h4>${item.name}</h4>
                    <p class="gold-text">$${item.price}</p>
                    <div class="item-tags">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="shop-actions">
                        <button onclick="markAsSold(${item.id})" class="sold-btn">
                            <i class="fas fa-hand-holding-usd"></i> MARK SOLD
                        </button>
                        <button onclick="deleteListing(${item.id})" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Handle Submission with Analytics Support
 */
function handleShopSubmission(event) {
    event.preventDefault();

    const category = document.getElementById('p-category').value;
    const itemName = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const placement = (category === 'Vehicle') ? 'lot' : 'mall';

    const newItem = {
        id: Date.now(),
        name: itemName,
        price: parseFloat(price),
        category: category,
        placementTag: placement,
        status: 'pending',
        isSold: false,
        onPromotion: false,
        vendorName: localStorage.getItem('musha_shop_name') || "Independent Seller",
        image: document.getElementById('output-preview').src || 'assets/musha.png'
    };

    myShopInventory.push(newItem);
    localStorage.setItem('musha_vendor_inventory', JSON.stringify(myShopInventory));
    showSuccessState(itemName, placement);
}

// ... Keep your existing deleteListing, togglePromotion, and switchDashboardTab functions ...

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('my-shop-grid')) renderMyShop();
});
