const { OAuth2Client } = require('google-auth-library');

// Replace with your Google OAuth Client ID
const CLIENT_ID = '937580556914-hfd084a6e8qeqfqfajin767n81srmdpi';
const client = new OAuth2Client(CLIENT_ID);

module.exports = async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    req.user = payload; // Optional: attach user info (email, name, etc.)
    next();
  } catch (err) {
    console.error('OAuth token verification failed:', err);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
