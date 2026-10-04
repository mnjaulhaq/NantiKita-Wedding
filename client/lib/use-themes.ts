"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { THEMES, type Theme } from "@/lib/themes";

// Status tema terbaru dari server (admin bisa mengubahnya di /admin/templates).
// Sebelum data tiba, atau kalau server tidak terjangkau, dipakai daftar bawaan di atas.
export function useThemes(): Theme[] {
  const [themes, setThemes] = useState<Theme[]>(THEMES);

  useEffect(() => {
    fetch(`${API_URL}/api/themes`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const rows = json?.data as { key: string; status: string }[] | undefined;
        if (!rows) return;
        setThemes(
          THEMES.map((t) => {
            const row = rows.find((r) => r.key === t.key);
            return row && (row.status === "active" || row.status === "dummy")
              ? { ...t, status: row.status }
              : t;
          }),
        );
      })
      .catch(() => {});
  }, []);

  return themes;
}
