// firebase-config.js

require('dotenv').config(); // Harus di awal

const admin = require('firebase-admin');

let serviceAccount;

try {
  // Ambil dan parse JSON dari environment variable
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);

  // Format private key agar newline-nya benar
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
} catch (error) {
  console.error('❌ Gagal memuat SERVICE_ACCOUNT dari .env:', error);
  process.exit(1); // Hentikan proses jika JSON tidak valid
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
