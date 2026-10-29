# 🚀 Panduan Lengkap Deploy Website & Portal LMA ke VPS (Ubuntu / Debian)

Panduan ini disusun langkah-demi-langkah agar Anda dapat mendeploy website landing page dan backend portal belajar **LMA – Lerne mit Andre** ke server VPS pribadi (DigitalOcean, Linode, AWS EC2, IDCloudHost, DomaiNesia, Niagahoster, dll) dengan aman, stabil, dan menggunakan domain HTTPS (SSL gratis).

---

## 📋 Ringkasan Arsitektur di VPS
* **OS:** Ubuntu 22.04 LTS / 24.04 LTS
* **Web Server & Reverse Proxy:** Nginx
* **Runtime Backend:** Node.js (v20 LTS / v22)
* **Process Manager:** PM2 (menjaga backend tetap berjalan 24/7 dan auto-restart jika VPS reboot)
* **Database:** MySQL / MariaDB (atau Mode File JSON bawaan)
* **Keamanan:** UFW Firewall & Let's Encrypt SSL (HTTPS gratis)

---

## 1. Persiapan Awal di VPS

Masuk ke VPS via Terminal / SSH:
```bash
ssh root@IP_VPS_ANDA
```

Update repositori paket server:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx software-properties-common
```

Nyalakan Firewall UFW agar aman:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable -y
```

---

## 2. Instalasi Node.js (LTS) & PM2

Install Node.js versi 20 LTS resmi dari NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Pastikan instalasi berhasil:
```bash
node -v   # Harusnya v20.x.x
npm -v    # Harusnya v10.x.x
```

Install PM2 secara global:
```bash
sudo npm install -g pm2
```

---

## 3. Instalasi & Konfigurasi Database MySQL

Install MariaDB / MySQL Server:
```bash
sudo apt install -y mariadb-server
sudo mysql_secure_installation
```

Masuk ke console MySQL untuk membuat database dan akun user:
```bash
sudo mysql -u root
```

Jalankan perintah SQL berikut di dalam prompt MySQL:
```sql
CREATE DATABASE lma_education_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'lma_user'@'localhost' IDENTIFIED BY 'PasswordRahasia123!';
GRANT ALL PRIVILEGES ON lma_education_db.* TO 'lma_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
*(Ganti `PasswordRahasia123!` dengan password database yang Anda tentukan).*

---

## 4. Clone Proyek dari GitHub ke VPS

Pindahkan ke direktori `/var/www/`:
```bash
cd /var/www
sudo git clone https://github.com/Nathanael04122002/LandingPage.git
sudo chown -R $USER:$USER /var/www/LandingPage
cd /var/www/LandingPage
```

---

## 5. Import Tabel Database (Schema SQL)

Import struktur tabel database LMA:
```bash
mysql -u lma_user -p lma_education_db < /var/www/LandingPage/my-backend/src/config/schema.sql
```
*(Masukkan password database yang telah dibuat sebelumnya).*

> 💡 **Catatan:** Jika Anda belum ingin memakai MySQL sekarang, backend LMA juga memiliki mode otomatis file JSON lokal yang dapat langsung berjalan tanpa MySQL!

---

## 6. Setup Backend & Environment Variables (`.env`)

Masuk ke folder backend dan install dependencies:
```bash
cd /var/www/LandingPage/my-backend
npm install --production
```

Buat dan sesuaikan file `.env`:
```bash
nano .env
```

Isi dengan konfigurasi VPS Anda:
```env
PORT=5000
NODE_ENV=production

JWT_SECRET=lma_secret_key_super_aman_2026_bali_education_token_99x
JWT_EXPIRES_IN=7d

# Jika menggunakan MySQL:
DB_DRIVER=mysql
DB_HOST=localhost
DB_USER=lma_user
DB_PASSWORD=PasswordRahasia123!
DB_NAME=lma_education_db
DB_PORT=3306

CLIENT_URL=https://domain-anda.com
```
Simpan dengan menekan `Ctrl + O`, lalu `Enter`, dan keluar dengan `Ctrl + X`.

---

## 7. Jalankan Backend dengan PM2

Jalankan server Node.js menggunakan PM2:
```bash
cd /var/www/LandingPage/my-backend
pm2 start ecosystem.config.js
```

Agar PM2 otomatis berjalan saat VPS restart/reboot:
```bash
pm2 save
pm2 startup
```
*(Salin dan jalankan perintah `sudo env PATH=...` yang dimunculkan oleh terminal jika diminta).*

Cek status backend:
```bash
pm2 status
pm2 logs lma-backend
```

---

## 8. Konfigurasi Nginx Web Server

Buat file konfigurasi Nginx untuk domain Anda:
```bash
sudo nano /etc/nginx/sites-available/lma
```

Salin konfigurasi berikut (ganti `domain-anda.com` dengan nama domain aktual Anda atau IP VPS):
```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    # Folder utama landing page & portal
    root /var/www/LandingPage;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend Reverse Proxy ke Node.js Express (Port 5000)
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Folder upload modul
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        expires 30d;
    }

    client_max_body_size 25M;
}
```

Aktifkan konfigurasi Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/lma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 9. Pasang SSL Gratis HTTPS (Certbot Let's Encrypt)

Pastikan Domain Anda sudah diarahkan (A-Record DNS) ke IP VPS Anda, lalu jalankan:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
```
Certbot akan otomatis memperbarui konfigurasi Nginx Anda menjadi HTTPS (`https://domain-anda.com`) dengan auto-renewal.

---

## 10. Verifikasi & Akun Bawaan

Buka browser dan akses:
1. **Website Utama:** `https://domain-anda.com`
2. **Portal Belajar Siswa:** `https://domain-anda.com/portal/login.html`
3. **Akun Bawaan (Default):**
   * **Akun Guru / Tutor LMA:**
     * Email: `andre@lma.id`
     * Password: `password123`
     * Fitur: Buat link Google Meet, terbitkan modul baru, rekap absensi & nilai kuis.
   * **Akun Siswa SD:**
     * Email: `budi@lma.id`
     * Password: `password123`
     * Fitur: Gabung Google Meet, baca modul, kerjakan kuis, 1-klik absen harian.

---

## 11. Perintah Pemeliharaan Harian
* **Restart Backend:** `pm2 restart lma-backend`
* **Melihat Log Real-time:** `pm2 logs`
* **Update Kode dari GitHub di VPS:**
  ```bash
  cd /var/www/LandingPage
  git pull origin main
  cd my-backend && npm install --production
  pm2 restart lma-backend
  ```
