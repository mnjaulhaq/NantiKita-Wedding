"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

// Kolom ucapan & doa restu di dalam surat undangan.
// Ucapan ditempelkan ke RSVP tamu yang baru saja dikirim (dicocokkan lewat nama),
// jadi di dashboard tetap satu baris per tamu.
export default function UcapanForm({ slug, nama }: { slug: string; nama: string }) {
  const [ucapan, setUcapan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await apiFetch(`/api/wedding/${slug}/ucapan`, {
        method: "POST",
        body: JSON.stringify({ nama_tamu: nama, ucapan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.errors?.ucapan?.[0] || data.message || "Gagal mengirim ucapan. Silakan coba lagi.");
      } else {
        setSuccess(data.message);
        setUcapan("");
      }
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi Anda lalu coba lagi.");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-3 rounded-2xl border border-[#e7dcc6] bg-[#fffdf8] p-5 text-left shadow-sm"
    >
      <label htmlFor="ucapan" className="block text-sm font-semibold text-[#3b3126]">
        Ucapan &amp; Doa Restu
      </label>
      <textarea
        id="ucapan"
        rows={4}
        required
        maxLength={1000}
        value={ucapan}
        onChange={(e) => setUcapan(e.target.value)}
        placeholder="Tulis ucapan untuk kedua mempelai"
        className="w-full rounded-xl border border-[#e7dcc6] bg-white px-3 py-2 text-base text-[#3b3126] placeholder:text-[#b9ad9a] focus:border-[#c29a3e] focus:outline-none"
      />
      {error && (
        <p role="alert" className="text-xs text-[#b4352a]">
          {error}
        </p>
      )}
      {success && <p className="text-xs text-green-700">{success}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-[#dcb85f] to-[#c29a3e] py-2.5 text-sm font-bold text-[#3a2a0c] disabled:opacity-60"
      >
        {loading ? "Mengirim..." : "Kirim Ucapan"}
      </button>
    </form>
  );
}
