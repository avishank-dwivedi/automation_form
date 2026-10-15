# 🚀 Render Deployment Guide — Jai Kisan Vyapar App

This guide explains how to deploy **Jai Kisan Vyapar App** to **Render** (Free Tier) in under 5 minutes.

---

## 📋 Overview
The app is configured as a **unified Full-Stack service**:
- **Backend (Node/Express)**: Serves all REST APIs (`/api/data`, `/api/sync`, `/api/ewb/*`).
- **Frontend (React/Vite)**: Automatically built and served statically by the backend Express server.
- **Single Free Service on Render**: No CORS issues, zero extra cost.

---

## 🛠️ Step 1: Push Code to GitHub
1. Open PowerShell or Terminal in your project folder:
   ```bash
   git add .
   git commit -m "Prepare Jai Kisan Vyapar for Render deployment"
   ```
2. Create a new repository on [GitHub](https://github.com/new) (e.g. `jai-kisan-vyapar`).
3. Push your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/jai-kisan-vyapar.git
   git branch -M main
   git push -u origin main
   ```

---

## ☁️ Step 2: Deploy on Render

### Option A: Automatic via Render Blueprint (Recommended)
1. Go to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect [`render.yaml`](file:///c:/Users/Welcome/OneDrive/Desktop/store_m/render.yaml) and configure everything automatically!
5. Click **Apply**.

---

### Option B: Manual Web Service Setup
1. Go to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Configure the following fields:
   - **Name**: `jai-kisan-vyapar` (or any name you choose)
   - **Region**: Singapore (or nearest to your customers)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run render-build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free`

5. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` | Port assigned by Render |
   | `MONGO_URI` | `mongodb+srv://...` | *(Optional)* Your MongoDB Atlas URI (see Step 3) |
   | `EWB_MODE` | `sandbox` | Sandbox or production for NIC E-Way Bill |

6. Click **Deploy Web Service**.

---

## 🍃 Step 3: Setting Up Free Cloud MongoDB (MongoDB Atlas)
If you want cloud database persistence accessible from anywhere (PC, phone, laptop):
1. Sign up for free at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster** (AWS / Singapore or Mumbai).
3. Under **Database Access**, create a user (e.g., username: `jaikisan`, password: `<your-password>`).
4. Under **Network Access**, click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** > **Drivers** > Copy your connection string:
   ```
   mongodb+srv://jaikisan:<password>@cluster0.abcde.mongodb.net/jai_kisan_agro?retryWrites=true&w=majority
   ```
6. In your **Render Dashboard**, add `MONGO_URI` with this connection string.

> **Note**: If you don't configure MongoDB Atlas, the server runs in **Resilient Mode** — your app will still work 100% fine using browser LocalStorage!

---

## 💻 How to Test the Production Build Locally
You can test the exact production server locally before deploying:
```bash
# 1. Build the frontend and install server packages
npm run render-build

# 2. Run the production server
npm start
```
Open [http://localhost:5000](http://localhost:5000) in your browser.
Both the React frontend and Express backend will run unified on port 5000!

---

## ✅ Deployment Checklist
- [x] Hardcoded `localhost:5000` URLs replaced with dynamic `API_BASE`
- [x] Static frontend build serving enabled in `server/app.js`
- [x] `render.yaml` blueprint created
- [x] `Dockerfile` created for container platforms
- [x] Build scripts configured in root `package.json`
- [x] Sales & Invoice `useEffect` runtime bug resolved
