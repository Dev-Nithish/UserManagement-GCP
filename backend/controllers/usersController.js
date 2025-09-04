const admin = require("firebase-admin");
const db = admin.firestore();

exports.getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const newUser = { ...req.body, createdAt: Date.now() };
    const docRef = await db.collection("users").add(newUser);
    res.json({ id: docRef.id, ...newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("users").doc(id).update(req.body);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("users").doc(id).delete();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
