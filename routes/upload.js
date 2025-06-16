const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: '/tmp' }); // Railway hanya izinkan tulis ke /tmp

let credentials;

try {
  const jsonString = Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf8');
  credentials = JSON.parse(jsonString);
} catch (err) {
  console.error('❌ Gagal memuat GOOGLE_CREDENTIALS dari .env:', err.message);
  process.exit(1);
}

const driveAuth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

// ...router.post('/'...) (tidak berubah)
