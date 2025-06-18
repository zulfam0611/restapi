const express = require('express');
const { admin, db } = require('../firebase-config');
const router = express.Router();

// ============================
// GET: Ambil data pengguna
// ============================
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

// ============================
// DELETE: Hapus pengguna
// ============================
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

// ============================
// POST: Tambah pengguna baru
// ============================
router.post('/add', async (req, res) => {
  const { name, email, password, rt, role } = req.body;

  try {
    // 1. Cek apakah email sudah digunakan
    const existingUser = await admin.auth().getUserByEmail(email);
    
    // Kalau berhasil menemukan user, berarti email sudah terdaftar
    return res.status(400).json({
      error: 'Email sudah digunakan oleh akun lain.',
    });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // Lanjut buat user baru
      try {
        const userRecord = await admin.auth().createUser({
          email,
          password,
          displayName: this.name,
        });

        // Set custom claims (role)
        await admin.auth().setCustomUserClaims(userRecord.uid, { role });

        // Format tanggal (createdAt)
        const createdAt = new Date();
        const formatter = new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const formattedCreatedAt = formatter.format(createdAt) + ' UTC+7';

        // Simpan ke Firestore
        await db.collection('users').doc(userRecord.uid).set({
          name,
          email,
          rt,
          role,
          uid: userRecord.uid,
          createdAt: formattedCreatedAt,
        });

        // Kirim email reset password
        await admin.auth().generatePasswordResetLink(email);

        return res.status(200).json({
          message: 'Pengguna berhasil ditambahkan dan email reset password telah dikirim.',
        });

      } catch (createErr) {
        console.error('Gagal membuat user:', createErr);
        return res.status(500).json({ error: 'Gagal membuat akun pengguna.' });
      }

    } else {
      // Error selain user-not-found
      console.error('Gagal memeriksa email:', error);
      return res.status(500).json({ error: 'Gagal memeriksa email.' });
    }
  }
});

module.exports = router;
