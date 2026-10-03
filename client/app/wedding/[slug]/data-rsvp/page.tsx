import Link from "next/link";
import { notFound } from "next/navigation";
import { Alex_Brush, Montserrat } from "next/font/google";
import { apiFetchServer } from "@/lib/api";
import { formatRelatif, formatTanggal } from "@/lib/format";
import DownloadRsvpPdf from "@/components/DownloadRsvpPdf";
import "@/components/gerbang-tamu.css";
import "@/components/rsvp.css";

// Dashboard RSVP untuk pengantin. Dibuka dari kolom nama dengan mengetik admin/client.
// Ini BUKAN panel admin NantiKita: tidak ada menu, edit, hapus, atau data klien lain.
// Tampilannya mengikuti halaman RSVP tamu (terang, krem & emas) dan memakai variabel --rv-*.

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

const CARD =
  "rounded-2xl border border-(--rv-border) bg-(--rv-card) backdrop-blur-xl shadow-[0_1px_2px_rgb(120_90_30/0.05),0_12px_32px_rgb(120_90_30/0.08)]";

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
      className={`rv-root ${alexBrush.variable} ${montserrat.variable} items-start! px-5 py-12 antialiased`}
    >
      <div className="rv-glow rv-glow-gold" />
      <div className="rv-glow rv-glow-sage" />

      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-10 text-center">
          <p className="rv-eyebrow">Data konfirmasi tamu</p>
          <h1 className="rv-title">
            {data.namaPria} &amp; {data.namaWanita}
          </h1>
          <p className="rv-date">{formatTanggal(data.tanggalAcara)}</p>
        </header>

        {/* Ringkasan: jumlah tamu hadir adalah angka yang paling dicari pengantin */}
        <section
          aria-label="Ringkasan RSVP"
          className="mb-10 grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]"
        >
          <div className={`${CARD} flex flex-col justify-between px-6 py-5`}>
            <p className="text-xs font-semibold tracking-widest text-(--rv-label) uppercase">
              Tamu akan hadir
            </p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="text-6xl leading-none font-bold tracking-tight text-(--rv-gold-dark) tabular-nums">
                {totalHadir}
              </span>
              <span className="text-sm font-medium text-(--rv-muted)">orang</span>
            </p>
          </div>
          <div className={`${CARD} flex flex-col justify-between px-6 py-5`}>
            <p className="text-xs font-semibold tracking-widest text-(--rv-muted) uppercase">
              Berhalangan
            </p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl leading-none font-bold tabular-nums">{totalTidakHadir}</span>
              <span className="text-sm font-medium text-(--rv-muted)">tamu</span>
            </p>
          </div>
          <div className={`${CARD} flex flex-col justify-between px-6 py-5`}>
            <p className="text-xs font-semibold tracking-widest text-(--rv-muted) uppercase">
              Total konfirmasi
            </p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl leading-none font-bold tabular-nums">{data.rsvps.length}</span>
              <span className="text-sm font-medium text-(--rv-muted)">tamu</span>
            </p>
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold tracking-widest text-(--rv-label) uppercase">
            Daftar Tamu
          </h2>
          <DownloadRsvpPdf
            data={{
              namaPria: data.namaPria,
              namaWanita: data.namaWanita,
              tanggalAcara: formatTanggal(data.tanggalAcara),
              rsvps: data.rsvps.map((r) => ({
                namaTamu: r.namaTamu,
                alamat: r.alamat,
                status: r.status,
                jumlahHadir: r.jumlahHadir,
                ucapan: r.ucapan,
              })),
            }}
          />
        </div>

        {data.rsvps.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-(--rv-border) px-6 py-10 text-center text-sm text-(--rv-muted)">
            Belum ada tamu yang mengirim konfirmasi. Data akan muncul di sini setelah tamu mengisi RSVP.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.rsvps.map((r) => (
              <li key={r.id} className={`${CARD} px-5 py-4`}>
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-(--rv-gold)/15 text-sm font-bold text-(--rv-gold-dark) uppercase"
                  >
                    {r.namaTamu.trim().charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">{r.namaTamu}</p>
                        <p className="text-xs text-(--rv-muted)">{r.alamat}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                            r.status === "hadir"
                              ? "bg-(--rv-gold)/15 text-(--rv-gold-dark)"
                              : "bg-black/5 text-(--rv-muted)"
                          }`}
                        >
                          {r.status === "hadir" ? `Hadir, ${r.jumlahHadir} orang` : "Berhalangan"}
                        </span>
                        <p className="mt-1 text-xs text-(--rv-muted)">{formatRelatif(r.createdAt)}</p>
                      </div>
                    </div>
                    {r.ucapan && (
                      <p className="mt-3 border-l-2 border-(--rv-gold)/50 pl-3 text-sm leading-relaxed">
                        {r.ucapan}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 text-center">
          <Link
            href={`/wedding/${data.slug}`}
            className="text-sm font-medium text-(--rv-label) underline-offset-4 hover:text-(--rv-gold-dark) hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--rv-gold-dark)"
          >
            Kembali ke undangan
          </Link>
        </div>
      </div>
    </main>
  );
}
