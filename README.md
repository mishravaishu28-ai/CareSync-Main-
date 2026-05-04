# CareSync-Main-
🚀 CareSync Platform
AI-Powered Student Crisis Detection & Emergency Response System.

📌 Project Overview
HealthSync is a Progressive Web App (PWA) designed to manage mental and physical health emergencies for students. The platform leverages the Google Gemini AI (1.5 Flash) to analyze student distress signals for suicide risk or self-harm and triggers immediate alerts to the nearest hospitals and emergency contacts.

🛠️ Tech Stack
Frontend: React.js (Vite)

Styling: Tailwind CSS

PWA Engine: Woekbox + Web Manifest

Backend/Database: Firebase (Firestore & Auth)

AI Engine: Google Gemini API (1.5 Flash)

Icons: Lucide React

Notifications: Web Push API 

👥 Team & Roles
Vaishnavi (Lead): AI Logic, Prompt Engineering, and API Integration, System Architect, AI-UX Strategist (Full-Stack Integrator)

Harsh: Lead Frontend Development (UI/UX) Specialist and PWA Configuration.

Sankalp: Data Security Lead & QA Analyst.

Shivam: Backend Infrastructure Lead & Cloud Architect.

Tushar: Response Systems Lead & Systems Engineer. 

## 📂 Project Structure
```text
healthsync-platform/
├── .env                # Secret API Keys (Gemini & Firebase) - NEVER COMMIT THIS
├── .gitignore          # Files to exclude from Git (node_modules, .env)
├── README.md           # Project Documentation
├── CONTRIBUTING.md     # Guidelines for team members
├── package.json        # Project dependencies and scripts
└── src/
    ├── assets/         # Images, icons, and global styles
    ├── components/     # Reusable UI components
    │   ├── SOSButton.jsx
    │   ├── Navbar.jsx
    │   └── ChatInterface.jsx
    ├── pages/          # Full page components
    │   ├── Dashboard.jsx
    │   ├── Login.jsx
    │   └── HospitalView.jsx
    ├── utils/          # Helper functions and configurations
    │   ├── firebaseConfig.js # Firebase setup (Shivam's work)
    │   └── geminiApi.js      # Gemini prompt logic (Vaishnavi's work)
    ├── hooks/          # Custom React hooks (for API calls)
    ├── App.jsx         # Main App component
    └── main.jsx        # Entry point
```

Git clone (https://github.com/mishravaishu28-ai/CareSync-Main-.git)

## 🛠️ Project Structure & Responsibilities

> To avoid code conflicts and ensure secure development, team members should work within their designated areas:

| File/Folder | Responsibility | Managed By |
| :--- | :--- | :--- |
| **`.env`** | Storing secret keys securely. | **Vaishnavi & Shivam** |
| **`src/components/`** | Creating UI elements (SOS button, Navbar). | **Harsh** |
| **`src/pages/`** | Building full-page layouts and views. | **Harsh** |
| **`src/utils/firebaseConfig.js`**| Database connection & Auth logic. | **Shivam** |
| **`src/utils/geminiApi.js`** | AI Prompt design & API calls. | **Vaishnavi** |
| **All code files** | Security review & QA testing. | **Sankalp** |
| **`src/pages/HospitalView.jsx`**| Emergency log display & logistics. | **Tushar** |

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
