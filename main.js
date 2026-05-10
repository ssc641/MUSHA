/* =========================================
   1. CORE ENGINE & NAVIGATION
   ========================================= */

// Fixed Toggle: Uses ONE logic for the whole system
function toggleSidebar() {
    const sidebar = document.querySelector('.side-bar');
    const mainContent = document.getElementById('main-content');
    const icon = document.querySelector('.menu-toggle i');

    if (sidebar) {
        // Toggle the 'hidden' class
        sidebar.classList.toggle('hidden');
        
        // Sync the main content margin so it doesn't get squashed
        if (mainContent) {
            mainContent.classList.toggle('expanded');
        }

        // Switch Icon between Bars and X
        if (icon) {
            if (sidebar.classList.contains('hidden')) {
                icon.classList.replace('fa-times', 'fa-bars');
            } else {
                icon.classList.replace('fa-bars', 'fa-times');
            }
        }
    }
}

// Handles the transition from Gateway to Showroom
function openTheMall() {
    const gateway = document.getElementById('gateway-overlay');
    const mainContent = document.getElementById('main-content');
    
    if (gateway) gateway.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    
    console.log("SSC System: Showroom active.");
}

/* =========================================
   2. FURNITURE & CAR SYNC
   ========================================= */

function showFurnitureSection(quality) {
    const lobbyView = document.getElementById('lobby-view');
    const furnitureGrid = document.getElementById('furniture-results-grid');

    if (lobbyView) lobbyView.style.display = 'none';
    if (furnitureGrid) {
        furnitureGrid.style.display = 'grid';
        // Ensure furniture.js data is loaded
        if (typeof furnitureInventory !== 'undefined') {
            const filtered = furnitureInventory.filter(item => 
                item.quality === quality || quality === 'all'
            );
            displayFurniture(filtered);
        }
    }
    window.scrollTo(0,0);
}

/* =========================================
   3. STATHECH LOGISTICS (EcoCash & Tracking)
   ========================================= */

const activeOrders = {
    "MSH-101": {
        item: "Royal Velvet Sofa",
        status: "Out for Delivery",
        driver: "Tinashe M.",
        vehicle: "White Toyota Hilux",
        location: "Riverside, Gweru"
    }
};

function trackOrder() {
    const idInput = document.getElementById('track-id');
    const id = idInput ? idInput.value.toUpperCase() : "";
    const order = activeOrders[id];

    if (!order) return alert("Order ID not found. Check your EcoCash receipt.");

    const resultGrid = document.getElementById('main-content');
    resultGrid.innerHTML = `
        <div class="tracker-container">
            <div class="tracker-card">
                <h3>ORDER #${id}</h3>
                <span class="status-pill">${order.status}</span>
                <p><strong>Item:</strong> ${order.item}</p>
                <p><strong>Driver:</strong> ${order.driver}</p>
                <button onclick="location.reload()" class="back-btn">Return to Mall</button>
            </div>
        </div>
    `;
}

/* =========================================
   4. MARKETPLACE UPLOADS (Snap & List)
   ========================================= */

function previewImage(event) {
    const reader = new FileReader();
    const file = event.target.files[0];
    
    reader.onload = function() {
        const output = document.getElementById('output-preview');
        if (output) {
            output.src = reader.result;
            output.style.display = 'block';
            // Hide the 'Tap to Snap' icon once photo is taken
            const trigger = document.querySelector('.camera-trigger');
            if (trigger) trigger.style.display = 'none';
        }
    }
    if (file) reader.readAsDataURL(file);
}

function handlePublicUpload(event) {
    event.preventDefault();
    const itemName = document.getElementById('p-name').value;
    alert(`SUBMITTED: ${itemName} is now in God Mode for verification.`);
    window.location.href = 'index.html';
}

/* =========================================
   5. ADMIN & INITIALIZATION
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check for Admin Desk
    if (document.getElementById('pending-list')) {
        loadPendingItems();
    }
    
    // 2. Auto-close sidebar on mobile after clicks
    const listItems = document.querySelectorAll('.sections li');
    listItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) toggleSidebar();
        });
    });
});

/* =========================================
   CORE ENGINE: GATEWAY NAVIGATION (RECTIFIED)
   ========================================= */

/**
 * Handles the transition from the Mall Entrance to the Main Showroom.
 * Fixed: Uses the specific 'mall-gateway' ID to avoid conflicts.
 */
function openTheMall() {
    const gateway = document.getElementById('mall-gateway');
    const mainContent = document.getElementById('main-content');
    
    if (gateway) {
        gateway.style.display = 'none';
    }
    if (mainContent) {
        mainContent.style.display = 'block';
        // Force a scroll to top to ensure the CEO sees the full showroom
        window.scrollTo(0, 0); 
    }
    console.log("Musha System: Showroom Active.");
}

/**
 * Sidebar Toggle logic for Mall and Auto pages.
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.side-bar');
    const icon = document.querySelector('.menu-toggle i');

    if (sidebar) {
        sidebar.classList.toggle('show-sidebar');
        
        // Sync icon state if it exists
        if (icon) {
            if (sidebar.classList.contains('show-sidebar')) {
                icon.className = 'fas fa-bars';
            } else {
                icon.className = 'fas fa-times';
            }
        }
    }
}

/**
 * FIX FOR GET ISSUE: Initialization
 * Ensures the system checks for gateways only after the page is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Musha Engine: Online.");
    
    // Auto-fix: if the user is on index.html, we don't want mall logic firing
    if (document.getElementById('landing-gateway')) {
        console.log("Musha Landing: Tiny Logo Loaded.");
    }
});

function handlePublicUpload(event) {
    event.preventDefault();
    
    const category = document.getElementById('p-category').value;
    const itemName = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;

    // Feedback that respects the system
    if (category === "Vehicle") {
        alert(`SUCCESS: Your ${itemName} has been sent to the Auto Hub for vetting.`);
    } else {
        alert(`SUCCESS: Your ${itemName} is being reviewed for the Grand Mall showroom.`);
    }

    // Redirect to index after submission
    window.location.href = 'index.html';
}

/**
 * Universal Contact Logic
 * Connects the buyer directly to the vendor's phone via WhatsApp
 */
function contactVendor(shopName, itemName, phone) {
    // If no phone is provided, it defaults to the StaTech Hub Line
    const targetPhone = phone || "263771111111"; 
    const message = `Hi ${shopName}, I saw your listing for the ${itemName} on the Musha Virtual Mall. Is it still available?`;
    
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, '_blank');
}

function openTheMall() {
    const gateway = document.getElementById('gateway-overlay');
    const mainContent = document.getElementById('main-content');
    
    if (gateway) {
        gateway.style.transition = "opacity 0.8s ease"; // Adds a premium fade
        gateway.style.opacity = "0";
        setTimeout(() => {
            gateway.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
        }, 800);
    }
    
    console.log("SSC System: Showroom active.");
}
