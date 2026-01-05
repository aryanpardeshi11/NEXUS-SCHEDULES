// firebase-config.js
// TODO: Replace with your actual Firebase project configuration
// Get this from: Firebase Console -> Project Settings -> General -> Your Apps -> Web App
const firebaseConfig = {
    apiKey: "AIzaSyDz7vvlr7CwPgJsiAyS1ZGtIJiQfk_qQ1c",
    authDomain: "nexus-schedules.firebaseapp.com",
    projectId: "nexus-schedules",
    storageBucket: "nexus-schedules.appspot.com",
    messagingSenderId: "184916276576",
    appId: "1:184916276576:web:985f6fa4d42eb368ab5a05",
    measurementId: "G-WMX5P2YYPX"
};

// Initialize Firebase
let app, auth, db;

if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Firebase Initialized");
} else {
    console.error("Firebase SDK not loaded");
}