import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">NantiKita</h1>
      <p className="text-gray-600 max-w-md">
        Platform undangan pernikahan digital. Kelola undangan klien, lihat RSVP, dan cetak laporan kehadiran.
      </p>
      <div className="flex gap-4">
        <Link href="/katalog" className="px-5 py-2 rounded bg-black text-white">
          Lihat Katalog Tema
        </Link>
        <Link href="/login" className="px-5 py-2 rounded border border-black">
          Login Admin
        </Link>
      </div>
    </main>
  );
}
