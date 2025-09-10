const express = require('express');
const path = require('path');
const cors = require('cors'); // ✅ import CORS

// ----------------------------
// ✅ Import backend API routes
// ----------------------------
const apiApp = require('./app');
const app = express();

// ----------------------------
// ✅ Enable CORS for frontend domains
// ----------------------------
app.use(cors({
  origin: [
    'http://localhost:4200', // dev
    'https://usermanagement-gcp3-937580556914.asia-south1.run.app' // prod
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ----------------------------
// ✅ Middleware & API routes
// ----------------------------
app.use('/api', apiApp);

// ----------------------------
// ✅ Serve Angular frontend
// ----------------------------
const angularDistPath = path.join(__dirname, 'dist');
app.use(express.static(angularDistPath));

// Angular fallback route (except /api)
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
