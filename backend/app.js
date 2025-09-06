const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const app = express();

// Initialize Firebase Admin SDK
try {
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    // Running on Google Cloud (Cloud Run, App Engine, etc.)
    admin.initializeApp();
    console.log('✅ Firebase Admin initialized with default credentials');
  } else {
    // Local development (check for service-account.json)
    const keyPath = path.join(__dirname, 'service-account.json');
    if (fs.existsSync(keyPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(require(keyPath)),
      });
      console.log('✅ Firebase Admin initialized with local service account');
    } else {
      console.warn('⚠️ No service-account.json found, Firebase Admin not initialized locally');
    }
  }
} catch (err) {
  console.error('❌ Firebase Admin initialization failed:', err);
}

// Example API route
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from backend API!' });
});

// Health endpoint for backend
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'backend ok' });
});

module.exports = app;
