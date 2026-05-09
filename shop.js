/* =========================================
   STA-TECH SHOP ENGINE: VENDOR HUB LOGIC
   ========================================= */

// 1. THE STATE MANAGER
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
 * Save Shop Identity (Name + Phone)
 */
function saveShopIdentity() {
    const shopName = document.getElementById('shop-name-input').value;
    const shopPhone = document.getElementById('shop-whatsapp-input').value;
    
    localStorage.setItem('musha_shop_name', shopName);
    localStorage.setItem('musha_shop_phone', shopPhone);
    
    console.log("Musha System: Identity secured for " + shopName);
}

/**
 * The Universal Submitter
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
        priorityScore: 0,
        onPromotion: false,
        vendorName: localStorage.getItem('musha_shop_name') || "Independent Seller",
        phone: localStorage.getItem('musha_shop_phone') || "263771111111",
        image: document.getElementById('output-preview').src || 'assets/musha.png'
    };

    myShopInventory.push(newItem);
    localStorage.setItem('musha_vendor_inventory', JSON.stringify(myShopInventory));

    showSuccessState(itemName, placement);
}

/**
 * Promotion Engine
 */
function togglePromotion(itemID) {
    const item = myShopInventory.find(i => i.id === itemID);
    if (item) {
        item.onPromotion = !item.onPromotion;
        item.priorityScore = item.onPromotion ? 10 : 0; 
        localStorage.setItem('musha_vendor_inventory', JSON.stringify(myShopInventory));
        renderMyShop();
    }
}

/**
 * UNIFIED: Render the "My Shop" Dashboard (With Live Status Tracker)
 */
function renderMyShop() {
    const container = document.getElementById('my-shop-grid');
    if (!container) return;

    if (myShopInventory.length === 0) {
        container.innerHTML = `<p class="empty-msg">Your shop is empty. List your first product!</p>`;
        return;
    }

    container.innerHTML = myShopInventory.map(item => {
        let statusClass = '';
        let statusIcon = '';

        switch(item.status) {
            case 'pending': 
                statusClass = 'status-pending'; 
                statusIcon = '<i class="fas fa-clock"></i> VETTING';
                break;
            case 'active': 
                statusClass = 'status-active'; 
                statusIcon = '<i class="fas fa-check-circle"></i> LIVE';
                break;
            default: 
                statusClass = 'status-other'; 
                statusIcon = item.status.toUpperCase();
        }

        return `
            <div class="shop-item-card ${item.onPromotion ? 'promo-active' : ''}">
                <img src="${item.image}" alt="preview">
                <div class="shop-item-details">
                    <h4>${item.name}</h4>
                    <p class="gold-text">$${item.price}</p>
                    <div class="item-tags">
                        <span class="tag-location">${item.placementTag === 'lot' ? 'AUTO LOT' : 'MALL'}</span>
                        <span class="status-badge ${statusClass}">${statusIcon}</span>
                    </div>
                    <div class="shop-actions">
                        <button onclick="togglePromotion(${item.id})" class="promo-btn">
                            ${item.onPromotion ? 'STOP PROMO' : 'BOOST SALES'}
                        </button>
                        <button onclick="requestLogistics('${item.name}')" class="logistics-btn">
                            <i class="fas fa-truck"></i> MOVE
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
 * PART 8: VENDOR ANALYTICS ENGINE
 */
function updateVendorStats() {
    const totalValue = myShopInventory.reduce((sum, item) => sum + (item.price || 0), 0);
    const liveCount = myShopInventory.filter(item => item.status === 'active').length;
    const boostedCount = myShopInventory.filter(item => item.onPromotion).length;

    // Update the UI
    const valueEl = document.getElementById('total-stock-value');
    const liveEl = document.getElementById('live-items-count');
    const boostEl = document.getElementById('boosted-items-count');

    if (valueEl) valueEl.innerText = `$${totalValue.toLocaleString()}`;
    if (liveEl) liveEl.innerText = liveCount;
    if (boostEl) boostEl.innerText = boostedCount;
}

// !! IMPORTANT: Add "updateVendorStats();" inside your renderMyShop() function
/**
 * Logistics Shortcut
 */
function requestLogistics(itemName) {
    const hubPhone = "263771111111";
    const msg = `Hi StaTech, I need a mover for my ${itemName} to the Hub.`;
    window.open(`https://wa.me/${hubPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}

/**
 * Delete Listing
 */
function deleteListing(id) {
    if (confirm("Remove this listing from Musha?")) {
        myShopInventory = myShopInventory.filter(i => i.id !== id);
        localStorage.setItem('musha_vendor_inventory', JSON.stringify(myShopInventory));
        renderMyShop();
    }
}

function showSuccessState(name, placement) {
    const form = document.getElementById('sell-form-section');
    form.innerHTML = `
        <div class="success-box" style="text-align:center; padding:40px;">
            <i class="fas fa-check-circle fa-4x" style="color:var(--musha-gold);"></i>
            <h2 style="margin-top:20px;">SYNCED TO ${placement.toUpperCase()}</h2>
            <p>Your ${name} is being vetted by StaTech Admin.</p>
            <button onclick="location.reload()" class="list-now-btn">List Another</button>
            <button onclick="switchDashboardTab('manage')" class="view-btn">View My Shop</button>
        </div>
    `;
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('musha_shop_name');
    const savedPhone = localStorage.getItem('musha_shop_phone');
    
    if (savedName) {
        const nameInput = document.getElementById('shop-name-input');
        if (nameInput) nameInput.value = savedName;
    }
    if (savedPhone) {
        const phoneInput = document.getElementById('shop-whatsapp-input');
        if (phoneInput) phoneInput.value = savedPhone;
    }
    
    if (document.getElementById('my-shop-grid')) {
        renderMyShop();
    }
});
