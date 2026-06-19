require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
const corsOptions = {
  origin(origin, callback) {
    const allowList = new Set([
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ]);

    // allow non-browser requests (e.g., Postman) with no origin
    if (!origin) return callback(null, true);
    if (allowList.has(origin)) return callback(null, true);
    return callback(new Error('CORS origin tidak diizinkan: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// Import routes
const rekomendasiPenelitianRoute = require('./routes/rekomendasiPenelitian');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const usersRoute = require('./routes/users');
const rekomendasiSuratPindahRoute = require('./routes/rekomendasiSuratPindah');
const rekomendasiAktaKelahiranRoute = require('./routes/rekomendasiAktaKelahiran');
const rekomendasiKartuKeluargaRoute = require('./routes/rekomendasiKartuKeluarga');
const rekomendasiSuratKerjaRoute = require('./routes/rekomendasiSuratKerja');
const rekomendasiSuratTanahRoute = require('./routes/rekomendasiSuratTanah');
const rekomendasiSuratAhliWarisRoute = require('./routes/rekomendasiSuratAhliWaris');
const rekomendasiSuratYayasanRoute = require('./routes/rekomendasiSuratYayasan');
const galeriRoute = require('./routes/galeri');

// Gunakan routes
app.use(rekomendasiPenelitianRoute);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', profileRoutes);
app.use(usersRoute);
app.use(rekomendasiSuratPindahRoute);
app.use(rekomendasiAktaKelahiranRoute);
app.use(rekomendasiKartuKeluargaRoute);
app.use(rekomendasiSuratKerjaRoute);
app.use(rekomendasiSuratTanahRoute);
app.use(rekomendasiSuratAhliWarisRoute);
app.use(rekomendasiSuratYayasanRoute);
app.use(galeriRoute);

// Root endpoint
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Backend Sistem Pelayanan Terpadu Rantau Kopar berhasil berjalan'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.IP || process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server berjalan di http://${HOST}:${PORT}`);
});
