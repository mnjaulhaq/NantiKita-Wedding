"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function RsvpForm({ slug }: { slug: string }) {
  const [form, setForm] = useState({
    nama_tamu: "",
    alamat: "",
    status: "hadir",
    jumlah_hadir: 1,
    ucapan: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
    setLoading(true);
    const res = await apiFetch(`/api/wedding/${slug}/rsvp`, {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErrors(data.errors || {});
      return;
    }
    setSuccess(data.message);
    setForm({ nama_tamu: "", alamat: "", status: "hadir", jumlah_hadir: 1, ucapan: "" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md mx-auto">
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <div>
        <label className="block text-sm mb-1">Nama Tamu</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.nama_tamu}
          onChange={(e) => setForm({ ...form, nama_tamu: e.target.value })}
          required
        />
        {errors.nama_tamu?.map((e) => (
          <p key={e} className="text-red-600 text-xs mt-1">{e}</p>
        ))}
      </div>

      <div>
        <label className="block text-sm mb-1">Asal / Kota</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.alamat}
          onChange={(e) => setForm({ ...form, alamat: e.target.value })}
          required
        />
        {errors.alamat?.map((e) => (
          <p key={e} className="text-red-600 text-xs mt-1">{e}</p>
        ))}
      </div>

      <div>
        <label className="block text-sm mb-1">Konfirmasi Kehadiran</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="hadir">Hadir</option>
          <option value="tidak_hadir">Tidak Hadir</option>
        </select>
      </div>

      {form.status === "hadir" && (
        <div>
          <label className="block text-sm mb-1">Jumlah Hadir</label>
          <input
            type="number"
            min={1}
            max={10}
            className="w-full border rounded px-3 py-2"
            value={form.jumlah_hadir}
            onChange={(e) => setForm({ ...form, jumlah_hadir: Number(e.target.value) })}
          />
        </div>
      )}

      <div>
        <label className="block text-sm mb-1">Ucapan &amp; Doa Restu</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={4}
          value={form.ucapan}
          onChange={(e) => setForm({ ...form, ucapan: e.target.value })}
          required
        />
        {errors.ucapan?.map((e) => (
          <p key={e} className="text-red-600 text-xs mt-1">{e}</p>
        ))}
      </div>

      <button disabled={loading} className="w-full bg-black text-white rounded py-2 disabled:opacity-50">
        {loading ? "Mengirim..." : "Kirim RSVP"}
      </button>
    </form>
  );
}
