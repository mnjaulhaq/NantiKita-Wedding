// Kata kunci di kolom "Kepada Yth" yang membuka dashboard RSVP pengantin.
// Dipakai di GerbangTamu (input nama) dan wedding/[slug]/page.tsx (kalau diketik langsung di URL ?to=).
const CLIENT_KEYWORDS = ["admin", "client"];

export function isClientKeyword(value: string | undefined | null): boolean {
  return CLIENT_KEYWORDS.includes((value ?? "").trim().toLowerCase());
}

export function dataRsvpPath(slug: string): string {
  return `/wedding/${slug}/data-rsvp`;
}