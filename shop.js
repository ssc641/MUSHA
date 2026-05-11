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
    const shopGrid = document.getElementById('my-shop-grid');
    const shopName = localStorage.getItem('musha_shop_name') || "Independent Seller";

    // MISSION: Fetch only items belonging to THIS specific shop
    db.collection("vendor_inventory")
      .where("vendorName", "==", shopName)
      .onSnapshot((querySnapshot) => {
          let myItems = [];
          querySnapshot.forEach((doc) => {
              myItems.push({ id: doc.id, ...doc.data() });
          });

          // Update the Stats (Total Stock, Live Items) using the cloud data
          updateCloudStats(myItems);

          if (myItems.length === 0) {
              shopGrid.innerHTML = `<p>No listings found for ${shopName}.</p>`;
              return;
          }

          shopGrid.innerHTML = myItems.map(item => `
              <div class="shop-item-card">
                  <img src="${item.image}" alt="${item.name}">
                  <div class="shop-item-info">
                      <h4>${item.name}</h4>
                      <p class="status-tag ${item.status}">${item.status.toUpperCase()}</p>
                      <p>$${item.price}</p>
                      <button onclick="deleteListing('${item.id}')" class="delete-btn">Remove</button>
                  </div>
              </div>
          `).join('');
      });
}

// NEW HELPER: Updates stats based on Cloud data instead of LocalStorage
function updateCloudStats(items) {
    const liveCount = items.filter(i => i.status === 'active').length;
    const pendingCount = items.filter(i => i.status === 'pending').length;
    
    if(document.getElementById('live-items-count')) {
        document.getElementById('live-items-count').innerText = liveCount;
        document.getElementById('pending-items-count').innerText = pendingCount;
    }
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
   // Inside your submission function
const newItem = {
    // ... your existing fields (name, price, etc.)
    facebook: document.getElementById('p-fb').value || null,
    email: document.getElementById('p-email').value || null,
    // ... rest of the object
};

 // Replace the old myShopInventory.push and localStorage.setItem with this:
db.collection("vendor_inventory").add(newItem)
.then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
    showSuccessState(itemName, placement);
})
.catch((error) => {
    console.error("Error adding document: ", error);
});
}

// ... Keep your existing deleteListing, togglePromotion, and switchDashboardTab functions ...

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('my-shop-grid')) renderMyShop();
});

// Add this to your getLiveMallInventory() function in furniture.js
function getLiveMallInventory() {
    const vendorItems = JSON.parse(localStorage.getItem('musha_vendor_inventory')) || [];
    
    // GUARD: Only show items that are ACTIVE and NOT SOLD
    const approvedMallItems = vendorItems.filter(item => 
        item.status === 'active' && 
        item.placementTag === 'mall' && 
        item.isSold !== true // <--- The Profit Shield
    );

    return [...furnitureInventory, ...approvedMallItems];
}
