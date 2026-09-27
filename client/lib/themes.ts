// Port dari config/themes.php (Laravel).
// Satu-satunya sumber kebenaran daftar tema. Tambah tema baru = tambah 1 entri di sini.
export const THEMES: Record<string, { label: string; status: "active" | "dummy" }> = {
  adatSunda: { label: "Adat Sunda", status: "active" },
  rustic: { label: "Rustic", status: "active" },
  cinematic: { label: "Cinematic", status: "active" },
  floral_luxury: { label: "Floral Luxury", status: "dummy" },
  modern: { label: "Modern", status: "dummy" },
  sage: { label: "Sage & Botanical", status: "dummy" },
  midnight: { label: "Midnight Romantic", status: "dummy" },
  japandi: { label: "Japandi", status: "dummy" },
};

export function themeOptions() {
  return Object.entries(THEMES).map(([key, v]) => ({
    key,
    label: v.status === "dummy" ? `${v.label} (Belum Siap)` : v.label,
    status: v.status,
  }));
}

export function isThemeActive(key: string) {
  return THEMES[key]?.status === "active";
}
