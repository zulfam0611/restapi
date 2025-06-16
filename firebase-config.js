// firebase-config.js

require('dotenv').config(); // Harus dipanggil pertama

const admin = require('firebase-admin');

let serviceAccount;

try {
  const base64 = process.env.SERVICE_ACCOUNT_BASE64;

  if (!base64) {
    throw new Error('SERVICE_ACCOUNT_BASE64 tidak ditemukan di .env');
  }

  // Decode base64 ke string JSON, lalu parse ke objek
  const jsonString = Buffer.from(base64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(jsonString);
} catch (error) {
  console.error('❌ Gagal memuat SERVICE_ACCOUNT dari .env:', error.message);
  process.exit(1);
}

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
