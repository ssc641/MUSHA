
# Fix 4: admin.js - Remove orphaned code, fix syntax, complete renderAdminQueue
admin_js_fixed = '''/* =========================================
   STA-TECH ADMIN ENGINE: GOD MODE
   ========================================= */

/**
 * Load and Render the Pending Queue from Firestore
 */
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

          document.getElementById('pending-count').innerText = pendingItems.length;

          if (pendingItems.length === 0) {
              queueContainer.innerHTML = `
                  <div class="admin-placeholder">
                      <i class="fas fa-check-circle" style="font-size:3rem; color:var(--musha-green);"></i>
                      <p>God Mode: No items in vetting queue.</p>
                  </div>`;
              return;
          }

          queueContainer.innerHTML = pendingItems.map(item => `
              <div class="admin-card">
                  <img src="${item.image || 'assets/musha.png'}" class="admin-thumb" alt="${item.name}">
                  <div class="admin-info">
                      <h3>${item.name} <span class="tag">${item.placementTag || 'mall'}</span></h3>
                      <p class="gold-text">$${Number(item.price).toLocaleString()}</p>
                      <p class="vendor-id">Vendor: ${item.vendorName || 'Unknown'}</p>
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
          queueContainer.innerHTML = `<p class="empty-msg">Error loading queue. Check Firebase rules.</p>`;
      });
}

/**
 * Approve Item: Moves it to the live market
 */
function approveItem(docId) {
    db.collection("vendor_inventory").doc(docId).update({
        status: 'active'
    })
    .then(() => {
        alert("Item is now LIVE in the Grand Mall!");
    })
    .catch((error) => {
        console.error("Error updating document: ", error);
        alert("Failed to approve. Check console.");
    });
}

/**
 * Reject Item: Removes it from the system
 */
function rejectItem(docId) {
    if (confirm("Are you sure you want to delete this listing?")) {
        db.collection("vendor_inventory").doc(docId).delete()
        .then(() => {
            alert("Item rejected and removed from system.");
        })
        .catch((error) => {
            console.error("Error removing document: ", error);
            alert("Failed to reject. Check console.");
        });
    }
}

/**
 * Sidebar filtering for admin
 */
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
            queueContainer.innerHTML = `<p class="empty-msg">No pending items for this filter.</p>`;
            return;
        }

        queueContainer.innerHTML = items.map(item => `
            <div class="admin-card">
                <img src="${item.image || 'assets/musha.png'}" class="admin-thumb" alt="${item.name}">
                <div class="admin-info">
                    <h3>${item.name} <span class="tag">${item.placementTag || 'mall'}</span></h3>
                    <p class="gold-text">$${Number(item.price).toLocaleString()}</p>
                    <p class="vendor-id">Vendor: ${item.vendorName || 'Unknown'}</p>
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
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-pending-list')) {
        renderAdminQueue();
    }
});
'''

with open('/mnt/agents/output/admin.js', 'w') as f:
    f.write(admin_js_fixed)

print("admin.js fixed and saved.")
