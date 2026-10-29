const express = require('express');
const router = express.Router();
const MeetController = require('../controllers/meetController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Akses jadwal meet & link aktif
router.get('/', MeetController.getAll);
router.get('/active', MeetController.getActive);

// Pengelolaan jadwal oleh Guru / Admin
router.post('/', verifyToken, requireRole('guru', 'admin'), MeetController.create);
router.put('/:id', verifyToken, requireRole('guru', 'admin'), MeetController.update);
router.delete('/:id', verifyToken, requireRole('guru', 'admin'), MeetController.delete);

module.exports = router;
