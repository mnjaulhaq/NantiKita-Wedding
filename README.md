# NantiKita — struktur baru (client & server terpisah)

Project ini sudah dipecah dari 1 project Next.js gabungan menjadi 2 project independen,
mengikuti pemisahan yang sama seperti backend Laravel + frontend terpisah sebelumnya:

```
nantikita/
├── server/   → Express + Prisma (REST API, port 4000)
│   ├── config/       # koneksi Prisma, mailer, daftar tema
│   ├── controllers/  # logic tiap endpoint (setara Controller Laravel)
│   ├── middlewares/  # requireAuth + helper JWT
│   ├── models/       # repository, pembungkus query Prisma per tabel
│   ├── routers/      # definisi route, tinggal panggil controller
│   ├── utils/        # generator PDF RSVP
│   ├── seeders/      # seed data awal (opsional)
│   ├── public/       # static assets
│   ├── prisma/       # schema.prisma + migrations
│   └── index.ts      # entry point
└── client/   → Next.js (UI saja, port 3000, tidak ada akses DB langsung)
    ├── app/          # halaman (App Router)
    ├── components/   # komponen reusable (form, shell admin, dsb)
    ├── lib/          # helper fetch ke API + auth token
    └── middleware.ts # proteksi rute /admin
```

## server/ (backend)

Port dari logic Laravel (`AuthController`, `WeddingController`, `RsvpController`,
`WeddingViewController`) mengikuti pola MVC: **routers** menerima request →
panggil **controllers** (logic) → controllers pakai **models** (query Prisma).

```bash
cd server
cp .env.example .env      # isi JWT_SECRET, dsb
npm install
npm install    # generate DB dari prisma/schema.prisma
npm run dev                # jalan di http://localhost:4000
```

Endpoint utama:

- `POST /api/auth/register|verify-otp|login|logout`, `GET /api/auth/me`
- `GET/POST /api/admin/weddings`, `GET/PUT/DELETE /api/admin/weddings/:id`
- `GET /api/admin/weddings/:id/rsvps`, `GET /api/admin/weddings/:id/pdf`
- `GET /api/admin/dashboard`, `GET /api/admin/rsvps`
- `GET /api/wedding/:slug`, `POST /api/wedding/:slug/rsvp`, `GET /api/themes`

Semua endpoint `/api/admin/*` wajib header `Authorization: Bearer <token>`
(kecuali link unduh PDF, yang boleh pakai `?token=`).

## client/ (frontend)

Next.js App Router, isinya cuma halaman (login, register, OTP, katalog, halaman
undangan tamu, dan admin panel). Tidak ada `src/app/api` lagi — semua data
diambil lewat `fetch` ke `server/`.

```bash
cd client
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL + JWT_SECRET (HARUS SAMA dgn server/.env)
npm install
npm run dev                         # jalan di http://localhost:3000
```

### Kenapa JWT_SECRET ada di kedua project?

Server menerbitkan token JWT saat login (dikirim di body response, disimpan
klien di cookie `nk_token`). `client/src/middleware.ts` perlu **memverifikasi**
tanda tangan token itu sendiri (untuk memproteksi rute `/admin/*`) tanpa
memanggil server — makanya butuh `JWT_SECRET` yang sama persis di kedua sisi.

### CORS

`server/.env` punya `CLIENT_ORIGIN` (default `http://localhost:3000`) yang
diizinkan lewat CORS. Ubah kalau deploy ke domain lain.

## Pemetaan fitur dari Laravel

| Laravel                                        | Server (Express)                                | Client (Next.js)                           |
| ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| `AuthController`                               | `routes/auth.ts`                                | `login/`, `register-admin/`, `verify-otp/` |
| `Admin/WeddingController`                      | `routes/admin.ts`                               | `admin/*`                                  |
| `WeddingViewController`                        | `GET /api/wedding/:slug` di `routes/wedding.ts` | `wedding/[slug]/page.tsx`                  |
| `RsvpController`                               | `POST /api/wedding/:slug/rsvp`                  | `wedding/[slug]/RsvpForm.tsx`              |
| `resources/views/katalog`                      | `themes.ts` (statis)                            | `katalog/page.tsx`                         |
| `resources/views/admin/weddings/pdf.blade.php` | `rsvp-pdf.tsx` (react-pdf)                      | link "Unduh PDF"                           |

## Catatan

- Tema undangan (`adatSunda`, `cinematic`, `floral_luxury`, `rustic`) di versi
  ini masih pakai 1 tampilan generik di `wedding/[slug]/page.tsx` — persis
  seperti kondisi sebelum dipisah. Kalau kamu mau tampilan tiap tema dibuat
  sepenuhnya sesuai desain Blade aslinya (styling detail per tema), itu
  pekerjaan lanjutan yang saya sarankan dikerjakan per-tema (satu per satu)
  supaya hasilnya presisi, bukan digabung sekaligus.
- Schema server menggunakan MySQL. Sesuaikan `DATABASE_URL` di `server/.env`
  dengan database lokalmu.
- Migration init lama masih memakai sintaks SQLite. Jangan jalankan
  `prisma migrate` ke MySQL sebelum riwayat migration dibaseline atau
  dikonversi; migration owner-only terbaru sudah memakai sintaks MySQL.
