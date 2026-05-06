function openTheMall() {
    // This finds the gateway and adds the class that makes it fade away
    const gateway = document.getElementById('gateway-overlay');
    gateway.classList.add('mall-opened');
    
    // Optional: play a "door opening" sound if you have one!
    console.log("SSC Grand Mall is now open.");
}

// In your script, let's make the tracker accept a "type"
function openTracker(type) {
    const icon = document.querySelector('.truck-icon');
    if (type === 'car') {
        icon.innerHTML = '🚗'; // Change to car
    } else {
        icon.innerHTML = '🚚'; // Default to truck
    }
    document.getElementById('tracking-modal').style.display = 'block';
}
