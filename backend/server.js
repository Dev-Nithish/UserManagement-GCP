const express = require('express');
const path = require('path');
const cors = require('cors');

// ----------------------------
// ✅ Import backend API routes
// ----------------------------
const apiApp = require('./app');
const app = express();

// ----------------------------
// ✅ Allowed origins
// ----------------------------
const allowedOrigins = [
  'http://localhost:4200', // dev
  'https://usermanagement-gcp09-937580556914.asia-south1.run.app' // frontend (Angular prod)
];

// ----------------------------
// ✅ Enable CORS with safe handling
// ----------------------------
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl/Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❌ Instead of throwing error (which caused 500), just block the request gracefully
    console.warn(`⚠️  Blocked by CORS: ${origin}`);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Handle preflight OPTIONS requests
app.options('*', cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ----------------------------
// ✅ Parse JSON bodies (large payloads)
// ----------------------------
app.use(express.json({ limit: '10mb' }));

// ----------------------------
// ✅ API routes (with OAuth middleware inside app.js)
// ----------------------------
app.use('/api', apiApp);

// ----------------------------
// ✅ Serve Angular frontend
// ----------------------------
const angularDistPath = path.join(__dirname, 'dist/angular-localstorage-table');
app.use(express.static(angularDistPath));

// Fallback route for Angular (all non-API routes)
app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

// ----------------------------
// ✅ Health check for Cloud Run
// ----------------------------
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ----------------------------
// ✅ Global error handler (shows real errors instead of silent 500)
// ----------------------------
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.stack || err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message
  });
});

// ----------------------------
// ✅ Start server
// ----------------------------
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
});
