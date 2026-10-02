# NantiKita Wedding

Platform undangan pernikahan digital: owner membuat undangan untuk klien, tamu mengisi RSVP dan ucapan, laporan kehadiran bisa diunduh sebagai PDF.

| Folder | Isi |
|---|---|
| `client/` | Next.js 16 + React 19 + Tailwind 4 (port 3000) |
| `server/` | Express 4 + Prisma 5 + MySQL (port 4000) |

## Menjalankan di komputer lokal

Prasyarat: Node.js 20+ dan MySQL (mis. Laragon/XAMPP) yang sudah menyala.

```bash
# 1. Server
cd server
cp .env.example .env          # lalu isi DATABASE_URL dan JWT_SECRET
npm install
npx prisma migrate deploy     # membuat tabel di database
npm run dev                   # http://localhost:4000  (cek: /health)

# 2. Client (terminal lain)
cd client
cp .env.local.example .env.local   # JWT_SECRET harus sama dengan server
npm install
npm run dev                        # http://localhost:3000
```

Buat database kosong bernama `nantikita_wedding` sebelum menjalankan `migrate deploy`.

### Akun owner pertama

Daftar lewat `/register-owner` (kode OTP dikirim ke email; kalau `SMTP_HOST` kosong, kode muncul di console server), atau buat langsung dari terminal:

```bash
cd server
npm run create-owner -- "Nama" username email@contoh.com passwordminimal8
```

## Alur kerja Git berdua

- Jangan commit `.env`, `.env.local`, `node_modules`, `dist`, atau dump `.sql`. Semuanya sudah ada di `.gitignore`.
- Setelah `git pull`, jalankan `npm install` di `server/` dan `client/` jika `package.json` berubah.
- Jika ada migrasi Prisma baru, jalankan `npx prisma migrate deploy` di `server/`.
- Kalau menambah kolom/tabel, ubah `schema.prisma` lalu `npx prisma migrate dev --name nama_perubahan` dan commit folder `prisma/migrations/`.

## Struktur singkat

- `server/models/` akses database, `controllers/` logika, `routers/` rute, `middlewares/` auth dan rate limit.
- `client/app/admin/` panel owner, `client/app/wedding/[slug]/` undangan untuk tamu, `client/app/katalog/` halaman katalog.