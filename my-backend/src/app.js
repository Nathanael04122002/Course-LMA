const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const modulRoutes = require('./routes/modulRoutes');
const meetRoutes = require('./routes/meetRoutes');
const kuisRoutes = require('./routes/kuisRoutes');
const absenRoutes = require('./routes/absenRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import middlewares
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Konfigurasi CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Pastikan folder uploads tersedia
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve Frontend Portal jika diakses langsung dari Express
const portalDir = path.join(__dirname, '..', '..', 'portal');
if (fs.existsSync(portalDir)) {
  app.use('/portal', express.static(portalDir));
}

// Serve root landing page files
const rootDir = path.join(__dirname, '..', '..');
app.use('/assets', express.static(rootDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'LMA – Lerne mit Andre Education Portal API',
    location: 'Bali, Indonesia',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Daftarkan API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/modul', modulRoutes);
app.use('/api/meets', meetRoutes);
app.use('/api/kuis', kuisRoutes);
app.use('/api/absen', absenRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Penanganan route tidak ditemukan & error handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
