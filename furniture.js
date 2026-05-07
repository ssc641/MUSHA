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
        storeId: "musha-gweru-01",
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
        storeId: "mid-decor-02",
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
    },
    {
        id: 2002,
        name: "Defy 9kg Washing Machine",
        quality: "standard",
        category: "Appliances",
        type: "Laundry",
        material: "Metal/Plastic",
        condition: "Brand New",
        price: 420,
        store: "Midlands Electronics",
        isVerified: true,
        whatsapp: "263772222222",
        image: "assets/appliances/washer1.jpg"
    }
];

/* =========================================
   2. CART & SHOPPING LOGIC
   ========================================= */
let mushaCart = JSON.parse(localStorage.getItem('mushaCart')) || [];

function addToCart(productId) {
    const product = furnitureInventory.find(p => p.id === productId);
    const qtyInput = document.getElementById(`qty-${productId}`);
    const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
    
    const cartItem = { ...product, selectedQty: quantity };
    mushaCart.push(cartItem);
    
    localStorage.setItem('mushaCart', JSON.stringify(mushaCart));
    updateCartCount();
    alert(`Musha Mall: ${product.name} added to cart.`);
}

function updateCartCount() {
    const countElement = document.getElementById('cart-count-display');
    if (countElement) countElement.innerText = mushaCart.length;
}

function removeFromCart(index) {
    mushaCart.splice(index, 1);
    localStorage.setItem('mushaCart', JSON.stringify(mushaCart));
    updateCartCount();
    // If on cart page, refresh the view
    if(typeof renderCartPage === "function") renderCartPage();
}

/* =========================================
   3. RENDER ENGINE (UI Generator)
   ========================================= */
function displayFurniture(items) {
    const grid = document.getElementById('furniture-results-grid');
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = `<p class='no-results'>No items found in this category.</p>`;
        return;
    }

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
                <span class="meta">${item.condition} | ${item.category} 
                    ${item.category === 'Appliances' ? `<span class="power-tag"><i class="fas fa-bolt"></i> Low Energy</span>` : ''}
                </span>
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
   4. UTILITY & NAVIGATION
   ========================================= */
function negotiateWA(itemName, phone) {
    const msg = `Hi, I saw the ${itemName} on Musha Home Mall. Is it available for delivery?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function viewStore(storeName) {
    const storeItems = furnitureInventory.filter(i => i.store === storeName);
    displayFurniture(storeItems);
    const header = document.getElementById('furniture-count-header');
    if (header) header.innerText = `Viewing all products from ${storeName}`;
}

/* =========================================
   5. PRICE COMPARISON SYSTEM
   ========================================= */
function comparePrices(productType) {
    const matches = furnitureInventory.filter(item => item.type === productType);
    if (matches.length < 2) return alert("No other similar items to compare at this time.");

    matches.sort((a, b) => a.price - b.price);

    const overlay = document.createElement('div');
    overlay.className = 'compare-overlay';
    
    overlay.innerHTML = `
        <div class="compare-modal">
            <div class="compare-header">
                <h3>Compare: ${productType}s</h3>
                <button onclick="this.closest('.compare-overlay').remove()">×</button>
            </div>
            <table class="compare-table">
                <thead>
                    <tr>
                        <th>Supplier</th>
                        <th>Price</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${matches.map(m => `
                        <tr>
                            <td>${m.store}</td>
                            <td class="gold-text">$${m.price}</td>
                            <td><button onclick="viewStore('${m.store}')">View</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    // Only display if we are on the results grid page
    if (document.getElementById('furniture-results-grid')) {
        displayFurniture(furnitureInventory);
    }
    updateCartCount();
});
