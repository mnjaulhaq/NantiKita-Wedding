import { listThemeSettings } from "../models/theme.model.js";

// Satu-satunya sumber kebenaran daftar tema. Tambah tema baru = tambah 1 entri di sini.
export const THEMES = {
    adatSunda: { label: "Adat Sunda", status: "active" },
    rustic: { label: "Rustic", status: "active" },
    cinematic: { label: "Cinematic", status: "active" },
    minimalist: { label: "Minimalist", status: "active" },
    floral_luxury: { label: "Floral Luxury", status: "dummy" },
    modern: { label: "Modern", status: "dummy" },
    sage: { label: "Sage & Botanical", status: "dummy" },
    midnight: { label: "Midnight Romantic", status: "dummy" },
    japandi: { label: "Japandi", status: "dummy" },
};

export const THEME_STATUSES = ["active", "dummy"];

// Gabungan status bawaan (THEMES) dan perubahan admin dari tabel theme_settings.
export async function resolveThemes() {
    const overrides = Object.fromEntries((await listThemeSettings()).map((r) => [r.key, r.status]));
    return Object.entries(THEMES).map(([key, v]) => ({
        key,
        title: v.label,
        status: THEME_STATUSES.includes(overrides[key]) ? overrides[key] : v.status,
        defaultStatus: v.status,
    }));
}