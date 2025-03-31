#building next js application
FROM node:20-alpine3.18

WORKDIR /app

# Copy the rest of the app (after dependencies for cache efficiency)
COPY . .

# Install pnpm using npm
RUN npm install -g pnpm

# Install dependencies (--frozen-lockfile is good for production)
RUN pnpm install --frozen-lockfile

# Build the app (if needed, e.g., React/Vite/Next.js)
RUN pnpm run build

WORKDIR /app

EXPOSE 3000

# Start the app (use "start" if defined in package.json)
CMD ["pnpm", "run" , "start"]