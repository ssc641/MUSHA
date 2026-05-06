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
