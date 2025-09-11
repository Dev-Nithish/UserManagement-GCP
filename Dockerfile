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
# Stage 2: Runtime container (distroless)
# -----------------------------
FROM gcr.io/distroless/nodejs20

WORKDIR /app/backend

# Copy backend dependencies
COPY backend/package*.json ./
# We need npm to install → use a temporary node:20 stage
FROM node:20 AS deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy installed node_modules into distroless image
FROM gcr.io/distroless/nodejs20
WORKDIR /app/backend
COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/ ./

# Copy Angular build from build stage
COPY --from=build /app/dist/angular-localstorage-table ./dist/angular-localstorage-table

EXPOSE 8080
CMD ["server.js"]
