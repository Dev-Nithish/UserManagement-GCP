const express = require('express');
const app = express();
const { Storage } = require('@google-cloud/storage');
const XLSX = require('xlsx');

// ✅ Import Google OAuth middleware
const verifyToken = require('./middlewares/authMiddleware');

app.use(express.json({ limit: '10mb' })); // to parse large JSON payloads

const storage = new Storage();
const bucketName = 'user-bucket123';
const fileName = 'users.xlsx';

// ----------------------------
// ✅ Upload/Overwrite users.xlsx in GCS (protected by OAuth)
// ----------------------------
app.post('/users/upload', verifyToken, async (req, res) => {
  try {
    const users = req.body; // expects an array of user objects [{name, age, contact}, ...]
    if (!Array.isArray(users)) return res.status(400).send('Invalid data');

    // Convert JSON to Excel
    const worksheet = XLSX.utils.json_to_sheet(users.map(u => ({
      Name: u.name,
      Age: u.age,
      Contact: u.contact
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Upload to GCS
    const file = storage.bucket(bucketName).file(fileName);
    await file.save(buffer, { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // ✅ Log who uploaded and how many users
    console.log(`[${new Date().toISOString()}] User ${req.user.email} uploaded ${users.length} users to GCS`);

    res.status(200).send('Users uploaded to GCS successfully');
  } catch (err) {
    console.error('Error uploading users to GCS:', err);
    res.status(500).send('Failed to upload users');
  }
});

module.exports = app;
