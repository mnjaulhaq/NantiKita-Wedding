import { notFound, redirect } from "next/navigation";
import { apiFetchServer } from "@/lib/api";
import { dataRsvpPath, isClientKeyword, undanganPath } from "@/lib/guest";
import RsvpForm from "@/components/RsvpForm";

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

// Halaman konfirmasi kehadiran yang sama untuk semua template.
// Setelah tamu mengisi data, RsvpForm menyimpan RSVP lalu mengarahkan ke
// /wedding/[slug]/undangan (surat undangan bertema).
export default async function WeddingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const res = await apiFetchServer(`/api/wedding/${slug}`);
  if (!res.ok) notFound();
  const { data: wedding } = (await res.json()) as { data: Wedding };

  const theme = sp.theme || "rustic";
  const paket = sp.paket || "basic";
  const toParam = sp.to;

  // Kata kunci pengantin yang diketik langsung di URL (?to=client) masuk ke dashboard RSVP.
  if (isClientKeyword(toParam)) redirect(dataRsvpPath(slug));

  // Mode demo katalog: langsung lihat template, tanpa mengisi RSVP (supaya tidak menyimpan data palsu).
  const isDariKatalog = !!sp.from_katalog || (toParam || "").toLowerCase() === "john doe";
  if (isDariKatalog) {
    redirect(undanganPath(slug, { theme, paket, to: "John Doe", from_katalog: true }));
  }

  // "NamaTamu" hanya placeholder di link yang dibuat admin, bukan nama sungguhan.
  const namaAwal = toParam && toParam !== "NamaTamu" ? toParam : undefined;

  return (
    <RsvpForm
      wedding={{
        slug: wedding.slug,
        namaPria: wedding.namaPria,
        namaWanita: wedding.namaWanita,
        tanggalAcara: wedding.tanggalAcara,
      }}
      theme={theme}
      paket={paket}
      namaAwal={namaAwal}
    />
  );
}
