# Stage 1: Build Angular
FROM node:20 AS builder
WORKDIR /app

# Copy Angular package files (frontend)
COPY package.json package-lock.json ./
RUN npm install

# Copy all source code
COPY . .

# Build Angular for production
RUN npm run build -- --output-path=./dist/angular-localstorage-table

# Stage 2: Serve with Express
FROM node:20-alpine
WORKDIR /app

# Copy Angular build output from builder stage
COPY --from=builder /app/dist/angular-localstorage-table ./dist/angular-localstorage-table

# Copy server and backend dependencies
COPY server.js ./
COPY backend/package*.json ./

# Install only backend dependencies
RUN npm install --legacy-peer-deps --omit=dev

# Expose port expected by Cloud Run
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
