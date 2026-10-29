// Middleware penanganan route 404 Not Found
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Endpoint API '${req.originalUrl}' tidak ditemukan pada server LMA.`
  });
}

// Middleware penanganan error global 500
function errorHandler(err, req, res, next) {
  console.error('🔥 [Server Error]', err);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server LMA.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
