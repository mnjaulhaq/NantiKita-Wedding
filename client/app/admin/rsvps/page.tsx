"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type RsvpWithWedding = {
  id: number;
  namaTamu: string;
  alamat: string;
  status: string;
  jumlahHadir: number;
  wedding: { namaPria: string; namaWanita: string };
};

export default function GlobalRsvpsPage() {
  const [rsvps, setRsvps] = useState<RsvpWithWedding[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/rsvps")
      .then((res) => res.json())
      .then((json) => {
        setRsvps(json.data || []);
        setLoaded(true);
      });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">RSVP Global</h1>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2">Pasangan</th>
            <th className="p-2">Nama Tamu</th>
            <th className="p-2">Asal</th>
            <th className="p-2">Status</th>
            <th className="p-2">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {rsvps.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">
                {r.wedding.namaPria} &amp; {r.wedding.namaWanita}
              </td>
              <td className="p-2">{r.namaTamu}</td>
              <td className="p-2">{r.alamat}</td>
              <td className="p-2">{r.status === "hadir" ? "Hadir" : "Tidak Hadir"}</td>
              <td className="p-2">{r.jumlahHadir}</td>
            </tr>
          ))}
          {loaded && rsvps.length === 0 && (
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
