// backend/index.js
const functions = require('@google-cloud/functions-framework');
const app = require('./app');

// Cloud Functions export
functions.http('api', app);

// Local dev (only if run directly, not in Cloud)
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
  });
}
