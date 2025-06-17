const express = require('express');
const { admin } = require('../firebase-config'); // pastikan sudah export { admin, db }
const router = express.Router();

router.post('/login', async (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ message: 'Token tidak ditemukan' });
  }

  try {
    // Verifikasi ID Token Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Ambil data user lengkap dari Firebase
    const userRecord = await admin.auth().getUser(uid);

    // Cek custom claim role 'admin'
    if (userRecord.customClaims && userRecord.customClaims.role === 'admin') {
      return res.status(200).json({ role: 'admin' });
    } else {
      return res.status(403).json({ message: 'Akses ditolak: Role tidak sesuai' });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    // Kirim pesan error detail agar mudah debugging (bisa kamu sembunyikan di production)
    return res.status(401).json({ message: 'Token tidak valid', error: error.message });
  }
});

module.exports = router;
