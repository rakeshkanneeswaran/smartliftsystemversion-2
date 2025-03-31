# ===== STAGE 1: Build =====
FROM node:20-alpine3.18 AS builder

WORKDIR /app

# Copy ONLY dependency files first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install pnpm using npm
RUN npm install -g pnpm

# Install dependencies (--frozen-lockfile is good for production)
RUN pnpm install --frozen-lockfile

# Copy the rest of the app (after dependencies for cache efficiency)
COPY . .

# Build the app (if needed, e.g., React/Vite/Next.js)
RUN pnpm run build

# ===== STAGE 2: Run =====
FROM node:20-alpine3.18 AS runner

WORKDIR /app

# Copy only production files from builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist 



EXPOSE 3002

# Start the app (use "start" if defined in package.json)
CMD ["node", "dist/index.js"]