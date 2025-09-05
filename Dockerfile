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

# Stage 2: Serve with Express
FROM node:20-alpine
WORKDIR /app

# Copy Angular build from Stage 1
COPY --from=builder /app/dist/angular-localstorage-table ./dist/angular-localstorage-table

# Copy backend server files
COPY server.js ./
COPY backend/package.json backend/package-lock.json ./backend/

# Install only backend dependencies
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

# Return to app root
WORKDIR /app

# Expose Cloud Run port
EXPOSE 8080

# Start Express server
CMD ["node", "server.js"]
