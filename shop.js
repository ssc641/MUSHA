/* =========================================
   STA-TECH SHOP ENGINE: VENDOR HUB LOGIC
   ========================================= */

// 1. THE STATE MANAGER (Local Storage for the Shop Owner)
let myShopInventory = JSON.parse(localStorage.getItem('musha_vendor_inventory')) || [];

/**
 * Tab Navigation: Switch between 'Listing Form' and 'My Shop Inventory'
 */
function switchDashboardTab(tabName) {
    const formSection = document.getElementById('sell-form-section');
    const shopSection = document.getElementById('my-shop-section');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(btn => btn.classList.remove('active'));
    
    if (tabName === 'list') {
        formSection.style.display = 'block';
        shopSection.style.display = 'none';
        document.querySelector('[onclick*="list"]').classList.add('active');
    } else {
        formSection.style.display = 'none';
        shopSection.style.display = 'block';
        document.querySelector('[onclick*="manage"]').classList.add('active');
        renderMyShop();
    }
}

/**
 * The Universal Submitter: Handles Placement & Priority
 */
function handleShopSubmission(event) {
    event.preventDefault();

    const category = document.getElementById('p-category').value;
    const itemName = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    
    // PLACEMENT GUARD: Determine where this item belongs
    // This ensures Auto parts stay in Auto and Mall stays in Mall
    const placement = (category === 'Vehicle') ? 'lot' : 'mall';

    const newItem = {
        id: Date.now(),
        vendorID: "STA-TECH-USER-01", // Placeholder until Auth is active
        name: itemName,
        price: parseFloat(price),
        category: category,
        placementTag: placement,
        status: 'pending',
        priorityScore: 0, // Default: Free listing
        onPromotion: false,
        image: document.getElementById('output-preview').src || 'assets/musha.png'
    };

    myShopInventory.push(newItem);
    localStorage.setItem('musha_vendor_inventory', JSON.stringify(myShopInventory));

    // Show custom success state
    showSuccessState(itemName, placement);
}

/**
 * Promotion Engine: Adjust Price or Set Flash Sale
 */
function togglePromotion(itemID) {
    const item = myShopInventory.find(i => i.id === itemID);
    if (item) {
        item.onPromotion = !item.onPromotion;
        // Logic: Promotions increase priorityScore to move it to the top
        item.priorityScore = item.onPromotion ? 10 : 0; 
        localStorage.setItem('musha_vendor_inventory', JSON.stringify(myShopInventory));
        renderMyShop();
        console.log(`Musha System: Item ${itemID} promotion set to ${item.onPromotion}`);
    }
}

/**
 * Render the "My Shop" Dashboard
 */
function renderMyShop() {
    const container = document.getElementById('my-shop-grid');
    if (!container) return;

    if (myShopInventory.length === 0) {
        container.innerHTML = `<p class="empty-msg">Your shop is empty. List your first product!</p>`;
        return;
    }

    container.innerHTML = myShopInventory.map(item => `
        <div class="shop-item-card ${item.onPromotion ? 'promo-active' : ''}">
            <img src="${item.image}" alt="preview">
            <div class="shop-item-details">
                <h4>${item.name}</h4>
                <p class="gold-text">$${item.price}</p>
                <div class="item-tags">
                    <span class="tag">${item.placementTag.toUpperCase()}</span>
                    <span class="status-${item.status}">${item.status.toUpperCase()}</span>
                </div>
                <div class="shop-actions">
                    <button onclick="togglePromotion(${item.id})" class="promo-btn">
                        ${item.onPromotion ? 'STOP PROMO' : 'BOOST SALES'}
                    </button>
                    <button onclick="requestLogistics('${item.name}')" class="logistics-btn">
                        <i class="fas fa-truck"></i> MOVE
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Logistics Shortcut: Bridge to StaTech WhatsApp
 */
function requestLogistics(itemName) {
    const msg = `Hi StaTech, I need a mover for my ${itemName} to the Hub.`;
    window.open(`https://wa.me/263771111111?text=${encodeURIComponent(msg)}`, '_blank');
}

function showSuccessState(name, placement) {
    const form = document.getElementById('public-upload-form');
    form.innerHTML = `
        <div class="success-box" style="text-align:center; padding:40px;">
            <i class="fas fa-check-circle fa-4y gold-text"></i>
            <h2 style="margin-top:20px;">SYNCED TO ${placement.toUpperCase()}</h2>
            <p>Your ${name} is being vetted by StaTech.</p>
            <button onclick="location.reload()" class="list-now-btn">List Another</button>
            <button onclick="switchDashboardTab('manage')" class="view-btn">Go to My Shop</button>
        </div>
    `;
}

// Initialize listeners
document.addEventListener('DOMContentLoaded', () => {
    // Ensure "My Shop" tab is ready if clicked
    const manageTab = document.querySelector('[onclick*="manage"]');
    if (manageTab) renderMyShop();
});
// Add this to your shop.js file

/**
 * Save Shop Name to LocalStorage
 */
function saveShopIdentity() {
    const shopName = document.getElementById('shop-name-input').value;
    localStorage.setItem('musha_shop_name', shopName);
    console.log("Musha System: Shop identity updated to " + shopName);
}

/**
 * Load Shop Name on Page Load
 */
document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('musha_shop_name');
    if (savedName) {
        document.getElementById('shop-name-input').value = savedName;
    }
});

// Update your handleShopSubmission function to include the Shop Name
// Inside handleShopSubmission:
const newItem = {
    // ... other properties ...
    vendorName: localStorage.getItem('musha_shop_name') || "Independent Seller",
    // ...
};
