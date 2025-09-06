# Stage 1: Build Angular
FROM node:20 AS builder
WORKDIR /app

# Copy Angular package files
COPY package.json package-lock.json ./

# Install Angular dependencies
RUN npm install --legacy-peer-deps

# Copy Angular source files
COPY . .

# Build Angular for production
RUN npm run build -- --output-path=./dist/angular-localstorage-table

# Stage 2: Backend + Serve Angular
FROM node:20-alpine
WORKDIR /app

# Copy Angular build
COPY --from=builder /app/dist/angular-localstorage-table ./dist/angular-localstorage-table

# Copy backend source
COPY server.js ./server.js
COPY backend ./backend

# Install backend dependencies (from backend/package.json)
WORKDIR /app/backend
RUN npm install --legacy-peer-deps --omit=dev

# Go back to /app so server.js works
WORKDIR /app
# Expose Cloud Run port
EXPOSE 8080

# Start Express server
CMD ["node", "server.js"]
