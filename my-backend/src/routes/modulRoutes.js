const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const ModulController = require('../controllers/modulController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Konfigurasi penyimpanan file Multer untuk uploads modul
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `modul-${basename}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // Batas upload 25 MB
});

// Siswa & Guru dapat membaca daftar modul
router.get('/', ModulController.getAll);
router.get('/:id', ModulController.getById);

// Guru / Admin: Tambah Modul (mendukung upload file PDF/dokumen)
router.post('/', verifyToken, requireRole('guru', 'admin'), upload.single('file'), ModulController.create);
router.put('/:id', verifyToken, requireRole('guru', 'admin'), upload.single('file'), ModulController.update);
router.delete('/:id', verifyToken, requireRole('guru', 'admin'), ModulController.delete);

module.exports = router;
