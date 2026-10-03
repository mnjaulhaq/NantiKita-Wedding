// Kata kunci di kolom nama (form RSVP) yang membuka dashboard RSVP pengantin.
// Dipakai di RsvpForm dan wedding/[slug]/page.tsx (kalau diketik langsung di URL ?to=).
const CLIENT_KEYWORDS = ["admin", "client"];

export function isClientKeyword(value: string | undefined | null): boolean {
  return CLIENT_KEYWORDS.includes((value ?? "").trim().toLowerCase());
}

export function dataRsvpPath(slug: string): string {
  return `/wedding/${slug}/data-rsvp`;
}

// Halaman surat undangan (tempat template tema ditampilkan), dibuka setelah tamu mengisi RSVP.
export function undanganPath(
  slug: string,
  params: { theme: string; paket: string; to?: string; from_katalog?: boolean },
): string {
  const qs = new URLSearchParams({ theme: params.theme, paket: params.paket });
  if (params.to) qs.set("to", params.to);
  if (params.from_katalog) qs.set("from_katalog", "true");
  return `/wedding/${slug}/undangan?${qs.toString()}`;
}
