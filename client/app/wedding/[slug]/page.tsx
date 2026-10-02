import { notFound, redirect } from "next/navigation";
import { apiFetchServer } from "@/lib/api";
import { isThemeActive } from "@/lib/themes";
import { dataRsvpPath, isClientKeyword } from "@/lib/guest";
import RsvpForm from "@/components/RsvpForm";
import GerbangTamu from "@/components/GerbangTamu";

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
};

export default async function WeddingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const res = await apiFetchServer(`/api/wedding/${slug}`);
  if (!res.ok) notFound();
  const { data: wedding } = (await res.json()) as { data: Wedding };

  const theme = sp.theme || "rustic";
  const paket = sp.paket || "basic";
  const tamuDariUrl = sp.to;

  // Kata kunci pengantin yang diketik langsung di URL (?to=client) juga masuk ke dashboard RSVP,
  // bukan ditampilkan sebagai nama tamu di cover.
  if (isClientKeyword(tamuDariUrl)) redirect(dataRsvpPath(slug));

  const isDariKatalog = !!sp.from_katalog || (tamuDariUrl || "").toLowerCase() === "john doe";

  // Kalau dibuka lewat link generate admin (tanpa parameter tamu) dan bukan mode demo katalog,
  // tampilkan halaman "gerbang depan" tempat tamu mengetik namanya sendiri.
  if (!isDariKatalog && (!tamuDariUrl || tamuDariUrl === "NamaTamu")) {
    return (
      <GerbangTamu
        wedding={{
          id: wedding.id,
          slug: wedding.slug,
          namaPria: wedding.namaPria,
          namaWanita: wedding.namaWanita,
          tanggalAcara: wedding.tanggalAcara,
        }}
        theme={theme}
        paket={paket}
      />
    );
  }

  const tamuFinal = isDariKatalog ? "John Doe" : tamuDariUrl!;
  const themeReady = isThemeActive(theme);

  // Data dari halaman gerbang (asal, status, jumlah_hadir) dipakai untuk mengisi form RSVP.
  const jumlahAwal = Number(sp.jumlah_hadir);
  const initialRsvp = isDariKatalog
    ? undefined
    : {
        nama_tamu: tamuFinal,
        alamat: sp.asal ?? "",
        status: sp.status === "hadir" || sp.status === "tidak_hadir" ? sp.status : undefined,
        jumlah_hadir:
          Number.isInteger(jumlahAwal) && jumlahAwal >= 1 && jumlahAwal <= 10 ? jumlahAwal : undefined,
      };

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
          {new Date(wedding.tanggalAcara).toLocaleDateString("id-ID", { dateStyle: "full" })}
        </p>
        <p className="text-gray-600">{wedding.lokasiAcara}</p>
        <p className="mt-4 text-sm text-gray-500">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p className="font-semibold">{tamuFinal}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Konfirmasi Kehadiran</h2>
        <RsvpForm slug={wedding.slug} initial={initialRsvp} />
      </section>
    </main>
  );
}