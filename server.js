const express = require('express');
const path = require('path');

// Import your backend API
const apiApp = require('./backend/app'); // <-- app.js in backend folder

const app = express();
const port = process.env.PORT || 8080;

// Mount API routes at /api
app.use('/api', apiApp);

// Serve Angular frontend
app.use(express.static(path.join(__dirname, 'dist/angular-localstorage-table')));

// Serve index.html for Angular routes, but exclude /api
app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-localstorage-table/index.html'));
});

// Bind to 0.0.0.0 for Cloud Run
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running at http://0.0.0.0:${port}`);
});
