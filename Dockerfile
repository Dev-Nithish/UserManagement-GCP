# Stage 1: Build Angular
FROM node:20 AS builder
WORKDIR /app

# Copy frontend package files
COPY package.json package-lock.json ./

# Install frontend dependencies
RUN npm install --legacy-peer-deps

# Copy all frontend source files
COPY . .

# Build Angular
RUN npm run build -- --output-path=./dist/angular-localstorage-table

# Stage 2: Setup backend + server
FROM node:20-alpine
WORKDIR /app

# Copy Angular build from builder
COPY --from=builder /app/dist/angular-localstorage-table ./dist/angular-localstorage-table

# Copy backend and server
COPY server.js ./server.js
COPY backend ./backend

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm install --legacy-peer-deps --omit=dev

# Go back to /app
WORKDIR /app

# Expose Cloud Run port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
