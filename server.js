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

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
