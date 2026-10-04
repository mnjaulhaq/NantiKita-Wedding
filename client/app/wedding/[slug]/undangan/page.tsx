import { notFound } from "next/navigation";
import { apiFetchServer } from "@/lib/api";
import { isThemeActive } from "@/lib/themes";
import UcapanForm from "@/components/UcapanForm";
import MinimalistTemplate from "@/components/templates/minimalist";
import { DEMO_WEDDING } from "@/lib/marketing";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

type Wedding = {
  id: string;
  namaPria: string;
  namaWanita: string;
  tanggalAcara: string;
  lokasiAcara: string;
  slug: string;
  musikUrl?: string | null;  
};

// Halaman surat undangan: tujuan redirect setelah tamu mengisi RSVP.
// Tampilan per tema dipasang di sini (pilih komponen berdasarkan `theme`).
export default async function UndanganPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const isDariKatalog = !!sp.from_katalog;

  let wedding: Wedding;
  if (isDariKatalog) {
    wedding = DEMO_WEDDING;
  } else {
    const res = await apiFetchServer(`/api/wedding/${slug}`);
    if (!res.ok) notFound();
    const response = (await res.json()) as { data: Wedding };
    wedding = response.data;
  }

  const theme = sp.theme || "rustic";
  const tamu = sp.to || "Tamu Undangan";
  // Status terbaru dari server (admin bisa mengubahnya); jatuh ke daftar bawaan kalau gagal.
  let themeReady = isThemeActive(theme);
  try {
    const tr = await apiFetchServer("/api/themes");
    const rows = tr.ok ? ((await tr.json()).data as { key: string; status: string }[]) : [];
    const row = rows.find((r) => r.key === theme);
    if (row) themeReady = row.status === "active";
  } catch {
    /* pakai status bawaan */
  }
  // Demo katalog: tidak ada RSVP, jadi tidak ada ucapan.

  // TODO: render template tema di sini, mis.
  //   if (theme === "cinematic") return <CinematicTemplate wedding={wedding} tamu={tamu} />;
  // Selama template belum dipasang, tampilkan kerangka sementara di bawah.
  if (theme === "floral_luxury") {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto space-y-8">
        {!themeReady && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm p-3 rounded">
            Tema &quot;{theme}&quot; sedang disiapkan. Menampilkan tampilan sementara.
          </div>
        )}

        <section className="text-center space-y-2">
          <p className="uppercase tracking-widest text-sm text-gray-500">The Wedding of</p>
          <h1 className="text-3xl font-bold">
            {wedding.namaPria} &amp; {wedding.namaWanita}
          </h1>
          <p className="text-gray-600">
            {new Date(wedding.tanggalAcara).toLocaleDateString("id-ID", {
              dateStyle: "full",
              timeZone: "UTC",
            })}
          </p>
          <p className="text-gray-600">{wedding.lokasiAcara}</p>
          <p className="mt-4 text-sm text-gray-500">Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <p className="font-semibold">{tamu}</p>
        </section>

        {/* Ucapan ditulis tamu di dalam surat undangan. Pindahkan ke bagian "Ucapan" di template tema. */}
        {!isDariKatalog && (
          <section>
            <UcapanForm slug={wedding.slug} nama={tamu} />
          </section>
        )}
      </main>
    );
  }

  if (theme === "minimalist") {
    return (
      <MinimalistTemplate wedding={wedding} tamu={tamu} themeReady={themeReady} isDariKatalog={isDariKatalog} />
    );
  }

  // Tema lain: tampilkan kerangka sementara.
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto space-y-8">
      {!themeReady && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm p-3 rounded">
          Tema &quot;{theme}&quot; sedang disiapkan. Menampilkan tampilan sementara.
        </div>
      )}

      <section className="text-center space-y-2">
        <p className="uppercase tracking-widest text-sm text-gray-500">The Wedding of</p>
        <h1 className="text-3xl font-bold">
          {wedding.namaPria} &amp; {wedding.namaWanita}
        </h1>
        <p className="text-gray-600">
          {new Date(wedding.tanggalAcara).toLocaleDateString("id-ID", {
            dateStyle: "full",
            timeZone: "UTC",
          })}
        </p>
        <p className="text-gray-600">{wedding.lokasiAcara}</p>
        <p className="mt-4 text-sm text-gray-500">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p className="font-semibold">{tamu}</p>
      </section>

      {/* Ucapan ditulis tamu di dalam surat undangan. Pindahkan ke bagian "Ucapan" di template tema. */}
      {!isDariKatalog && (
        <section>
          <UcapanForm slug={wedding.slug} nama={tamu} />
        </section>
      )}
    </main>
  );
}
