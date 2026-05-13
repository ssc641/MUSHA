/* =========================================
   MOOSHA AUTH ENGINE v3.0
   Vendor Login, Session & Password Recovery
   ========================================= */

const AUTH_KEY = 'musha_vendor_session';
const REMEMBER_KEY = 'musha_remember_me';

function isVendorLoggedIn() {
    const session = JSON.parse(localStorage.getItem(AUTH_KEY));
    if (!session) return false;
    const now = Date.now();
    const maxAge = session.remember ? (7 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
    if (now - session.timestamp > maxAge) {
        logoutVendor();
        return false;
    }
    return true;
}

function getCurrentVendor() {
    const session = JSON.parse(localStorage.getItem(AUTH_KEY));
    return session ? session.vendor : null;
}

function loginVendor(email, password, remember) {
    return db.collection("vendors")
        .where("email", "==", email)
        .where("password", "==", hashPassword(password))
        .get()
        .then((snapshot) => {
            if (snapshot.empty) throw new Error("Invalid email or password");
            let vendor = null;
            snapshot.forEach((doc) => { vendor = { id: doc.id, ...doc.data() }; });
            const session = {
                vendor: { id: vendor.id, shopName: vendor.shopName, email: vendor.email, phone: vendor.phone, whatsapp: vendor.whatsapp, facebook: vendor.facebook, isAdmin: vendor.isAdmin || false },
                timestamp: Date.now(), remember: remember
            };
            localStorage.setItem(AUTH_KEY, JSON.stringify(session));
            return vendor;
        });
}

function registerVendor(vendorData) {
    return db.collection("vendors")
        .where("email", "==", vendorData.email)
        .get()
        .then((snapshot) => {
            if (!snapshot.empty) throw new Error("An account with this email already exists");
            const newVendor = {
                shopName: vendorData.shopName, email: vendorData.email, phone: vendorData.phone,
                whatsapp: vendorData.whatsapp || vendorData.phone, facebook: vendorData.facebook || null,
                password: hashPassword(vendorData.password), isAdmin: false, isVerified: false,
                status: 'active', createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            };
            return db.collection("vendors").add(newVendor);
        });
}

function logoutVendor() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    window.location.href = 'sell.html?mode=login';
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'musha_' + Math.abs(hash).toString(16);
}

function requestPasswordReset(email, proofPhone, proofShopName) {
    return db.collection("vendors").where("email", "==", email).get()
        .then((snapshot) => {
            if (snapshot.empty) throw new Error("No account found with this email");
            let vendor = null;
            snapshot.forEach((doc) => { vendor = { id: doc.id, ...doc.data() }; });
            if (vendor.whatsapp !== proofPhone && vendor.phone !== proofPhone) throw new Error("Phone number does not match");
            if (vendor.shopName.toLowerCase() !== proofShopName.toLowerCase()) throw new Error("Shop name does not match");
            const resetRequest = {
                vendorId: vendor.id, vendorEmail: vendor.email, vendorShopName: vendor.shopName,
                proofPhone: proofPhone, requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending_admin_review',
                newPassword: hashPassword('TempPass_' + Math.random().toString(36).slice(2, 8))
            };
            return db.collection("password_resets").add(resetRequest);
        });
}

function approvePasswordReset(resetId) {
    return db.collection("password_resets").doc(resetId).get()
        .then((doc) => {
            if (!doc.exists) throw new Error("Reset request not found");
            const data = doc.data();
            return db.collection("vendors").doc(data.vendorId).update({
                password: data.newPassword, passwordResetAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                return db.collection("password_resets").doc(resetId).update({
                    status: 'completed', completedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
        });
}

function adminDeleteVendorShop(vendorId) {
    return db.collection("vendor_inventory").where("vendorId", "==", vendorId).get()
        .then((snapshot) => {
            const batch = db.batch();
            snapshot.forEach((doc) => { batch.delete(doc.ref); });
            return batch.commit();
        })
        .then(() => { return db.collection("vendors").doc(vendorId).delete(); });
}

function adminDeleteProduct(productId) {
    return db.collection("vendor_inventory").doc(productId).delete();
}

function isAdmin() {
    const vendor = getCurrentVendor();
    return vendor && vendor.isAdmin === true;
}

function requireAdmin() {
    if (!isAdmin()) {
        showToast("Access denied. Admin only.", "error");
        setTimeout(() => { window.location.href = 'sell.html?mode=login'; }, 2000);
        return false;
    }
    return true;
}

function requireVendor() {
    if (!isVendorLoggedIn()) {
        showToast("Please log in to access your shop", "error");
        setTimeout(() => { window.location.href = 'sell.html?mode=login'; }, 2000);
        return false;
    }
    return true;
}

function updateLastLogin(vendorId) {
    return db.collection("vendors").doc(vendorId).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const vendor = getCurrentVendor();
    if (vendor) {
        console.log(`%c[Auth] Logged in as: ${vendor.shopName}`, "color: #2eaf7d;");
        const shopNameInput = document.getElementById('shop-name-input');
        if (shopNameInput && !shopNameInput.value) shopNameInput.value = vendor.shopName;
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.style.display = 'flex';
    }
});
