const AbsenModel = require('../models/absenModel');
const UserModel = require('../models/userModel');

const AbsenController = {
  // 1. Catat Kehadiran Siswa Hari Ini (Menggunakan Waktu Siswa / WIB & Melampirkan Nama Siswa)
  async recordAttendance(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      const userId = req.user.id;
      const { status, keterangan, schedule_id, client_time, client_timezone } = req.body;

      // Ambil tanggal hari ini dalam format YYYY-MM-DD
      const now = new Date();
      const todayDate = now.toISOString().slice(0, 10);

      // Format Waktu: Gunakan waktu lokal tempat siswa login atau konversi standar ke WIB (Waktu Indonesia Barat)
      let formattedTime = client_time;
      let timezoneLabel = client_timezone || 'WIB';

      if (!formattedTime) {
        // Konversi default ke WIB (UTC+7)
        const wibTime = new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now);
        formattedTime = `${wibTime} WIB`;
      } else if (!formattedTime.includes('WIB') && !formattedTime.includes('WITA') && !formattedTime.includes('WIT')) {
        formattedTime = `${formattedTime} ${timezoneLabel}`;
      }

      // Cek apakah sudah absen hari ini: jika sudah, izinkan update status
      const alreadyCheckedIn = await AbsenModel.findTodayByUserId(userId, todayDate);
      if (alreadyCheckedIn) {
        const updated = await AbsenModel.update(alreadyCheckedIn.id, {
          status: status || 'hadir',
          waktu: formattedTime,
          keterangan: keterangan || `Kehadiran diperbarui menjadi ${status}`
        });
        return res.json({
          success: true,
          message: `Status kehadiranmu hari ini berhasil diperbarui menjadi "${(status || 'hadir').toUpperCase()}"!`,
          data: updated
        });
      }

      const attendanceRecord = await AbsenModel.create({
        user_id: userId,
        user_name: user ? user.name : req.user.name,
        user_email: user ? user.email : req.user.email,
        user_kelas: user ? user.kelas : req.user.kelas,
        avatar: user ? user.avatar : '',
        schedule_id: schedule_id || null,
        tanggal: todayDate,
        waktu: formattedTime,
        timezone: timezoneLabel,
        status: status || 'hadir',
        keterangan: keterangan || 'Hadir pada sesi Open Class LMA'
      });

      res.status(201).json({
        success: true,
        message: `Kehadiran siswa an. "${attendanceRecord.user_name}" berhasil dicatat pada pukul ${formattedTime}!`,
        data: attendanceRecord
      });
    } catch (err) {
      console.error('Error saat absen:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal mencatat absensi: ' + err.message
      });
    }
  },

  // 2. Cek Status Kehadiran Hari Ini
  async getStatusToday(req, res) {
    try {
      const userId = req.user.id;
      const todayDate = new Date().toISOString().slice(0, 10);
      const todayAttendance = await AbsenModel.findTodayByUserId(userId, todayDate);

      res.json({
        success: true,
        hasCheckedIn: !!todayAttendance,
        tanggal: todayDate,
        data: todayAttendance || null
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengecek status kehadiran: ' + err.message
      });
    }
  },

  // 3. Riwayat Kehadiran Pribadi Siswa
  async getMyAttendance(req, res) {
    try {
      const list = await AbsenModel.getByUserId(req.user.id);
      res.json({
        success: true,
        totalHadir: list.filter(i => i.status === 'hadir').length,
        data: list
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil riwayat absensi: ' + err.message
      });
    }
  },

  // 4. Rekapitulasi Semua Kehadiran Siswa dengan Nama Lengkap (Guru / Admin Only)
  async getAllAttendance(req, res) {
    try {
      const list = await AbsenModel.getAll();
      const allUsers = await UserModel.getAll();

      // Pastikan nama dan detail setiap siswa terlampir lengkap
      const enrichedList = list.map(item => {
        const student = allUsers.find(u => Number(u.id) === Number(item.user_id));
        return {
          ...item,
          user_name: student ? student.name : (item.user_name || 'Siswa LMA'),
          user_email: student ? student.email : (item.user_email || '-'),
          user_kelas: student ? student.kelas : (item.user_kelas || 'SD'),
          avatar: student ? student.avatar : (item.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=student')
        };
      });

      res.json({
        success: true,
        count: enrichedList.length,
        data: enrichedList
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil rekapitulasi absensi: ' + err.message
      });
    }
  },

  // 5. Update Status Absensi Siswa oleh Guru
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, keterangan } = req.body;

      const updated = await AbsenModel.update(id, {
        ...(status ? { status } : {}),
        ...(keterangan ? { keterangan } : {})
      });

      res.json({
        success: true,
        message: 'Status kehadiran berhasil diperbarui.',
        data: updated
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui status absensi: ' + err.message
      });
    }
  }
};

module.exports = AbsenController;
