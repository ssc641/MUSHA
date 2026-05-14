/* =========================================
   MOOSHA CORE ENGINE v3.0
   ========================================= */

function toggleSidebar() {
    const sidebar = document.querySelector('.side-bar');
    const icon = document.querySelector('.menu-toggle i');
    if (sidebar) {
        sidebar.classList.toggle('active');
        if (icon) {
            if (sidebar.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        }
    }
}

function openTheMall() {
    const gateway = document.getElementById('gateway-overlay');
    const mallGateway = document.getElementById('mall-gateway');
    const mainContent = document.getElementById('main-content');
    if (gateway) {
        gateway.style.transition = "opacity 0.8s ease";
        gateway.style.opacity = "0";
        setTimeout(() => {
            gateway.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
        }, 800);
    }
    if (mallGateway) {
        mallGateway.style.display = 'none';
        if (mainContent) {
            mainContent.style.display = 'block';
            window.scrollTo(0, 0);
        }
    }
    console.log("Musha System: Showroom active.");
}

function showFurnitureSection(quality) {
    const lobbyView = document.getElementById('lobby-view');
    const mallHeader = document.getElementById('mall-header');
    const furnitureGrid = document.getElementById('mall-grid');
    if (lobbyView) lobbyView.style.display = 'none';
    if (mallHeader) mallHeader.style.display = 'flex';
    if (furnitureGrid) {
        furnitureGrid.style.display = 'grid';
        if (typeof furnitureInventory !== 'undefined') {
            const filtered = furnitureInventory.filter(item => item.quality === quality || quality === 'all');
            if (typeof displayFurniture === 'function') displayFurniture(filtered);
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
            if (typeof displayFurniture === 'function') displayFurniture(filtered);
        }
    }
    window.scrollTo(0,0);
}

const activeOrders = {
    "MSH-101": { item: "Royal Velvet Sofa", status: "Out for Delivery", driver: "Tinashe M.", vehicle: "White Toyota Hilux", location: "Riverside, Gweru" }
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
            </div>`;
    }
}

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

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.classList.add('show'); });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

/* =========================================
   MOOSHA TRANSPORT CONCIERGE
   ========================================= */
const MOOSHA_LOGISTICS_WHATSAPP = "263779041144";

function transportWithMoosha(itemName, vendorName, price, source) {
    const msg = `Hi Moosha, I'm interested in buying *${itemName}* from *${vendorName || 'a vendor'}* (priced at $${Number(price).toLocaleString()}) on the ${source || 'marketplace'}. Can you help arrange delivery to my area? I'm ready to pay for transport.`;
    window.open(`https://wa.me/${MOOSHA_LOGISTICS_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
}


/* =========================================
   COMPARISON MODAL SYSTEM
   ========================================= */
let _compareModalCreated = false;

function ensureCompareModal() {
    if (_compareModalCreated) return;
    const modalHTML = `
        <div id="compare-modal-overlay" class="compare-modal-overlay" onclick="closeCompareModal(event)">
            <div class="compare-modal" onclick="event.stopPropagation()">
                <div class="compare-header">
                    <h2><i class="fas fa-balance-scale"></i> Compare Prices</h2>
                    <button class="compare-close" onclick="closeCompareModal()">&times;</button>
                </div>
                <div class="compare-body" id="compare-modal-body"></div>
            </div>
        </div>`;
    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
    _compareModalCreated = true;
}

function openCompareModal() {
    ensureCompareModal();
    const overlay = document.getElementById('compare-modal-overlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCompareModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const overlay = document.getElementById('compare-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCompareModal(); });

document.addEventListener('DOMContentLoaded', () => {
    console.log("Musha Engine v3.0: Online.");
    if (document.getElementById('landing-gateway')) console.log("Musha Landing: Gateway Loaded.");
    const listItems = document.querySelectorAll('.sections li');
    listItems.forEach(item => {
        item.addEventListener('click', () => { if (window.innerWidth <= 768) toggleSidebar(); });
    });
    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.side-bar');
        const toggle = document.querySelector('.menu-toggle');
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !toggle.contains(e.target)) toggleSidebar();
        }
    });
});
