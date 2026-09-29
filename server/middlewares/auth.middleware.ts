import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";

const SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "dev-secret-change-me");
if (!SECRET) throw new Error("JWT_SECRET wajib diset di production.");

export type SessionPayload = {
  userId: string;
  username: string;
};

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const payload = jwt.verify(token, SECRET);
    if (typeof payload !== "object" || payload === null) return null;
    if (
      (typeof payload.userId !== "string" &&
        typeof payload.userId !== "number") ||
      typeof payload.username !== "string"
    ) {
      return null;
    }

    const userId = BigInt(payload.userId);
    if (userId <= 0n) return null;
    return { userId: userId.toString(), username: payload.username };
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
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = getBearerToken(req);
  const session = token ? verifySession(token) : null;
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const user = await db.user.findUnique({
    where: { id: BigInt(session.userId) },
  });
  if (!user || user.role !== "owner")
    return res.status(401).json({ message: "Unauthorized" });

  (req as Request & { user: typeof user }).user = user;
  next();
}

// Semua owner memiliki akses penuh ke seluruh data.
export function getScope(_req: Request): { userId?: bigint } {
  return {};
}
