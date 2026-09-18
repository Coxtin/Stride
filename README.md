# 📝 Offline-First Task Manager

A Progressive Web App (PWA) To-Do List built with Vanilla JavaScript that works completely offline and syncs to the cloud using the GitHub Gists API.

## 🌟 Why this project? (Elevator Pitch)
Most To-Do applications rely on traditional databases and require an active backend. This project explores a **serverless and offline-first** architecture, leveraging device memory (`localStorage`) for instant performance and a JSON file hosted on GitHub (Gists) as the Single Source of Truth for multi-device synchronization.

## ✨ Core Features
* **Offline-First:** The interface loads instantly without an internet connection, powered by a Service Worker and Cache Storage.
* **Cloud Sync (Backend-less):** Utilizes the GitHub Gists API to save and retrieve data from the cloud for free.
* **Cross-Platform & PWA:** Installable as a native app on Android, iOS, and Desktop via the `manifest.json` file.
* **Smart Synchronization:** Automatically detects when the internet connection is restored and syncs local data with the cloud.
* **Minimalist Design:** Fluid, card-based interface (using Flexbox) with no external CSS frameworks.

## 🏗️ Architecture & Technologies
* **Frontend:** HTML5, CSS3 (Flexbox, CSS variables), Vanilla JavaScript (ES6+).
* **Local Storage:** `localStorage` for offline data persistence.
* **Offline Support:** Service Worker for caching static resources (`index.html`, `app.js`, `main.css`).
* **Cloud Storage:** GitHub Gists API (using `fetch` for RESTful GET/PATCH requests).

### How does the sync work?
1. On application startup, a `GET` request is made to the GitHub Gist. If successful, the remote data overwrites the local storage.
2. If the device is offline, it immediately loads the data directly from `localStorage`.
3. Any modification (Add/Edit/Delete) updates the UI and `localStorage` first, then asynchronously sends a `PATCH` request to GitHub.
4. Upon an `online` event (internet connection restored) or `visibilitychange`, the app triggers a background sync to keep data consistent.

## 🚀 How to run locally
Since the app uses your own GitHub data, a quick initial setup is required:

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/repo-name.git](https://github.com/your-username/repo-name.git)
