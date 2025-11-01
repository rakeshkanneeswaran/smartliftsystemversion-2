#!/bin/bash

# ============================================
# 🚀 Smart Lift System - PM2 Startup Script
# ============================================

set -e

echo "======================================"
echo " Starting Smart Lift System Services "
echo "======================================"

# Ensure pnpm and pm2 are installed
if ! command -v pnpm &> /dev/null
then
    echo "❌ pnpm not found! Please install with: npm install -g pnpm"
    exit 1
fi

if ! command -v pm2 &> /dev/null
then
    echo "❌ pm2 not found! Please install with: npm install -g pm2"
    exit 1
fi

# Go to backend folder
echo "➡️  Starting Backend..."
cd "$(dirname "$0")/backend"
pnpm install --frozen-lockfile
pm2 start "pnpm run start" --name backend

# Go to Next.js frontend folder
echo "➡️  Starting Next.js Frontend..."
cd ../display/my-app
pnpm install --frozen-lockfile
pm2 start "pnpm run start" --name frontend

# Save PM2 processes
pm2 save

echo "✅ All apps started successfully!"
echo "--------------------------------------"
pm2 list
