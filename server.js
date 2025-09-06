const express = require('express');
const path = require('path');

// Import backend API
const apiApp = require('./backend/app');

const app = express();
const port = process.env.PORT || 8080;

// Log environment info
console.log("🚀 Starting server...");
console.log(`PORT=${port}`);
console.log(`NODE_ENV=${process.env.NODE_ENV || 'development'}`);

// Middleware & routes
app.use('/api', apiApp);

// Serve Angular frontend
app.use(express.static(path.join(__dirname, 'dist/angular-localstorage-table')));

// Serve Angular routes (except /api)
app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-localstorage-table/index.html'));
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Server is running' }));

// Catch all for unknown routes
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
try {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}
