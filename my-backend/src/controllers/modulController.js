const ModulModel = require('../models/modulModel');

const ModulController = {
  // 1. Ambil Semua Modul Pembelajaran (dengan filter kategori: jerman / matematika)
  async getAll(req, res) {
    try {
      const { kategori } = req.query;
      const modules = await ModulModel.getAll(kategori);
      res.json({
        success: true,
        count: modules.length,
        data: modules
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil daftar modul: ' + err.message
      });
    }
  },

  // 2. Ambil Detail Satu Modul
  async getById(req, res) {
    try {
      const modul = await ModulModel.getById(req.params.id);
      if (!modul) {
        return res.status(404).json({
          success: false,
          message: 'Modul pembelajaran tidak ditemukan.'
        });
      }

      res.json({
        success: true,
        data: modul
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail modul: ' + err.message
      });
    }
  },

  // 3. Tambah Modul Baru (Mendukung Upload File PDF / Lainnya)
  async create(req, res) {
    try {
      const { title, kategori, level, deskripsi, materi_teks, durasi_menit, file_url, file_name } = req.body;

      if (!title || !kategori) {
        return res.status(400).json({
          success: false,
          message: 'Judul dan kategori modul (jerman / matematika) wajib diisi!'
        });
      }

      let finalFileUrl = file_url || '';
      let finalFileName = file_name || '';
      let finalFileSize = null;

      // Jika ada file yang diunggah via form-data
      if (req.file) {
        finalFileUrl = `/uploads/${req.file.filename}`;
        finalFileName = req.file.originalname;
        finalFileSize = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
      }

      const newModul = await ModulModel.create({
        title: title.trim(),
        kategori: kategori.toLowerCase(),
        level: level || 'Semua Level',
        deskripsi: deskripsi || '',
        materi_teks: materi_teks || '',
        durasi_menit: Number(durasi_menit) || 30,
        file_url: finalFileUrl,
        file_name: finalFileName,
        file_size: finalFileSize
      });

      res.status(201).json({
        success: true,
        message: 'Modul pembelajaran baru berhasil ditambahkan beserta lampiran!',
        data: newModul
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan modul: ' + err.message
      });
    }
  },

  // 4. Update Modul (Guru / Admin Only)
  async update(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      if (req.file) {
        updates.file_url = `/uploads/${req.file.filename}`;
        updates.file_name = req.file.originalname;
        updates.file_size = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
      }

      const updated = await ModulModel.update(id, updates);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Modul tidak ditemukan untuk diperbarui.'
        });
      }

      res.json({
        success: true,
        message: 'Modul berhasil diperbarui!',
        data: updated
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui modul: ' + err.message
      });
    }
  },

  // 5. Hapus Modul (Guru / Admin Only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      await ModulModel.delete(id);
      res.json({
        success: true,
        message: 'Modul berhasil dihapus.'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus modul: ' + err.message
      });
    }
  }
};

module.exports = ModulController;
