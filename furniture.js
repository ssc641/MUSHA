/* =========================================
   1. FURNITURE INVENTORY (The Database)
   ========================================= */
const furnitureInventory = [
    {
        id: 1001,
        name: "Royal Velvet L-Shape",
        category: "Living Room",
        type: "Sofa",
        material: "Velvet & Oak",
        condition: "Brand New",
        price: 1200, // Number for math/cart logic
        store: "Musha Home Gweru",
        storeId: "musha-gweru-01",
        isVerified: true,
        whatsapp: "263771111111",
        email: "sales@mushahome.co.zw",
        image: "assets/furniture/sofa1.jpg"
    },
    {
        id: 1002,
        name: "Vintage Mahogany Table",
        category: "Dining",
        type: "Table",
        material: "Solid Wood",
        condition: "Pre-owned",
        price: 450,
        store: "Midlands Decor",
        storeId: "mid-decor-02",
        isVerified: false,
        whatsapp: "263782222222",
        email: "info@midlandsdecor.zw",
        image: "assets/furniture/table1.jpg"
    },
    {
        id: 1003,
        name: "Defy 4-Plate Stove",
        category: "Kitchen",
        type: "Appliance",
        material: "Stainless Steel",
        condition: "Brand New",
        price: 550,
        store: "Gweru Power Hub",
        storeId: "power-hub-03",
        isVerified: true,
        whatsapp: "263773333333",
        email: "power@hub.co.zw",
        image: "assets/furniture/stove1.jpg"
    }
];

/* =========================================
   2. CART & SHOPPING LOGIC
   ========================================= */
let mushaCart = JSON.parse(localStorage.getItem('mushaCart')) || [];

function addToCart(productId) {
    const product = furnitureInventory.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value) || 1;
    
    const cartItem = { ...product, selectedQty: quantity };
    mushaCart.push(cartItem);
    
    // Save to local storage so it stays if they refresh
    localStorage.setItem('mushaCart', JSON.stringify(mushaCart));
    
    alert(`Musha Mall: Added ${quantity} x ${product.name} to your cart.`);
    updateCartCount();
}

function updateCartCount() {
    const countElement = document.getElementById('cart-count-display');
    if (countElement) countElement.innerText = mushaCart.length;
}

/* =========================================
   3. FILTERING ENGINE
   ========================================= */
function filterFurniture() {
    const roomVal = document.getElementById('room-select').value;
    const condVal = document.getElementById('condition-select').value;
    const storeVal = document.getElementById('store-select').value;

    const filtered = furnitureInventory.filter(item => {
        const matchesRoom = (roomVal === "all" || item.category === roomVal);
        const matchesCond = (condVal === "all" || item.condition === condVal);
        const matchesStore = (storeVal === "all" || item.store === storeVal);
        return matchesRoom && matchesCond && matchesStore;
    });

    displayFurniture(filtered);
}

/* =========================================
   4. RENDER ENGINE (UI Generator)
   ========================================= */
function displayFurniture(items) {
    const grid = document.getElementById('furniture-results-grid');
    if (!grid) return;

    grid.innerHTML = items.map(item => `
        <div class="furniture-card ${item.isVerified ? 'verified-card' : 'unverified-card'}">
            
            <div class="trust-badge ${item.isVerified ? 'verified' : 'warning'}">
                <i class="fas ${item.isVerified ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                ${item.isVerified ? 'Verified Hub' : 'Unverified Seller'}
            </div>

            <div class="price-badge">$${item.price.toLocaleString()}</div>
            
            <div class="img-container">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/placeholder-home.jpg'">
            </div>

            <div class="details">
                <span class="meta">${item.condition} | ${item.category}</span>
                <h3 class="title">${item.name}</h3>
                <p class="material-text">Material: ${item.material}</p>
                <p class="store-text" onclick="viewStore('${item.store}')">
                    <i class="fas fa-store"></i> <u>${item.store}</u>
                </p>
                
                <div class="qty-selector">
                    <label>Qty:</label>
                    <input type="number" id="qty-${item.id}" value="1" min="1" max="10">
                </div>

                <div class="action-buttons">
                    <button class="cart-btn" onclick="addToCart(${item.id})">
                        <i class="fas fa-shopping-cart"></i> Add
                    </button>
                    <button class="negotiate-btn" onclick="negotiateWA('${item.name}', '${item.whatsapp}')">
                        <i class="fab fa-whatsapp"></i> Negotiate
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/* =========================================
   5. CONTACT & UTILITY
   ========================================= */
function negotiateWA(itemName, phone) {
    const msg = `Hi, I saw the ${itemName} on Musha Home Mall. Is the price negotiable for a cash purchase?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function viewStore(storeName) {
    const storeItems = furnitureInventory.filter(i => i.store === storeName);
    displayFurniture(storeItems);
    document.getElementById('furniture-count-header').innerText = `Viewing all products from ${storeName}`;
}

function resetFurnitureFilters() {
    document.querySelectorAll('select').forEach(s => s.value = 'all');
    displayFurniture(furnitureInventory);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayFurniture(furnitureInventory);
    updateCartCount();
});
/* =========================================
   6. PRICE COMPARISON SYSTEM
   ========================================= */
function comparePrices(productType) {
    // 1. Find all products that match the same type (e.g., all 'Sofa' or all 'Stove')
    const matches = furnitureInventory.filter(item => item.type === productType);
    
    // 2. Sort them from cheapest to most expensive
    matches.sort((a, b) => a.price - b.price);

    // 3. Create the Comparison UI
    const overlay = document.createElement('div');
    overlay.className = 'compare-overlay';
    
    overlay.innerHTML = `
        <div class="compare-modal">
            <div class="compare-header">
                <h3>Compare Prices: ${productType}s</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <table class="compare-table">
                <thead>
                    <tr>
                        <th>Supplier</th>
                        <th>Condition</th>
                        <th>Price</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${matches.map(m => `
                        <tr>
                            <td>${m.store} ${m.isVerified ? '✅' : ''}</td>
                            <td>${m.condition}</td>
                            <td class="gold-text">$${m.price}</td>
                            <td><button onclick="viewStore('${m.store}')">View</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="compare-note">Prices verified by StaTech Logistics</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}
/* =========================================
   7. THE CART ENGINE
   ========================================= */
function openCart() {
    const cartContainer = document.getElementById('cart-display-area');
    if (mushaCart.length === 0) {
        alert("Your Musha Cart is empty!");
        return;
    }

    let total = 0;
    const cartHTML = mushaCart.map((item, index) => {
        const subtotal = item.price * item.selectedQty;
        total += subtotal;
        return `
            <div class="cart-item">
                <span>${item.name} (x${item.selectedQty})</span>
                <span class="gold-text">$${subtotal.toLocaleString()}</span>
                <button onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
    }).join('');

    // This would show up in your Cart Modal or Sidebar
    console.log("Total Musha Purchase:", total);
}

function removeFromCart(index) {
    mushaCart.splice(index, 1);
    localStorage.setItem('mushaCart', JSON.stringify(mushaCart));
    updateCartCount();
    alert("Item removed from cart.");
}

