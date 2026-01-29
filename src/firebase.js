import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";  // ⭐ realtime only

const firebaseConfig = {
  apiKey: "AIzaSyDGJWO91Sd00Jy7d7TVKyPu3M70mEGZyF8",
  authDomain: "demoproject-98876.firebaseapp.com",
  databaseURL: "https://demoproject-98876-default-rtdb.firebaseio.com", // ⭐ required
  projectId: "demoproject-98876",
  storageBucket: "demoproject-98876.firebasestorage.app",
  messagingSenderId: "271689689002",
  appId: "1:271689689002:web:68434a01d821deb5b9edd3"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app); // ⭐ THIS IS THE FIX
