import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";

const SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-secret-change-me");
if (!SECRET) throw new Error("JWT_SECRET wajib diset di production.");

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

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

// Middleware auth: hanya akun owner yang boleh masuk ke area aplikasi.
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  const session = token ? verifySession(token) : null;
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== "owner") return res.status(401).json({ message: "Unauthorized" });

  (req as Request & { user: typeof user }).user = user;
  next();
}

// Semua owner memiliki akses penuh ke seluruh data.
export function getScope(_req: Request): { userId?: number } {
  return {};
}
