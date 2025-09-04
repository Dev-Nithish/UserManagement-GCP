// backend/index.js
const functions = require('@google-cloud/functions-framework');
const app = require('./app');

// Export HTTP function named "api"
functions.http('api', app);
