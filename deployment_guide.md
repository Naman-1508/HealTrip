# 🚀 HealTrip Deployment Guide

This guide explains how to deploy the HealTrip platform for free using Render (for the Backend + ML) and Vercel (for the Frontend). 

I have added 4 files to your project that consolidate your services into a single, memory-efficient deployment without changing any of your existing source code.

## 🛠️ Files Added
1.  `Dockerfile`: Packages Node.js and Python together.
2.  `render-start.sh`: A script that launches all services in order.
3.  `backend/ml/unified_app.py`: Combines 6 ML services into 1 process (Saves ~400MB RAM).
4.  `backend/ml/proxy_ml.js`: A bridge that keeps your existing Node.js code working perfectly.

---

## 1️⃣ Deploy Backend & ML (Render)

1.  **Push to GitHub**: Make sure you commit and push the new files to your repository.
2.  **Create Render Account**: Go to [Render.com](https://render.com).
3.  **New Web Service**:
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.
4.  **Configuration**:
    *   **Name**: `healtrip-backend`
    *   **Region**: Pick one closest to you (e.g., Singapore or Frankfurt).
    *   **Branch**: `main`
    *   **Runtime**: Select **Docker**.
5.  **Environment Variables**:
    *   Click **Advanced** -> **Add Environment Variable**.
    *   `PORT`: `5000`
    *   `NODE_ENV`: `production`
    *   `MONGODB_URI`: (Your MongoDB connection string)
    *   `CLERK_SECRET_KEY`: (Your Clerk Secret)
    *   `GROQ_API_KEY`: (Your Groq API Key)
    *   *(Add any other keys from your `backend/.env`)*
6.  **Deploy**: Click **Create Web Service**.

---

## 2️⃣ Deploy Frontend (Vercel)

1.  **Create Vercel Account**: Go to [Vercel.com](https://vercel.com).
2.  **New Project**:
    *   Connect your GitHub repository.
    *   Find the **HealTrip** project and click **Import**.
3.  **Project Settings**:
    *   **Root Directory**: Select `frontend`.
    *   **Framework Preset**: Vite (it should auto-detect).
4.  **Environment Variables**:
    *   `REACT_APP_API_URL`: Use your Render URL (e.g., `https://healtrip-backend.onrender.com`).
    *   `REACT_APP_CLERK_PUBLISHABLE_KEY`: (Your Clerk Public Key).
5.  **Deploy**: Click **Deploy**.

---

## 🔍 How it Works (Technical Details)
Your backend code looks for ML services on `localhost:8001`, `localhost:8002`, etc. Since Render only gives us one public port, we:
1.  Run all ML logic on **Port 8000** under sub-paths (e.g., `/hotels`, `/hospitals`).
2.  Run a tiny **Node Proxy** on ports 8001-8005.
3.  When your Backend requests `localhost:8001`, the Proxy intercepts it and forwards it to the Unified ML engine on Port 8000.
4.  This keeps RAM usage low (under 512MB) and avoids code changes.

---

## 🔄 How to Revert
If you want to stop using this unified deployment:
1.  Delete the `Dockerfile` and `render-start.sh` from your root.
2.  Delete `backend/ml/unified_app.py` and `backend/ml/proxy_ml.js`.
3.  Your local development environment will continue to work exactly as it does now.
