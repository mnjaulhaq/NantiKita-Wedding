// Pengganti Carbon (translatedFormat / format / diffForHumans) di Blade.
const LOCALE = "id-ID";

function toDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

// tanggal_acara adalah tanggal murni (tanpa jam), jadi diformat pakai UTC supaya tidak geser hari.
export function formatTanggal(iso: string) {
  const d = toDate(iso);
  if (!d) return "-";
  return new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

export function formatTanggalPendek(iso: string) {
  const d = toDate(iso);
  if (!d) return "-";
  return new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}

export function formatRelatif(iso: string) {
  const d = toDate(iso);
  if (!d) return "-";
  const diff = (d.getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
  for (const [unit, sec] of units) {
    if (Math.abs(diff) >= sec) return rtf.format(Math.round(diff / sec), unit);
  }
  return "baru saja";
}

export function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}
