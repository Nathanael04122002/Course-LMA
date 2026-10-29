const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Endpoint registrasi siswa mandiri
router.post('/register', AuthController.register);

// Endpoint login siswa & guru
router.post('/login', AuthController.login);

// Endpoint profil pengguna aktif (dengan verifikasi JWT)
router.get('/me', verifyToken, AuthController.getProfile);

// Endpoint perbarui profil
router.put('/profile', verifyToken, AuthController.updateProfile);

// ==================== PANEL GURU / ADMIN: KELOLA AKUN SISWA ====================
// Ambil seluruh daftar siswa
router.get('/students', verifyToken, requireRole('guru', 'admin'), AuthController.getStudents);

// Guru mendaftarkan & membuatkan akun siswa langsung
router.post('/students', verifyToken, requireRole('guru', 'admin'), AuthController.createStudentByTeacher);

// Guru mereset password akun siswa
router.put('/students/:id/reset-password', verifyToken, requireRole('guru', 'admin'), AuthController.resetStudentPassword);

// Guru menyetujui akun siswa (Approval)
router.put('/students/:id/approve', verifyToken, requireRole('guru', 'admin'), AuthController.approveStudent);

// Guru menolak akun siswa
router.put('/students/:id/reject', verifyToken, requireRole('guru', 'admin'), AuthController.rejectStudent);

// Guru menghapus akun siswa
router.delete('/students/:id', verifyToken, requireRole('guru', 'admin'), AuthController.deleteStudent);

module.exports = router;
