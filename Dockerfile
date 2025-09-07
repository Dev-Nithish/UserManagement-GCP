# Stage 1: Build Angular app
FROM node:20 AS build

WORKDIR /app

# Install Angular dependencies (frontend)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy Angular source and build
COPY . .
RUN npm run build -- --configuration production --project=angular-localstoarge-table

# Stage 2: Runtime container
FROM node:20

WORKDIR /app

# Copy backend dependencies and install
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev --legacy-peer-deps
COPY backend ./backend

# Copy built Angular dist from build stage
COPY --from=build /app/dist ./dist

# Copy server.js
COPY server.js .

# Expose port for Cloud Run
EXPOSE 8080

# Start the app
CMD ["node", "server.js"]
