const KuisModel = require('../models/kuisModel');

const KuisController = {
  // 1. Ambil Semua Kuis yang Tersedia
  async getAll(req, res) {
    try {
      const { kategori } = req.query;
      const quizzes = await KuisModel.getAll(kategori);

      const safeQuizzes = quizzes.map(q => {
        const questions = q.questions || [];
        const totalPoin = questions.reduce((sum, item) => sum + (Number(item.points) || 10), 0);

        return {
          id: q.id,
          title: q.title,
          kategori: q.kategori,
          deskripsi: q.deskripsi,
          waktu_menit: q.waktu_menit,
          total_soal: questions.length,
          total_poin: totalPoin,
          created_at: q.created_at
        };
      });

      res.json({
        success: true,
        count: safeQuizzes.length,
        data: safeQuizzes
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal memuat kuis: ' + err.message
      });
    }
  },

  // 2. Ambil Soal Kuis untuk Dikerjakan Siswa
  async getById(req, res) {
    try {
      const quiz = await KuisModel.getById(req.params.id);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Kuis tidak ditemukan.'
        });
      }

      const isTeacher = req.user && (req.user.role === 'guru' || req.user.role === 'admin');
      const questions = quiz.questions || [];
      const totalPoin = questions.reduce((sum, item) => sum + (Number(item.points) || 10), 0);

      const questionsForStudent = questions.map((q, idx) => ({
        id: q.id || idx + 1,
        question: q.question,
        options: q.options,
        points: Number(q.points) || 10,
        // answerIndex & explanation hanya disertakan jika yang meminta adalah guru/admin
        ...(isTeacher ? { answerIndex: q.answerIndex, explanation: q.explanation } : {})
      }));

      res.json({
        success: true,
        data: {
          id: quiz.id,
          title: quiz.title,
          kategori: quiz.kategori,
          deskripsi: quiz.deskripsi,
          waktu_menit: quiz.waktu_menit,
          total_soal: questionsForStudent.length,
          total_poin: totalPoin,
          questions: questionsForStudent
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal memuat detail kuis: ' + err.message
      });
    }
  },

  // 3. Kirim Jawaban Kuis & Hitung Skor Berdasarkan Bobot Nilai Setiap Soal
  async submit(req, res) {
    try {
      const { id } = req.params;
      const { answers } = req.body;

      const quiz = await KuisModel.getById(id);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Kuis tidak ditemukan.'
        });
      }

      const questions = quiz.questions || [];
      let benarCount = 0;
      let earnedPoints = 0;
      let maxPoints = 0;
      const reviewDetails = [];

      questions.forEach((q, idx) => {
        const questionPoints = Number(q.points) || 10;
        maxPoints += questionPoints;

        let userAns = null;
        if (Array.isArray(answers)) {
          userAns = answers[idx];
        } else if (answers && typeof answers === 'object') {
          userAns = answers[q.id] !== undefined ? answers[q.id] : answers[idx];
        }

        const isCorrect = userAns !== null && userAns !== undefined && Number(userAns) === Number(q.answerIndex);
        if (isCorrect) {
          benarCount++;
          earnedPoints += questionPoints;
        }

        reviewDetails.push({
          questionId: q.id || idx + 1,
          question: q.question,
          options: q.options,
          points: questionPoints,
          earned: isCorrect ? questionPoints : 0,
          userAnswer: (userAns !== null && userAns !== undefined) ? q.options[userAns] : 'Tidak dijawab',
          correctAnswer: q.options[q.answerIndex],
          isCorrect,
          explanation: q.explanation || ''
        });
      });

      // Hitung skor akhir persentase 0-100
      const score = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;

      // Badge apresiasi edukatif
      let badge = 'Bintang Belajar 🌟';
      let message = 'Usaha yang bagus! Teruslah berlatih!';
      if (score === 100) {
        badge = 'Juara Sempurna 🏆⭐⭐⭐';
        message = 'Fantastis! Semua jawaban benar dengan poin sempurna!';
      } else if (score >= 80) {
        badge = 'Hebat Sekali 🎖️⭐⭐';
        message = `Kerja yang luar biasa! Kamu mengumpulkan ${earnedPoints} dari ${maxPoints} poin!`;
      } else if (score >= 60) {
        badge = 'Bagus Terus Semangat 🌟⭐';
        message = `Bagus! Kamu meraih ${earnedPoints} poin. Sedikit lagi menuju sempurna!`;
      }

      // Simpan riwayat nilai ke database
      const savedResult = await KuisModel.saveResult({
        user_id: req.user.id,
        quiz_id: Number(id),
        score,
        earned_points: earnedPoints,
        max_points: maxPoints,
        total_soal: questions.length,
        jawaban_benar: benarCount,
        detail_jawaban: JSON.stringify(reviewDetails)
      });

      res.json({
        success: true,
        message,
        badge,
        score,
        earned_points: earnedPoints,
        max_points: maxPoints,
        total_soal: questions.length,
        jawaban_benar: benarCount,
        review: reviewDetails,
        result_id: savedResult.id
      });
    } catch (err) {
      console.error('Error submit kuis:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal memproses hasil kuis: ' + err.message
      });
    }
  },

  // 4. Riwayat Kuis Pribadi Siswa
  async getMyResults(req, res) {
    try {
      const results = await KuisModel.getResultsByUserId(req.user.id);
      res.json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal memuat riwayat nilai: ' + err.message
      });
    }
  },

  // 5. Rekap Nilai Seluruh Siswa (Guru / Admin)
  async getAllResults(req, res) {
    try {
      const results = await KuisModel.getAllResults();
      res.json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal memuat rekapitulasi nilai kuis: ' + err.message
      });
    }
  },

  // 6. Buat Kuis Baru oleh Guru (Dengan Pengaturan Nilai/Poin per Soal)
  async create(req, res) {
    try {
      const { title, kategori, deskripsi, waktu_menit, questions } = req.body;

      if (!title || !kategori || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Judul kuis, kategori, dan daftar pertanyaan minimal 1 soal wajib diisi!'
        });
      }

      // Validasi dan format tiap pertanyaan dengan bobot nilai masing-masing
      const formattedQuestions = questions.map((q, idx) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(`Soal nomor ${idx + 1} tidak lengkap (pertanyaan dan minimal 2 pilihan opsi wajib diisi).`);
        }
        return {
          id: idx + 1,
          question: q.question.trim(),
          options: q.options.map(opt => String(opt).trim()),
          answerIndex: Number(q.answerIndex) || 0,
          points: Number(q.points) > 0 ? Number(q.points) : 10, // Nilai/bobot soal yang diatur guru
          explanation: q.explanation ? String(q.explanation).trim() : ''
        };
      });

      const totalPoinKuis = formattedQuestions.reduce((acc, q) => acc + q.points, 0);

      const newQuiz = await KuisModel.create({
        title: title.trim(),
        kategori: kategori.toLowerCase(),
        deskripsi: deskripsi || '',
        waktu_menit: Number(waktu_menit) || 10,
        total_poin: totalPoinKuis,
        questions: formattedQuestions
      });

      res.status(201).json({
        success: true,
        message: `Kuis "${newQuiz.title}" berhasil dibuat dengan total ${formattedQuestions.length} soal (Total Nilai: ${totalPoinKuis} Poin)!`,
        data: newQuiz
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || 'Gagal membuat kuis.'
      });
    }
  },

  // 7. Hapus Kuis (Guru / Admin)
  async delete(req, res) {
    try {
      const { id } = req.params;
      await KuisModel.delete(id);
      res.json({
        success: true,
        message: 'Kuis berhasil dihapus.'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus kuis: ' + err.message
      });
    }
  }
};

module.exports = KuisController;
