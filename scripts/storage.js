/**
 * storage.js
 * Centralized data management for the Engineering Scheduler App.
 * Uses localStorage to persist data.
 */

const STORAGE_KEYS = {
    SCHEDULE: 'eng_app_schedule',
    TASKS: 'eng_app_tasks',
    EXAMS: 'eng_app_exams',
    NOTES: 'eng_app_notes',
    SETTINGS: 'eng_app_settings'
};

// Initial Data Structures (if empty)
const DEFAULTS = {
    SCHEDULE: [
        { timeRange: '08:00 AM – 09:15 AM', activity: 'Morning Routine & Breakfast', hours: '1.25' },
        { timeRange: '09:15 AM – 10:00 AM', activity: 'Travel to college', hours: '0.75' },
        { timeRange: '10:00 AM – 05:00 PM', activity: 'College', hours: '7' },
        { timeRange: '05:00 PM – 06:00 PM', activity: 'Travel/Home & Snack', hours: '1' },
        { timeRange: '06:00 PM – 08:00 PM', activity: 'Study/revision', hours: '2' },
        { timeRange: '08:00 PM – 09:00 PM', activity: 'Dinner & Relaxation', hours: '1' },
        { timeRange: '09:00 PM – 11:30 PM', activity: 'Coding Practice/leisure/PC', hours: '2.5' },
        { timeRange: '11:30 PM – 08:00 AM', activity: 'Sleep', hours: '8.5' }
    ],
    TASKS: [],
    EXAMS: [],
    NOTES: []
};

let unsubscribe = null;

const Storage = {
    get(key) {
        const data = localStorage.getItem(key);
        // Fallback to defaults
        const shortKey = key.replace('eng_app_', '').toUpperCase();
        return data ? JSON.parse(data) : DEFAULTS[shortKey] || [];
    },

    set(key, data) {
        // 1. Update Local
        localStorage.setItem(key, JSON.stringify(data));
        
        // 2. Dispatch event for UI
        window.dispatchEvent(new Event('eng-app-data-changed'));

        // 3. Sync to Cloud if logged in
        if (typeof auth !== 'undefined' && auth.currentUser) {
            const shortKey = key.replace('eng_app_', '');
            // Debounce or just fire? Fire for now, Firestore handles concurrency well enough for single user
            db.collection('users').doc(auth.currentUser.uid).collection('data').doc(shortKey).set({
                content: data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }).catch(err => console.error("Sync error", err));
        }
    },
    
    // Explicit reset for Schedule
    resetSchedule() { this.set(STORAGE_KEYS.SCHEDULE, DEFAULTS.SCHEDULE); },

    // Helpers
    getTasks() { return this.get(STORAGE_KEYS.TASKS); },
    saveTasks(tasks) { this.set(STORAGE_KEYS.TASKS, tasks); },

    getSchedule() { return this.get(STORAGE_KEYS.SCHEDULE); },
    saveSchedule(schedule) { this.set(STORAGE_KEYS.SCHEDULE, schedule); },
    
    getExams() { return this.get(STORAGE_KEYS.EXAMS); },
    saveExams(exams) { this.set(STORAGE_KEYS.EXAMS, exams); },

    getNotes() { return this.get(STORAGE_KEYS.NOTES); },
    saveNotes(notes) { this.set(STORAGE_KEYS.NOTES, notes); }
};

// Cloud Sync Listener (called by auth.js)
window.initCloudSync = (user) => {
    if (unsubscribe) unsubscribe(); // Unsub previous

    console.log("Initializing Cloud Sync for", user.email);
    const collectionRef = db.collection('users').doc(user.uid).collection('data');

    unsubscribe = collectionRef.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === "added" || change.type === "modified") {
                const docId = change.doc.id; // e.g., 'tasks', 'schedule'
                const data = change.doc.data().content;
                
                // Map short key back to full key
                const fullKey = 'eng_app_' + docId;
                
                // Update LocalStorage from Cloud
                // Avoid loop? If we just setItem, it won't trigger Storage.set logic (which writes back)
                // BUT it will trigger UI update
                const currentLocal = localStorage.getItem(fullKey);
                if (currentLocal !== JSON.stringify(data)) {
                    console.log("Cloud update received for", fullKey);
                    localStorage.setItem(fullKey, JSON.stringify(data));
                    window.dispatchEvent(new Event('eng-app-data-changed'));
                }
            }
        });
    });
};

// Listen for Login event
document.addEventListener('eng-app-user-login', () => {
    if (auth.currentUser) window.initCloudSync(auth.currentUser);
});

// Listen for storage events (Tabs)
window.addEventListener('storage', (e) => {
    if (Object.values(STORAGE_KEYS).includes(e.key)) {
        window.dispatchEvent(new Event('eng-app-data-changed'));
    }
});

window.AppStorage = Storage;
