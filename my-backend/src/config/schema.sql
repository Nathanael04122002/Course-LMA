-- ========================================================
-- Schema Database LMA – Lerne mit Andre (MySQL / MariaDB)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `lma_education_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lma_education_db`;

-- 1. Tabel Users (Siswa, Guru, Admin)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('siswa', 'guru', 'admin') DEFAULT 'siswa',
  `status` ENUM('pending', 'active', 'rejected') DEFAULT 'active',
  `kelas` VARCHAR(50) DEFAULT 'Bahasa Jerman & Matematika SD',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Modul Pembelajaran (Bahasa Jerman & Matematika SD)
CREATE TABLE IF NOT EXISTS `modul` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `kategori` ENUM('jerman', 'matematika') NOT NULL,
  `level` VARCHAR(50) DEFAULT 'Pemula / SD',
  `deskripsi` TEXT,
  `file_url` VARCHAR(255) DEFAULT NULL,
  `materi_teks` LONGTEXT,
  `durasi_menit` INT DEFAULT 30,
  `urutan` INT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Jadwal & Link Google Meet (Live Open Class)
CREATE TABLE IF NOT EXISTS `meet_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `program` VARCHAR(100) NOT NULL,
  `instructor` VARCHAR(100) DEFAULT 'Kak Andre (LMA Tutor)',
  `meet_link` VARCHAR(255) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `status` ENUM('upcoming', 'live', 'finished') DEFAULT 'upcoming',
  `notes` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Kuis Interaktif
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `kategori` ENUM('jerman', 'matematika') NOT NULL,
  `deskripsi` TEXT,
  `waktu_menit` INT DEFAULT 15,
  `questions` LONGTEXT NOT NULL, -- Format JSON: array dari { id, question, options, answerIndex, explanation }
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Hasil Kuis Siswa
CREATE TABLE IF NOT EXISTS `quiz_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `quiz_id` INT NOT NULL,
  `score` INT NOT NULL,
  `total_soal` INT NOT NULL,
  `jawaban_benar` INT NOT NULL,
  `detail_jawaban` LONGTEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Absensi Simple
CREATE TABLE IF NOT EXISTS `attendances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `schedule_id` INT DEFAULT NULL,
  `tanggal` DATE NOT NULL,
  `waktu` TIME NOT NULL,
  `status` ENUM('hadir', 'izin', 'sakit') DEFAULT 'hadir',
  `keterangan` VARCHAR(255) DEFAULT 'Hadir tepat waktu di sesi Open Class',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_date` (`user_id`, `tanggal`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Index untuk performa query cepat
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_modul_kategori ON modul(kategori);
CREATE INDEX idx_meet_status ON meet_schedules(status);
CREATE INDEX idx_attendance_tanggal ON attendances(tanggal);
