# ==========================================
# HealTrip Unified Dockerfile for Render
# ==========================================

# Use a Node.js base image
FROM node:20-slim

# Install Python and essential tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Install Backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# 2. Install ML dependencies (Consolidated requirements)
# Note: We copy from backend/ml but run pip at the root level for simplicity
COPY backend/ml/requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# 3. Copy all project files
COPY . .

# 4. Make the start script executable
RUN chmod +x render-start.sh

# 5. Environment Setup
ENV NODE_ENV=production
# Render will override this, but we use 5000 as default
ENV PORT=5000

# 6. Expose the main API port
EXPOSE 5000

# 7. Use the unified start script
CMD ["./render-start.sh"]
