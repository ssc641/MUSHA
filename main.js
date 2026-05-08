/* =========================================
   1. CORE ENGINE & NAVIGATION
   ========================================= */

// Fixed Toggle: Uses ONE logic for the whole system
function toggleSidebar() {
    const sidebar = document.querySelector('.side-bar');
    const mainContent = document.getElementById('main-content');
    const icon = document.querySelector('.menu-toggle i');

    if (sidebar) {
        sidebar.classList.toggle('hidden');
        
        if (mainContent) {
            mainContent.classList.toggle('expanded');
        }

        if (icon) {
            if (sidebar.classList.contains('hidden')) {
                icon.classList.replace('fa-times', 'fa-bars');
            } else {
                icon.classList.replace('fa-bars', 'fa-times');
            }
        }
    }
}

/**
 * Handles the transition from Gateway to Showroom.
 * Uses the ID 'mall-gateway' to match your updated CSS swap system.
 */
function openTheMall() {
    const overlay = document.getElementById('mall-gateway');
    const mainContent = document.getElementById('main-content');
    
    if (overlay) {
        // Start the fade out (Transition set in style.css)
        overlay.style.opacity = '0';
        
        // Ensure main content is visible behind the overlay
        if (mainContent) mainContent.style.display = 'block';

        // Physically remove overlay after fade to allow clicks
        setTimeout(() => { 
            overlay.style.display = 'none'; 
            console.log("SSC System: MushaHub Showroom active.");
        }, 800);
    }
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
    if (document.getElementById('pending-list')) {
        loadPendingItems();
    }
    
    const listItems = document.querySelectorAll('.sections li');
    listItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) toggleSidebar();
        });
    });
});
