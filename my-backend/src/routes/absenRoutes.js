const express = require('express');
const router = express.Router();
const AbsenController = require('../controllers/absenController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Absen harian siswa & cek status hari ini
router.post('/', verifyToken, AbsenController.recordAttendance);
router.get('/today', verifyToken, AbsenController.getStatusToday);
router.get('/my', verifyToken, AbsenController.getMyAttendance);

// Rekapitulasi absensi seluruh siswa (Guru / Admin)
router.get('/all', verifyToken, requireRole('guru', 'admin'), AbsenController.getAllAttendance);
router.put('/:id', verifyToken, requireRole('guru', 'admin'), AbsenController.updateStatus);

module.exports = router;
