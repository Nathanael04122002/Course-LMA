const express = require('express');
const router = express.Router();
const KuisController = require('../controllers/kuisController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Akses daftar kuis & pengerjaan kuis
router.get('/', KuisController.getAll);
router.get('/:id', KuisController.getById);

// Submit kuis oleh siswa
router.post('/:id/submit', verifyToken, KuisController.submit);

// Riwayat kuis pribadi siswa
router.get('/results/my', verifyToken, KuisController.getMyResults);

// Rekapitulasi hasil seluruh siswa (Guru / Admin)
router.get('/results/all', verifyToken, requireRole('guru', 'admin'), KuisController.getAllResults);

// Buat & hapus kuis (Guru / Admin)
router.post('/', verifyToken, requireRole('guru', 'admin'), KuisController.create);
router.delete('/:id', verifyToken, requireRole('guru', 'admin'), KuisController.delete);

module.exports = router;
