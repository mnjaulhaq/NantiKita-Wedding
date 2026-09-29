import { Request, Response, NextFunction } from "express";

// Rate limiter in-memory sederhana (tanpa dependency). Cukup untuk 1 instance server.
// Kalau nanti pakai banyak instance, ganti ke express-rate-limit + Redis.
type Opts = { windowMs: number; max: number; key?: (req: Request) => string; message?: string };

export function rateLimit({ windowMs, max, key, message }: Opts) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }, windowMs).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const k = key ? key(req) : req.ip || "unknown";
    const now = Date.now();
    const entry = hits.get(k);
    if (!entry || entry.resetAt <= now) {
      hits.set(k, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count++;
    if (entry.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({
        message: message || "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
        errors: { otp_code: [message || "Terlalu banyak percobaan. Coba lagi beberapa saat lagi."] },
      });
    }
    next();
  };
}
