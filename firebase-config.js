require('dotenv').config();
const admin = require('firebase-admin');

let serviceAccount;

try {
  const jsonString = Buffer.from(process.env.SERVICE_ACCOUNT, 'base64').toString('utf8');
  serviceAccount = JSON.parse(jsonString);
} catch (err) {
  console.error('❌ Gagal memuat SERVICE_ACCOUNT dari .env:', err.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = { admin, db };
