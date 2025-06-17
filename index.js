const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware global
app.use(cors());
app.use(bodyParser.json());

// 🔁 Load semua route
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

// 🧩 Mount route dengan path konsisten
app.use('/api/upload', uploadRoutes); // ✅ Ini akan aktif di: POST /api/upload
app.use('/api/auth', authRoutes);
app.use('/users', usersRoutes);

// 🔁 Redirect untuk image dari Google Drive jika pakai fileId
app.get('/image/:fileId', (req, res) => {
  const { fileId } = req.params;
  const imageUrl = `https://drive.google.com/uc?id=${fileId}`;
  res.redirect(imageUrl);
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
