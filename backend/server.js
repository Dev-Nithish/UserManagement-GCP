const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const fs = require('fs');


// ----------------------------
// ✅ Initialize Firebase Admin
// ----------------------------
try {
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    // Running on Google Cloud (Cloud Run, App Engine, etc.)
    admin.initializeApp();
    console.log('✅ Firebase Admin initialized with default credentials');
  } else {
    // Local development
    const keyPath = path.join(__dirname, 'service-account.json');
    if (fs.existsSync(keyPath)) {
      const serviceAccount = require(keyPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with local service account');
    } else {
      console.warn('⚠️ No service-account.json found, Firebase Admin not initialized locally');
    }
  }
} catch (err) {
  console.error('❌ Firebase Admin initialization failed:', err);
}

// ----------------------------
// ✅ Import backend API routes
// ----------------------------
const apiApp = require('./app');
const app = express();
const port = process.env.PORT || 8080;

// ----------------------------
// ✅ Middleware & API routes
// ----------------------------
app.use('/api', apiApp);

// ----------------------------
// ✅ Serve Angular frontend
// ----------------------------
app.use(express.static(path.join(__dirname, 'dist/angular-localstorage-table')));

// Angular routes fallback (except /api)
app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-localstorage-table/index.html'));
});

// Health check for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ----------------------------
// ✅ Start server
// ----------------------------
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
});
