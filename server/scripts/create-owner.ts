import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../config/db";

// Pemakaian:
// npm run create-owner -- <name> <username> <email> <password>
// Script ini hanya berjalan dari sisi server, bukan endpoint publik.
async function main() {
  const [name, username, email, password] = process.argv.slice(2);

  if (!name || !username || !email || !password) {
    console.error("Pemakaian: npm run create-owner -- <name> <username> <email> <password>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password minimal 8 karakter.");
    process.exit(1);
  }

  const [existingUsername, existingEmail] = await Promise.all([
    db.user.findUnique({ where: { username } }),
    db.user.findUnique({ where: { email } }),
  ]);

  if (existingUsername) {
    console.error(`Username "${username}" sudah terdaftar.`);
    process.exit(1);
  }

  if (existingEmail) {
    console.error(`Email "${email}" sudah terdaftar.`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  const owner = await db.user.create({
    data: {
      name,
      username,
      email,
      password: hashed,
      role: "owner",
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`OK: owner "${owner.username}" berhasil dibuat.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
