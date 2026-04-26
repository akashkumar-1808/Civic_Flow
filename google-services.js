import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";

// Firebase configuration placeholder
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForHackathon",
  authDomain: "civicflow-hackathon.firebaseapp.com",
  projectId: "civicflow-hackathon",
  storageBucket: "civicflow-hackathon.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// Initialize Firebase
let app;
let analytics;
try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
} catch (e) {
  console.log("Analytics loaded in simulated context.");
}

// Attach trackEvent globally
window.trackEvent = function(eventName) {
  if (analytics) {
    try {
      logEvent(analytics, eventName);
    } catch (e) {}
  }
  console.log(`[Firebase Analytics] Logged event: ${eventName}`);
};
