const { Storage } = require("@google-cloud/storage");

// 🔹 Setup GCS
const storage = new Storage();
const bucket = storage.bucket("your-bucket-name"); // change to your actual bucket name
const file = bucket.file("users.json");

// 🔹 Helpers
async function readUsers() {
  try {
    const [contents] = await file.download();
    return JSON.parse(contents.toString());
  } catch (err) {
    if (err.code === 404) return []; // no file yet → return empty list
    throw err;
  }
}

async function writeUsers(users) {
  await file.save(JSON.stringify(users, null, 2));
}

// 🔹 Controller methods
exports.getUsers = async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const users = await readUsers();
    const newUser = { id: Date.now().toString(), ...req.body, createdAt: Date.now() };
    users.push(newUser);
    await writeUsers(users);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to add user", details: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ error: "User not found" });
    users[idx] = { ...users[idx], ...req.body };
    await writeUsers(users);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user", details: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readUsers();
    const updated = users.filter(u => u.id !== id);
    if (updated.length === users.length) {
      return res.status(404).json({ error: "User not found" });
    }
    await writeUsers(updated);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user", details: err.message });
  }
};
