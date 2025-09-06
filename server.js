const express = require('express');
const path = require('path');

// Import backend API
const apiApp = require('./backend/app');

const app = express();
const port = process.env.PORT || 8080;

// Mount backend API at /api
app.use('/api', apiApp);

// Serve Angular frontend
app.use(express.static(path.join(__dirname, 'dist/angular-localstorage-table')));

// Serve Angular routes (except /api)
app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-localstorage-table/index.html'));
});

// Bind to 0.0.0.0 for Cloud Run
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${port}`);
});
