require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const app = express();

// Middleware
function getAllowedOrigins() {
  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  let swaggerOrigin = null;
  try {
    swaggerOrigin = swaggerSpec.servers?.[0]?.url
      ? new URL(swaggerSpec.servers[0].url).origin
      : null;
  } catch (error) {
    // An invalid Swagger server URL must not broaden the CORS policy.
    swaggerOrigin = null;
  }
  const defaultOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    swaggerOrigin
  ];

  return new Set([...defaultOrigins, ...configuredOrigins].filter(Boolean));
}

function swaggerBasicAuth(req, res, next) {
  const unauthorized = () => {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
    return res.status(401).send('Authentication required');
  };

  const authorization = req.get('authorization') || '';
  if (!authorization.startsWith('Basic ')) return unauthorized();

  try {
    const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 0) return unauthorized();

    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    if (
      username !== process.env.SWAGGER_USERNAME ||
      password !== process.env.SWAGGER_PASSWORD
    ) {
      return unauthorized();
    }

    return next();
  } catch (error) {
    return unauthorized();
  }
}

const corsOptions = {
  origin(origin, callback) {
    const allowList = getAllowedOrigins();

    // allow non-browser requests (e.g., Postman) with no origin
    if (!origin) return callback(null, true);
    if (allowList.has(origin)) return callback(null, true);
    return callback(new Error('CORS origin tidak diizinkan'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dokumentasi API Register, Login, dan Pengajuan Form Layanan
app.use(
  '/api-docs',
  swaggerBasicAuth,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: false,
    customSiteTitle: 'PETA RANKO API'
  })
);

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
const kepalaCamatRoute = require('./routes/kepalaCamat');
const pengajuanStatusRoute = require('./routes/pengajuanStatus');

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
app.use(kepalaCamatRoute);
app.use(pengajuanStatusRoute);

// Root endpoint
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Backend Sistem Pelayanan Terpadu Rantau Kopar berhasil berjalan'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Diagnostic metadata only; do not log request bodies, credentials, or tokens.
  console.error('[request-error]', {
    method: req.method,
    path: req.originalUrl,
    origin: req.get('origin') || null,
    contentType: req.get('content-type') || null,
    accept: req.get('accept') || null,
    message: err.message
  });
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
