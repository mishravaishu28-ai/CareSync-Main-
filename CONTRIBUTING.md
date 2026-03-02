# Team Roles & Workflow: CareSync Platform

## 🤝 Team Roles & Responsibility Breakdown

1.  **Vaishnavi (Lead System Architect, AI-UX Strategist):**
    * **Goal:** Core AI logic and 'Zero-Click' UX design.
    * **Focus:** System blueprint, AI (Gemini) integration, and full-stack synchronization.

2.  **Harsh (Lead Frontend Developer & UI-UX Specialist):**
    * **Goal:** App interface ("Face") and performance.
    * **Focus:** React.js, Tailwind CSS, and PWA (Service Workers, Manifest) implementation.

3.  **Shivam (Backend Infrastructure Lead & Cloud Architect):**
    * **Goal:** Database and Server (Backend) management.
    * **Focus:** Firestore Database setup, Security Rules, Authentication, and Cloud Functions.

4.  **Tushar (Response Systems Lead & Systems Engineer):**
    * **Goal:** Emergency Response Hub and Notification system.
    * **Focus:** Hospital dashboard (GPS map) and Siren Notification Engine (FCM).

5.  **Sankalp (Data Security Lead & QA Analyst):**
    * **Goal:** Data Security and System Testing.
    * **Focus:** Data encryption, security auditing, load testing, and Pull Request reviews.

## 🚀 Development Process

### 1. Folder Structure (Standards)
* **`src/components/`** - Reusable UI components.
* **`src/pages/`** - Main page views (HospitalView, UserSOS).
* **`src/utils/`** - Configuration files (firebaseConfig, geminiApi).

### 2. Branching & Merging
* **Branch:** Always create a separate branch for your task (e.g., `feature/sos-button`). Do not push directly to `main`.
* **Pull Request (PR):** Submit a PR when your task is complete.
* **Code Review:** Pull Requests must be reviewed and approved by **vaishnavi or Sankalp (QA)** before merging.

### 3. Tailwind CSS
* Use only Tailwind utility classes. Maintain consistency in spacing and colors.

### 4. Security
* Never hardcode API keys or Firebase secrets. Use `.env` files and ensure they are added to `.gitignore`.
