<!-- markdownlint-disable MD003 MD033 MD036 -->
# NEXUS Engineering Scheduler

<div align="center">

![NEXUS](https://img.shields.io/badge/NEXUS-Engineering%20Scheduler-8b5cf6?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange?style=for-the-badge&logo=firebase)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, cloud-synchronized productivity dashboard for engineering teams and professionals**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Technologies](#️-technologies)

</div>

---

## 📋 Overview

**NEXUS** is a comprehensive web-based productivity and scheduling application designed for engineering professionals. It combines task management, calendar scheduling, note-taking, and real-time synchronization into a sleek, modern interface with Google authentication and Firebase cloud storage.

## ✨ Features

### 🎯 **Dashboard**

- **Real-time Statistics**: Track pending tasks, upcoming events, and total notes at a glance
- **Visual Progress Indicators**: Donut charts and progress bars for daily productivity tracking
- **Smart Greeting**: Time-based welcome messages with current date display
- **Quick Focus Widget**: Stay on track with productivity reminders

### 📅 **Calendar & Scheduling**

- **Interactive Calendar View**: Month-view calendar with event visualization
- **Daily Schedule Management**: Time-blocked schedule with drag-and-drop support
- **Event Creation**: Add, edit, and delete events with custom times and descriptions
- **Day Progress Tracking**: Visual timeline showing current time and remaining hours

### ✅ **Task Management**

- **Todo Lists**: Create, organize, and track tasks with completion status
- **Priority Indicators**: Visual cues for task importance
- **Real-time Updates**: Instant synchronization across devices

### 📝 **Notes System**

- **Rich Note-Taking**: Create and organize notes with timestamps
- **Search & Filter**: Quickly find notes with built-in search functionality
- **Cloud Sync**: All notes automatically saved to Firebase

### 🔐 **Authentication & Security**

- **Google Sign-In**: Secure OAuth authentication via Firebase
- **User Profiles**: Personalized experience with user-specific data
- **Session Management**: Automatic logout and session handling

### 🎨 **Modern UI/UX**

- **Dark Mode Design**: Eye-friendly dark theme with vibrant accent colors
- **Glassmorphism Effects**: Modern, translucent UI elements
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Smooth Animations**: Polished micro-interactions and transitions

## 🚀 Demo

### Dashboard View

The main dashboard provides an at-a-glance overview of your productivity metrics, today's schedule, and quick access to all features.

### Key Screens

- **Dashboard** (`index.html`) - Central hub with stats and today's overview
- **Schedule** (`schedule.html`) - Detailed daily time management
- **Calendar** (`calendar.html`) - Monthly event planning
- **Notes** (`notes.html`) - Note-taking and organization
- **Todo** (`todo.html`) - Task list management

## 🛠️ Technologies

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties and animations
- **Vanilla JavaScript** - No framework dependencies for maximum performance

### Backend & Services

- **Firebase Authentication** - Google OAuth integration
- **Cloud Firestore** - Real-time NoSQL database
- **Firebase Hosting** - Fast, secure web hosting

### Libraries & Tools

- **Font Awesome 6.4.0** - Icon library
- **Firebase SDK 9.22.0** - Backend integration

## 📦 Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (free tier available)
- Node.js (optional, for local development server)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/nexus-scheduler.git
   cd nexus-scheduler
   ```

2. **Configure Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Google Authentication in Firebase Authentication settings
   - Create a Firestore database
   - Copy your Firebase configuration

3. **Update Firebase Config**

   Edit `scripts/firebase-config.js` with your Firebase credentials:

   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

4. **Launch the Application**

   **Option A: Direct File Access**
   - Simply open `index.html` in your browser

   **Option B: Local Server (Recommended)**

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve
   ```

   Then navigate to `http://localhost:8000`

## 💻 Usage

### First Time Setup

1. **Sign In**: Click "Continue with Google" on the auth overlay
2. **Grant Permissions**: Allow NEXUS to access your Google account
3. **Start Using**: You'll be redirected to the dashboard

### Creating Your First Event

1. Navigate to **Schedule** or **Calendar**
2. Click the "Add Event" button
3. Fill in event details (title, time, description)
4. Click "Save" - your event syncs instantly to the cloud

### Managing Tasks

1. Go to the **Todo** page
2. Click "Add Task" to create a new item
3. Check off tasks as you complete them
4. Tasks sync automatically across all your devices

### Taking Notes

1. Open the **Notes** section
2. Click "New Note" to start writing
3. Notes are auto-saved with timestamps
4. Use the search bar to find specific notes

## 📁 Project Structure

```text
nexus-scheduler/
├── index.html              # Dashboard/Home page
├── schedule.html           # Daily schedule view
├── calendar.html           # Monthly calendar view
├── notes.html              # Notes management
├── todo.html               # Task list
├── style.css               # Global styles and design system
├── scripts/
│   ├── firebase-config.js  # Firebase initialization
│   ├── auth.js             # Authentication logic
│   ├── storage.js          # Data persistence layer
│   ├── dashboard.js        # Dashboard functionality
│   ├── schedule.js         # Schedule management
│   ├── calendar.js         # Calendar rendering
│   ├── notes.js            # Note-taking features
│   ├── todo.js             # Task management
│   └── nav.js              # Navigation and sidebar
└── .gitignore              # Git ignore rules
```

## 🎨 Customization

### Color Scheme

The app uses CSS custom properties for easy theming. Edit `style.css`:

```css
:root {
  --primary: #8b5cf6; /* Purple accent */
  --secondary: #3b82f6; /* Blue accent */
  --bg-main: #09090b; /* Main background */
  --bg-card: #18181b; /* Card background */
  --text-primary: #fafafa; /* Primary text */
  --text-muted: #a1a1aa; /* Muted text */
}
```

## 🔒 Security & Privacy

- **Authentication**: Secure Google OAuth 2.0 flow
- **Data Storage**: All data encrypted in transit and at rest via Firebase
- **User Isolation**: Each user's data is completely isolated using Firestore security rules
- **No Third-party Tracking**: No analytics or tracking scripts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** for backend infrastructure
- **Font Awesome** for beautiful icons
- **Google Fonts** for typography

## 📧 Contact

For questions, suggestions, or support, please open an issue on GitHub.

---

<div align="center">

**Built with ❤️ for productive engineering teams**

⭐ Star this repo if you find it useful!

</div>
