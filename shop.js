
# Fix 2: shop.js - Merge newItem declarations, add missing functions, fix Firebase submission
shop_js_fixed = '''/* =========================================
   STA-TECH SHOP ENGINE: VENDOR HUB LOGIC
   ========================================= */

let myShopInventory = [];

/**
 * Save shop identity to localStorage
 */
function saveShopIdentity() {
    const name = document.getElementById('shop-name-input').value.trim();
    const whatsapp = document.getElementById('shop-whatsapp-input').value.trim();
    if (name) localStorage.setItem('musha_shop_name', name);
    if (whatsapp) localStorage.setItem('musha_shop_whatsapp', whatsapp);
}

/**
 * Switch between List and Manage tabs
 */
function switchDashboardTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (tab === 'list') {
        document.getElementById('sell-form-section').style.display = 'block';
        document.getElementById('my-shop-section').style.display = 'none';
    } else {
        document.getElementById('sell-form-section').style.display = 'none';
        document.getElementById('my-shop-section').style.display = 'block';
        renderMyShop();
    }
}

/**
 * THE ANALYTICS ENGINE
 */
function updateVendorStats() {
    const totalPotential = myShopInventory
        .filter(item => !item.isSold)
        .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    const liveCount = myShopInventory.filter(item => item.status === 'active' && !item.isSold).length;
    const pendingCount = myShopInventory.filter(item => item.status === 'pending').length;

    if(document.getElementById('total-stock-value')) {
        document.getElementById('total-stock-value').innerText = `$${totalPotential.toLocaleString()}`;
    }
    if(document.getElementById('live-items-count')) {
        document.getElementById('live-items-count').innerText = liveCount;
    }
    if(document.getElementById('pending-items-count')) {
        document.getElementById('pending-items-count').innerText = pendingCount;
    }
    if(document.getElementById('vendor-stats')) {
        document.getElementById('vendor-stats').innerText = `Vetting: ${pendingCount} | Active: ${liveCount}`;
    }
}

/**
 * Handle Submission to Firebase
 */
function handleShopSubmission(event) {
    event.preventDefault();

    const category = document.getElementById('p-category').value;
    const itemName = document.getElementById('p-name').value.trim();
    const price = document.getElementById('p-price').value;
    const desc = document.getElementById('p-desc').value.trim();
    const fb = document.getElementById('p-fb').value.trim() || null;
    const email = document.getElementById('p-email').value.trim() || null;
    const imagePreview = document.getElementById('output-preview').src;
    
    const placement = (category === 'Vehicle') ? 'lot' : 'mall';
    const shopName = localStorage.getItem('musha_shop_name') || "Independent Seller";
    const shopWhatsapp = localStorage.getItem('musha_shop_whatsapp') || "263771111111";

    if (!itemName || !price) {
        alert("Please fill in the product name and price.");
        return;
    }

    const newItem = {
        name: itemName,
        price: parseFloat(price),
        category: category,
        description: desc,
        placementTag: placement,
        status: 'pending',
        isSold: false,
        onPromotion: false,
        vendorName: shopName,
        whatsapp: shopWhatsapp,
        facebook: fb,
        email: email,
        image: (imagePreview && imagePreview !== window.location.href) ? imagePreview : 'assets/musha.png',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("vendor_inventory").add(newItem)
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        alert(`SUCCESS: Your ${itemName} has been sent for vetting.`);
        document.getElementById('public-upload-form').reset();
        document.getElementById('output-preview').style.display = 'none';
        // Switch to My Shop tab to show it
        switchDashboardTab('manage');
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
        alert("Error submitting. Check your internet connection.");
    });
}

/**
 * Delete a listing
 */
function deleteListing(docId) {
    if (confirm("Are you sure you want to remove this listing?")) {
        db.collection("vendor_inventory").doc(docId).delete()
        .then(() => {
            alert("Listing removed.");
            renderMyShop();
        })
        .catch((error) => {
            console.error("Error deleting: ", error);
        });
    }
}

/**
 * Mark as Sold
 */
function markAsSold(id) {
    db.collection("vendor_inventory").doc(id).update({
        isSold: true,
        status: 'sold'
    })
    .then(() => {
        alert("Item marked as sold!");
        renderMyShop();
    })
    .catch((error) => {
        console.error("Error updating: ", error);
    });
}

/**
 * Render the "My Shop" Dashboard from Firestore
 */
function renderMyShop() {
    const shopGrid = document.getElementById('my-shop-grid');
    const shopName = localStorage.getItem('musha_shop_name') || "Independent Seller";

    if (!shopGrid) return;

    shopGrid.innerHTML = '<p class="empty-msg">Loading your inventory...</p>';

    db.collection("vendor_inventory")
      .where("vendorName", "==", shopName)
      .get()
      .then((querySnapshot) => {
          let myItems = [];
          querySnapshot.forEach((doc) => {
              myItems.push({ id: doc.id, ...doc.data() });
          });
          
          myShopInventory = myItems; // sync local cache
          updateVendorStats();

          if (myItems.length === 0) {
              shopGrid.innerHTML = `<p class="empty-msg">No listings found for ${shopName}.</p>`;
              return;
          }

          shopGrid.innerHTML = myItems.map(item => `
              <div class="shop-item-card ${item.onPromotion ? 'promo-active' : ''}">
                  <img src="${item.image}" alt="${item.name}" style="width:100%; height:180px; object-fit:cover;">
                  <div class="shop-item-info" style="padding:15px;">
                      <h4>${item.name}</h4>
                      <p class="status-tag status-${item.status}">${item.status.toUpperCase()}</p>
                      <p style="color:var(--musha-gold); font-weight:bold;">$${Number(item.price).toLocaleString()}</p>
                      <div class="shop-actions" style="display:flex; gap:8px; margin-top:10px;">
                          <button onclick="markAsSold('${item.id}')" class="sold-btn">Mark Sold</button>
                          <button onclick="deleteListing('${item.id}')" class="delete-btn">Remove</button>
                      </div>
                  </div>
              </div>
          `).join('');
      })
      .catch((error) => {
          console.error("Error fetching shop: ", error);
          shopGrid.innerHTML = `<p class="empty-msg">Error loading data. Check connection.</p>`;
      });
}

// Load identity on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('musha_shop_name');
    const savedWhatsapp = localStorage.getItem('musha_shop_whatsapp');
    if (savedName) document.getElementById('shop-name-input').value = savedName;
    if (savedWhatsapp) document.getElementById('shop-whatsapp-input').value = savedWhatsapp;
    
    if (document.getElementById('my-shop-grid')) {
        renderMyShop();
    }
});
'''

with open('/mnt/agents/output/shop.js', 'w') as f:
    f.write(shop_js_fixed)

print("shop.js fixed and saved.")
