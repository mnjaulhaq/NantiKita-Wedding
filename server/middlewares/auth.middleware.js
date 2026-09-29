import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
const SECRET = process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "dev-secret-change-me");
if (!SECRET)
    throw new Error("JWT_SECRET wajib diset di production.");
export function signSession(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}
export function verifySession(token) {
    try {
        const payload = jwt.verify(token, SECRET);
        if (typeof payload !== "object" || payload === null)
            return null;
        if ((typeof payload.userId !== "string" &&
            typeof payload.userId !== "number") ||
            typeof payload.username !== "string") {
            return null;
        }
        const userId = BigInt(payload.userId);
        if (userId <= 0n)
            return null;
        return { userId: userId.toString(), username: payload.username };
    }
    catch {
        return null;
    }
}
function getBearerToken(req) {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer "))
        return header.slice(7);
    return null;
}
// Middleware auth: hanya akun owner yang boleh masuk ke area aplikasi.
export async function requireAuth(req, res, next) {
    const token = getBearerToken(req);
    const session = token ? verifySession(token) : null;
    if (!session)
        return res.status(401).json({ message: "Unauthorized" });
    const user = await db.user.findUnique({
        where: { id: BigInt(session.userId) },
    });
    if (!user || user.role !== "owner")
        return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
}
// Semua owner memiliki akses penuh ke seluruh data.
export function getScope(_req) {
    return {};
}
