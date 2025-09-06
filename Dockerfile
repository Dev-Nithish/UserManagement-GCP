# Stage 1: Build Angular app
FROM node:20 AS build

WORKDIR /app

# Copy Angular package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy Angular source code and build
COPY . .
RUN npm run build --prod

# Stage 2: Runtime container
FROM node:20

WORKDIR /app

# Copy backend files
COPY backend ./backend

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy built Angular dist from build stage
WORKDIR /app
COPY --from=build /app/dist ./dist

# Copy server.js
COPY server.js .

# Expose port (Cloud Run sets $PORT)
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
