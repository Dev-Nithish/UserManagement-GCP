# -----------------------------
# Stage 1: Build Angular frontend
# -----------------------------
FROM node:20 AS build

WORKDIR /app

# Copy frontend dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy all frontend source files
COPY . ./

# Build Angular app
RUN npm run build -- --configuration production --project=angular-localstorage-table

# -----------------------------
# Stage 2: Runtime container
# -----------------------------
FROM node:20

# Set working directory to backend
WORKDIR /app/backend

# Copy backend dependencies and install
COPY backend/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy backend code
COPY backend/ ./

# Copy built Angular frontend from build stage
# ⚡ Ensures Angular build output is in /dist for backend server
COPY --from=build /app/dist/angular-localstorage-table ./dist

# Expose port for Cloud Run (uses $PORT)
EXPOSE 8080

# Start the backend server
CMD ["node", "server.js"]
