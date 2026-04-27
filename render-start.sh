#!/bin/bash

# =================================================================
# HealTrip Production Entry Point
# =================================================================

echo "🚀 Starting HealTrip Production Services..."

# 1. Start the Unified ML Service (Port 8000)
# This process loads all ML models into memory once to save RAM.
echo "🧠 Starting Unified ML Engine..."
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend/ml
uvicorn backend.ml.unified_app:app --host 0.0.0.0 --port 8000 &

# 2. Wait for ML to warm up
sleep 5

# 3. Start the Compatibility Proxies (Ports 8001-8005)
# This allows the Node.js backend to find ML services where it expects them.
echo "📡 Starting Compatibility Proxies..."
node backend/ml/proxy_ml.js &

# 4. Start the Main Backend Service
# Render uses the $PORT variable, but we've exposed 5000 in the Dockerfile
echo "🌐 Starting Main Backend API..."
cd backend
npm start
