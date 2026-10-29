/**
 * LMA (Lerne mit Andre) - API Client & Common Helpers
 * Mendukung dual-mode: Real Express Backend (Port 5000) & Instant Local Demo Fallback
 */

const API_CONFIG = {
  baseURL: window.location.origin.includes(':5000')
    ? '/api'
    : 'http://localhost:5000/api'
};

// ==================== AUTH MANAGEMENT ====================
function getToken() {
  return localStorage.getItem('lma_token');
}

function getUser() {
  try {
    const raw = localStorage.getItem('lma_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setAuth(token, user) {
  localStorage.setItem('lma_token', token);
  localStorage.setItem('lma_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('lma_token');
  localStorage.removeItem('lma_user');
  window.location.href = 'login.html';
}

function requireAuth(allowedRoles = null) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = 'login.html';
    return null;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    alert('Akses khusus guru/admin. Mengalihkan ke dashboard siswa...');
    window.location.href = 'dashboard.html';
    return null;
  }

  return user;
}

// ==================== MOCK DATA ENGINE (FALLBACK JIKA BACKEND BELUM RUNNING) ====================
function getLocalMockDB() {
  let db = null;
  try {
    const raw = localStorage.getItem('lma_mock_db_store');
    if (raw) db = JSON.parse(raw);
  } catch (e) {}

  // Pastikan data awal tidak otomatis mengunci status siswa hari ini sebelum tombol ditekan
  if (db && db.attendances && !localStorage.getItem('lma_user_has_manually_attended')) {
    const today = new Date().toISOString().slice(0, 10);
    db.attendances = db.attendances.filter(a => !(Number(a.user_id) === 2 && a.tanggal === today));
  }

  if (!db) {
    db = {
      users: [
        { id: 1, name: 'Andre (LMA Tutor)', email: 'andre@lma.id', password: 'password123', role: 'guru', status: 'active', kelas: 'Semua Program', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AndreTeacher' },
        { id: 2, name: 'Budi Pratama', email: 'budi@lma.id', password: 'password123', role: 'siswa', status: 'active', kelas: 'Matematika SD & Bahasa Jerman', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BudiStudent' },
        { id: 3, name: 'Siti Ayu Bali', email: 'siti@lma.id', password: 'password123', role: 'siswa', status: 'active', kelas: 'Bahasa Jerman Pemula', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SitiStudent' }
      ],
      modules: [
        {
          id: 1,
          title: '🇩🇪 Modul 1: Begrüßung & Sich Vorstellen (Salam & Perkenalan)',
          kategori: 'jerman',
          level: 'Pemula (A1.1)',
          deskripsi: 'Belajar kosakata salam sehari-hari dalam Bahasa Jerman: Guten Morgen, Guten Tag, Wie geht es dir?, dan cara memperkenalkan nama dan asal negara.',
          materi_teks: `
### Ringkasan Materi Bahasa Jerman:
1. **Guten Morgen** = Selamat pagi (06:00 - 11:00)
2. **Guten Tag** = Selamat siang / sore (11:00 - 18:00)
3. **Guten Abend** = Selamat malam (18:00 ke atas)
4. **Gute Nacht** = Selamat tidur / istirahat
5. **Hallo / Tschüss** = Halo / Sampai jumpa (santai)

**Contoh Perkenalan Diri:**
- *Ich heiße Budi.* (Nama saya Budi.)
- *Ich komme aus Bali, Indonesien.* (Saya berasal dari Bali, Indonesia.)
- *Ich lerne Deutsch bei LMA!* (Saya belajar Bahasa Jerman di LMA!)
          `,
          durasi_menit: 30
        },
        {
          id: 2,
          title: '🇩🇪 Modul 2: Zahlen von 1 bis 20 (Angka 1 - 20)',
          kategori: 'jerman',
          level: 'Pemula (A1.1)',
          deskripsi: 'Mengenal pengucapan angka dalam bahasa Jerman dengan lagu interaktif dan trik mengingat mudah untuk anak.',
          materi_teks: `
### Angka 1 - 10:
- 1 = eins, 2 = zwei, 3 = drei, 4 = vier, 5 = fünf
- 6 = sechs, 7 = sieben, 8 = acht, 9 = neun, 10 = zehn
          `,
          durasi_menit: 25
        },
        {
          id: 3,
          title: '🔢 Modul 1: Trik Cepat Perkalian & Operasi Hitung Campuran',
          kategori: 'matematika',
          level: 'SD Kelas 4 - 6',
          deskripsi: 'Memahami urutan operasi matematika (Kabataku: Kali, Bagi, Tambah, Kurang) dengan metode logika cerita yang seru.',
          materi_teks: `
### Aturan Emas KABATAKU:
1. Kerjakan yang di dalam kurung terlebih dahulu: **( ... )**
2. Kerjakan **Perkalian (×)** dan **Pembagian (÷)** dari kiri ke kanan.
3. Kerjakan **Penjumlahan (+)** dan **Pengurangan (-)** dari kiri ke kanan.

*Contoh Soal:*
10 + 5 × 2 = 10 + 10 = **20**!
          `,
          durasi_menit: 35
        },
        {
          id: 4,
          title: '🔢 Modul 2: Pecahan & Desimal Tanpa Pusing',
          kategori: 'matematika',
          level: 'SD Kelas 4 - 6',
          deskripsi: 'Visualisasi pecahan menggunakan potongan pizza dan cokelat agar mudah dimengerti anak.',
          materi_teks: `
### Mengenal Pembilang & Penyebut:
- **Atas:** Pembilang (bagian yang kita miliki)
- **Bawah:** Penyebut (total bagian potongan yang sama besar)
          `,
          durasi_menit: 30
        }
      ],
      meets: [
        {
          id: 1,
          title: 'Live Open Class: Percakapan Bahasa Jerman Dasar',
          program: 'Bahasa Jerman',
          instructor: 'Kak Andre (LMA Founder)',
          meet_link: 'https://meet.google.com/lma-germ-bali',
          start_time: new Date().toISOString(),
          status: 'live',
          notes: 'Siapkan catatan & mic untuk latihan pelafalan bersama Kak Andre dari Bali!'
        },
        {
          id: 2,
          title: 'Live Open Class: Rahasia Perkalian 2 Digit Cepat',
          program: 'Matematika SD',
          instructor: 'Kak Andre & Tim LMA',
          meet_link: 'https://meet.google.com/lma-math-bali',
          start_time: new Date(Date.now() + 86400000).toISOString(),
          status: 'upcoming',
          notes: 'Ajak teman-teman ikut serta! Ada mini-game berhadiah bintang!'
        }
      ],
      quizzes: [
        {
          id: 1,
          title: '🇩🇪 Kuis Ceria Bahasa Jerman: Salam & Sapaan',
          kategori: 'jerman',
          deskripsi: 'Uji kemampuan kosakata salam bahasa Jerman. Ada 5 pertanyaan seru!',
          waktu_menit: 10,
          total_soal: 5,
          questions: [
            { id: 1, question: 'Apa arti dari "Guten Morgen" dalam bahasa Indonesia?', options: ['Selamat Malam', 'Selamat Pagi', 'Selamat Tidur', 'Sampai Jumpa'], answerIndex: 1, explanation: '"Guten Morgen" digunakan untuk menyapa di pagi hari.' },
            { id: 2, question: 'Jika ingin mengucapkan "Sampai jumpa" secara santai, kita mengatakan...', options: ['Danke', 'Bitte', 'Tschüss', 'Ja'], answerIndex: 2, explanation: '"Tschüss" adalah kata santai untuk berpisah.' },
            { id: 3, question: 'Bagaimana cara mengatakan "Nama saya Budi" dalam Bahasa Jerman?', options: ['Ich bin alt Budi', 'Ich heiße Budi', 'Ich lerne Budi', 'Ich mag Budi'], answerIndex: 1, explanation: '"Ich heiße..." adalah cara yang tepat menyebut nama.' },
            { id: 4, question: 'Angka "tiga" (3) dalam Bahasa Jerman adalah...', options: ['Eins', 'Zwei', 'Drei', 'Vier'], answerIndex: 2, explanation: '1=Eins, 2=Zwei, 3=Drei.' },
            { id: 5, question: 'Apa arti dari kata "Danke"?', options: ['Sama-sama', 'Terima kasih', 'Maaf', 'Tolong'], answerIndex: 1, explanation: '"Danke" berarti Terima Kasih.' }
          ]
        },
        {
          id: 2,
          title: '🔢 Kuis Logika Matematika SD: Operasi Hitung Seru',
          kategori: 'matematika',
          deskripsi: 'Latihan operasi campuran dan hitung cepat dengan metode Kabataku.',
          waktu_menit: 10,
          total_soal: 5,
          questions: [
            { id: 1, question: 'Hasil dari 12 + 8 × 2 adalah...', options: ['40', '28', '20', '32'], answerIndex: 1, explanation: '8 × 2 = 16, lalu 12 + 16 = 28.' },
            { id: 2, question: 'Pecahan 1/2 senilai dengan...', options: ['2/4', '3/5', '1/4', '2/3'], answerIndex: 0, explanation: '1/2 dikalikan 2/2 = 2/4.' },
            { id: 3, question: 'Sebuah persegi memiliki sisi 6 cm. Berapa kelilingnya?', options: ['36 cm', '24 cm', '12 cm', '18 cm'], answerIndex: 1, explanation: '4 × 6 = 24 cm.' },
            { id: 4, question: 'Hasil dari (25 - 5) ÷ 4 adalah...', options: ['5', '20', '10', '15'], answerIndex: 0, explanation: '20 ÷ 4 = 5.' },
            { id: 5, question: 'Berapakah 7 × 8?', options: ['54', '56', '58', '64'], answerIndex: 1, explanation: '7 × 8 = 56.' }
          ]
        }
      ],
      quiz_results: [
        {
          id: 1,
          user_id: 2,
          user_name: 'Budi Pratama',
          quiz_id: 1,
          quiz_title: '🇩🇪 Kuis Ceria Bahasa Jerman: Salam & Sapaan',
          score: 100,
          total_soal: 5,
          jawaban_benar: 5,
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ],
      attendances: [
        {
          id: 1,
          user_id: 2,
          user_name: 'Budi Pratama',
          user_email: 'budi@lma.id',
          user_kelas: 'Matematika SD & Bahasa Jerman',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BudiStudent',
          tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // Kemarin (agar hari ini Budi BELUM absen)
          waktu: '10:00:15 WIB',
          timezone: 'WIB',
          status: 'hadir',
          keterangan: 'Hadir tepat waktu di sesi Open Class LMA'
        },
        {
          id: 2,
          user_id: 3,
          user_name: 'Siti Ayu Bali',
          user_email: 'siti@lma.id',
          user_kelas: 'Bahasa Jerman Pemula',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SitiStudent',
          tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // Kemarin
          waktu: '09:55:40 WIB',
          timezone: 'WIB',
          status: 'hadir',
          keterangan: 'Hadir 5 menit sebelum kelas dimulai'
        },
        {
          id: 3,
          user_id: 4,
          user_name: 'Gede Danendra',
          user_email: 'gede@lma.id',
          user_kelas: 'Matematika SD Kelas 5',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GedeStudent',
          tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // Kemarin
          waktu: '10:05:12 WIB',
          timezone: 'WIB',
          status: 'hadir',
          keterangan: 'Hadir aktif di kelas'
        }
      ]
    };
    saveLocalMockDB(db);
  }
  return db;
}

function saveLocalMockDB(db) {
  try {
    localStorage.setItem('lma_mock_db_store', JSON.stringify(db));
  } catch (e) {}
}

// Handler Fallback Mock API
function handleMockFallback(endpoint, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};
  const db = getLocalMockDB();
  const user = getUser() || { id: 2, name: 'Budi Pratama', role: 'siswa', kelas: 'SD' };
  const todayStr = new Date().toISOString().slice(0, 10);

  // AUTH: LOGIN
  if (endpoint.includes('/auth/login')) {
    const inputEmail = (body.email || '').toLowerCase().trim();
    const foundUser = (db.users || []).find(u => u.email.toLowerCase() === inputEmail);
    const isTeacher = inputEmail.includes('andre') || (foundUser && foundUser.role === 'guru');

    // CEK PERSETUJUAN GURU (STATUS APPROVAL)
    if (foundUser && foundUser.role === 'siswa' && foundUser.status === 'pending') {
      return {
        success: false,
        status: 'pending',
        message: 'Akun Anda sedang menunggu persetujuan (approval) dari Guru/Admin LMA. Silakan hubungi admin WhatsApp (+62 821-3132-576) atau tunggu hingga akun Anda disetujui oleh Kak Andre.'
      };
    }

    if (foundUser && foundUser.role === 'siswa' && foundUser.status === 'rejected') {
      return {
        success: false,
        status: 'rejected',
        message: 'Pendaftaran akun Anda ditolak oleh guru/admin. Silakan hubungi admin via WhatsApp untuk konfirmasi.'
      };
    }

    const role = isTeacher ? 'guru' : (foundUser ? foundUser.role : 'siswa');
    const name = foundUser ? foundUser.name : (isTeacher ? 'Andre (Tutor LMA)' : (inputEmail.split('@')[0] || 'Budi Pratama'));
    const id = foundUser ? foundUser.id : (isTeacher ? 1 : 2);
    const kelas = foundUser ? foundUser.kelas : 'Bahasa Jerman & Matematika SD';
    const status = foundUser ? (foundUser.status || 'active') : 'active';
    const avatar = foundUser ? foundUser.avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    const userObj = { id, name, email: body.email, role, status, kelas, avatar };

    return {
      success: true,
      message: `Selamat datang kembali, ${name}!`,
      token: 'lma_token_local_mock_2026',
      user: userObj
    };
  }

  // AUTH: REGISTRASI MANDIRI SISWA (MEMERLUKAN PERSETUJUAN GURU)
  if (endpoint.includes('/auth/register')) {
    const email = (body.email || '').toLowerCase().trim();
    if (!db.users) db.users = [];

    const existing = db.users.find(u => u.email.toLowerCase() === email);
    if (existing) {
      throw new Error(`Email "${email}" sudah terdaftar. Silakan gunakan email lain atau hubungi guru.`);
    }

    const newUser = {
      id: Date.now(),
      name: body.name || 'Siswa Baru',
      email: email,
      password: body.password || 'password123',
      role: 'siswa',
      status: 'pending', // Menunggu persetujuan Guru!
      kelas: body.kelas || 'Bahasa Jerman & Matematika SD',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(body.name || 'Siswa')}`,
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveLocalMockDB(db);

    return {
      success: true,
      pending_approval: true,
      message: 'Pendaftaran akun Anda berhasil diajukan! Akun Anda sedang menunggu persetujuan (approval) dari Guru/Admin LMA sebelum dapat digunakan untuk login.',
      user: newUser
    };
  }

  // AUTH: UPDATE PROFIL SISWA / GURU
  if (endpoint.includes('/auth/profile')) {
    if (method === 'PUT') {
      const currentAuth = getUser();
      const targetId = currentAuth ? currentAuth.id : (user ? user.id : 2);
      const targetUser = (db.users || []).find(u => Number(u.id) === Number(targetId));

      if (targetUser) {
        if (body.name) targetUser.name = body.name.trim();
        if (body.kelas) targetUser.kelas = body.kelas.trim();
        if (body.avatar) targetUser.avatar = body.avatar.trim();
        if (body.newPassword) targetUser.password = body.newPassword.trim();
        saveLocalMockDB(db);

        // Update local session
        const updatedSafeUser = {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          status: targetUser.status || 'active',
          kelas: targetUser.kelas,
          avatar: targetUser.avatar
        };
        localStorage.setItem('lma_user', JSON.stringify(updatedSafeUser));

        return {
          success: true,
          message: 'Profil berhasil diperbarui!',
          user: updatedSafeUser
        };
      }
      throw new Error('Pengguna tidak ditemukan untuk diperbarui.');
    }
  }

  // KELOLA AKUN SISWA OLEH GURU (MOCK FALLBACK)
  if (endpoint.includes('/auth/students')) {
    if (!db.users) db.users = [];

    // 1. Ambil daftar siswa
    if (method === 'GET') {
      const students = db.users.filter(u => u.role === 'siswa');
      return { success: true, count: students.length, data: students };
    }

    // 2. Guru membuatkan akun siswa (Langsung aktif karena dibuat oleh guru)
    if (method === 'POST') {
      const existing = db.users.find(u => u.email.toLowerCase() === (body.email || '').toLowerCase().trim());
      if (existing) {
        throw new Error(`Email "${body.email}" sudah terdaftar sebagai siswa!`);
      }
      const newStudent = {
        id: Date.now(),
        name: body.name || 'Siswa Baru',
        email: body.email.toLowerCase().trim(),
        password: body.password || 'lma123',
        role: 'siswa',
        status: 'active', // Guru mendaftarkan -> langsung aktif
        kelas: body.kelas || 'Bahasa Jerman & Matematika SD',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(body.name || 'Siswa')}`,
        created_at: new Date().toISOString()
      };
      db.users.push(newStudent);
      saveLocalMockDB(db);
      return {
        success: true,
        message: `Akun siswa "${newStudent.name}" (${newStudent.email}) berhasil dibuat dan email notifikasi telah disimulasikan!`,
        data: newStudent
      };
    }

    // 3. Guru menyetujui akun siswa (Approve)
    if (method === 'PUT' && endpoint.includes('/approve')) {
      const parts = endpoint.split('/');
      const idIdx = parts.indexOf('students') + 1;
      const studentId = parts[idIdx];
      const student = db.users.find(u => Number(u.id) === Number(studentId));
      if (student) {
        student.status = 'active';
        saveLocalMockDB(db);
        return {
          success: true,
          message: `Akun siswa "${student.name}" (${student.email}) berhasil disetujui! Siswa kini dapat masuk ke portal belajar.`
        };
      }
      throw new Error('Siswa tidak ditemukan.');
    }

    // 4. Guru menolak akun siswa (Reject)
    if (method === 'PUT' && endpoint.includes('/reject')) {
      const parts = endpoint.split('/');
      const idIdx = parts.indexOf('students') + 1;
      const studentId = parts[idIdx];
      const student = db.users.find(u => Number(u.id) === Number(studentId));
      if (student) {
        student.status = 'rejected';
        saveLocalMockDB(db);
        return {
          success: true,
          message: `Pendaftaran siswa "${student.name}" telah ditolak.`
        };
      }
      throw new Error('Siswa tidak ditemukan.');
    }

    // 5. Guru reset password siswa
    if (method === 'PUT' && endpoint.includes('/reset-password')) {
      const parts = endpoint.split('/');
      const idIdx = parts.indexOf('students') + 1;
      const studentId = parts[idIdx];
      const student = db.users.find(u => Number(u.id) === Number(studentId));
      if (student) {
        student.password = body.newPassword || 'lma123';
        saveLocalMockDB(db);
        return { success: true, message: `Password siswa "${student.name}" berhasil direset menjadi "${student.password}".` };
      }
      throw new Error('Siswa tidak ditemukan.');
    }

    // 6. Guru hapus akun siswa
    if (method === 'DELETE') {
      const studentId = endpoint.split('/').pop();
      const student = db.users.find(u => Number(u.id) === Number(studentId));
      db.users = db.users.filter(u => Number(u.id) !== Number(studentId));
      saveLocalMockDB(db);
      return { success: true, message: `Akun siswa "${student ? student.name : 'Siswa'}" berhasil dihapus.` };
    }
  }

  // DASHBOARD STATS
  if (endpoint.includes('/dashboard/stats')) {
    const isTeacher = user.role === 'guru' || user.role === 'admin';
    const todayAbsen = db.attendances.find(a => Number(a.user_id) === Number(user.id) && a.tanggal === todayStr);
    const liveClass = db.meets.find(m => m.status === 'live') || db.meets[0];

    return {
      success: true,
      role: user.role,
      liveClass,
      stats: {
        totalModul: db.modules.length,
        totalKuisTersedia: db.quizzes.length,
        kuisSelesaiCount: db.quiz_results.length,
        rataRataSkor: 100,
        totalHadirCount: db.attendances.filter(a => Number(a.user_id) === Number(user.id)).length,
        sudahAbsenHariIni: !!todayAbsen,
        totalSiswa: 3,
        totalMeets: db.meets.length
      }
    };
  }

  // MEETS
  if (endpoint.includes('/meets')) {
    if (method === 'POST') {
      const newMeet = { id: Date.now(), ...body, created_at: new Date().toISOString() };
      db.meets.unshift(newMeet);
      saveLocalMockDB(db);
      return { success: true, message: 'Jadwal Google Meet berhasil dibuat!', data: newMeet };
    }
    if (method === 'PUT') {
      const id = endpoint.split('/').pop();
      const meet = db.meets.find(m => Number(m.id) === Number(id));
      if (meet) Object.assign(meet, body);
      saveLocalMockDB(db);
      return { success: true, message: 'Jadwal berhasil diupdate!', data: meet };
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/').pop();
      db.meets = db.meets.filter(m => Number(m.id) !== Number(id));
      saveLocalMockDB(db);
      return { success: true, message: 'Jadwal berhasil dihapus.' };
    }
    return { success: true, count: db.meets.length, data: db.meets };
  }

  // MODUL
  if (endpoint.includes('/modul')) {
    if (method === 'POST') {
      const newMod = { 
        id: Date.now(), 
        ...body, 
        file_url: body.file_url || '',
        file_name: body.file_name || '',
        file_size: body.file_size || '',
        created_at: new Date().toISOString() 
      };
      db.modules.unshift(newMod);
      saveLocalMockDB(db);
      return { success: true, message: 'Modul beserta lampiran berhasil diterbitkan!', data: newMod };
    }
    return { success: true, count: db.modules.length, data: db.modules };
  }

  // KUIS
  if (endpoint.includes('/kuis')) {
    if (method === 'POST' && !endpoint.includes('/submit')) {
      // Guru membuat kuis baru dengan bobot nilai per soal
      const totalPoin = (body.questions || []).reduce((acc, q) => acc + (Number(q.points) || 10), 0);
      const newQuiz = {
        id: Date.now(),
        title: body.title,
        kategori: body.kategori,
        deskripsi: body.deskripsi,
        waktu_menit: Number(body.waktu_menit) || 10,
        total_soal: (body.questions || []).length,
        total_poin: totalPoin,
        questions: body.questions || [],
        created_at: new Date().toISOString()
      };
      db.quizzes.unshift(newQuiz);
      saveLocalMockDB(db);
      return { success: true, message: `Kuis "${newQuiz.title}" berhasil dibuat dengan total ${newQuiz.total_soal} soal (${totalPoin} Poin)!`, data: newQuiz };
    }
    if (endpoint.includes('/results/my')) {
      const myResults = db.quiz_results.filter(r => Number(r.user_id) === Number(user.id));
      return { success: true, count: myResults.length, data: myResults };
    }
    if (endpoint.includes('/results/all')) {
      return { success: true, count: db.quiz_results.length, data: db.quiz_results };
    }
    if (endpoint.includes('/submit')) {
      const quizId = endpoint.split('/')[2];
      const quiz = db.quizzes.find(q => Number(q.id) === Number(quizId)) || db.quizzes[0];
      const answers = body.answers || {};
      let benar = 0;
      let earnedPoints = 0;
      let maxPoints = 0;

      const review = (quiz.questions || []).map((q, idx) => {
        const qPoints = Number(q.points) || 10;
        maxPoints += qPoints;
        const uAns = answers[idx] !== undefined ? answers[idx] : answers[q.id];
        const isCorrect = (uAns !== null && uAns !== undefined) && Number(uAns) === Number(q.answerIndex);
        if (isCorrect) {
          benar++;
          earnedPoints += qPoints;
        }
        return {
          question: q.question,
          points: qPoints,
          earned: isCorrect ? qPoints : 0,
          userAnswer: (uAns !== null && uAns !== undefined) ? q.options[uAns] : 'Tidak dijawab',
          correctAnswer: q.options[q.answerIndex],
          isCorrect,
          explanation: q.explanation
        };
      });

      const score = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
      const resRecord = {
        id: Date.now(),
        user_id: user.id,
        user_name: user.name,
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        score,
        earned_points: earnedPoints,
        max_points: maxPoints,
        total_soal: quiz.questions.length,
        jawaban_benar: benar,
        created_at: new Date().toISOString()
      };
      db.quiz_results.unshift(resRecord);
      saveLocalMockDB(db);

      return {
        success: true,
        score,
        earned_points: earnedPoints,
        max_points: maxPoints,
        badge: score === 100 ? 'Juara Sempurna 🏆⭐⭐⭐' : score >= 80 ? 'Hebat Sekali 🎖️⭐⭐' : 'Bintang Belajar 🌟',
        message: score >= 80 ? `Fantastis! Kamu mengumpulkan ${earnedPoints} dari ${maxPoints} poin!` : `Bagus! Kamu meraih ${earnedPoints} poin. Ayo berlatih lagi!`,
        review
      };
    }
    const singleId = endpoint.match(/\/kuis\/(\d+)$/);
    if (singleId) {
      const q = db.quizzes.find(item => Number(item.id) === Number(singleId[1]));
      return { success: true, data: q || db.quizzes[0] };
    }
    return { success: true, count: db.quizzes.length, data: db.quizzes };
  }

  // ABSEN
  if (endpoint.includes('/absen')) {
    if (endpoint.includes('/today')) {
      const todayAbsen = db.attendances.find(a => Number(a.user_id) === Number(user.id) && a.tanggal === todayStr);
      return { success: true, hasCheckedIn: !!todayAbsen, tanggal: todayStr, data: todayAbsen || null };
    }
    if (endpoint.includes('/my')) {
      const myAbsen = db.attendances.filter(a => Number(a.user_id) === Number(user.id));
      return { success: true, totalHadir: myAbsen.length, data: myAbsen };
    }
    if (endpoint.includes('/all')) {
      return { success: true, count: db.attendances.length, data: db.attendances };
    }
    if (method === 'POST') {
      const now = new Date();
      const wibDefault = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(now) + ' WIB';

      const finalTime = body.client_time || wibDefault;

      // Cek apakah sudah pernah absen hari ini: jika ada, update statusnya!
      const existingIdx = db.attendances.findIndex(a => Number(a.user_id) === Number(user.id) && a.tanggal === todayStr);
      if (existingIdx !== -1) {
        db.attendances[existingIdx].status = body.status || 'hadir';
        db.attendances[existingIdx].waktu = finalTime;
        db.attendances[existingIdx].keterangan = body.keterangan || `Status kehadiran diperbarui menjadi ${body.status}`;
        saveLocalMockDB(db);
        try { localStorage.setItem('lma_user_has_manually_attended', 'true'); } catch(e){}
        return { 
          success: true, 
          message: `Status kehadiran siswa an. "${user.name}" berhasil diubah menjadi "${(body.status || 'hadir').toUpperCase()}"!`, 
          data: db.attendances[existingIdx] 
        };
      }

      const newAbsen = {
        id: Date.now(),
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        user_kelas: user.kelas || 'Bahasa Jerman & Matematika SD',
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`,
        tanggal: todayStr,
        waktu: finalTime,
        timezone: body.client_timezone || 'WIB',
        status: body.status || 'hadir',
        keterangan: body.keterangan || 'Hadir pada sesi Open Class LMA'
      };
      db.attendances.unshift(newAbsen);
      saveLocalMockDB(db);
      try { localStorage.setItem('lma_user_has_manually_attended', 'true'); } catch(e){}
      return { success: true, message: `Kehadiran siswa an. "${user.name}" berhasil dicatat sebagai "${(body.status || 'hadir').toUpperCase()}" pada ${finalTime}!`, data: newAbsen };
    }
  }

  return { success: false, message: 'Endpoint mock belum didefinisikan.' };
}

// ==================== HTTP REQUEST HELPER ====================
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.baseURL}${endpoint}`;

  try {
    // Timeout cepat 1 detik untuk deteksi backend port 5000
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    return data;
  } catch (error) {
    // Otomatis tangani via Engine Mock Lokal jika backend port 5000 belum aktif
    return handleMockFallback(endpoint, options);
  }
}

const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  toast.innerHTML = `
    <i class="ph-bold ${type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==================== RENDER COMMON NAVBAR ====================
function renderPortalNavbar(activePage = 'dashboard') {
  const navContainer = document.getElementById('navbarContainer');
  if (!navContainer) return;

  const user = getUser() || { name: 'Siswa LMA', role: 'siswa', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LMA' };
  const isTeacher = user.role === 'guru' || user.role === 'admin';

  navContainer.innerHTML = `
    <header class="portal-navbar">
      <div class="portal-nav-container">
        <a href="dashboard.html" class="brand-area">
          <img src="../Logo.png" alt="LMA Logo" class="brand-logo-img" onerror="this.src='https://api.dicebear.com/7.x/shapes/svg?seed=LMA'">
          <div class="brand-title-group">
            <h1>LMA – Lerne mit Andre</h1>
            <p>Portal Belajar Online • Bali</p>
          </div>
        </a>

        <nav class="portal-nav-links">
          <a href="dashboard.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
            <i class="ph-fill ph-squares-four"></i> Dashboard
          </a>
          <a href="meet.html" class="nav-item ${activePage === 'meet' ? 'active' : ''}">
            <i class="ph-fill ph-video-camera"></i> Live GMeet
          </a>
          <a href="modul.html" class="nav-item ${activePage === 'modul' ? 'active' : ''}">
            <i class="ph-fill ph-book-open"></i> Modul
          </a>
          <a href="kuis.html" class="nav-item ${activePage === 'kuis' ? 'active' : ''}">
            <i class="ph-fill ph-game-controller"></i> Kuis Seru
          </a>
          <a href="absen.html" class="nav-item ${activePage === 'absen' ? 'active' : ''}">
            <i class="ph-fill ph-check-square-offset"></i> Absen
          </a>
          ${isTeacher ? `
          <a href="admin.html" class="nav-item ${activePage === 'admin' ? 'active' : ''}" style="color: var(--accent-red); font-weight:800;">
            <i class="ph-fill ph-gear"></i> Panel Guru
          </a>` : ''}
        </nav>

        <div class="user-badge-area">
          <div class="user-profile-chip" onclick="openProfileModal()" style="cursor: pointer;" title="Klik untuk Ubah Profil Saya">
            <img src="${user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(user.name)}" class="user-avatar" id="navUserAvatarImg" alt="Avatar">
            <div class="user-info">
              <span class="user-name" id="navUserNameSpan">${user.name.split(' ')[0]}</span>
              <span class="user-role-badge">${user.role === 'guru' ? '👨‍🏫 Guru / Tutor' : '👦 Siswa SD'}</span>
            </div>
            <i class="ph-bold ph-pencil-simple" style="font-size: 0.85rem; color: var(--primary); margin-left: 2px;" title="Ubah Profil"></i>
          </div>
          <button class="btn btn-outline btn-sm" onclick="openProfileModal()" style="padding: 5px 9px; font-size: 0.8rem; border-radius: 8px; display: inline-flex; align-items: center; gap: 4px;" title="Edit Profil Saya">
            <i class="ph-bold ph-user"></i> <span class="d-none-sm">Profil</span>
          </button>
          <button class="btn-logout" onclick="logout()" title="Keluar">
            <i class="ph-bold ph-sign-out"></i>
          </button>
        </div>
      </div>
    </header>
  `;

  // Suntikkan modal profil jika belum ada di dokumen
  injectProfileModal();
}

// ==================== FITUR UBAH / UPDATE PROFIL SISWA & GURU ====================
function injectProfileModal() {
  if (document.getElementById('profileModalOverlay')) return;

  const modalHtml = `
    <div id="profileModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 1rem;">
      <div style="background: white; border-radius: 20px; max-width: 500px; width: 100%; padding: 1.75rem; box-shadow: 0 20px 50px rgba(0,0,0,0.25); max-height: 90vh; overflow-y: auto; position: relative; animation: modalPop 0.25s ease-out;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 36px; height: 36px; background: #EBF2FF; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--primary);">
              <i class="ph-bold ph-user-gear" style="font-size: 1.3rem;"></i>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 1.15rem; color: var(--dark); font-family: var(--font-heading);">Ubah Profil Saya</h3>
              <p style="margin: 0; font-size: 0.78rem; color: var(--gray);">Perbarui nama, program kelas, avatar, dan password Anda</p>
            </div>
          </div>
          <button type="button" onclick="closeProfileModal()" style="background: none; border: none; font-size: 1.4rem; color: var(--gray); cursor: pointer; padding: 4px;">
            <i class="ph-bold ph-x"></i>
          </button>
        </div>

        <form onsubmit="handleUpdateProfileSubmit(event)">
          <!-- Pilih Karakter Avatar -->
          <div class="form-group" style="text-align: center; margin-bottom: 1.25rem;">
            <label class="form-label" style="margin-bottom: 0.5rem; display: block;">Pilih Karakter Avatar Belajar Anda:</label>
            <div style="display: inline-block; position: relative; margin-bottom: 0.75rem;">
              <img id="modalAvatarPreview" src="" alt="Preview Avatar" style="width: 76px; height: 76px; border-radius: 50%; background: #EBF2FF; border: 3px solid var(--primary); padding: 2px;">
            </div>
            <input type="hidden" id="modalInputAvatar" value="">

            <!-- Pilihan Preset Avatar -->
            <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Budi" onclick="selectPresetAvatar(this.src)" style="width: 38px; height: 38px; border-radius: 50%; cursor: pointer; background: #EBF2FF; border: 1.5px solid #CBD5E0;" title="Pilih Robot Ceria">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Felix" onclick="selectPresetAvatar(this.src)" style="width: 38px; height: 38px; border-radius: 50%; cursor: pointer; background: #EBF2FF; border: 1.5px solid #CBD5E0;" title="Pilih Sahabat Pintar">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Siti" onclick="selectPresetAvatar(this.src)" style="width: 38px; height: 38px; border-radius: 50%; cursor: pointer; background: #EBF2FF; border: 1.5px solid #CBD5E0;" title="Pilih Bintang Belajar">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Hans" onclick="selectPresetAvatar(this.src)" style="width: 38px; height: 38px; border-radius: 50%; cursor: pointer; background: #EBF2FF; border: 1.5px solid #CBD5E0;" title="Pilih Penjelajah Jerman">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Luna" onclick="selectPresetAvatar(this.src)" style="width: 38px; height: 38px; border-radius: 50%; cursor: pointer; background: #EBF2FF; border: 1.5px solid #CBD5E0;" title="Pilih Juara Hitung">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=AndreTeacher" onclick="selectPresetAvatar(this.src)" style="width: 38px; height: 38px; border-radius: 50%; cursor: pointer; background: #EBF2FF; border: 1.5px solid #CBD5E0;" title="Pilih Karakter Guru">
            </div>
          </div>

          <!-- Nama Lengkap -->
          <div class="form-group">
            <label class="form-label">Nama Lengkap Siswa</label>
            <input type="text" id="modalInputName" class="form-input" required placeholder="Nama Anda">
          </div>

          <!-- Email (Readonly) -->
          <div class="form-group">
            <label class="form-label">Email Terdaftar (Login)</label>
            <input type="email" id="modalInputEmail" class="form-input" disabled style="background: #F1F5F9; color: var(--gray); cursor: not-allowed;">
          </div>

          <!-- Program / Kelas -->
          <div class="form-group">
            <label class="form-label">Program Kelas Pembelajaran</label>
            <select id="modalInputKelas" class="form-select">
              <option value="Bahasa Jerman & Matematika SD">🇩🇪 & 🔢 Bahasa Jerman & Matematika SD</option>
              <option value="Bahasa Jerman Pemula">🇩🇪 Bahasa Jerman Pemula</option>
              <option value="Matematika SD">🔢 Matematika SD</option>
            </select>
          </div>

          <!-- Ganti Password Baru (Opsional) -->
          <div style="background: #F8FAFC; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.25rem;">
            <label class="form-label" style="margin-bottom: 0.25rem; font-weight: 700; color: var(--dark);">
              <i class="ph-bold ph-key"></i> Ganti Password Akun (Opsional)
            </label>
            <p style="font-size: 0.78rem; color: var(--gray); margin-bottom: 0.75rem;">
              Kosongkan jika Anda tidak ingin mengubah password saat ini.
            </p>
            <input type="password" id="modalInputNewPassword" class="form-input" placeholder="Masukkan password baru (min. 6 karakter)">
          </div>

          <!-- Tombol Aksi -->
          <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button type="button" class="btn btn-outline btn-sm" onclick="closeProfileModal()">Batal</button>
            <button type="submit" class="btn btn-primary btn-sm" id="btnSaveProfile">
              <i class="ph-bold ph-check"></i> Simpan Perubahan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openProfileModal() {
  injectProfileModal();
  const user = getUser();
  if (!user) return;

  document.getElementById('modalInputName').value = user.name || '';
  document.getElementById('modalInputEmail').value = user.email || '';
  document.getElementById('modalInputKelas').value = user.kelas || 'Bahasa Jerman & Matematika SD';
  document.getElementById('modalInputNewPassword').value = '';

  const avatar = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`;
  document.getElementById('modalAvatarPreview').src = avatar;
  document.getElementById('modalInputAvatar').value = avatar;

  const overlay = document.getElementById('profileModalOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function closeProfileModal() {
  const overlay = document.getElementById('profileModalOverlay');
  if (overlay) overlay.style.display = 'none';
}

function selectPresetAvatar(url) {
  document.getElementById('modalAvatarPreview').src = url;
  document.getElementById('modalInputAvatar').value = url;
}

async function handleUpdateProfileSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('modalInputName').value.trim();
  const kelas = document.getElementById('modalInputKelas').value;
  const avatar = document.getElementById('modalInputAvatar').value;
  const newPassword = document.getElementById('modalInputNewPassword').value.trim();
  const btn = document.getElementById('btnSaveProfile');

  if (!name) {
    showToast('Nama lengkap tidak boleh kosong!', 'error');
    return;
  }

  if (newPassword && newPassword.length < 6) {
    showToast('Password baru minimal harus 6 karakter!', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Menyimpan...';

  try {
    const payload = { name, kelas, avatar };
    if (newPassword) payload.newPassword = newPassword;

    const res = await api.put('/auth/profile', payload);

    if (res && res.success) {
      showToast('Profil Anda berhasil diperbarui!', 'success');

      // Update session user di localStorage
      const user = getUser() || {};
      user.name = name;
      user.kelas = kelas;
      user.avatar = avatar;
      setAuth(getToken(), user);

      // Perbarui tampilan di UI langsung tanpa reload
      const navAvatar = document.getElementById('navUserAvatarImg');
      const navName = document.getElementById('navUserNameSpan');
      const greetingUser = document.getElementById('greetingUser');
      if (navAvatar) navAvatar.src = avatar;
      if (navName) navName.innerText = name.split(' ')[0];
      if (greetingUser) greetingUser.innerText = `Hallo, ${name}! 👋`;

      closeProfileModal();
    } else {
      showToast((res && res.message) ? res.message : 'Gagal memperbarui profil.', 'error');
    }
  } catch (err) {
    showToast(err.message || 'Terjadi kesalahan saat memperbarui profil.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ph-bold ph-check"></i> Simpan Perubahan Profil';
  }
}
