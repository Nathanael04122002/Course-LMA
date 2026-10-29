# LMA – Lerne mit Andre (Course & Learning Portal)

Platform kursus dan portal pembelajaran online untuk **Bahasa Jerman & Matematika SD** yang berbasis di **Bali, Indonesia**. Proyek ini mencakup Website Landing Page, Portal Belajar Interaktif Siswa, Panel Manajemen Guru, serta Backend API berbasis Node.js/Express.

---

## 🌟 Fitur Utama

### 1. Landing Page Interaktif
* Profil lembaga, pengenalan tutor, dan program pembelajaran (Bahasa Jerman & Matematika SD).
* Galeri evidence kegiatan belajar & testimoni.
* Akses langsung pendaftaran via WhatsApp dan akses Portal Siswa.

### 2. Portal Siswa (`/portal`)
* **Live Google Meet:** Hub tautan sesi tatap muka interaktif dengan status real-time.
* **Modul Pembelajaran:** Rangkuman materi belajar, kosakata Jerman, trik hitung SD, dan unduhan file lampiran (PDF/dokumen).
* **Kuis Interaktif:** Kuis latihan mandiri dengan skor instan, perolehan bintang, dan ulasan pembahasan.
* **Absensi Harian:** Pencatatan kehadiran siswa (Hadir, Izin, Sakit) dengan jam WIB real-time.
* **Profil Siswa:** Siswa dapat memperbarui nama, program kelas, dan memilih 6 karakter avatar ceria.

### 3. Panel Guru / Tutor (`/portal/admin.html`)
* **Kelola Akun Siswa & Approval:**
  * Siswa yang mendaftar mandiri berstatus *Pending Approval* dan wajib disetujui Guru sebelum dapat login.
  * Guru dapat menyetujui (*Approve*) atau menolak pendaftaran siswa.
  * Guru dapat mendaftarkan siswa secara langsung dan mengatur password awal.
* **Upload Modul & Lampiran PDF:** Menerbitkan modul materi baru dan mengunggah dokumen/PDF.
* **Pembuat Soal Kuis & Bobot Nilai:** Guru dapat membuat soal kuis sendiri dan mengatur bobot nilai tiap soal.
* **Rekapitulasi Absensi:** Memantau kehadiran siswa secara lengkap beserta nama dan waktu (WIB).
* **Jadwal Google Meet:** Memasang link Google Meet dan mengaktifkan status sesi *Live*.

---

## 📂 Struktur Direktori

```
LandingPages/
├── index.html               # Halaman utama (Landing Page LMA)
├── style.css                # Styling desain sistem LMA
├── script.js                # Interaktivitas landing page
├── Logo.png                 # Brand logo resmi LMA
├── jalankan-portal.bat      # Launcher server pengujian lokal
│
├── portal/                  # Frontend Portal Belajar
│   ├── login.html           # Halaman login & pendaftaran siswa
│   ├── dashboard.html       # Dashboard siswa
│   ├── meet.html            # Hub Google Meet kelas
│   ├── modul.html           # Penampil modul materi & unduhan file
│   ├── kuis.html            # Runner kuis interaktif
│   ├── absen.html           # Presensi kehadiran harian siswa (WIB)
│   ├── admin.html           # Panel manajemen Guru (Kak Andre)
│   ├── css/portal.css       # Desain sistem portal
│   └── js/api.js            # Dual-mode API client (Backend + Mock fallback)
│
├── my-backend/              # Backend REST API (Node.js & Express)
│   ├── src/
│   │   ├── config/          # Konfigurasi DB (MySQL/MariaDB & file store)
│   │   ├── controllers/     # Logika bisnis (Auth, Meet, Modul, Kuis, Absen)
│   │   ├── models/          # Model data
│   │   ├── routes/          # Endpoint API
│   │   ├── middlewares/     # JWT authentication & role authorization
│   │   └── services/        # Email service (Nodemailer SMTP & offline simulation)
│   ├── uploads/             # Folder penyimpanan file modul PDF
│   ├── package.json
│   ├── ecosystem.config.js  # Konfigurasi PM2 untuk VPS
│   └── nginx.conf.example   # Template konfigurasi Nginx reverse proxy
│
└── DEPLOY_VPS_GUIDE.md      # Panduan lengkap deployment ke VPS Linux Ubuntu
```

---

## 🚀 Panduan Menjalankan di Lokal (Pengujian)

1. Jalankan `jalankan-portal.bat` atau buka terminal:
   ```bash
   python -m http.server 8000
   ```
2. Buka browser:
   * **Landing Page:** `http://localhost:8000/index.html`
   * **Portal Belajar:** `http://localhost:8000/portal/login.html`

---

## ☁️ Panduan Deployment ke VPS

Lihat panduan lengkap langkah-demi-langkah pada file [`DEPLOY_VPS_GUIDE.md`](DEPLOY_VPS_GUIDE.md) yang mencakup:
1. Setup Node.js 20 & MySQL/MariaDB di Ubuntu VPS.
2. Konfigurasi Nginx Reverse Proxy & SSL HTTPS Gratis (Certbot Let's Encrypt).
3. Pengaturan PM2 Process Manager untuk menjalankan backend secara 24/7.
4. Pengaturan konfigurasi `.env` untuk SMTP email pengumuman.

---

## 📄 Lisensi
Hak Cipta &copy; 2026 **LMA – Lerne mit Andre**. Semua hak dilindungi.
