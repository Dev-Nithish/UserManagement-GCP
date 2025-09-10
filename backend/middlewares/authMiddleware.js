const { OAuth2Client } = require('google-auth-library');

// ✅ Full Google OAuth Client ID (from GCP console)
const CLIENT_ID = '937580556914-hfd084a6e8qeqfqfajin767n81srmdpi.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

module.exports = async function verifyGoogleToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    req.user = payload; // 👈 contains { email, name, picture, sub (Google user ID) }
    next();
  } catch (err) {
    console.error('OAuth token verification failed:', err);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
