"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch, API_URL } from "@/lib/api";
import { getToken } from "@/lib/auth-client";

type Rsvp = {
  id: number;
  namaTamu: string;
  alamat: string;
  status: string;
  jumlahHadir: number;
  ucapan: string | null;
};

type Wedding = {
  id: number;
  namaPria: string;
  namaWanita: string;
  rsvps: Rsvp[];
};

export default function WeddingRsvpsPage() {
  const params = useParams<{ id: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiFetch(`/api/admin/weddings/${params.id}/rsvps`).then(async (res) => {
      if (!res.ok) return setNotFound(true);
      const json = await res.json();
      setWedding(json.data);
    });
  }, [params.id]);

  if (notFound) return <p className="text-sm text-red-600">Data klien tidak ditemukan.</p>;
  if (!wedding) return <p className="text-sm text-gray-500">Memuat...</p>;

  // Link unduh PDF butuh token lewat query string karena ini <a> biasa, bukan fetch.
  const pdfHref = `${API_URL}/api/admin/weddings/${wedding.id}/pdf?token=${encodeURIComponent(getToken() || "")}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          RSVP: {wedding.namaPria} &amp; {wedding.namaWanita}
        </h1>
        <a href={pdfHref} className="bg-black text-white rounded px-4 py-2 text-sm">
          Unduh PDF
        </a>
      </div>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2">Nama Tamu</th>
            <th className="p-2">Asal</th>
            <th className="p-2">Status</th>
            <th className="p-2">Jumlah</th>
            <th className="p-2">Ucapan</th>
          </tr>
        </thead>
        <tbody>
          {wedding.rsvps.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.namaTamu}</td>
              <td className="p-2">{r.alamat}</td>
              <td className="p-2">{r.status === "hadir" ? "Hadir" : "Tidak Hadir"}</td>
              <td className="p-2">{r.jumlahHadir}</td>
              <td className="p-2">{r.ucapan}</td>
            </tr>
          ))}
          {wedding.rsvps.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-400">
                Belum ada RSVP masuk.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
