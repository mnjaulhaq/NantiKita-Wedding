export function rateLimit({ windowMs, max, key, message, errorField }) {
    const msg = message || "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    const hits = new Map();
    setInterval(() => {
        const now = Date.now();
        for (const [k, v] of hits)
            if (v.resetAt <= now)
                hits.delete(k);
    }, windowMs).unref();
    return (req, res, next) => {
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
                message: msg,
                ...(errorField && { errors: { [errorField]: [msg] } }),
            });
        }
        next();
    };
}