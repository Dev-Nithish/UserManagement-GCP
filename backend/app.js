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

// ✅ Upload/Overwrite users.xlsx in GCS (protected by OAuth)
app.post('/users/upload', verifyToken, async (req, res) => {
  try {
    const users = req.body; // expects [{name, age, contact}, ...]

    if (!Array.isArray(users)) {
      return res.status(400).json({ error: 'Invalid data: expected array of users' });
    }

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
    await file.save(buffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    console.log(`[${new Date().toISOString()}] User ${req.user.email} uploaded ${users.length} users to GCS`);

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    res.status(200).json({
      message: 'Users uploaded to GCS successfully',
      url: publicUrl
    });
  } catch (err) {
    console.error('Error uploading users to GCS:', err);
    res.status(500).json({ error: 'Failed to upload users' });
  }
});

module.exports = app;
