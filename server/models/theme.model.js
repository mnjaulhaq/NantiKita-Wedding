import { db } from "../config/db.js";

export function listThemeSettings() {
  return db.themeSetting.findMany();
}

export function saveThemeStatus(key, status) {
  return db.themeSetting.upsert({
    where: { key },
    update: { status },
    create: { key, status },
  });
}

// { tema: jumlah undangan } untuk semua tema yang dipakai klien.
export async function countWeddingsByTheme() {
  const rows = await db.wedding.groupBy({ by: ["tema"], _count: { _all: true } });
  return Object.fromEntries(rows.map((r) => [r.tema, r._count._all]));
}
