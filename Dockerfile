# Stage 1: Build the Angular application
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# Use the updated build script from package.json which allocates more memory
RUN npm run build -- --output-path=./dist/angular-localstorage-table

# Stage 2: Serve the application with a simple Express server
FROM node:18-alpine
WORKDIR /app
# Copy the built files from the first stage
COPY --from=builder /app/dist/angular-localstorage-table ./dist/angular-localstorage-table
COPY server.js .
COPY package.json .
RUN npm install --omit=dev
EXPOSE 8080
CMD [ "npm", "start" ]
