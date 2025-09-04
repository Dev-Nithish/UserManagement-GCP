// auth.js
const express = require("express");
const admin = require("firebase-admin");
const fetch = require("node-fetch"); // for Firebase REST API login
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

// ✅ Signup route
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({ email, password });

    // Generate a custom JWT using Firebase UID
    const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET || "secret_key", {
      expiresIn: "1h",
    });

    res.json({ idToken: token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    // Use Firebase REST API to verify credentials
    const apiKey = process.env.AIzaSyB4nshBH7wDRIXSaWmYIRm2qT9N1myqo30;
    if (!apiKey) return res.status(500).json({ error: "FIREBASE_API_KEY not set" });

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    // Generate a custom JWT using Firebase UID
    const token = jwt.sign({ uid: data.localId }, process.env.JWT_SECRET || "secret_key", {
      expiresIn: "1h",
    });

    res.json({ idToken: token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
