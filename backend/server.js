const express = require('express');
const path = require('path');

// ----------------------------
// ✅ Import backend API routes
// ----------------------------
const apiApp = require('./app');
const app = express();

// ----------------------------
// ✅ Middleware & API routes
// ----------------------------
app.use('/api', apiApp);

// ----------------------------
// ✅ Serve Angular frontend
// ----------------------------
// In Dockerfile, Angular build is copied to ./dist
const angularDistPath = path.join(__dirname, 'dist');
app.use(express.static(angularDistPath));

// Angular fallback route (for client-side routing, except /api)
app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

// Health check for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ----------------------------
// ✅ Start server
// ----------------------------
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
});
