/* =========================================
   STA-TECH ADMIN ENGINE: GOD MODE
   ========================================= */

let pendingInventory = JSON.parse(localStorage.getItem('musha_vendor_inventory')) || [];

/**
 * Load and Render the Pending Queue
 */
function renderAdminQueue() {
    const queueContainer = document.getElementById('admin-pending-list');
    if (!queueContainer) return;

    // Filter for only items that need vetting
    const pendingItems = pendingInventory.filter(item => item.status === 'pending');

    if (pendingItems.length === 0) {
        queueContainer.innerHTML = `<p class="empty-msg">God Mode: No items currently in vetting queue.</p>`;
        return;
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
function approveItem(itemID) {
    const itemIndex = pendingInventory.findIndex(i => i.id === itemID);
    if (itemIndex > -1) {
        pendingInventory[itemIndex].status = 'active';
        localStorage.setItem('musha_vendor_inventory', JSON.stringify(pendingInventory));
        
        // CEO Feedback
        console.log(`Musha System: ${pendingInventory[itemIndex].name} is now LIVE.`);
        renderAdminQueue();
        alert("Item Approved & Moved to Live Market.");
    }
}

/**
 * Reject Item: Removes it from the system
 */
function rejectItem(itemID) {
    if (confirm("Are you sure you want to delete this listing?")) {
        pendingInventory = pendingInventory.filter(i => i.id !== itemID);
        localStorage.setItem('musha_vendor_inventory', JSON.stringify(pendingInventory));
        renderAdminQueue();
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', renderAdminQueue);
