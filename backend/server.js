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
// ✅ Enable CORS with preflight handling
// ----------------------------
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy: Origin not allowed -> ' + origin), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Handle preflight OPTIONS requests for all routes
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
// ✅ Start server
// ----------------------------
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
});
