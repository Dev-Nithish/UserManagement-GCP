# ------------------ Stage 1: Build Angular ------------------
FROM node:20 AS builder
WORKDIR /app

# Copy frontend package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Build Angular frontend
RUN npm run build -- --output-path=./dist/angular-localstorage-table

# ------------------ Stage 2: Setup backend + server ------------------
FROM node:20
WORKDIR /app

# Copy Angular build
COPY --from=builder /app/dist/angular-localstorage-table ./dist/angular-localstorage-table

# Copy backend and server files
COPY server.js ./server.js
COPY backend ./backend
COPY package.json package-lock.json ./

# Install backend dependencies
RUN npm install --legacy-peer-deps --omit=dev

# Expose port for Cloud Run
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
