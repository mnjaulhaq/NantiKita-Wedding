"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { themeOptions } from "@/lib/themes";
import { apiFetch } from "@/lib/api";

type WeddingFormValues = {
  nama_pria: string;
  nama_wanita: string;
  tanggal_acara: string;
  lokasi_acara: string;
  paket: "basic" | "premium";
  tema: string;
};

export default function WeddingForm({
  mode,
  weddingId,
  initial,
}: {
  mode: "create" | "edit";
  weddingId?: number;
  initial?: Partial<WeddingFormValues>;
}) {
  const router = useRouter();
  const themes = themeOptions();
  const [form, setForm] = useState<WeddingFormValues>({
    nama_pria: initial?.nama_pria || "",
    nama_wanita: initial?.nama_wanita || "",
    tanggal_acara: initial?.tanggal_acara || "",
    lokasi_acara: initial?.lokasi_acara || "",
    paket: initial?.paket || "basic",
    tema: initial?.tema || themes[0]?.key || "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const url = mode === "create" ? "/api/admin/weddings" : `/api/admin/weddings/${weddingId}`;
    const method = mode === "create" ? "POST" : "PUT";
    const res = await apiFetch(url, {
      method,
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErrors(data.errors || {});
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
      <Field label="Nama Pria" value={form.nama_pria} onChange={(v) => setForm({ ...form, nama_pria: v })} errors={errors.nama_pria} />
      <Field label="Nama Wanita" value={form.nama_wanita} onChange={(v) => setForm({ ...form, nama_wanita: v })} errors={errors.nama_wanita} />
      <Field
        label="Tanggal Acara"
        type="date"
        value={form.tanggal_acara}
        onChange={(v) => setForm({ ...form, tanggal_acara: v })}
        errors={errors.tanggal_acara}
      />
      <div>
        <label className="block text-sm mb-1">Lokasi Acara</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={form.lokasi_acara}
          onChange={(e) => setForm({ ...form, lokasi_acara: e.target.value })}
          required
        />
        {errors.lokasi_acara?.map((e) => (
          <p key={e} className="text-red-600 text-xs mt-1">{e}</p>
        ))}
      </div>
      <div>
        <label className="block text-sm mb-1">Paket</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={form.paket}
          onChange={(e) => setForm({ ...form, paket: e.target.value as "basic" | "premium" })}
        >
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Tema</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={form.tema}
          onChange={(e) => setForm({ ...form, tema: e.target.value })}
        >
          {themes.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <button disabled={loading} className="bg-black text-white rounded px-5 py-2 disabled:opacity-50">
        {loading ? "Menyimpan..." : mode === "create" ? "Buat Klien" : "Update Klien"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  errors,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  errors?: string[];
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type}
        className="w-full border rounded px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      {errors?.map((e) => (
        <p key={e} className="text-red-600 text-xs mt-1">{e}</p>
      ))}
    </div>
  );
}
