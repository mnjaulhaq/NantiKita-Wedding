import "dotenv/config";
import { db } from "../config/db.js";
// Pemakaian: npm run make-owner -- <username>
// Menjadikan user sebagai "owner" (bisa melihat & mengelola semua data klien).
async function main() {
    const username = process.argv[2];
    if (!username) {
        console.error("Pemakaian: npm run make-owner -- <username>");
        process.exit(1);
    }
    const user = await db.user.findUnique({ where: { username } });
    if (!user) {
        console.error(`User "${username}" tidak ditemukan.`);
        process.exit(1);
    }
    await db.user.update({ where: { id: user.id }, data: { role: "owner" } });
    console.log(`OK: ${username} sekarang owner.`);
}
main().finally(() => db.$disconnect());
