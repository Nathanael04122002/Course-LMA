const MeetModel = require('../models/meetModel');

const MeetController = {
  // 1. Ambil Semua Jadwal Kelas Google Meet
  async getAll(req, res) {
    try {
      const meets = await MeetModel.getAll();
      res.json({
        success: true,
        count: meets.length,
        data: meets
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil jadwal Google Meet: ' + err.message
      });
    }
  },

  // 2. Ambil Kelas yang Sedang Live atau Akan Datang
  async getActive(req, res) {
    try {
      const activeMeets = await MeetModel.getActiveOrUpcoming();
      res.json({
        success: true,
        data: activeMeets
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil kelas aktif: ' + err.message
      });
    }
  },

  // 3. Tambah Jadwal Kelas Google Meet Baru (Guru/Admin)
  async create(req, res) {
    try {
      const { title, program, instructor, meet_link, start_time, end_time, status, notes } = req.body;

      if (!title || !meet_link || !start_time) {
        return res.status(400).json({
          success: false,
          message: 'Judul sesi, link Google Meet, dan waktu mulai wajib diisi!'
        });
      }

      // Validasi format link meet jika perlu
      let cleanLink = meet_link.trim();
      if (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
        cleanLink = 'https://' + cleanLink;
      }

      const newMeet = await MeetModel.create({
        title: title.trim(),
        program: program || 'Bahasa Jerman & Matematika SD',
        instructor: instructor || req.user.name || 'Kak Andre (LMA)',
        meet_link: cleanLink,
        start_time: new Date(start_time).toISOString(),
        end_time: end_time ? new Date(end_time).toISOString() : new Date(new Date(start_time).getTime() + 60 * 60 * 1000).toISOString(),
        status: status || 'upcoming',
        notes: notes || ''
      });

      res.status(201).json({
        success: true,
        message: 'Jadwal Google Meet berhasil dibuat!',
        data: newMeet
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal membuat jadwal Google Meet: ' + err.message
      });
    }
  },

  // 4. Update Jadwal & Link Meet (Guru/Admin)
  async update(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      
      if (updates.meet_link && !updates.meet_link.startsWith('http')) {
        updates.meet_link = 'https://' + updates.meet_link.trim();
      }

      const updated = await MeetModel.update(id, updates);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Sesi Google Meet tidak ditemukan.'
        });
      }

      res.json({
        success: true,
        message: 'Jadwal Google Meet berhasil diperbarui!',
        data: updated
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui jadwal: ' + err.message
      });
    }
  },

  // 5. Hapus Sesi Meet (Guru/Admin)
  async delete(req, res) {
    try {
      const { id } = req.params;
      await MeetModel.delete(id);
      res.json({
        success: true,
        message: 'Jadwal kelas Google Meet berhasil dihapus.'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus jadwal: ' + err.message
      });
    }
  }
};

module.exports = MeetController;
