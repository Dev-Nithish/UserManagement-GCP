const functions = require('@google-cloud/functions-framework');
const app = require('./app');

// Cloud Function entrypoint
functions.http('api', app);
