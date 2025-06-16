const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: '/tmp' }); // Railway hanya izinkan tulis ke /tmp

// Load Google credentials dari .env
let credentials;

try {
  const jsonString = Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf8');
  credentials = JSON.parse(jsonString);
} catch (err) {
  console.error('❌ Gagal memuat GOOGLE_CREDENTIALS dari .env:', err.message);
  process.exit(1);
}

// Setup Google Drive Auth
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Endpoint upload file ke Google Drive
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    }

    const fileMetadata = {
      name: req.file.originalname,
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    // Upload file ke Google Drive
    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
    });

    const fileId = response.data.id;

    // Set permission agar file bisa diakses publik
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Dapatkan link file
    const result = await drive.files.get({
      fileId,
      fields: 'webViewLink, webContentLink',
    });

    // Hapus file lokal setelah upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: 'Upload berhasil',
      imageUrl: result.data.webContentLink,
      viewLink: result.data.webViewLink,
    });
  } catch (error) {
    console.error('❌ Upload gagal:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat upload.' });
  }
});

module.exports = router;
