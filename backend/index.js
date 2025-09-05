// Import the Functions Framework
const functions = require('@google-cloud/functions-framework');

// Import your Express app
const app = require('./app');

// Export an HTTP function named "api"
functions.http('api', app);
