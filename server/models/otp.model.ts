import { db } from "../config/db";

export function createOtp(data: { username: string; otpCode: string; expiresAt: Date }) {
  return db.otp.create({ data });
}

export function findLatestOtp(username: string) {
  return db.otp.findFirst({ where: { username }, orderBy: { createdAt: "desc" } });
}

export function deleteOtpsByUsername(username: string) {
  return db.otp.deleteMany({ where: { username } });
}
