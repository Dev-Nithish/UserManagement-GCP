const express = require('express');
const { Storage } = require('@google-cloud/storage');
const XLSX = require('xlsx');

// ✅ Import Google OAuth middleware
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
app.use(express.json({ limit: '10mb' }));

const storage = new Storage();
const bucketName = 'user-bucket123';
const fileName = 'users.xlsx';

// ----------------------------
// ✅ Utility: load users.xlsx as JSON
// ----------------------------
async function loadUsersFromGCS() {
  const file = storage.bucket(bucketName).file(fileName);
  const [exists] = await file.exists();
  if (!exists) return [];

  const [contents] = await file.download();
  const workbook = XLSX.read(contents, { type: 'buffer' });
  const sheet = workbook.Sheets['Users'];
  return XLSX.utils.sheet_to_json(sheet);
}

// ✅ Utility: save JSON users back to users.xlsx
async function saveUsersToGCS(users) {
  const worksheet = XLSX.utils.json_to_sheet(users);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  const file = storage.bucket(bucketName).file(fileName);
  await file.save(buffer, {
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

// ----------------------------
// ✅ GET /users → fetch all users
// ----------------------------
app.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await loadUsersFromGCS();
    console.log(`[${new Date().toISOString()}] ${req.user.email} fetched ${users.length} users`);
    res.status(200).json(users);
  } catch (err) {
    console.error('Error reading users from GCS:', err);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// ----------------------------
// ✅ POST /users → add new user
// ----------------------------
app.post('/users', verifyToken, async (req, res) => {
  try {
    const newUser = req.body;
    if (!newUser.name || !newUser.age || !newUser.contact) {
      return res.status(400).json({ error: 'Missing required fields (name, age, contact)' });
    }

    const users = await loadUsersFromGCS();
    const newId = users.length > 0 ? Math.max(...users.map(u => parseInt(u.id || 0))) + 1 : 1;

    const userToAdd = { id: newId.toString(), ...newUser, createdAt: new Date().toISOString() };
    users.push(userToAdd);

    await saveUsersToGCS(users);

    console.log(`[${new Date().toISOString()}] ${req.user.email} added user ID ${newId}`);
    res.status(201).json(userToAdd);
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Failed to add user', details: err.message });
  }
});

// ----------------------------
// ✅ PUT /users/:id → update user
// ----------------------------
app.put('/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const users = await loadUsersFromGCS();
    const index = users.findIndex(u => u.id == userId);

    if (index === -1) return res.status(404).json({ error: 'User not found' });

    users[index] = { ...users[index], ...updates };
    await saveUsersToGCS(users);

    console.log(`[${new Date().toISOString()}] ${req.user.email} updated user ID ${userId}`);
    res.status(200).json(users[index]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

// ----------------------------
// ✅ DELETE /users/:id → delete user
// ----------------------------
app.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    let users = await loadUsersFromGCS();

    const index = users.findIndex(u => u.id == userId);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    users.splice(index, 1);
    await saveUsersToGCS(users);

    console.log(`[${new Date().toISOString()}] ${req.user.email} deleted user ID ${userId}`);
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

// ----------------------------
// ✅ Keep your old bulk upload route
// ----------------------------
app.post('/users/upload', verifyToken, async (req, res) => {
  try {
    const users = req.body;
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: 'Invalid data: expected array of users' });
    }

    await saveUsersToGCS(users);
    console.log(`[${new Date().toISOString()}] ${req.user.email} uploaded ${users.length} users`);
    res.status(200).json({ message: 'Users uploaded successfully' });
  } catch (err) {
    console.error('Error uploading users:', err);
    res.status(500).json({ error: 'Failed to upload users', details: err.message });
  }
});

module.exports = app;
