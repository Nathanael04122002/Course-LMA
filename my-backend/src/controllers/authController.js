const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const EmailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'lma_secret_key_super_aman_2026_bali_education_token_99x';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate Token JWT Helper
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'siswa',
      kelas: user.kelas
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

const AuthController = {
  // 1. Registrasi Akun Siswa Baru
  async register(req, res) {
    try {
      const { name, email, password, kelas, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nama lengkap, email, dan password wajib diisi!'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password minimal terdiri dari 6 karakter.'
        });
      }

      // Cek apakah email sudah terdaftar
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Tentukan avatar ceria ramah anak
      const seedName = encodeURIComponent(name.trim());
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seedName}`;

      const assignedRole = role === 'guru' || role === 'admin' ? role : 'siswa';
      // Siswa yang mendaftar mandiri berstatus 'pending' (wajib persetujuan Guru/Admin)
      const initialStatus = assignedRole === 'siswa' ? 'pending' : 'active';

      const newUser = await UserModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: assignedRole,
        status: initialStatus,
        kelas: kelas || 'Bahasa Jerman & Matematika SD',
        avatar: avatarUrl,
        created_at: new Date().toISOString()
      });

      // Jika yang mendaftar adalah siswa, akun berstatus pending dan TIDAK langsung diberi token akses
      if (initialStatus === 'pending') {
        return res.status(201).json({
          success: true,
          pending_approval: true,
          message: 'Pendaftaran akun Anda berhasil diajukan! Akun Anda sedang menunggu persetujuan dari Guru/Admin LMA sebelum dapat digunakan untuk login.',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            status: 'pending'
          }
        });
      }

      // Untuk guru/admin, langsung aktifkan token
      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: 'Pendaftaran akun berhasil!',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          kelas: newUser.kelas,
          avatar: newUser.avatar
        }
      });
    } catch (err) {
      console.error('Error saat register:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal melakukan pendaftaran akun: ' + err.message
      });
    }
  },

  // 2. Login Akun (Siswa & Guru)
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Silakan masukkan email dan password.'
        });
      }

      // Cari user berdasarkan email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah. Silakan coba kembali.'
        });
      }

      // Verifikasi password hash
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah. Silakan coba kembali.'
        });
      }

      // CEK PERSETUJUAN GURU: Jika siswa masih pending, tolak akses ke panel
      if (user.role === 'siswa' && user.status === 'pending') {
        return res.status(403).json({
          success: false,
          status: 'pending',
          message: 'Akun Anda sedang menunggu persetujuan (approval) dari Guru/Admin LMA. Silakan hubungi admin atau tunggu hingga akun Anda diaktifkan.'
        });
      }

      if (user.role === 'siswa' && user.status === 'rejected') {
        return res.status(403).json({
          success: false,
          status: 'rejected',
          message: 'Pendaftaran akun Anda ditolak oleh guru/admin. Silakan hubungi tim LMA via WhatsApp.'
        });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        message: `Selamat datang kembali, ${user.name}!`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          kelas: user.kelas,
          avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`
        }
      });
    } catch (err) {
      console.error('Error saat login:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal memproses login: ' + err.message
      });
    }
  },

  // 3. Ambil Profil Pengguna Aktif (Token Verification)
  async getProfile(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan.'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data profil: ' + err.message
      });
    }
  },

  // 4. Update Profil Pengguna (Siswa & Guru)
  async updateProfile(req, res) {
    try {
      const { name, kelas, avatar, currentPassword, newPassword } = req.body;
      const updates = {};
      if (name) updates.name = name.trim();
      if (kelas) updates.kelas = kelas.trim();
      if (avatar) updates.avatar = avatar.trim();

      // Jika ada permintaan ganti password
      if (newPassword) {
        if (newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'Password baru minimal harus 6 karakter.'
          });
        }

        // Jika user mengirimkan currentPassword, verifikasi terlebih dahulu
        if (currentPassword) {
          const userWithPass = await UserModel.findByIdWithPassword(req.user.id);
          if (userWithPass) {
            const isMatch = await bcrypt.compare(currentPassword, userWithPass.password);
            if (!isMatch) {
              return res.status(400).json({
                success: false,
                message: 'Password saat ini salah. Silakan coba lagi.'
              });
            }
          }
        }

        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(newPassword, salt);
      }

      const updatedUser = await UserModel.update(req.user.id, updates);

      res.json({
        success: true,
        message: 'Profil berhasil diperbarui!',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          kelas: updatedUser.kelas,
          avatar: updatedUser.avatar
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui profil: ' + err.message
      });
    }
  },

  // 5. Guru/Admin: Ambil Seluruh Daftar Akun Siswa
  async getStudents(req, res) {
    try {
      const allUsers = await UserModel.getAll();
      const students = allUsers.filter(u => u.role === 'siswa');
      res.json({
        success: true,
        count: students.length,
        data: students
      });
    } catch (err) {
      console.error('Error getStudents:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat daftar siswa: ' + err.message
      });
    }
  },

  // 6. Guru/Admin: Daftarkan & Buatkan Akun Siswa Secara Langsung
  async createStudentByTeacher(req, res) {
    try {
      const { name, email, password, kelas, sendEmail = true } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nama siswa, email, dan password awal wajib diisi!'
        });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: `Email "${email}" sudah terdaftar sebagai siswa.`
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`;
      const newStudent = await UserModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: 'siswa',
        kelas: kelas || 'Bahasa Jerman & Matematika SD',
        avatar: avatarUrl,
        created_by_teacher: true,
        created_at: new Date().toISOString()
      });

      // Kirim email rincian login jika diizinkan
      let emailSent = false;
      if (sendEmail) {
        EmailService.sendAccountCreatedByTeacherEmail(newStudent.email, newStudent.name, newStudent.kelas, password)
          .then(res => { emailSent = res.success; })
          .catch(e => console.warn('Peringatan kirim email siswa:', e.message));
      }

      res.status(201).json({
        success: true,
        message: `Akun siswa "${newStudent.name}" (${newStudent.email}) berhasil dibuat!`,
        data: {
          id: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          kelas: newStudent.kelas,
          avatar: newStudent.avatar,
          temp_password: password
        }
      });
    } catch (err) {
      console.error('Error createStudentByTeacher:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat akun siswa: ' + err.message
      });
    }
  },

  // 7. Guru/Admin: Reset Password Siswa
  async resetStudentPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password baru minimal harus 6 karakter.'
        });
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Siswa tidak ditemukan.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await UserModel.update(id, { password: hashedPassword });

      // Kirim email pemberitahuan password baru
      EmailService.sendAccountCreatedByTeacherEmail(user.email, user.name, user.kelas, newPassword)
        .catch(e => console.warn('Gagal kirim email reset:', e.message));

      res.json({
        success: true,
        message: `Password siswa "${user.name}" berhasil direset menjadi: ${newPassword}`
      });
    } catch (err) {
      console.error('Error resetStudentPassword:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal mereset password: ' + err.message
      });
    }
  },

  // 8. Guru/Admin: Hapus Akun Siswa
  async deleteStudent(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Akun siswa tidak ditemukan.'
        });
      }

      await UserModel.delete(id);
      res.json({
        success: true,
        message: `Akun siswa "${user.name}" (${user.email}) berhasil dihapus.`
      });
    } catch (err) {
      console.error('Error deleteStudent:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus siswa: ' + err.message
      });
    }
  },

  // 9. Guru/Admin: Setujui Pendaftaran Siswa (Approve Account)
  async approveStudent(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Akun siswa tidak ditemukan.'
        });
      }

      await UserModel.update(id, { status: 'active' });

      // Kirim Welcome Email sekarang karena akun sudah resmi disetujui
      EmailService.sendWelcomeEmail(user.email, user.name, user.kelas)
        .catch(e => console.warn('Peringatan kirim email persetujuan:', e.message));

      res.json({
        success: true,
        message: `Pendaftaran siswa "${user.name}" (${user.email}) telah DISETUJUI! Siswa sekarang dapat login ke portal belajar.`
      });
    } catch (err) {
      console.error('Error approveStudent:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal menyetujui akun siswa: ' + err.message
      });
    }
  },

  // 10. Guru/Admin: Tolak Pendaftaran Siswa (Reject Account)
  async rejectStudent(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Akun siswa tidak ditemukan.'
        });
      }

      await UserModel.update(id, { status: 'rejected' });

      res.json({
        success: true,
        message: `Pendaftaran siswa "${user.name}" (${user.email}) telah DITOLAK.`
      });
    } catch (err) {
      console.error('Error rejectStudent:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal menolak akun siswa: ' + err.message
      });
    }
  }
};

module.exports = AuthController;
