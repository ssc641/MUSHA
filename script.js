function openTheMall() {
    // This finds the gateway and adds the class that makes it fade away
    const gateway = document.getElementById('gateway-overlay');
    gateway.classList.add('mall-opened');
    
    // Optional: play a "door opening" sound if you have one!
    console.log("SSC Grand Mall is now open.");
}