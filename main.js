function openTheMall() {
    // Finds the gateway and triggers the CSS fade-out transition
    const gateway = document.getElementById('gateway-overlay');
    
    if (gateway) {
        gateway.classList.add('mall-opened');
        
        // After the fade finishes (1.5s), we hide it so it doesn't block clicks
        setTimeout(() => {
            gateway.style.display = 'none';
        }, 1500);
    }
    
    console.log("SSC Grand Mall is now open.");
}

/**
 * Logistics Tracker: Swaps icons and displays the modal
 * @param {string} type - 'car' or 'truck'
 */
function openTracker(type) {
    const icon = document.querySelector('.truck-icon');
    const modal = document.getElementById('tracking-modal');

    if (icon) {
        // Swap icon based on whether it's Automotive or Furniture
        icon.innerHTML = (type === 'car') ? '🚗' : '🚚'; 
    }

    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Placeholder for section switching logic
 */
function showSection(sectionId) {
    console.log("Navigating to: " + sectionId);
    // You can add logic here to highlight tabs or change background images
}

/* =========================================
   MALL NAVIGATION LOGIC
   ========================================= */

function openTheMall() {
    document.getElementById('gateway-overlay').style.display = 'none';
}

function showFurnitureSection(quality) {
    const lobbyView = document.getElementById('lobby-view');
    const furnitureGrid = document.getElementById('furniture-results-grid');

    // 1. Hide the fountain lobby
    lobbyView.style.display = 'none';

    // 2. Show the results grid
    furnitureGrid.style.display = 'grid';

    // 3. Filter the furnitureInventory by the quality clicked
    // This assumes you add a 'quality' property to your items in furniture.js
    const filtered = furnitureInventory.filter(item => 
        item.quality === quality || quality === 'all'
    );

    // 4. Call the display function from furniture.js
    displayFurniture(filtered);
    
    // Scroll to top so user sees the new results
    window.scrollTo(0,0);
}

// Function to handle the sidebar room links
function filterFurnitureByRoom(roomName) {
    showFurnitureSection('all'); // Ensure the grid is visible
    const filtered = furnitureInventory.filter(item => item.category === roomName);
    displayFurniture(filtered);
}
/* =========================================
   STATHECH LOGISTICS: TRACKING SYSTEM
   ========================================= */

// Dummy data for testing (In a real app, this comes from a database)
const activeOrders = {
    "MSH-101": {
        item: "Royal Velvet Sofa",
        status: "Out for Delivery",
        driver: "Tinashe M.",
        vehicle: "White Toyota Hilux (ABW-1234)",
        eta: "14:45 PM",
        location: "Riverside, Gweru"
    },
    "MSH-202": {
        item: "Defy 4-Plate Stove",
        status: "Processing at Hub",
        driver: "Pending",
        vehicle: "StaTech Logistics Van",
        eta: "Tomorrow",
        location: "Harare Main Hub"
    }
};

function trackOrder() {
    const id = document.getElementById('track-id').value.toUpperCase();
    const resultGrid = document.getElementById('main-content'); // We'll hijack the main area to show the status
    const order = activeOrders[id];

    if (!order) {
        alert("Order ID not found. Please check your receipt.");
        return;
    }

    // Hide the lobby/grid and show the tracker
    resultGrid.innerHTML = `
        <div class="tracker-container">
            <div class="tracker-card">
                <div class="tracker-header">
                    <h3>ORDER #${id}</h3>
                    <span class="status-pill">${order.status}</span>
                </div>
                <div class="tracker-body">
                    <p><strong>Product:</strong> ${order.item}</p>
                    <p><strong>Current Location:</strong> ${order.location}</p>
                    <hr>
                    <div class="driver-profile">
                        <i class="fas fa-user-circle fa-3x"></i>
                        <div class="driver-details">
                            <p><strong>Driver:</strong> ${order.driver}</p>
                            <p><strong>Vehicle:</strong> ${order.vehicle}</p>
                            <p><strong>Estimated Arrival:</strong> ${order.eta}</p>
                        </div>
                    </div>
                </div>
                <button class="reset-btn" onclick="location.reload()">Back to Mall</button>
            </div>
        </div>
    `;
}

/* =========================================
   GENERATE REAL ORDERS
   ========================================= */
function completePurchase() {
    if (mushaCart.length === 0) return alert("Cart is empty!");

    // 1. Generate a random ID like MSH-552
    const newOrderId = "MSH-" + Math.floor(100 + Math.random() * 900);
    
    // 2. Add it to our "Active Orders" database
    activeOrders[newOrderId] = {
        item: mushaCart[0].name + (mushaCart.length > 1 ? " & more" : ""),
        status: "Processing",
        driver: "Assigning...",
        vehicle: "StaTech Fleet",
        eta: "Calculating...",
        location: "Musha Sorting Hub"
    };

    // 3. Clear cart and show the ID to the user
    alert("SUCCESS! Your Order ID is: " + newOrderId + "\nWrite this down to track your delivery!");
    mushaCart = [];
    localStorage.setItem('mushaCart', JSON.stringify(mushaCart));
    location.reload(); 
}
/* =========================================
   VENDOR PORTAL: ADD NEW ITEM
   ========================================= */
function vendorAddProduct(event) {
    event.preventDefault(); // Stop page from refreshing

    const newProduct = {
        id: Date.now(), // Unique ID based on time
        name: document.getElementById('v-name').value,
        price: Number(document.getElementById('v-price').value),
        category: document.getElementById('v-category').value,
        condition: document.getElementById('v-condition').value,
        store: "Vendor Partner", // This would be the logged-in store name
        isVerified: true,
        image: "assets/placeholder.jpg" // They can paste a link later
    };

    // Add to our main list
    furnitureInventory.push(newProduct);
    
    alert("Success! " + newProduct.name + " is now live in the Mall.");
    displayFurniture(furnitureInventory); // Refresh the grid
}
/* =========================================
   GOD MODE: VENDOR MANAGEMENT
   ========================================= */
const registeredVendors = [
    { id: "V-01", name: "Gweru Furniture King", status: "Active" },
    { id: "V-02", name: "Budget Beds Hub", status: "Active" }
];

function blockVendor(vendorId) {
    const vendor = registeredVendors.find(v => v.id === vendorId);
    if (vendor) {
        vendor.status = "BLOCKED";
        
        // Logic: Remove all their products from the mall instantly
        furnitureInventory = furnitureInventory.filter(item => item.storeId !== vendorId);
        
        alert(`GOD MODE: ${vendor.name} has been banned. All products removed.`);
        displayFurniture(furnitureInventory); // Update the Mall live
    }
}
/* =========================================
   UNIVERSAL VENDOR UPLOAD (Cars + Furniture)
   ========================================= */
function universalUpload(event) {
    event.preventDefault();

    const categoryType = document.getElementById('listing-type').value; // 'car' or 'furniture'
    
    const newListing = {
        id: "PENDING-" + Date.now(),
        name: document.getElementById('p-name').value,
        price: document.getElementById('p-price').value,
        // CRITICAL: New listings are ALWAYS false by default
        isVerified: false, 
        seller: "Public User", 
        image: "assets/pending-review.jpg" 
    };

    if (categoryType === 'car') {
        carInventory.push(newListing);
        alert("Car listed! It will appear as 'Unverified' until StaTech reviews it.");
    } else {
        furnitureInventory.push(newListing);
        alert("Furniture listed! Waiting for verification.");
    }
}
// Show the photo immediately after they take it
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('output-preview');
        output.src = reader.result;
        output.style.display = 'block';
        document.querySelector('.camera-trigger').style.display = 'none';
    }
    reader.readAsDataURL(event.target.files[0]);
}

// Handle the upload
function handlePublicUpload(event) {
    event.preventDefault();
    
    const category = document.getElementById('p-category').value;
    const itemName = document.getElementById('p-name').value;
    
    // In a real app, this would go to a database. 
    // For now, we'll alert the success and you can see it in God Mode.
    alert(`Musha: ${itemName} has been submitted! StaTech will review the photo for verification.`);
    
    // Redirect back to Mall
    window.location.href = 'mall.html';
}
/* =========================================
   GOD MODE: ADMIN ACTIONS
   ========================================= */

function loadPendingItems() {
    const list = document.getElementById('pending-list');
    if (!list) return;

    // Combine cars and furniture to see everything pending
    const allItems = [...carInventory, ...furnitureInventory];
    const pending = allItems.filter(item => item.isVerified === false);

    document.getElementById('pending-count').innerText = pending.length;

    list.innerHTML = pending.map(item => `
        <div class="admin-card">
            <img src="${item.image}" alt="Preview">
            <div class="admin-card-info">
                <h4>${item.name}</h4>
                <p class="gold-text">$${item.price}</p>
                <p>Seller: ${item.seller || 'Public User'}</p>
                
                <div class="admin-actions">
                    <button class="verify-btn" onclick="approveItem(${item.id})">
                        <i class="fas fa-check"></i> VERIFY
                    </button>
                    <button class="ban-btn" onclick="deleteItem(${item.id})">
                        <i class="fas fa-trash"></i> DELETE
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function approveItem(id) {
    // Find item and set isVerified to true
    let item = carInventory.find(i => i.id === id) || furnitureInventory.find(i => i.id === id);
    if (item) {
        item.isVerified = true;
        alert("ITEM VERIFIED: It is now live with the StaTech Badge!");
        loadPendingItems(); // Refresh the list
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', loadPendingItems);
/* =========================================
   STATHECH PAYMENT & ORDER FINALIZATION
   ========================================= */

function openPayment() {
    document.getElementById('payment-modal').style.display = 'flex';
}

function submitOrderFinal() {
    const proof = document.getElementById('payment-proof').files[0];
    
    if (!proof) {
        alert("Please upload your EcoCash confirmation screenshot first.");
        return;
    }

    // Generate the Real Order ID
    const orderId = "MSH-" + Math.floor(1000 + Math.random() * 9000);
    
    // Add to your God Mode list for manual verification
    activeOrders[orderId] = {
        item: "Pending Verification",
        status: "Awaiting Payment Approval",
        paymentStatus: "Pending Review",
        driver: "Waiting...",
        eta: "TBD"
    };

    alert(`PAYMENT SUBMITTED!\nYour Order ID is: ${orderId}\nStaTech will verify your payment and start the delivery soon.`);
    
    // Clear cart and redirect
    mushaCart = [];
    localStorage.setItem('mushaCart', JSON.stringify(mushaCart));
    location.href = 'mall.html';
}
function requestVerification(itemId) {
    const item = furnitureInventory.find(i => i.id === itemId) || carInventory.find(i => i.id === itemId);
    
    // Show them the payment instructions
    const msg = `To get the "Verified" badge for ${item.name}, please pay $5 to Ecocash Merchant 123456. Use Reference: VERIFY-${item.id}`;
    
    alert(msg);
    // In God Mode, this item will now highlight as "Payment Pending"
}
/* =========================================
   STATHECH PAYMENT & ORDER FINALIZATION
   ========================================= */

function openPayment() {
    document.getElementById('payment-modal').style.display = 'flex';
}

function submitOrderFinal() {
    const proof = document.getElementById('payment-proof').files[0];
    
    if (!proof) {
        alert("Please upload your EcoCash confirmation screenshot first.");
        return;
    }

    // Generate the Real Order ID
    const orderId = "MSH-" + Math.floor(1000 + Math.random() * 9000);
    
    // Add to your God Mode list for manual verification
    activeOrders[orderId] = {
        item: "Pending Verification",
        status: "Awaiting Payment Approval",
        paymentStatus: "Pending Review",
        driver: "Waiting...",
        eta: "TBD"
    };

    alert(`PAYMENT SUBMITTED!\nYour Order ID is: ${orderId}\nStaTech will verify your payment and start the delivery soon.`);
    
    // Clear cart and redirect
    mushaCart = [];
    localStorage.setItem('mushaCart', JSON.stringify(mushaCart));
    location.href = 'mall.html';
}







