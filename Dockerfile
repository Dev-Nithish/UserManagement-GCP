# -----------------------------
# Stage 1: Build Angular frontend
# -----------------------------
FROM node:20 AS build

WORKDIR /app

# Copy frontend dependencies (root package.json)
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
COPY --from=build /app/dist ./dist

# Expose port for clarity (Cloud Run uses $PORT)
EXPOSE 8080

# Start the backend server
CMD ["node", "server.js"]
