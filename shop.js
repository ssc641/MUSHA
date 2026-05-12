
/* =========================================
   MOOSHA SHOP ENGINE v3.0 - VENDOR HUB
   ========================================= */

let myShopInventory = [];

function saveShopIdentity() {
    const name = document.getElementById('shop-name-input').value.trim();
    const whatsapp = document.getElementById('shop-whatsapp-input').value.trim();
    if (name) localStorage.setItem('musha_shop_name', name);
    if (whatsapp) localStorage.setItem('musha_shop_whatsapp', whatsapp);
}

function switchDashboardTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (tab === 'list') {
        document.getElementById('sell-form-section').style.display = 'block';
        document.getElementById('my-shop-section').style.display = 'none';
    } else {
        document.getElementById('sell-form-section').style.display = 'none';
        document.getElementById('my-shop-section').style.display = 'block';
        renderMyShop();
    }
}

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
        showToast("Please fill in product name and price.", "error");
        return;
    }
    if (!category) {
        showToast("Please select a category.", "error");
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
        image: (imagePreview && !imagePreview.includes(window.location.href)) ? imagePreview : 'assets/musha.png',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const btn = event.target.querySelector('.list-now-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SUBMITTING...';
        btn.disabled = true;
    }

    db.collection("vendor_inventory").add(newItem)
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        showToast(`${itemName} submitted for vetting!`, "success");
        document.getElementById('public-upload-form').reset();
        document.getElementById('output-preview').style.display = 'none';
        const trigger = document.querySelector('.camera-trigger');
        if (trigger) trigger.style.display = 'block';
        switchDashboardTab('manage');
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
        showToast("Submission failed. Check connection.", "error");
    })
    .finally(() => {
        if (btn) {
            btn.innerHTML = 'SUBMIT TO HUB';
            btn.disabled = false;
        }
    });
}

function deleteListing(docId) {
    if (confirm("Remove this listing permanently?")) {
        db.collection("vendor_inventory").doc(docId).delete()
        .then(() => {
            showToast("Listing removed.", "info");
            renderMyShop();
        })
        .catch((error) => {
            console.error("Error deleting: ", error);
            showToast("Failed to remove listing.", "error");
        });
    }
}

function markAsSold(id) {
    db.collection("vendor_inventory").doc(id).update({
        isSold: true,
        status: 'sold',
        soldAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showToast("Item marked as sold!", "success");
        renderMyShop();
    })
    .catch((error) => {
        console.error("Error updating: ", error);
        showToast("Failed to update status.", "error");
    });
}

function renderMyShop() {
    const shopGrid = document.getElementById('my-shop-grid');
    const shopName = localStorage.getItem('musha_shop_name') || "Independent Seller";

    if (!shopGrid) return;

    shopGrid.innerHTML = '<div class="empty-msg"><i class="fas fa-spinner fa-spin"></i> Loading your inventory...</div>';

    db.collection("vendor_inventory")
      .where("vendorName", "==", shopName)
      .get()
      .then((querySnapshot) => {
          let myItems = [];
          querySnapshot.forEach((doc) => {
              myItems.push({ id: doc.id, ...doc.data() });
          });

          myShopInventory = myItems;
          updateVendorStats();

          if (myItems.length === 0) {
              shopGrid.innerHTML = `<div class="empty-msg"><i class="fas fa-store" style="font-size:2rem; display:block; margin-bottom:15px; color:var(--musha-gold);"></i>No listings found for ${shopName}.</div>`;
              return;
          }

          shopGrid.innerHTML = myItems.map((item, index) => `
              <div class="shop-item-card ${item.onPromotion ? 'promo-active' : ''}" style="animation-delay: ${index * 0.05}s">
                  <img src="${item.image}" alt="${item.name}" loading="lazy">
                  <div class="shop-item-info">
                      <h4>${item.name}</h4>
                      <span class="status-tag status-${item.status}">${item.status.toUpperCase()}</span>
                      <p style="color:var(--musha-gold); font-weight:700; font-size:1.1rem; margin:8px 0;">$${Number(item.price).toLocaleString()}</p>
                      <p style="font-size:0.8rem; color:var(--text-muted);">${item.category} | ${item.placementTag === 'lot' ? 'Auto Lot' : 'Grand Mall'}</p>
                      <div class="shop-actions">
                          <button onclick="markAsSold('${item.id}')" class="sold-btn">Mark Sold</button>
                          <button onclick="deleteListing('${item.id}')" class="delete-btn">Remove</button>
                      </div>
                  </div>
              </div>
          `).join('');
      })
      .catch((error) => {
          console.error("Error fetching shop: ", error);
          shopGrid.innerHTML = `<div class="empty-msg"><i class="fas fa-exclamation-circle" style="color:var(--danger);"></i>Error loading data. Check connection.</div>`;
      });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('musha_shop_name');
    const savedWhatsapp = localStorage.getItem('musha_shop_whatsapp');
    if (savedName) document.getElementById('shop-name-input').value = savedName;
    if (savedWhatsapp) document.getElementById('shop-whatsapp-input').value = savedWhatsapp;

    if (document.getElementById('my-shop-grid')) {
        renderMyShop();
    }
});
