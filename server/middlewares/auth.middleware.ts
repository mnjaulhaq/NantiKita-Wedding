import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export type SessionPayload = {
  userId: number;
  username: string;
};

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

// Token pendek untuk jembatan antara /register -> /verify-otp (pengganti
// cookie session sementara "verify_username"/"verify_email" di versi Laravel/Next monolit).
export function signPendingVerification(username: string, email: string) {
  return jwt.sign({ username, email, purpose: "verify-otp" }, SECRET, { expiresIn: "10m" });
}

export function verifyPendingVerification(token: string): { username: string; email: string } | null {
  try {
    const payload = jwt.verify(token, SECRET) as { username: string; email: string; purpose: string };
    if (payload.purpose !== "verify-otp") return null;
    return { username: payload.username, email: payload.email };
  } catch {
    return null;
  }
}

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  // Fallback lewat query string, dipakai untuk link unduh langsung (mis. <a href=".../pdf?token=...">)
  // yang tidak bisa menyertakan header Authorization.
  const queryToken = req.query.token;
  if (typeof queryToken === "string") return queryToken;
  return null;
}

// Middleware setara `middleware('auth')` di Laravel. Menempelkan req.user kalau valid.
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  const session = token ? verifySession(token) : null;
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  (req as Request & { user: typeof user }).user = user;
  next();
}
