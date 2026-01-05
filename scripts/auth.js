// auth.js
// Handles Login/Logout

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userDisplay = document.getElementById('user-display');
const authOverlay = document.getElementById('auth-overlay');

// Auth State Listener
if (auth) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            console.log("User logged in:", user.email);
            if(userDisplay) userDisplay.textContent = user.displayName || user.email;
            if(authOverlay) authOverlay.style.display = 'none'; // Hide login screen
            
            // Trigger data load
            document.dispatchEvent(new Event('eng-app-user-login'));
        } else {
            // User is signed out
            console.log("User logged out");
            if(authOverlay) authOverlay.style.display = 'flex'; // Show login screen
        }
    });
}

// Login
window.loginWithGoogle = () => {
    if (!auth) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .catch((error) => {
            console.error("Login failed:", error);
            alert("Login failed: " + error.message);
        });
};

// Logout
window.logout = () => {
    if (!auth) return;
    auth.signOut();
};
