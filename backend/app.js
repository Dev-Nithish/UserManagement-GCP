const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const fetch = require("node-fetch"); // Firebase REST API for login
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Initialize Firebase Admin (local or cloud)
try {
  if (!admin.apps.length) {
    if (process.env.GCP_PROJECT) {
      // Running on Cloud Functions → default credentials
      admin.initializeApp();
    } else {
      // Running locally → use service-account.json
      const serviceAccount = require(path.join(__dirname, "service-account.json"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    console.log("🔥 Firebase Admin initialized");
  }
} catch (err) {
  console.error("⚠️ Failed to initialize Firebase Admin", err);
}

const db = admin.firestore();

// ✅ Initialize Google Cloud Storage
let storage;
try {
  if (process.env.GCP_PROJECT) {
    storage = new Storage(); // Cloud Functions → default creds
  } else {
    const serviceAccount = require(path.join(__dirname, "service-account.json"));
    storage = new Storage({ credentials: serviceAccount });
  }
} catch (err) {
  console.error("⚠️ Failed to initialize GCS", err);
}
const bucketName = "your-bucket-name"; // 👈 replace this
const bucket = storage ? storage.bucket(bucketName) : null;

// ------------------ ROUTES ------------------

app.get("/", (req, res) => {
  res.send("Welcome to the backend API!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend working!" });
});

// ------------------ AUTH ROUTES ------------------

// Signup
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

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!process.env.FIREBASE_API_KEY) {
      throw new Error("Set FIREBASE_API_KEY in your environment variables");
    }
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

// ------------------ USER ROUTES ------------------

app.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const newUser = req.body;
    const docRef = await db.collection("users").add({
      ...newUser,
      createdAt: Date.now(),
    });
    res.json({ id: docRef.id, ...newUser });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Something went wrong" });
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
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("users").doc(id).delete();
    res.json({ id, message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ------------------ GCS BACKUP ROUTE ------------------

app.post("/backupUsers", async (req, res) => {
  if (!bucket) {
    return res.status(500).json({ error: "GCS not configured" });
  }
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const file = bucket.file("users.json");
    await file.save(JSON.stringify(users, null, 2));

    res.json({ message: "Backup complete", file: `gs://${bucketName}/users.json` });
  } catch (err) {
    console.error("Error backing up users:", err);
    res.status(500).json({ error: "Backup failed" });
  }
});

// ------------------ LOCAL vs CLOUD FUNCTION ------------------

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
  });
}



module.exports = app;
