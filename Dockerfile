# Stage 1: Build Angular
FROM node:20 AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (Angular + backend dev deps are okay here)
RUN npm install --legacy-peer-deps

# Copy all source files
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
COPY package.json package-lock.json ./  

# Install only production dependencies
RUN npm install --legacy-peer-deps --omit=dev

# Expose Cloud Run port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
