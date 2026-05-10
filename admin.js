/* =========================================
   STA-TECH ADMIN ENGINE: GOD MODE
   ========================================= */

let pendingInventory = JSON.parse(localStorage.getItem('musha_vendor_inventory')) || [];

/**
 * Load and Render the Pending Queue
 */
function renderAdminQueue() {
    const queueContainer = document.getElementById('admin-pending-list');
    
    // Listen to Firestore for PENDING items
    db.collection("vendor_inventory")
      .where("status", "==", "pending")
      .onSnapshot((querySnapshot) => {
          let pendingItems = [];
          querySnapshot.forEach((doc) => {
              pendingItems.push({ id: doc.id, ...doc.data() });
          });

          if (pendingItems.length === 0) {
              queueContainer.innerHTML = `<p class="empty-msg">God Mode: No items in vetting queue.</p>`;
              return;
          }

          // Use your existing .map logic to show the cards
          queueContainer.innerHTML = pendingItems.map(item => `
              <div class="admin-card">
                  <img src="${item.image}" class="admin-thumb">
                  <h3>${item.name}</h3>
                  <button onclick="approveItem('${item.id}')">APPROVE</button>
              </div>
          `).join('');
      });
}

    queueContainer.innerHTML = pendingItems.map(item => `
        <div class="admin-card">
            <img src="${item.image}" class="admin-thumb">
            <div class="admin-info">
                <h3>${item.name} <span class="tag">${item.placementTag}</span></h3>
                <p class="gold-text">$${item.price}</p>
                <p class="vendor-id">Vendor: ${item.vendorID}</p>
            </div>
            <div class="admin-actions">
                <button onclick="approveItem(${item.id})" class="approve-btn">
                    <i class="fas fa-check"></i> APPROVE
                </button>
                <button onclick="rejectItem(${item.id})" class="reject-btn">
                    <i class="fas fa-trash"></i> REJECT
                </button>
            </div>
        </div>
    `).join('');
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
        });
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', renderAdminQueue);

// Add this to admin.js to handle the sidebar filtering
function filterAdmin(tag) {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const allItems = JSON.parse(localStorage.getItem('musha_vendor_inventory')) || [];
    const queueContainer = document.getElementById('admin-pending-list');
    
    // Filter by 'pending' AND the specific placement tag
    const filtered = allItems.filter(item => {
        if (tag === 'all') return item.status === 'pending';
        return item.status === 'pending' && item.placementTag === tag;
    });

    // Re-render only the filtered items
    renderCustomAdminList(filtered);
}

function renderCustomAdminList(items) {
    const container = document.getElementById('admin-pending-list');
    // ... same mapping logic as approveItem ...
    // (Ensure this function mimics the renderAdminQueue logic for the items passed to it)
}
