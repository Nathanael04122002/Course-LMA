const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let pool = null;
let useMySQL = false;

// Lokasi penyimpanan data lokal (jika mode JSON file aktif)
const dataDir = path.join(__dirname, '..', 'data');
const dbFilePath = path.join(dataDir, 'database.json');

// Pastikan folder data tersedia
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Data awal (Seed Data) untuk portal LMA
function getInitialSeedData() {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password123', salt);

  return {
    users: [
      {
        id: 1,
        name: 'Andre (LMA Founder & Tutor)',
        email: 'andre@lma.id',
        password: hashedPassword,
        role: 'guru',
        status: 'active',
        kelas: 'Bahasa Jerman & Matematika SD',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AndreTeacher',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Budi Pratama',
        email: 'budi@lma.id',
        password: hashedPassword,
        role: 'siswa',
        status: 'active',
        kelas: 'Matematika SD & Bahasa Jerman',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BudiStudent',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Siti Ayu Bali',
        email: 'siti@lma.id',
        password: hashedPassword,
        role: 'siswa',
        status: 'active',
        kelas: 'Bahasa Jerman',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SitiStudent',
        created_at: new Date().toISOString()
      }
    ],
    modul: [
      {
        id: 1,
        title: '🇩🇪 Modul 1: Begrüßung & Sich Vorstellen (Salam & Perkenalan)',
        kategori: 'jerman',
        level: 'Pemula (A1.1)',
        deskripsi: 'Belajar kosakata salam sehari-hari dalam Bahasa Jerman: Guten Morgen, Guten Tag, Wie geht es dir?, dan cara memperkenalkan nama dan asal negara.',
        file_url: '/uploads/modul-jerman-1.pdf',
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
        durasi_menit: 30,
        urutan: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: '🇩🇪 Modul 2: Zahlen von 1 bis 20 (Angka 1 - 20)',
        kategori: 'jerman',
        level: 'Pemula (A1.1)',
        deskripsi: 'Mengenal pengucapan angka dalam bahasa Jerman dengan lagu interaktif dan trik mengingat mudah untuk anak.',
        file_url: '/uploads/modul-jerman-2.pdf',
        materi_teks: `
### Angka 1 - 10:
- 1 = eins
- 2 = zwei
- 3 = drei
- 4 = vier
- 5 = fünf
- 6 = sechs
- 7 = sieben
- 8 = acht
- 9 = neun
- 10 = zehn
        `,
        durasi_menit: 25,
        urutan: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: '🔢 Modul 1: Trik Cepat Perkalian & Operasi Hitung Campuran',
        kategori: 'matematika',
        level: 'SD Kelas 4 - 6',
        deskripsi: 'Memahami urutan operasi matematika (Kabataku: Kali, Bagi, Tambah, Kurang) dengan metode logika cerita yang seru.',
        file_url: '/uploads/modul-matematika-1.pdf',
        materi_teks: `
### Aturan Emas KABATAKU:
1. Kerjakan yang di dalam kurung terlebih dahulu: **( ... )**
2. Kerjakan **Perkalian (×)** dan **Pembagian (÷)** dari kiri ke kanan.
3. Kerjakan **Penjumlahan (+)** dan **Pengurangan (-)** dari kiri ke kanan.

*Contoh Soal:*
10 + 5 × 2 = 10 + 10 = **20** *(Bukan (10+5)×2)*!
        `,
        durasi_menit: 35,
        urutan: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        title: '🔢 Modul 2: Pecahan & Desimal Tanpa Pusing',
        kategori: 'matematika',
        level: 'SD Kelas 4 - 6',
        deskripsi: 'Visualisasi pecahan menggunakan potongan pizza dan cokelat agar mudah dimengerti anak.',
        file_url: '/uploads/modul-matematika-2.pdf',
        materi_teks: `
### Mengenal Pembilang & Penyebut:
- **Atas:** Pembilang (bagian yang kita miliki)
- **Bawah:** Penyebut (total bagian potongan yang sama besar)

Contoh: 1/2 pizza + 1/2 pizza = 1 pizza utuh!
        `,
        durasi_menit: 30,
        urutan: 2,
        created_at: new Date().toISOString()
      }
    ],
    meet_schedules: [
      {
        id: 1,
        title: 'Live Open Class: Percakapan Bahasa Jerman Dasar',
        program: 'Bahasa Jerman',
        instructor: 'Kak Andre (LMA Founder)',
        meet_link: 'https://meet.google.com/lma-germ-bali',
        start_time: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // Sedang berlangsung
        end_time: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
        status: 'live',
        notes: 'Siapkan catatan & mic untuk latihan pelafalan bersama Kak Andre dari Bali!',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Live Open Class: Rahasia Perkalian 2 Digit Cepat',
        program: 'Matematika SD',
        instructor: 'Kak Andre & Tim LMA',
        meet_link: 'https://meet.google.com/lma-math-bali',
        start_time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Besok
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(),
        status: 'upcoming',
        notes: 'Ajak teman-teman ikut serta! Akan ada mini-game berhadiah bintang!',
        created_at: new Date().toISOString()
      }
    ],
    quizzes: [
      {
        id: 1,
        title: '🇩🇪 Kuis Ceria Bahasa Jerman: Salam & Sapaan',
        kategori: 'jerman',
        deskripsi: 'Uji kemampuan kosakata salam bahasa Jerman. Ada 5 pertanyaan seru!',
        waktu_menit: 10,
        questions: [
          {
            id: 1,
            question: 'Apa arti dari "Guten Morgen" dalam bahasa Indonesia?',
            options: ['Selamat Malam', 'Selamat Pagi', 'Selamat Tidur', 'Sampai Jumpa'],
            answerIndex: 1,
            explanation: '"Guten Morgen" digunakan untuk menyapa di pagi hari.'
          },
          {
            id: 2,
            question: 'Jika ingin mengucapkan "Sampai jumpa" secara santai, kita mengatakan...',
            options: ['Danke', 'Bitte', 'Tschüss', 'Ja'],
            answerIndex: 2,
            explanation: '"Tschüss" adalah kata yang sangat populer untuk berpisah secara santai.'
          },
          {
            id: 3,
            question: 'Bagaimana cara mengatakan "Nama saya Budi" dalam Bahasa Jerman?',
            options: ['Ich bin alt Budi', 'Ich heiße Budi', 'Ich lerne Budi', 'Ich mag Budi'],
            answerIndex: 1,
            explanation: '"Ich heiße..." adalah cara yang tepat untuk menyebutkan nama.'
          },
          {
            id: 4,
            question: 'Angka "tiga" (3) dalam Bahasa Jerman adalah...',
            options: ['Eins', 'Zwei', 'Drei', 'Vier'],
            answerIndex: 2,
            explanation: '1=Eins, 2=Zwei, 3=Drei, 4=Vier.'
          },
          {
            id: 5,
            question: 'Apa arti dari kata "Danke"?',
            options: ['Sama-sama', 'Terima kasih', 'Maaf', 'Tolong'],
            answerIndex: 1,
            explanation: '"Danke" berarti Terima Kasih, dan jawabannya adalah "Bitte" (Sama-sama).'
          }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: '🔢 Kuis Logika Matematika SD: Operasi Hitung Seru',
        kategori: 'matematika',
        deskripsi: 'Latihan operasi campuran dan hitung cepat dengan metode Kabataku.',
        waktu_menit: 10,
        questions: [
          {
            id: 1,
            question: 'Hasil dari 12 + 8 × 2 adalah...',
            options: ['40', '28', '20', '32'],
            answerIndex: 1,
            explanation: 'Perkalian dikerjakan lebih dulu: 8 × 2 = 16. Lalu 12 + 16 = 28.'
          },
          {
            id: 2,
            question: 'Pecahan 1/2 senilai dengan...',
            options: ['2/4', '3/5', '1/4', '2/3'],
            answerIndex: 0,
            explanation: '1/2 jika pembilang dan penyebut dikalikan 2 menjadi 2/4.'
          },
          {
            id: 3,
            question: 'Sebuah persegi memiliki sisi 6 cm. Berapa kelilingnya?',
            options: ['36 cm', '24 cm', '12 cm', '18 cm'],
            answerIndex: 1,
            explanation: 'Keliling persegi = 4 × sisi = 4 × 6 = 24 cm.'
          },
          {
            id: 4,
            question: 'Hasil dari (25 - 5) ÷ 4 adalah...',
            options: ['5', '20', '10', '15'],
            answerIndex: 0,
            explanation: 'Dalam kurung didahulukan: 25 - 5 = 20. Lalu 20 ÷ 4 = 5.'
          },
          {
            id: 5,
            question: 'Berapakah 7 × 8?',
            options: ['54', '56', '58', '64'],
            answerIndex: 1,
            explanation: '7 dikalikan 8 adalah 56.'
          }
        ],
        created_at: new Date().toISOString()
      }
    ],
    quiz_results: [
      {
        id: 1,
        user_id: 2,
        quiz_id: 1,
        score: 100,
        total_soal: 5,
        jawaban_benar: 5,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ],
    attendances: [
      {
        id: 1,
        user_id: 2,
        schedule_id: 1,
        tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // Kemarin (agar hari ini Budi belum absen)
        waktu: '10:00:00',
        status: 'hadir',
        keterangan: 'Hadir aktif di sesi Live Open Class',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  };
}

// Inisialisasi JSON database jika belum ada
function initJSONDatabase() {
  if (!fs.existsSync(dbFilePath)) {
    const seed = getInitialSeedData();
    fs.writeFileSync(dbFilePath, JSON.stringify(seed, null, 2), 'utf8');
    console.log(' [DB] Initialized local JSON database at:', dbFilePath);
  }
}

// Baca data JSON
function readJSON() {
  initJSONDatabase();
  try {
    const content = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(' [DB] Error reading JSON DB:', err.message);
    const seed = getInitialSeedData();
    fs.writeFileSync(dbFilePath, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
}

// Simpan data JSON
function writeJSON(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(' [DB] Error writing JSON DB:', err.message);
    return false;
  }
}

// Inisialisasi koneksi MySQL jika diatur di .env
async function initDatabase() {
  const driver = (process.env.DB_DRIVER || 'file').toLowerCase();
  
  if (driver === 'mysql') {
    try {
      const mysql = require('mysql2/promise');
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lma_education_db',
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Cek koneksi
      const conn = await pool.getConnection();
      console.log(' Connected successfully to MySQL Database (' + process.env.DB_NAME + ')');
      conn.release();
      useMySQL = true;
    } catch (err) {
      console.warn('⚠️ [DB Warning] Gagal konek MySQL (' + err.message + '). Beralih ke sistem File DB JSON lokal secara otomatis.');
      useMySQL = false;
      initJSONDatabase();
    }
  } else {
    console.log(' [DB] Menggunakan Mode File Database Lokal (src/data/database.json). Siap dijalankan tanpa instalasi MySQL!');
    useMySQL = false;
    initJSONDatabase();
  }
}

// Universal query / ORM helper
const db = {
  isMySQL: () => useMySQL,

  // Direct SQL query untuk MySQL (atau custom fallback)
  async query(sql, params = []) {
    if (useMySQL && pool) {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } else {
      throw new Error('Query SQL langsung hanya didukung dalam mode MySQL. Gunakan helper method db.collection(...) untuk kompabilitas penuh.');
    }
  },

  // Generic collection accessor untuk kemudahan CRUD seragam
  collection(name) {
    return {
      async find(predicate = () => true) {
        if (useMySQL && pool) {
          // Dalam mode MySQL, bisa disesuaikan atau diarahkan ke helper table
          const [rows] = await pool.query(`SELECT * FROM ${name}`);
          return rows.filter(predicate);
        }
        const data = readJSON();
        const list = data[name] || [];
        return list.filter(predicate);
      },

      async findOne(predicate) {
        if (useMySQL && pool) {
          const [rows] = await pool.query(`SELECT * FROM ${name}`);
          return rows.find(predicate) || null;
        }
        const data = readJSON();
        const list = data[name] || [];
        return list.find(predicate) || null;
      },

      async findById(id) {
        return this.findOne(item => Number(item.id) === Number(id));
      },

      async insert(newItem) {
        if (useMySQL && pool) {
          const keys = Object.keys(newItem);
          const values = Object.values(newItem);
          const placeholders = keys.map(() => '?').join(', ');
          const sql = `INSERT INTO ${name} (${keys.join(', ')}) VALUES (${placeholders})`;
          const [result] = await pool.execute(sql, values);
          return { id: result.insertId, ...newItem };
        }
        const data = readJSON();
        if (!data[name]) data[name] = [];
        const nextId = data[name].length > 0 ? Math.max(...data[name].map(i => Number(i.id) || 0)) + 1 : 1;
        const record = { id: nextId, created_at: new Date().toISOString(), ...newItem };
        data[name].push(record);
        writeJSON(data);
        return record;
      },

      async updateById(id, updates) {
        if (useMySQL && pool) {
          const keys = Object.keys(updates);
          const setClause = keys.map(k => `${k} = ?`).join(', ');
          const values = [...Object.values(updates), id];
          const sql = `UPDATE ${name} SET ${setClause} WHERE id = ?`;
          await pool.execute(sql, values);
          return this.findById(id);
        }
        const data = readJSON();
        const list = data[name] || [];
        const index = list.findIndex(i => Number(i.id) === Number(id));
        if (index === -1) return null;
        list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
        data[name] = list;
        writeJSON(data);
        return list[index];
      },

      async deleteById(id) {
        if (useMySQL && pool) {
          await pool.execute(`DELETE FROM ${name} WHERE id = ?`, [id]);
          return true;
        }
        const data = readJSON();
        const list = data[name] || [];
        const filtered = list.filter(i => Number(i.id) !== Number(id));
        data[name] = filtered;
        writeJSON(data);
        return true;
      }
    };
  }
};

module.exports = {
  initDatabase,
  db
};
