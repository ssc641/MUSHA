// =========================================
// MOOSHA FIREBASE CONFIGURATION v3.0
// =========================================

const firebaseConfig = {
  apiKey: "AIzaSyC2tEGjPcpz5bCac-fNLfnvTdlPj76Ix5I",
  authDomain: "musha-a9afd.firebaseapp.com",
  projectId: "musha-a9afd",
  storageBucket: "musha-a9afd.firebasestorage.app",
  messagingSenderId: "746382138126",
  appId: "1:746382138126:web:38b5fa27d3436169fdcd9f",
  measurementId: "G-Y8GJN9K0KN"
};

// Initialize Firebase with error handling
try {
  firebase.initializeApp(firebaseConfig);
  console.log("%c[Firebase] Connected to Musha-a9afd", "color: #2eaf7d; font-weight: bold;");
} catch (error) {
  console.error("%c[Firebase] INIT FAILED:", "color: #ff4b2b; font-weight: bold;", error);
  // Prevent the rest of the app from crashing
  window.firebaseInitFailed = true;
}

// Create shortcuts ONLY if init succeeded
let db, storage;

if (!window.firebaseInitFailed) {
  try {
    db = firebase.firestore();
    storage = firebase.storage();

    // Enable offline persistence so submissions survive bad internet
    db.enablePersistence({ synchronizeTabs: true })
      .then(() => {
        console.log("%c[Firestore] Offline persistence enabled", "color: #d4af37;");
      })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn("[Firestore] Persistence failed: multiple tabs open");
        } else if (err.code === 'unimplemented') {
          console.warn("[Firestore] Persistence not supported in this browser");
        }
      });

    // Settings must be set BEFORE any db operations
    db.settings({ 
      experimentalForceLongPolling: true,
      merge: true 
    });

  } catch (error) {
    console.error("%c[Firebase] Service init failed:", "color: #ff4b2b;", error);
    window.firebaseInitFailed = true;
  }
} else {
  // Create dummy objects so the rest of the app doesn't crash
  db = {
    collection: () => ({
      where: () => ({ onSnapshot: () => {}, get: () => Promise.resolve({ forEach: () => {} }) }),
      add: () => Promise.reject(new Error("Firebase not initialized")),
      doc: () => ({ update: () => Promise.reject(new Error("Firebase not initialized")), delete: () => Promise.reject(new Error("Firebase not initialized")) })
    })
  };
  storage = { ref: () => ({ put: () => Promise.reject(new Error("Firebase not initialized")) }) };
}

// Global safety check helper
function isFirebaseReady() {
  if (window.firebaseInitFailed) {
    console.error("Firebase is not initialized. Check your internet and Firebase config.");
    showToast("Connection failed. Check internet & Firebase config.", "error");
    return false;
  }
  return true;
}
