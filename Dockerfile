# Stage 1: Build the Angular application
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# Build Angular app for production
RUN npm run build -- --output-path=./dist/angular-localstorage-table

# Stage 2: Serve the application with Express
FROM node:18-alpine
WORKDIR /app

# Copy production build from builder
COPY --from=builder /app/dist/angular-localstorage-table ./dist/angular-localstorage-table

# Copy server and package files
COPY server.js package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Cloud Run expects the container to listen on this port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
