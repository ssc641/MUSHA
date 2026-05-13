/* =========================================
   MOOSHA SHOP ENGINE v3.0 - AUTH-ENABLED
   Vendor sees ONLY their inventory
   ========================================= */

let myShopInventory = [];

function saveShopIdentity() {
    const name = document.getElementById('shop-name-input').value.trim();
    const whatsapp = document.getElementById('shop-whatsapp-input')?.value.trim();
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

    // MUST be logged in
    if (!isVendorLoggedIn()) {
        showToast("Please log in first", "error");
        setTimeout(() => window.location.href = 'sell.html?mode=login', 1500);
        return;
    }

    const vendor = getCurrentVendor();
    const category = document.getElementById('p-category').value;
    const itemName = document.getElementById('p-name').value.trim();
    const price = document.getElementById('p-price').value;
    const desc = document.getElementById('p-desc').value.trim();
    const fb = document.getElementById('p-fb').value.trim() || vendor.facebook || null;
    const email = document.getElementById('p-email').value.trim() || vendor.email || null;
    const imagePreview = document.getElementById('output-preview').src;

    const placement = (category === 'Vehicle') ? 'lot' : 'mall';

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
        vendorId: vendor.id,
        vendorName: vendor.shopName,
        vendorEmail: vendor.email,
        whatsapp: vendor.whatsapp || vendor.phone,
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
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> SUBMIT TO HUB';
            btn.disabled = false;
        }
    });
}

function deleteListing(docId) {
    if (!isVendorLoggedIn()) {
        showToast("Session expired. Please log in.", "error");
        return;
    }

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
    if (!isVendorLoggedIn()) {
        showToast("Session expired. Please log in.", "error");
        return;
    }

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

    if (!shopGrid) return;

    // MUST be logged in
    if (!isVendorLoggedIn()) {
        shopGrid.innerHTML = '<div class="empty-msg">Please log in to view your shop.</div>';
        return;
    }

    const vendor = getCurrentVendor();

    shopGrid.innerHTML = '<div class="empty-msg"><i class="fas fa-spinner fa-spin"></i> Loading your inventory...</div>';

    // Query by vendorId for security - vendor can ONLY see their own items
    db.collection("vendor_inventory")
      .where("vendorId", "==", vendor.id)
      .get()
      .then((querySnapshot) => {
          let myItems = [];
          querySnapshot.forEach((doc) => {
              myItems.push({ id: doc.id, ...doc.data() });
          });

          myShopInventory = myItems;
          updateVendorStats();

          if (myItems.length === 0) {
              shopGrid.innerHTML = `<div class="empty-msg"><i class="fas fa-store" style="font-size:2rem; display:block; margin-bottom:15px; color:var(--musha-gold);"></i>No listings yet. Create your first one!</div>`;
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

/* =========================================
   AUTH HANDLERS (Login, Register, Forgot)
   ========================================= */

function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tabs .tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (tab === 'login') {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('forgot-form').style.display = 'none';
    } else {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('forgot-form').style.display = 'none';
    }
}

function showForgotPassword() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forgot-form').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forgot-form').style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me').checked;

    const btn = event.target.querySelector('.list-now-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> LOGGING IN...';
        btn.disabled = true;
    }

    loginVendor(email, password, remember)
        .then((vendor) => {
            showToast(`Welcome back, ${vendor.shopName}!`, "success");
            updateLastLogin(vendor.id);
            showDashboard();
        })
        .catch((error) => {
            showToast(error.message || "Login failed", "error");
            if (btn) {
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> LOGIN TO SHOP';
                btn.disabled = false;
            }
        });
}

function handleRegister(event) {
    event.preventDefault();

    const shopName = document.getElementById('reg-shop-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const facebook = document.getElementById('reg-facebook').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (password !== confirm) {
        showToast("Passwords do not match", "error");
        return;
    }
    if (password.length < 6) {
        showToast("Password must be at least 6 characters", "error");
        return;
    }

    const btn = event.target.querySelector('.list-now-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CREATING...';
        btn.disabled = true;
    }

    registerVendor({
        shopName, email, phone, facebook, password
    })
    .then(() => {
        showToast("Shop created! Please log in.", "success");
        switchAuthTab('login');
        document.getElementById('login-email').value = email;
    })
    .catch((error) => {
        showToast(error.message || "Registration failed", "error");
    })
    .finally(() => {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-user-plus"></i> CREATE SHOP ACCOUNT';
            btn.disabled = false;
        }
    });
}

function handleForgotPassword(event) {
    event.preventDefault();

    const email = document.getElementById('forgot-email').value.trim();
    const phone = document.getElementById('forgot-phone').value.trim();
    const shopName = document.getElementById('forgot-shop').value.trim();

    const btn = event.target.querySelector('.list-now-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SUBMITTING...';
        btn.disabled = true;
    }

    requestPasswordReset(email, phone, shopName)
        .then(() => {
            showToast("Reset request sent to admin. Check WhatsApp within 24hrs.", "success");
            showLoginForm();
        })
        .catch((error) => {
            showToast(error.message || "Reset request failed", "error");
        })
        .finally(() => {
            if (btn) {
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> SUBMIT RESET REQUEST';
                btn.disabled = false;
            }
        });
}

function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';

    const vendor = getCurrentVendor();
    if (vendor) {
        document.getElementById('shop-name-input').value = vendor.shopName;
        document.getElementById('vendor-email-display').innerText = vendor.email;

        // Show logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.style.display = 'flex';

        // Pre-fill listing contact info
        const fbInput = document.getElementById('p-fb');
        const emailInput = document.getElementById('p-email');
        if (fbInput && vendor.facebook) fbInput.value = vendor.facebook;
        if (emailInput && vendor.email) emailInput.value = vendor.email;
    }

    renderMyShop();
}

/* =========================================
   PAGE INITIALIZATION
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Check URL params for mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    if (isVendorLoggedIn()) {
        // Already logged in - show dashboard
        showDashboard();
    } else {
        // Not logged in - show auth
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('dashboard-section').style.display = 'none';

        if (mode === 'register') {
            switchAuthTab('register');
        } else {
            switchAuthTab('login');
        }
    }

    // Load saved identity if any
    const savedName = localStorage.getItem('musha_shop_name');
    const savedWhatsapp = localStorage.getItem('musha_shop_whatsapp');
    const nameInput = document.getElementById('shop-name-input');
    const waInput = document.getElementById('shop-whatsapp-input');
    if (savedName && nameInput && !nameInput.value) nameInput.value = savedName;
    if (savedWhatsapp && waInput) waInput.value = savedWhatsapp;
});
