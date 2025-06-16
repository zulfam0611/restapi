// firebase-config.js

require('dotenv').config(); // Wajib dipanggil pertama

const admin = require('firebase-admin');

let serviceAccount;

try {
  // Parse JSON dari environment variable
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);

  // Ganti line break literal \\n menjadi newline nyata \n
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
} catch (error) {
  console.error('❌ Gagal memuat SERVICE_ACCOUNT dari .env:', error.message);
  process.exit(1); // Keluar dari aplikasi jika format salah
}

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
