
# Fix 7: main.js - Remove all duplicates, consolidate into clean functions
main_js_fixed = '''/* =========================================
   1. CORE ENGINE & NAVIGATION
   ========================================= */

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

/* =========================================
   2. GATEWAY NAVIGATION
   ========================================= */

function openTheMall() {
    const gateway = document.getElementById('gateway-overlay');
    const mallGateway = document.getElementById('mall-gateway');
    const mainContent = document.getElementById('main-content');
    
    // Handle index.html gateway
    if (gateway) {
        gateway.style.transition = "opacity 0.8s ease";
        gateway.style.opacity = "0";
        setTimeout(() => {
            gateway.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
        }, 800);
    }
    
    // Handle mall.html gateway
    if (mallGateway) {
        mallGateway.style.display = 'none';
        if (mainContent) {
            mainContent.style.display = 'block';
            window.scrollTo(0, 0);
        }
    }
    
    console.log("Musha System: Showroom active.");
}

/* =========================================
   3. FURNITURE SECTIONS
   ========================================= */

function showFurnitureSection(quality) {
    const lobbyView = document.getElementById('lobby-view');
    const mallHeader = document.getElementById('mall-header');
    const furnitureGrid = document.getElementById('mall-grid');

    if (lobbyView) lobbyView.style.display = 'none';
    if (mallHeader) mallHeader.style.display = 'flex';
    if (furnitureGrid) {
        furnitureGrid.style.display = 'grid';
        // Filter logic would go here based on quality
        if (typeof furnitureInventory !== 'undefined') {
            const filtered = furnitureInventory.filter(item => 
                item.quality === quality || quality === 'all'
            );
            if (typeof displayFurniture === 'function') {
                displayFurniture(filtered);
            }
        }
    }
    window.scrollTo(0,0);
}

function filterFurnitureByRoom(room) {
    const lobbyView = document.getElementById('lobby-view');
    const mallHeader = document.getElementById('mall-header');
    const furnitureGrid = document.getElementById('mall-grid');

    if (lobbyView) lobbyView.style.display = 'none';
    if (mallHeader) mallHeader.style.display = 'flex';
    if (furnitureGrid) {
        furnitureGrid.style.display = 'grid';
        if (typeof furnitureInventory !== 'undefined') {
            const filtered = furnitureInventory.filter(item => item.category === room);
            if (typeof displayFurniture === 'function') {
                displayFurniture(filtered);
            }
        }
    }
    window.scrollTo(0,0);
}

/* =========================================
   4. STATHECH LOGISTICS (EcoCash & Tracking)
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
    if (resultGrid) {
        resultGrid.innerHTML = `
            <div class="tracker-container">
                <div class="tracker-card">
                    <h3>ORDER #${id}</h3>
                    <span class="status-pill">${order.status}</span>
                    <p><strong>Item:</strong> ${order.item}</p>
                    <p><strong>Driver:</strong> ${order.driver}</p>
                    <p><strong>Vehicle:</strong> ${order.vehicle}</p>
                    <p><strong>Location:</strong> ${order.location}</p>
                    <button onclick="location.reload()" class="back-btn">Return to Mall</button>
                </div>
            </div>
        `;
    }
}

/* =========================================
   5. MARKETPLACE UPLOADS (Snap & List)
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

/* =========================================
   6. INITIALIZATION
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Musha Engine: Online.");
    
    // Auto-fix: if the user is on index.html
    if (document.getElementById('landing-gateway')) {
        console.log("Musha Landing: Gateway Loaded.");
    }

    // Auto-close sidebar on mobile after clicks
    const listItems = document.querySelectorAll('.sections li');
    listItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) toggleSidebar();
        });
    });
});
'''

with open('/mnt/agents/output/main.js', 'w') as f:
    f.write(main_js_fixed)

print("main.js fixed and saved.")
