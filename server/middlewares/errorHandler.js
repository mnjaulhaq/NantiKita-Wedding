export function errorHandler(error, req, res, next) {
  console.error(`Request ${req.method} ${req.originalUrl} failed:`, error);

  if (res.headersSent) return next(error);

  if (error?.code === "P1001") {
    return res.status(503).json({
      message: "Layanan sedang mengalami gangguan. Silakan coba lagi beberapa saat lagi.",
    });
  }

  return res.status(500).json({ message: "Terjadi kesalahan pada server." });
}
