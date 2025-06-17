const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: '/tmp' }); // /tmp aman untuk Railway/Vercel

// 🔐 Ambil & decode kredensial dari .env (base64)
const base64 = process.env.GOOGLE_CREDENTIALS;
const jsonString = Buffer.from(base64, 'base64').toString('utf8');
const credentials = JSON.parse(jsonString);
credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

// 🔐 Setup autentikasi Google Drive
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// 📤 Endpoint POST /api/upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang dikirim.' });
    }

    const fileMetadata = { name: req.file.originalname };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    // Upload ke Google Drive
    const uploadRes = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
    });

    const fileId = uploadRes.data.id;

    // Ubah jadi publik
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    // Ambil link view dan download
    const file = await drive.files.get({
      fileId,
      fields: 'webViewLink, webContentLink',
    });

    // Hapus file lokal
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: 'Upload berhasil',
      imageUrl: file.data.webContentLink,
      viewLink: file.data.webViewLink,
    });
  } catch (error) {
    console.error('❌ Upload gagal:', error.message);
    console.error(error.response?.data || error);
    res.status(500).json({ error: 'Upload gagal: ' + error.message });
  }
});

module.exports = router;
