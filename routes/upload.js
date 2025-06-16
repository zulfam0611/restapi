const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config(); // Harus di awal

const router = express.Router();

// Gunakan folder sementara agar aman di Railway/Vercel
const upload = multer({ dest: '/tmp' });

let credentials;

try {
  const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;

  if (!base64) {
    throw new Error('GOOGLE_CREDENTIALS_BASE64 tidak ditemukan di .env');
  }

  const jsonString = Buffer.from(base64, 'base64').toString('utf8');
  credentials = JSON.parse(jsonString);
} catch (error) {
  console.error('❌ Gagal memuat GOOGLE_CREDENTIALS_BASE64 dari .env:', error.message);
  process.exit(1);
}

const driveAuth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

router.post('/', upload.single('image'), async (req, res) => {
  console.log('--- Menerima Permintaan Upload ---');
  console.log('Request File (dari Multer):', req.file);
  console.log('Request Body (data teks dari form-data):', req.body);

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    }

    const auth = await driveAuth.getClient();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: req.file.originalname,
      parents: ['1RgaJv33l2o1fu3H9YKTpBmVSAA_5cyyK'], // Ganti dengan folder ID kamu
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
    });

    const fileId = response.data.id;

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const result = await drive.files.get({
      fileId,
      fields: 'webViewLink, webContentLink',
    });

    fs.unlinkSync(req.file.path); // Hapus file sementara

    res.status(200).json({
      message: 'Upload berhasil',
      imageUrl: result.data.webContentLink,
    });
  } catch (error) {
    console.error('Upload gagal:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan saat upload.',
      detail: error.message,
    });
  }
});

module.exports = router;
