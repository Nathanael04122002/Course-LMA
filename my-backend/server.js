require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initDatabase } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Inisialisasi Database (MySQL atau JSON File Fallback)
    await initDatabase();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log('========================================================');
      console.log('🚀 LMA (Lerne mit Andre) Backend Server Berhasil Berjalan!');
      console.log(`📍 Lokasi: Bali, Indonesia`);
      console.log(`🌐 Server Port: http://localhost:${PORT}`);
      console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🎓 Portal Belajar: http://localhost:${PORT}/portal/login.html`);
      console.log('========================================================');
    });

    // Tangani graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🛑 Mematikan server LMA secara aman...');
      server.close(() => {
        console.log('✅ Server telah ditutup.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Gagal menjalankan server LMA:', error.message);
    process.exit(1);
  }
}

startServer();
