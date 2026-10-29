const ModulModel = require('../models/modulModel');
const MeetModel = require('../models/meetModel');
const KuisModel = require('../models/kuisModel');
const AbsenModel = require('../models/absenModel');
const UserModel = require('../models/userModel');

const DashboardController = {
  async getStats(req, res) {
    try {
      const user = req.user;
      const isTeacher = user.role === 'guru' || user.role === 'admin';

      const [modules, meets, quizzes] = await Promise.all([
        ModulModel.getAll(),
        MeetModel.getAll(),
        KuisModel.getAll()
      ]);

      const now = new Date();
      const todayDate = now.toISOString().slice(0, 10);

      // Cari sesi live sekarang atau terdekat
      const liveOrNextClass = meets.find(m => m.status === 'live') ||
        meets.find(m => new Date(m.start_time) >= now) || null;

      if (isTeacher) {
        // Statistik Guru / Admin
        const [allUsers, allResults, allAttendances] = await Promise.all([
          UserModel.getAll(),
          KuisModel.getAllResults(),
          AbsenModel.getAll()
        ]);

        const totalSiswa = allUsers.filter(u => u.role === 'siswa').length;
        const todayAttendances = allAttendances.filter(a => a.tanggal === todayDate);

        return res.json({
          success: true,
          role: user.role,
          stats: {
            totalModul: modules.length,
            totalJermanModul: modules.filter(m => m.kategori === 'jerman').length,
            totalMatematikaModul: modules.filter(m => m.kategori === 'matematika').length,
            totalSiswa,
            totalMeets: meets.length,
            totalQuizzes: quizzes.length,
            totalKuisSubmitted: allResults.length,
            absenHariIniCount: todayAttendances.length
          },
          liveClass: liveOrNextClass,
          recentAttendances: todayAttendances.slice(0, 5)
        });
      } else {
        // Statistik Siswa
        const [todayAbsen, myResults, myAttendances] = await Promise.all([
          AbsenModel.findTodayByUserId(user.id, todayDate),
          KuisModel.getResultsByUserId(user.id),
          AbsenModel.getByUserId(user.id)
        ]);

        const avgScore = myResults.length > 0
          ? Math.round(myResults.reduce((acc, cur) => acc + (cur.score || 0), 0) / myResults.length)
          : 0;

        return res.json({
          success: true,
          role: 'siswa',
          stats: {
            totalModul: modules.length,
            totalKuisTersedia: quizzes.length,
            kuisSelesaiCount: myResults.length,
            rataRataSkor: avgScore,
            totalHadirCount: myAttendances.filter(a => a.status === 'hadir').length,
            sudahAbsenHariIni: !!todayAbsen
          },
          todayAttendance: todayAbsen,
          liveClass: liveOrNextClass,
          recentQuizzes: myResults.slice(0, 3)
        });
      }
    } catch (err) {
      console.error('Error saat load stats:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat statistik dashboard: ' + err.message
      });
    }
  }
};

module.exports = DashboardController;
