const express = require('express');
const app = express();

// Example API route
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from backend API!' });
});

// Health endpoint for backend
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'backend ok' });
});

module.exports = app;
