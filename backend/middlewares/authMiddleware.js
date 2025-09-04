const admin = require('firebase-admin');

module.exports = async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Optional: attach decoded token to request
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
