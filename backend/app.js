const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config();
const fs = require("fs");

const app = express();

// ------------------ CORS ------------------
const allowedOrigins = [
  "https://angular-projects3-937580556914.asia-south1.run.app",
  "http://localhost:4200"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", cors());

// ------------------ Middleware ------------------
app.use(express.json());

// ------------------ Firebase Admin ------------------
const adminOptions = {};
try {
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    console.log("🔥 Running on Cloud Run: using default credentials");
  } else {
    const serviceAccountPath = path.join(__dirname, "service-account.json");
    if (fs.existsSync(serviceAccountPath)) {
      adminOptions.credential = admin.credential.cert(require(serviceAccountPath));
      console.log("🔥 Running locally: using local service-account.json");
    } else {
      console.warn("⚠️ service-account.json not found locally. Firebase Admin may fail.");
    }
  }
  admin.initializeApp(adminOptions);
  console.log("🔥 Firebase Admin initialized");
} catch (err) {
  console.error("⚠️ Firebase Admin failed to initialize", err);
}

// Firestore instance
const db = admin.firestore();

// ------------------ Routes ------------------
app.get("/", (req, res) => res.send("Welcome to the backend API!"));
app.get("/health", (req, res) => res.json({ status: "ok", message: "Backend working!" }));

// Auth endpoints
app.post("/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    const token = await admin.auth().createCustomToken(userRecord.uid);
    res.json({ idToken: token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(400).json({ error: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!process.env.FIREBASE_API_KEY) throw new Error("FIREBASE_API_KEY missing");
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    res.json({ idToken: data.idToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Users endpoints
app.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/users", async (req, res) => {
  try {
    const newUser = req.body;
    const docRef = await db.collection("users").add({ ...newUser, createdAt: Date.now() });
    res.json({ id: docRef.id, ...newUser });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    await db.collection("users").doc(id).update(updates);
    res.json({ id, ...updates });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("users").doc(id).delete();
    res.json({ id, message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
