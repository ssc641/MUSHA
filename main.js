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

