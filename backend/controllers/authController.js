const admin = require("firebase-admin");

exports.signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Optionally, generate custom token for frontend
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      token: customToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Firebase Admin SDK **cannot verify password directly**
  // So, the frontend will use Firebase Client SDK to login and get ID token
  // For now, you can create a "mock login" or implement a REST call to verify

  res.status(501).json({
    message:
      "Login via backend requires Firebase client login or custom auth implementation",
  });
};
