// Pengganti config('themes') dari Laravel (config/themes.php).

// Isi dengan tema yang sama: key = nilai yang disimpan ke DB, status "active" = siap dipakai klien asli.

export type Theme = {
  key: string;
  label: string;
  status: "active" | "dummy";
};

export const THEMES: Theme[] = [
  { key: "adatSunda", label: "Adat Sunda", status: "active" },
  { key: "rustic", label: "Rustic", status: "active" },
  { key: "cinematic", label: "Cinematic", status: "active" },

  { key: "floral_luxury", label: "Floral Luxury", status: "dummy" },
  { key: "modern", label: "Modern", status: "dummy" },
  { key: "sage", label: "Sage & Botanical", status: "dummy" },
  { key: "midnight", label: "Midnight Romantic", status: "dummy" },
  { key: "japandi", label: "Japandi", status: "dummy" },
];

export function isThemeActive(key: string): boolean {
  const theme = THEMES.find((theme) => theme.key === key);

  return theme?.status === "active";
}