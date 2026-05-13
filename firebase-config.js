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

try {
  firebase.initializeApp(firebaseConfig);
  console.log("%c[Firebase] Connected to Musha-a9afd", "color: #2eaf7d; font-weight: bold;");
} catch (error) {
  console.error("%c[Firebase] INIT FAILED:", "color: #ff4b2b; font-weight: bold;", error);
  window.firebaseInitFailed = true;
}

let db, storage;

if (!window.firebaseInitFailed) {
  try {
    db = firebase.firestore();
    storage = firebase.storage();

    // Settings FIRST, before any other operations
    db.settings({ experimentalForceLongPolling: true });

    // THEN enable persistence
    db.enablePersistence({ synchronizeTabs: true })
      .then(() => { console.log("%c[Firestore] Offline persistence enabled", "color: #d4af37;"); })
      .catch((err) => {
        if (err.code === 'failed-precondition') console.warn("[Firestore] Persistence failed: multiple tabs");
        else if (err.code === 'unimplemented') console.warn("[Firestore] Persistence not supported");
      });

  } catch (error) {
    console.error("%c[Firebase] Service init failed:", "color: #ff4b2b;", error);
    window.firebaseInitFailed = true;
  }
} else {
  db = {
    collection: () => ({
      where: () => ({ onSnapshot: () => {}, get: () => Promise.resolve({ forEach: () => {} }) }),
      add: () => Promise.reject(new Error("Firebase not initialized")),
      doc: () => ({ update: () => Promise.reject(new Error("Firebase not initialized")), delete: () => Promise.reject(new Error("Firebase not initialized")) })
    })
  };
  storage = { ref: () => ({ put: () => Promise.reject(new Error("Firebase not initialized")) }) };
}

function isFirebaseReady() {
  if (window.firebaseInitFailed) {
    showToast("Connection failed. Check internet & Firebase config.", "error");
    return false;
  }
  return true;
}
