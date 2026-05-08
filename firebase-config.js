// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2tEGjPcpz5bCac-fNLfnvTdlPj76Ix5I",
  authDomain: "musha-a9afd.firebaseapp.com",
  projectId: "musha-a9afd",
  storageBucket: "musha-a9afd.firebasestorage.app",
  messagingSenderId: "746382138126",
  appId: "1:746382138126:web:38b5fa27d3436169fdcd9f",
  measurementId: "G-Y8GJN9K0KN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// These are the "Shortcuts" we will use in your other scripts
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase is connected to Musha-a9afd!");

