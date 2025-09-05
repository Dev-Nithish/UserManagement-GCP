// server.js
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Serve the static files from the 'dist' folder.
// The path must match the folder created by Angular CLI during build
app.use(express.static(path.join(__dirname, 'dist/angular-localstorage-table')));

// For all other routes, serve the 'index.html' file. This is crucial for single-page applications (SPAs).
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-localstorage-table/index.html'));
});

// Start the server and listen on the correct port.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
