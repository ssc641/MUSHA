/* =========================================
   1. CORE ENGINE & NAVIGATION
   ========================================= */

// Handles the opening fade effect for the main entrance
function openTheMall() {
    const gateway = document.getElementById('gateway-overlay');
    if (gateway) {
        gateway.classList.add('mall-opened');
        setTimeout(() => {
            gateway.style.display = 'none';
        }, 1500);
    }
    console.log("SSC Grand Mall: System Online.");
}

// Mobile Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.side-bar');
    if (sidebar) sidebar.classList.toggle('active');
}

// Auto-close sidebar on mobile after clicking a link
document.querySelectorAll('.sections li').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) toggleSidebar();
    });
});

/* =========================================
   2. PRODUCT FILTERING & DISPLAY
   ========================================= */

function showFurnitureSection(quality) {
    const lobbyView = document.getElementById('lobby-view');
    const furnitureGrid = document.getElementById('furniture-results-grid');

    if (lobbyView) lobbyView.style.display = 'none';
    if (furnitureGrid) furnitureGrid.style.display = 'grid';

    // Filters by quality (Premium/Standard)
    const filtered = furnitureInventory.filter(item => 
        item.quality === quality || quality === 'all'
    );

    displayFurniture(filtered);
    window.scrollTo(0,0);
}

function filterFurnitureByRoom(roomName) {
    showFurnitureSection('all');
    const filtered = furnitureInventory.filter(item => item.category === roomName);
    displayFurniture(filtered);
}

/* =========================================
   3. STATHECH LOGISTICS: TRACKING SYSTEM
   ========================================= */

const activeOrders = {
    "MSH-101": {
        item: "Royal Velvet Sofa",
        status: "Out for Delivery",
        driver: "Tinashe M.",
        vehicle: "White Toyota Hilux",
        eta: "14:45 PM",
        location: "Riverside, Gweru"
    }
};

function trackOrder() {
    const idInput = document.getElementById('track-id');
    if (!idInput) return;
    
    const id = idInput.value.toUpperCase();
    const resultGrid = document.getElementById('main-content');
    const order = activeOrders[id];

    if (!order) return alert("Order ID not found. Please check your receipt.");

    resultGrid.innerHTML = `
        <div class="tracker-container">
            <div class="tracker-card">
                <div class="tracker-header">
                    <h3>ORDER #${id}</h3>
                    <span class="status-pill">${order.status}</span>
                </div>
                <div class="tracker-body">
                    <p><strong>Product:</strong> ${order.item}</p>
                    <p><strong>Location:</strong> ${order.location}</p>
                    <div class="driver-profile">
                        <i class="fas fa-user-circle fa-3x"></i>
                        <div class="driver-details">
                            <p><strong>Driver:</strong> ${order.driver}</p>
                            <p><strong>Vehicle:</strong> ${order.vehicle}</p>
                        </div>
                    </div>
                </div>
                <button class="back-btn" onclick="location.reload()">Back to Mall</button>
            </div>
        </div>
    `;
}

/* =========================================
   4. VENDOR & PUBLIC UPLOADS (Marketplace)
   ========================================= */

function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('output-preview');
        if (output) {
            output.src = reader.result;
            output.style.display = 'block';
            document.querySelector('.camera-trigger').style.display = 'none';
        }
    }
    reader.readAsDataURL(event.target.files[0]);
}

function handlePublicUpload(event) {
    event.preventDefault();
    const itemName = document.getElementById('p-name').value;
    alert(`Musha: ${itemName} submitted! StaTech God Mode will review the listing.`);
    window.location.href = 'mall.html';
}

/* =========================================
   5. GOD MODE: ADMIN & VERIFICATION
   ========================================= */

function loadPendingItems() {
    const list = document.getElementById('pending-list');
    if (!list) return;

    const allItems = [...carInventory, ...furnitureInventory];
    const pending = allItems.filter(item => item.isVerified === false);

    document.getElementById('pending-count').innerText = pending.length;

    list.innerHTML = pending.map(item => `
        <div class="admin-card">
            <img src="${item.image}" alt="Preview">
            <div class="admin-card-info">
                <h4>${item.name}</h4>
                <div class="admin-actions">
                    <button class="verify-btn" onclick="approveItem(${item.id})">VERIFY</button>
                    <button class="ban-btn" onclick="deleteItem(${item.id})">DELETE</button>
                </div>
            </div>
        </div>
    `).join('');
}

function approveItem(id) {
    let item = carInventory.find(i => i.id === id) || furnitureInventory.find(i => i.id === id);
    if (item) {
        item.isVerified = true;
        alert("ITEM VERIFIED: Badge added.");
        loadPendingItems();
    }
}

/* =========================================
   6. PAYMENTS (EcoCash Portal)
   ========================================= */

function openPayment() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.style.display = 'flex';
}

function submitOrderFinal() {
    const proof = document.getElementById('payment-proof').files[0];
    if (!proof) return alert("Please upload EcoCash confirmation screenshot.");

    const orderId = "MSH-" + Math.floor(1000 + Math.random() * 9000);
    alert(`PAYMENT SUBMITTED! Order ID: ${orderId}`);
    
    // Reset Cart
    localStorage.setItem('mushaCart', JSON.stringify([]));
    location.href = 'mall.html';
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pending-list')) loadPendingItems();
});
