#!/bin/bash

# ============================================
# 🚀 Node.js + pnpm Installation Script
# For Ubuntu (AWS EC2)
# ============================================

set -e

echo "======================================"
echo " Installing Node.js (LTS) and pnpm "
echo "======================================"

# Update system packages
echo "➡️  Updating system packages..."
sudo apt update -y

# Install required tools
echo "➡️  Installing curl..."
sudo apt install -y curl ca-certificates

# Add NodeSource repository (LTS)
echo "➡️  Adding NodeSource Node.js LTS repo..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

# Install Node.js
echo "➡️  Installing Node.js..."
sudo apt install -y nodejs

# Verify Node.js and npm
echo "✅ Node.js version:"
node -v

echo "✅ npm version:"
npm -v

# Install pnpm globally
echo "➡️  Installing pnpm..."
npm install -g pnpm

# Verify pnpm
echo "✅ pnpm version:"
pnpm -v

echo "======================================"
echo " ✅ Node.js and pnpm installed successfully "
echo "======================================"
