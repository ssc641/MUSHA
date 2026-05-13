/* =========================================
   MOOSHA ADMIN ENGINE v3.0 - GOD MODE
   Full override powers + Password Reset Queue
   ========================================= */

function renderAdminQueue() {
    const queueContainer = document.getElementById('admin-pending-list');
    if (!queueContainer) return;

    db.collection("vendor_inventory")
      .where("status", "==", "pending")
      .onSnapshot((querySnapshot) => {
          let pendingItems = [];
          querySnapshot.forEach((doc) => {
              pendingItems.push({ id: doc.id, ...doc.data() });
          });

          const countEl = document.getElementById('pending-count');
          if (countEl) countEl.innerText = pendingItems.length;

          if (pendingItems.length === 0) {
              queueContainer.innerHTML = `
                  <div class="admin-placeholder">
                      <i class="fas fa-check-circle" style="color:var(--musha-green);"></i>
                      <p>All caught up! No items in vetting queue.</p>
                  </div>`;
              return;
          }

          queueContainer.innerHTML = pendingItems.map((item, index) => `
              <div class="admin-card" style="animation-delay: ${index * 0.05}s">
                  <img src="${item.image || 'assets/musha.png'}" class="admin-thumb" alt="${item.name}" loading="lazy">
                  <div class="admin-info">
                      <h3>${item.name} <span class="tag">${item.placementTag || 'mall'}</span></h3>
                      <p class="gold-text">$${Number(item.price).toLocaleString()}</p>
                      <p class="vendor-id"><i class="fas fa-user"></i> ${item.vendorName || 'Unknown'}</p>
                      <p class="vendor-id" style="margin-top:2px;"><i class="fas fa-envelope"></i> ${item.vendorEmail || 'No email'}</p>
                      <p class="vendor-id" style="margin-top:2px;"><i class="fas fa-folder"></i> ${item.category || 'Uncategorized'}</p>
                  </div>
                  <div class="admin-actions">
                      <button onclick="approveItem('${item.id}')" class="approve-btn">
                          <i class="fas fa-check"></i> APPROVE
                      </button>
                      <button onclick="rejectItem('${item.id}')" class="reject-btn">
                          <i class="fas fa-trash"></i> REJECT
                      </button>
                  </div>
              </div>
          `).join('');
      }, (error) => {
          console.error("Admin snapshot error:", error);
          queueContainer.innerHTML = `<div class="admin-placeholder"><i class="fas fa-exclamation-triangle" style="color:var(--danger);"></i><p>Error loading queue. Check Firebase rules.</p></div>`;
      });
}

function approveItem(docId) {
    db.collection("vendor_inventory").doc(docId).update({
        status: 'active',
        approvedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showToast("Item approved and is now LIVE!", "success");
    })
    .catch((error) => {
        console.error("Error approving:", error);
        showToast("Failed to approve item.", "error");
    });
}

function rejectItem(docId) {
    if (confirm("Delete this listing permanently?")) {
        db.collection("vendor_inventory").doc(docId).delete()
        .then(() => {
            showToast("Item rejected and removed.", "info");
        })
        .catch((error) => {
            console.error("Error rejecting:", error);
            showToast("Failed to remove item.", "error");
        });
    }
}

/* =========================================
   ADMIN OVERRIDE: Delete ANY product
   ========================================= */

function adminDeleteAnyProduct(productId) {
    if (!confirm("ADMIN OVERRIDE: Permanently delete this product?

This action cannot be undone.")) return;

    db.collection("vendor_inventory").doc(productId).delete()
    .then(() => {
        showToast("Product deleted by admin.", "success");
    })
    .catch((error) => {
        console.error("Admin delete error:", error);
        showToast("Delete failed.", "error");
    });
}

/* =========================================
   ADMIN OVERRIDE: Delete ENTIRE vendor shop
   ========================================= */

function adminDeleteVendorShop(vendorId, vendorName) {
    if (!confirm(`ADMIN OVERRIDE: Delete entire shop "${vendorName}"?

ALL their listings will be permanently removed. This cannot be undone.`)) return;

    // Step 1: Delete all their listings
    db.collection("vendor_inventory")
      .where("vendorId", "==", vendorId)
      .get()
      .then((snapshot) => {
          const batch = db.batch();
          snapshot.forEach((doc) => {
              batch.delete(doc.ref);
          });
          return batch.commit();
      })
      .then(() => {
          // Step 2: Delete vendor account
          return db.collection("vendors").doc(vendorId).delete();
      })
      .then(() => {
          showToast(`Shop "${vendorName}" and all listings deleted.`, "success");
          renderAllVendors(); // Refresh the list
      })
      .catch((error) => {
          console.error("Admin delete shop error:", error);
          showToast("Failed to delete shop.", "error");
      });
}

/* =========================================
   ADMIN: View ALL vendors
   ========================================= */

function renderAllVendors() {
    const container = document.getElementById('vendor-management-list');
    if (!container) return;

    container.innerHTML = '<div class="admin-placeholder"><i class="fas fa-spinner fa-spin"></i><p>Loading vendors...</p></div>';

    db.collection("vendors").get()
    .then((snapshot) => {
        let vendors = [];
        snapshot.forEach((doc) => {
            vendors.push({ id: doc.id, ...doc.data() });
        });

        if (vendors.length === 0) {
            container.innerHTML = '<div class="admin-placeholder"><p>No registered vendors yet.</p></div>';
            return;
        }

        container.innerHTML = vendors.map((v, index) => `
            <div class="admin-card" style="animation-delay: ${index * 0.05}s; border-left-color: var(--danger);">
                <div class="admin-info" style="flex-grow:1;">
                    <h3>${v.shopName} ${v.isAdmin ? '<span class="tag" style="background:rgba(46,175,125,0.2);color:var(--musha-green);">ADMIN</span>' : ''}</h3>
                    <p class="vendor-id"><i class="fas fa-envelope"></i> ${v.email}</p>
                    <p class="vendor-id"><i class="fas fa-phone"></i> ${v.whatsapp || v.phone || 'No phone'}</p>
                    <p class="vendor-id"><i class="fas fa-calendar"></i> Joined: ${v.createdAt ? new Date(v.createdAt.toDate()).toLocaleDateString() : 'Unknown'}</p>
                    <p class="vendor-id"><i class="fas fa-sign-in-alt"></i> Last login: ${v.lastLogin ? new Date(v.lastLogin.toDate()).toLocaleDateString() : 'Never'}</p>
                </div>
                <div class="admin-actions" style="flex-direction:column; gap:8px;">
                    <button onclick="adminDeleteVendorShop('${v.id}', '${v.shopName}')" class="reject-btn" style="font-size:0.75rem;">
                        <i class="fas fa-store-slash"></i> DELETE SHOP
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch((error) => {
        console.error("Error loading vendors:", error);
        container.innerHTML = '<div class="admin-placeholder"><i class="fas fa-exclamation-triangle" style="color:var(--danger);"></i><p>Error loading vendors.</p></div>';
    });
}

/* =========================================
   ADMIN: Password Reset Queue
   ========================================= */

function renderPasswordResetQueue() {
    const container = document.getElementById('password-reset-list');
    if (!container) return;

    container.innerHTML = '<div class="admin-placeholder"><i class="fas fa-spinner fa-spin"></i><p>Loading reset requests...</p></div>';

    db.collection("password_resets")
      .where("status", "==", "pending_admin_review")
      .orderBy("requestedAt", "desc")
      .onSnapshot((snapshot) => {
          let requests = [];
          snapshot.forEach((doc) => {
              requests.push({ id: doc.id, ...doc.data() });
          });

          if (requests.length === 0) {
              container.innerHTML = '<div class="admin-placeholder"><i class="fas fa-check-circle" style="color:var(--musha-green);"></i><p>No pending password reset requests.</p></div>';
              return;
          }

          container.innerHTML = requests.map((req, index) => `
              <div class="admin-card" style="animation-delay: ${index * 0.05}s; border-left-color: var(--warning);">
                  <div class="admin-info" style="flex-grow:1;">
                      <h3>Password Reset <span class="tag" style="background:rgba(255,165,0,0.2);color:var(--warning);">PENDING</span></h3>
                      <p class="vendor-id"><i class="fas fa-store"></i> ${req.vendorShopName}</p>
                      <p class="vendor-id"><i class="fas fa-envelope"></i> ${req.vendorEmail}</p>
                      <p class="vendor-id"><i class="fas fa-phone"></i> Proof: ${req.proofPhone}</p>
                      <p class="vendor-id"><i class="fas fa-clock"></i> Requested: ${req.requestedAt ? new Date(req.requestedAt.toDate()).toLocaleString() : 'Unknown'}</p>
                  </div>
                  <div class="admin-actions" style="flex-direction:column; gap:8px;">
                      <button onclick="approvePasswordReset('${req.id}')" class="approve-btn" style="font-size:0.75rem;">
                          <i class="fas fa-check"></i> VERIFY & RESET
                      </button>
                      <button onclick="rejectPasswordReset('${req.id}')" class="reject-btn" style="font-size:0.75rem; background:#333; color:#888; border-color:#444;">
                          <i class="fas fa-times"></i> REJECT
                      </button>
                  </div>
              </div>
          `).join('');
      }, (error) => {
          console.error("Reset queue error:", error);
          container.innerHTML = '<div class="admin-placeholder"><p>Error loading reset requests.</p></div>';
      });
}

function approvePasswordReset(resetId) {
    db.collection("password_resets").doc(resetId).get()
    .then((doc) => {
        if (!doc.exists) throw new Error("Reset request not found");
        const data = doc.data();

        // Update vendor password
        return db.collection("vendors").doc(data.vendorId).update({
            password: data.newPassword,
            passwordResetAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            // Mark reset as completed
            return db.collection("password_resets").doc(resetId).update({
                status: 'completed',
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
    })
    .then(() => {
        showToast("Password reset approved. Vendor notified.", "success");
    })
    .catch((error) => {
        console.error("Reset approval error:", error);
        showToast("Failed to approve reset.", "error");
    });
}

function rejectPasswordReset(resetId) {
    db.collection("password_resets").doc(resetId).update({
        status: 'rejected',
        rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showToast("Reset request rejected.", "info");
    })
    .catch((error) => {
        console.error("Reset rejection error:", error);
        showToast("Failed to reject request.", "error");
    });
}

/* =========================================
   SIDEBAR FILTERING
   ========================================= */

function filterAdmin(tag) {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Hide all sections
    document.getElementById('verification-desk-section').style.display = 'none';
    document.getElementById('vendor-management-section').style.display = 'none';
    document.getElementById('password-reset-section').style.display = 'none';

    if (tag === 'vendors') {
        document.getElementById('vendor-management-section').style.display = 'block';
        renderAllVendors();
    } else if (tag === 'resets') {
        document.getElementById('password-reset-section').style.display = 'block';
        renderPasswordResetQueue();
    } else {
        document.getElementById('verification-desk-section').style.display = 'block';
        if (tag !== 'all') {
            let query = db.collection("vendor_inventory").where("status", "==", "pending");
            if (tag !== 'all') {
                query = query.where("placementTag", "==", tag);
            }
            renderFilteredQueue(query);
        }
    }
}

function renderFilteredQueue(query) {
    const queueContainer = document.getElementById('admin-pending-list');
    if (!queueContainer) return;

    query.get().then((querySnapshot) => {
        let items = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });

        if (items.length === 0) {
            queueContainer.innerHTML = `<div class="admin-placeholder"><p>No pending items for this filter.</p></div>`;
            return;
        }

        queueContainer.innerHTML = items.map((item, index) => `
            <div class="admin-card" style="animation-delay: ${index * 0.05}s">
                <img src="${item.image || 'assets/musha.png'}" class="admin-thumb" alt="${item.name}">
                <div class="admin-info">
                    <h3>${item.name} <span class="tag">${item.placementTag || 'mall'}</span></h3>
                    <p class="gold-text">$${Number(item.price).toLocaleString()}</p>
                    <p class="vendor-id"><i class="fas fa-user"></i> ${item.vendorName || 'Unknown'}</p>
                </div>
                <div class="admin-actions">
                    <button onclick="approveItem('${item.id}')" class="approve-btn">
                        <i class="fas fa-check"></i> APPROVE
                    </button>
                    <button onclick="rejectItem('${item.id}')" class="reject-btn">
                        <i class="fas fa-trash"></i> REJECT
                    </button>
                </div>
            </div>
        `).join('');
    }).catch((error) => {
        console.error("Filter error:", error);
        showToast("Filter failed to load.", "error");
    });
}

/* =========================================
   REVENUE COUNTER
   ========================================= */

db.collection("vendor_inventory")
  .where("status", "==", "active")
  .onSnapshot((snap) => {
      let total = 0;
      snap.forEach(doc => {
          total += Number(doc.data().price) || 0;
      });
      const revEl = document.getElementById('total-revenue');
      if (revEl) revEl.innerText = `$${total.toLocaleString()}`;
  });

/* =========================================
   INIT
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-pending-list')) {
        renderAdminQueue();
    }
});
