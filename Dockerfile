# Stage 1: Build the Angular application
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build -- --output-path=./dist/angular-project1

# Stage 2: Serve the application with the simple Express server
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist/angular-project1 ./dist/angular-project1
COPY server.js .
COPY package.json .
RUN npm install --omit=dev
EXPOSE 8080
CMD [ "npm", "start" ]
