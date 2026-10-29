const { db } = require('../config/db');

const attendancesCollection = () => db.collection('attendances');

const AbsenModel = {
  // Ambil semua riwayat absensi (untuk guru/admin)
  async getAll() {
    const list = await attendancesCollection().find();
    const allUsers = await db.collection('users').find();

    return list.map(item => {
      const user = allUsers.find(u => Number(u.id) === Number(item.user_id));
      return {
        ...item,
        user_name: user ? user.name : 'Siswa LMA',
        user_email: user ? user.email : '',
        user_kelas: user ? user.kelas : ''
      };
    }).sort((a, b) => new Date(`${b.tanggal}T${b.waktu || '00:00:00'}`) - new Date(`${a.tanggal}T${a.waktu || '00:00:00'}`));
  },

  // Cek apakah siswa sudah absen hari ini
  async findTodayByUserId(userId, tanggalHariIni) {
    return attendancesCollection().findOne(
      item => Number(item.user_id) === Number(userId) && item.tanggal === tanggalHariIni
    );
  },

  // Riwayat absensi siswa tertentu
  async getByUserId(userId) {
    const list = await attendancesCollection().find(item => Number(item.user_id) === Number(userId));
    return list.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  },

  // Rekam absen baru
  async create(data) {
    return attendancesCollection().insert(data);
  },

  // Update status absen (jika admin ingin edit)
  async update(id, updates) {
    return attendancesCollection().updateById(id, updates);
  },

  async delete(id) {
    return attendancesCollection().deleteById(id);
  }
};

module.exports = AbsenModel;
