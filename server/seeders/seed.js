import { db } from "../config/db.js";
// Seed contoh: tambahkan data awal di sini kalau perlu (mis. akun admin default).
// Jalankan lewat `npx prisma db seed`.
async function main() {
  console.log(
    "Tidak ada seed default. Tambahkan data awal di seeders/seed.js sesuai kebutuhan.",
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
