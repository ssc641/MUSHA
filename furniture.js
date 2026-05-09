/* =========================================
   1. MASTER INVENTORY (The Database)
   ========================================= */
const furnitureInventory = [
    {
        id: 1001,
        name: "Royal Velvet L-Shape",
        quality: "premium",
        category: "Living Room",
        type: "Sofa",
        material: "Velvet & Oak",
        condition: "Brand New",
        price: 1200,
        store: "Musha Home Gweru",
        isVerified: true,
        whatsapp: "263771111111",
        image: "assets/furniture/sofa1.jpg"
    },
    {
        id: 1002,
        name: "Standard Pine Coffee Table",
        quality: "standard",
        category: "Living Room",
        type: "Table",
        material: "Pine Wood",
        condition: "New",
        price: 150,
        store: "Midlands Decor",
        isVerified: false,
        whatsapp: "263782222222",
        image: "assets/furniture/table1.jpg"
    },
    {
        id: 2001,
        name: "Samsung Double-Door Fridge",
        quality: "premium",
        category: "Appliances",
        type: "Kitchen",
        material: "Stainless Steel",
        condition: "Brand New",
        price: 950,
        store: "Gweru Power Hub",
        isVerified: true,
        whatsapp: "263771111111",
        image: "assets/appliances/fridge1.jpg"
    }
];

/* =========================================
   2. CART LOGIC (Persistent Storage)
   ========================================= */
let mushaCart = JSON.parse(localStorage.getItem('mushaCart')) || [];

function addToCart(productId) {
    const product = furnitureInventory.find(p => p.id === productId);
    const qtyInput = document.getElementById(`qty-${productId}`);
    const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
    
    // Check if already in cart to update qty instead of duplicating
    const existingItem = mushaCart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.selectedQty += quantity;
    } else {
        mushaCart.push({ ...product, selectedQty: quantity });
    }
    
    localStorage.setItem('mushaCart', JSON.stringify(mushaCart));
    updateCartCount();
    alert(`Musha Mall: ${product.name} added to cart.`);
}

function updateCartCount() {
    const countElement = document.getElementById('cart-count-display');
    if (countElement) {
        countElement.innerText = mushaCart.length;
    }
}

/* =========================================
   3. RENDER ENGINE (The Grid)
   ========================================= */
function displayFurniture(items) {
    const grid = document.getElementById('furniture-results-grid');
    const lobby = document.getElementById('lobby-view');

    if (!grid) return;

    // Switch views: Hide lobby, show grid
    if (lobby) lobby.style.display = 'none';
    grid.style.display = 'grid';

    if (items.length === 0) {
        grid.innerHTML = `<div class="no-results">No items found. Try another category!</div>`;
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="furniture-card ${item.isVerified ? 'verified-card' : 'unverified-card'}">
            <div class="trust-badge ${item.isVerified ? 'verified' : 'warning'}">
                <i class="fas ${item.isVerified ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                ${item.isVerified ? 'Verified Hub' : 'Unverified'}
            </div>
            
            <div class="img-container">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/musha.png'">
            </div>

            <div class="card-details">
                <h3 class="title">${item.name}</h3>
                <p class="price-text">$${item.price.toLocaleString()}</p>
                <p class="store-info"><i class="fas fa-store"></i> ${item.store}</p>
                
                <div class="card-actions">
                    <div class="qty-box">
                        <input type="number" id="qty-${item.id}" value="1" min="1">
                    </div>
                    <button class="add-btn" onclick="addToCart(${item.id})">ADD</button>
                    <button class="wa-btn" onclick="negotiateWA('${item.name}', '${item.whatsapp}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/* =========================================
   4. FILTERS & UTILITIES
   ========================================= */
function filterFurnitureByRoom(roomName) {
    const filtered = furnitureInventory.filter(item => item.category === roomName);
    displayFurniture(filtered);
}

function negotiateWA(itemName, phone) {
    const msg = `Hi, I saw the ${itemName} on Musha. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Ensure cart count is accurate on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

/* =========================================
   MALL INVENTORY SYNC (Furniture & Home)
   ========================================= */

// 1. Combine hardcoded inventory with Vendor Hub data
const liveFurnitureInventory = [
    ...(typeof furnitureInventory !== 'undefined' ? furnitureInventory : []), // Your existing furniture array
    ...(JSON.parse(localStorage.getItem('musha_vendor_inventory')) || [])
].filter(item => {
    // GUARD: Only show items approved by Admin and tagged for the Mall
    const isApproved = item.status === 'active';
    const isMallItem = item.placementTag === 'mall';
    
    // Also include your original hardcoded items which might not have these tags yet
    const isLegacyItem = !item.status; 

    return (isApproved && isMallItem) || isLegacyItem;
});

// 2. Sort by Priority (Boosted items first)
liveFurnitureInventory.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

// 3. Render the Mall
// Replace your old display call with this:
displayFurniture(liveFurnitureInventory);
