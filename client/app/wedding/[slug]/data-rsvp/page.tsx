import Link from "next/link";
import { notFound } from "next/navigation";
import { Alex_Brush, Montserrat } from "next/font/google";
import { apiFetchServer } from "@/lib/api";
import { formatRelatif, formatTanggal } from "@/lib/format";
import "@/components/gerbang-tamu.css";

// Dashboard RSVP untuk pengantin. Dibuka dari kolom "Kepada Yth" dengan mengetik admin/client.
// Ini BUKAN panel admin NantiKita: tidak ada menu, edit, hapus, atau data klien lain.

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alex-brush",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-gt-montserrat",
  display: "swap",
});

type Rsvp = {
  id: string;
  namaTamu: string;
  alamat: string;
  status: "hadir" | "tidak_hadir";
  jumlahHadir: number;
  ucapan: string | null;
  createdAt: string;
};

type WeddingRsvps = {
  slug: string;
  namaPria: string;
  namaWanita: string;
  tanggalAcara: string;
  rsvps: Rsvp[];
};

export default async function DataRsvpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const res = await apiFetchServer(`/api/wedding/${slug}/rsvps`);
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Data RSVP gagal dimuat.");
  const { data } = (await res.json()) as { data: WeddingRsvps };

  const totalHadir = data.rsvps
    .filter((r) => r.status === "hadir")
    .reduce((sum, r) => sum + r.jumlahHadir, 0);
  const totalTidakHadir = data.rsvps.filter((r) => r.status === "tidak_hadir").length;

  return (
    <main
      className={`gt-root ${alexBrush.variable} ${montserrat.variable} relative isolate min-h-screen overflow-hidden bg-[#0d0f12] px-5 py-12 text-[#e2e8f0] antialiased`}
    >
      <div className="absolute top-[-20%] left-[-20%] -z-10 h-[500px] w-[500px] rounded-full bg-linear-to-tr from-[#d4af37]/10 to-transparent blur-[120px]" />

      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-widest text-[#c5a880]">
            Data konfirmasi tamu
          </p>
          <h1 className="gt-script mt-2 bg-linear-to-b from-[#f9f5e8] via-[#dfba6b] to-[#b89742] bg-clip-text text-5xl text-transparent md:text-6xl">
            {data.namaPria} &amp; {data.namaWanita}
          </h1>
          <p className="mt-3 text-sm text-[#c5a880]">{formatTanggal(data.tanggalAcara)}</p>
        </header>

        {/* Ringkasan: jumlah tamu hadir adalah angka yang paling dicari pengantin */}
        <section
          aria-label="Ringkasan RSVP"
          className="mb-8 rounded-2xl border border-white/10 bg-black/40 px-6 py-6 backdrop-blur-xl"
        >
          <p className="text-sm text-gray-400">Tamu yang akan hadir</p>
          <p className="gt-script mt-1 text-6xl leading-none text-[#dfba6b]">
            {totalHadir}
            <span className="ml-2 font-sans text-base text-gray-400">orang</span>
          </p>
          <dl className="mt-5 flex gap-8 border-t border-white/10 pt-4 text-sm">
            <div>
              <dt className="text-gray-400">Berhalangan hadir</dt>
              <dd className="mt-0.5 text-lg font-semibold text-white">{totalTidakHadir} tamu</dd>
            </div>
            <div>
              <dt className="text-gray-400">Total konfirmasi</dt>
              <dd className="mt-0.5 text-lg font-semibold text-white">{data.rsvps.length}</dd>
            </div>
          </dl>
        </section>

        {data.rsvps.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center text-sm text-gray-400">
            Belum ada tamu yang mengirim konfirmasi. Data akan muncul di sini setelah tamu mengisi RSVP.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.rsvps.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{r.namaTamu}</p>
                    <p className="text-xs text-gray-400">{r.alamat}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                        r.status === "hadir"
                          ? "bg-[#dfba6b]/15 text-[#dfba6b]"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {r.status === "hadir" ? `Hadir, ${r.jumlahHadir} orang` : "Berhalangan"}
                    </span>
                    <p className="mt-1 text-xs text-gray-500">{formatRelatif(r.createdAt)}</p>
                  </div>
                </div>
                {r.ucapan && (
                  <p className="mt-3 border-l-2 border-[#dfba6b]/40 pl-3 text-sm leading-relaxed text-gray-300">
                    {r.ucapan}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 text-center">
          <Link
            href={`/wedding/${data.slug}`}
            className="text-sm text-[#c5a880] underline-offset-4 hover:text-[#dfba6b] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dfba6b]"
          >
            Kembali ke undangan
          </Link>
        </div>
      </div>
    </main>
  );
}