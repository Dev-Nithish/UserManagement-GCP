# Stage 1: Build Angular
FROM node:18 AS builder
WORKDIR /app

# Copy Angular project package.json
COPY package.json package-lock.json ./

RUN npm install
COPY . .
RUN npm run build -- --output-path=./dist/angular-localstorage-table

# Stage 2: Serve with Express
FROM node:18-alpine
WORKDIR /app

# Copy production build from builder
COPY --from=builder /app/dist/angular-localstorage-table ./dist/angular-localstorage-table

# Copy server.js and backend package.json
COPY server.js ./
COPY backend/package.json ./
COPY backend/package-lock.json ./

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 8080
CMD ["npm", "start"]
