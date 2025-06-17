const express = require('express');
const { admin, db } = require('../firebase-config'); // Ambil dari firebase-config.js
const router = express.Router();

// GET data pengguna dengan filter rt dan role
router.get('/', async (req, res) => {
  const { rt, role } = req.query;

  try {
    let query = db.collection('users');

    if (rt && rt !== 'Semua') {
      query = query.where('rt', '==', rt);
    }

    if (role && role !== 'Semua') {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      return res.status(404).send('Tidak ada data pengguna ditemukan');
    }

    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal memuat data pengguna');
  }
});

// DELETE pengguna berdasarkan ID dokumen Firestore
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    await db.collection('users').doc(userId).delete();
    res.send('Pengguna berhasil dihapus');
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal menghapus pengguna');
  }
});

// POST tambah pengguna baru + kirim email reset password
router.post('/add', async (req, res) => {
  const { nama, email, password, rt, role } = req.body;

  try {
    // 1. Buat akun di Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: nama,
    });

    // 2. Set custom claims untuk role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // 3. Simpan ke Firestore
    await db.collection('users').doc(userRecord.uid).set({
      nama,
      email,
      rt,
      role,
      uid: userRecord.uid,
    });

    // 4. Kirim email reset password otomatis via Firebase
    await admin.auth().generatePasswordResetLink(email);

    res.status(200).json({
      message: 'Pengguna berhasil ditambahkan dan email reset password telah dikirim.',
    });
  } catch (error) {
    console.error('Gagal menambahkan pengguna:', error);
    res.status(500).json({ error: 'Gagal menambahkan pengguna' });
  }
});

module.exports = router;
