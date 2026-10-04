"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { errorPopup, successPopup } from "@/lib/alert";
import { THEMES } from "@/lib/themes";
import { useThemes } from "@/lib/use-themes";

export type WeddingFormValues = {
  nama_pria: string;
  nama_wanita: string;
  tanggal_acara: string;
  lokasi_acara: string;
  paket: "basic" | "premium";
  tema: string;
  musik_url?: string;
};

type Props = {
  mode: "create" | "edit";
  weddingId?: number;
  initial?: Partial<WeddingFormValues>;
};

// Gaya field & tombol ada di components/admin.css (adm-*), mengikuti desain login.

export default function WeddingForm({ mode, weddingId, initial }: Props) {
  const router = useRouter();
  const themes = useThemes();
  const isCreate = mode === "create";
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<WeddingFormValues>({
    nama_pria: "",
    nama_wanita: "",
    tanggal_acara: "",
    lokasi_acara: "",
    paket: "basic",
    tema: THEMES[0]?.key ?? "",
    musik_url: "",
    ...initial,
  });

  function set<K extends keyof WeddingFormValues>(key: K, value: WeddingFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // ASUMSI: endpoint & body snake_case. Sesuaikan dengan API-mu / WeddingForm yang sudah ada.
      const res = await apiFetch(isCreate ? "/api/admin/weddings" : `/api/admin/weddings/${weddingId}`, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request gagal");
      await successPopup(isCreate ? "Undangan berhasil dibuat." : "Data undangan berhasil diperbarui.");
      router.push("/admin/weddings");
    } catch {
      await errorPopup("Data belum bisa disimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <section className="adm-section">
        <h3>Data pengantin</h3>
        <p>Nama yang akan tampil di undangan.</p>
        <div className="adm-form-grid" style={{ marginBottom: 0 }}>
          <div className="adm-field">
            <label htmlFor="nama_pria" className="adm-label">Nama pengantin pria</label>
            <input id="nama_pria" type="text" required value={values.nama_pria} onChange={(e) => set("nama_pria", e.target.value)}
              placeholder={isCreate ? "Contoh: Andi" : undefined} className="adm-input" />
          </div>
          <div className="adm-field">
            <label htmlFor="nama_wanita" className="adm-label">Nama pengantin wanita</label>
            <input id="nama_wanita" type="text" required value={values.nama_wanita} onChange={(e) => set("nama_wanita", e.target.value)}
              placeholder={isCreate ? "Contoh: Siti" : undefined} className="adm-input" />
          </div>
        </div>
      </section>

      <section className="adm-section">
        <h3>Acara</h3>
        <p>Kapan dan di mana pernikahan berlangsung.</p>
        <div className="adm-field" style={{ marginBottom: 20, maxWidth: 320 }}>
          <label htmlFor="tanggal_acara" className="adm-label">Tanggal pernikahan</label>
          <input id="tanggal_acara" type="date" required value={values.tanggal_acara} onChange={(e) => set("tanggal_acara", e.target.value)} className="adm-input" />
        </div>
        <div className="adm-field">
          <label htmlFor="lokasi_acara" className="adm-label">Lokasi acara / alamat lengkap</label>
          <textarea id="lokasi_acara" rows={3} required value={values.lokasi_acara} onChange={(e) => set("lokasi_acara", e.target.value)}
            placeholder={isCreate ? "Gedung Sasana Budaya, Jl. Merdeka No. 12, Jakarta" : undefined} className="adm-input" />
        </div>
      </section>

      <section className="adm-section">
        <h3>Paket</h3>
        <p>Pilih fitur yang didapat klien.</p>
        <div className="adm-choices two">
          {([
            ["basic", "Basic", "Standar"],
            ["premium", "Premium", "Fitur lengkap + custom name guest"],
          ] as const).map(([val, title, desc]) => (
            <label key={val} className={`adm-choice${values.paket === val ? " on" : ""}`}>
              <input type="radio" name="paket" value={val} required checked={values.paket === val} onChange={() => set("paket", val)} />
              <b>{title}</b>
              <small>{desc}</small>
            </label>
          ))}
        </div>
      </section>

      <section className="adm-section">
        <h3>Tema & musik</h3>
        <p>Tema bertanda &quot;Belum siap&quot; masih dalam pengerjaan tim dan belum bisa dipakai untuk client asli.</p>
        <div className="adm-choices" style={{ marginBottom: 20 }}>
          {themes.map((t) => (
            <label key={t.key} className={`adm-choice${values.tema === t.key ? " on" : ""}${t.status !== "active" ? " off" : ""}`}>
              <input type="radio" name="tema" value={t.key} required checked={values.tema === t.key} onChange={() => set("tema", t.key)} />
              <b>{t.label}</b>
              {t.status !== "active" && <small>Belum siap</small>}
            </label>
          ))}
        </div>
        <div className="adm-field">
          <label htmlFor="musik_url" className="adm-label">Link musik latar (opsional)</label>
          <input id="musik_url" type="url" value={values.musik_url ?? ""} onChange={(e) => set("musik_url", e.target.value)}
            placeholder="https://youtube.com/... atau mp3 link" className="adm-input" />
        </div>
      </section>

      <div className="adm-form-actions">
        {!isCreate && (
          <Link href="/admin/weddings" className="adm-btn adm-btn-ghost">
            Batal
          </Link>
        )}
        <button type="submit" disabled={saving} className="adm-btn adm-btn-primary">
          {saving ? "Menyimpan..." : isCreate ? "Buat undangan" : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
