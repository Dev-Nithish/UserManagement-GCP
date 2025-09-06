# Stage 1: Build Angular app
FROM node:20 AS build

WORKDIR /app

# Install Angular dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy Angular source and build with explicit project name
COPY . .
RUN npm run build -- --configuration production --project=angular-localstorage-table

# Stage 2: Runtime container
FROM node:20
WORKDIR /app

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
COPY backend .

# Copy built Angular dist from build stage
WORKDIR /app
COPY --from=build /app/dist ./dist

# Copy server.js
COPY server.js .

EXPOSE 8080
CMD ["node", "server.js"]
