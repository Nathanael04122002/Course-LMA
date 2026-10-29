const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lma_secret_key_super_aman_2026_bali_education_token_99x';

// Middleware verifikasi token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.'
    });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Sesi login telah kedaluwarsa atau token tidak valid. Silakan login ulang.'
    });
  }
}

// Middleware pengecekan hak akses Role (misal: 'guru', 'admin')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna belum terautentikasi.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Fitur ini hanya dapat diakses oleh peran: ${roles.join(' atau ')}.`
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireRole
};
