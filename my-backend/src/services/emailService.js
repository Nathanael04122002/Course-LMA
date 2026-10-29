const path = require('path');

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Graceful fallback jika nodemailer belum di-install di environment lokal
}

// Konfigurasi Transporter SMTP
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!nodemailer || !host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: user,
      pass: pass
    }
  });
}

const EmailService = {
  /**
   * Kirim Email Selamat Datang ke Siswa yang Mendaftar Mandiri
   */
  async sendWelcomeEmail(studentEmail, studentName, studentKelas) {
    const portalUrl = (process.env.CLIENT_URL || 'http://localhost:8000') + '/portal/login.html';
    const fromSender = process.env.SMTP_FROM || '"LMA – Lerne mit Andre" <admin@lma.id>';

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0F3C9B 0%, #1A56DB 100%); padding: 30px 25px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">LMA – Lerne mit Andre</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Open Class Online Bahasa Jerman & Matematika SD (Bali, Indonesia)</p>
        </div>

        <div style="padding: 30px 25px; color: #1A202C;">
          <h2 style="font-size: 20px; color: #1A56DB; margin-top: 0;">Willkommen & Selamat Datang, ${studentName}! 👋</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #4A5568;">
            Pendaftaran akun belajarmu di <strong>LMA – Lerne mit Andre</strong> telah berhasil. Sekarang kamu sudah bisa mengakses seluruh modul pembelajaran, jadwal Live Google Meet kelas online, kuis seru berhadiah bintang, dan absensi kehadiran.
          </p>

          <div style="background: #F8FAFC; border-left: 4px solid #1A56DB; padding: 15px 20px; margin: 25px 0; border-radius: 6px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Rincian Akun Belajar Anda:</strong></p>
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #4A5568;">Nama Siswa: <strong>${studentName}</strong></p>
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #4A5568;">Email Login: <strong>${studentEmail}</strong></p>
            <p style="margin: 0; font-size: 14px; color: #4A5568;">Program Kelas: <strong>${studentKelas || 'Bahasa Jerman & Matematika SD'}</strong></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" style="background: #1A56DB; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              Masuk ke Portal Belajar Siswa &rarr;
            </a>
          </div>

          <p style="font-size: 14px; color: #718096; line-height: 1.5;">
            Jika ada kendala saat masuk akun atau pertanyaan seputar jadwal kelas, silakan hubungi tim kami via WhatsApp di <strong>+62 821-3132-576</strong>.
          </p>
        </div>

        <div style="background: #EDF2F7; padding: 15px 25px; text-align: center; font-size: 12px; color: #718096;">
          &copy; ${new Date().getFullYear()} LMA – Lerne mit Andre &bull; Bali, Indonesia. Semua hak cipta dilindungi.
        </div>
      </div>
    `;

    const transporter = getTransporter();

    if (!transporter) {
      console.log('========================================================');
      console.log(`📧 [EMAIL SERVICE - SIMULASI/OFFLINE] Welcome Email Terkirim ke: ${studentEmail}`);
      console.log(`👤 Nama Siswa: ${studentName} | Kelas: ${studentKelas}`);
      console.log(`🔗 Link Portal: ${portalUrl}`);
      console.log('💡 Note: Untuk mengirim email sungguhan di VPS, atur SMTP_HOST, SMTP_USER, SMTP_PASS di .env');
      console.log('========================================================');
      return { success: true, simulated: true };
    }

    try {
      const info = await transporter.sendMail({
        from: fromSender,
        to: studentEmail,
        subject: `🎉 Selamat Datang di LMA, ${studentName}! Akun Belajar Kamu Sudah Aktif`,
        html: htmlContent
      });
      console.log(`✅ [EMAIL SERVICE] Welcome email berhasil dikirim ke ${studentEmail} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`⚠️ [EMAIL SERVICE] Gagal mengirim email via SMTP (${err.message}). Registrasi siswa tetap berhasil.`);
      return { success: false, error: err.message };
    }
  },

  /**
   * Kirim Email Ketika Akun Dibuatkan oleh Guru dari Panel Guru
   */
  async sendAccountCreatedByTeacherEmail(studentEmail, studentName, studentKelas, tempPassword) {
    const portalUrl = (process.env.CLIENT_URL || 'http://localhost:8000') + '/portal/login.html';
    const fromSender = process.env.SMTP_FROM || '"LMA – Lerne mit Andre" <admin@lma.id>';

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0F3C9B 0%, #1A56DB 100%); padding: 30px 25px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">LMA – Lerne mit Andre</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Akun Portal Belajar Resmi Siswa</p>
        </div>

        <div style="padding: 30px 25px; color: #1A202C;">
          <h2 style="font-size: 20px; color: #1A56DB; margin-top: 0;">Hallo, ${studentName}! 👋</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #4A5568;">
            Guru / Tutor kamu di <strong>LMA Bali (Kak Andre)</strong> telah mendaftarkan akun belajarmu di portal pembelajaran LMA. Berikut adalah data akses login akunmu:
          </p>

          <div style="background: #FEFCBF; border: 1px solid #ECC94B; border-radius: 8px; padding: 18px 22px; margin: 25px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #744210;"><strong>🔑 Data Akses Login Kamu:</strong></p>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #744210;">Email: <strong>${studentEmail}</strong></p>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #744210;">Password Awal: <strong style="background: #ffffff; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 15px;">${tempPassword}</strong></p>
            <p style="margin: 0; font-size: 14px; color: #744210;">Program: <strong>${studentKelas || 'Bahasa Jerman & Matematika SD'}</strong></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" style="background: #1A56DB; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              Login ke Portal Belajar Sekarang &rarr;
            </a>
          </div>

          <p style="font-size: 13px; color: #718096; line-height: 1.5;">
            *Kamu dapat mengganti password kapan saja di profilmu setelah berhasil masuk.
          </p>
        </div>

        <div style="background: #EDF2F7; padding: 15px 25px; text-align: center; font-size: 12px; color: #718096;">
          &copy; ${new Date().getFullYear()} LMA – Lerne mit Andre &bull; Hubungi WA: +62 821-3132-576
        </div>
      </div>
    `;

    const transporter = getTransporter();

    if (!transporter) {
      console.log('========================================================');
      console.log(`📧 [EMAIL SERVICE - SIMULASI/OFFLINE] Akun Dibuat Guru untuk: ${studentEmail}`);
      console.log(`👤 Nama Siswa: ${studentName} | Password: ${tempPassword}`);
      console.log(`🔗 Link Login: ${portalUrl}`);
      console.log('========================================================');
      return { success: true, simulated: true };
    }

    try {
      const info = await transporter.sendMail({
        from: fromSender,
        to: studentEmail,
        subject: `🔑 Akun Portal Belajar LMA Anda Telah Dibuat oleh Guru`,
        html: htmlContent
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`⚠️ [EMAIL SERVICE] Gagal kirim email akun baru (${err.message})`);
      return { success: false, error: err.message };
    }
  }
};

module.exports = EmailService;
