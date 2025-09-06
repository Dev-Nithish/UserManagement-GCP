const express = require('express');
const path = require('path');

// Import backend API
const apiApp = require('./backend/app');

const app = express();
const port = process.env.PORT || 8080;

// Middleware & routes
app.use('/api', apiApp);

// Serve Angular frontend
app.use(express.static(path.join(__dirname, 'dist/angular-localstorage-table')));

// Serve Angular routes (except /api)
app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-localstorage-table/index.html'));
});

// Start server on Cloud Run
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
});
