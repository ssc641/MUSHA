/* =========================================
   MOOSHA ADMIN ENGINE v3.0 - GOD MODE
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
                      <p class="vendor-id"><i class="fas fa-user"></i> ${item.vendorName || 'Unknown Vendor'}</p>
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
    if (confirm("Are you sure you want to permanently delete this listing?")) {
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

function filterAdmin(tag) {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    let query = db.collection("vendor_inventory").where("status", "==", "pending");

    if (tag !== 'all') {
        query = query.where("placementTag", "==", tag);
    }

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

// Revenue calculation
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-pending-list')) {
        renderAdminQueue();
    }
});
