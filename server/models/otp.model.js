import { db } from "../config/db.js";
export function createOtp(data) {
    return db.otp.create({ data: { ...data, createdAt: new Date() } });
}
export function findLatestOtp(username) {
    return db.otp.findFirst({ where: { username }, orderBy: { createdAt: "desc" } });
}
export function deleteOtpsByUsername(username) {
    return db.otp.deleteMany({ where: { username } });
}