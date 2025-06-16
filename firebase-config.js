// firebase-config.js

require('dotenv').config(); // Wajib dipanggil paling atas

const admin = require('firebase-admin');

let serviceAccount;

try {
  const base64 = process.env.SERVICE_ACCOUNT;

  if (!base64) {
    throw new Error('SERVICE_ACCOUNT tidak ditemukan di .env');
  }

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

// Ekspor admin dan db agar bisa dipakai di file lain
const db = admin.firestore();

module.exports = { admin, db };
