#!/bin/bash
set -e

echo "🔧 Setting up machine..."

# Node.js (already done by you)
# pnpm (already done by you)

# pnpm global env (critical)
pnpm setup
source ~/.bashrc

# Install PM2
pnpm install -g pm2

# PM2 auto-start on reboot
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

echo "✅ Machine setup complete"
