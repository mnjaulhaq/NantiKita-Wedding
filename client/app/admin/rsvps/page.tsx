"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatRelatif } from "@/lib/format";

type RsvpWithWedding = {
  id: number;
  namaTamu: string;
  alamat: string;
  status: string;
  jumlahHadir: number;
  ucapan: string | null;
  createdAt: string;
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
    <>
      <div className="adm-head">
        <div>
          <h2>RSVP Global</h2>
          <p>Konfirmasi kehadiran dan ucapan dari semua undangan klien.</p>
        </div>
      </div>

      <div className="adm-card" style={{ padding: 16 }}>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Undangan</th>
                <th>Nama tamu</th>
                <th>Konfirmasi</th>
                <th>Jumlah hadir</th>
                <th>Ucapan</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r) => (
                <tr key={r.id}>
                  <td className="adm-name" style={{ color: "var(--g-700)" }}>
                    {r.wedding.namaPria} &amp; {r.wedding.namaWanita}
                  </td>
                  <td>
                    <span className="adm-name">{r.namaTamu}</span>
                    {r.alamat && <div className="adm-sub">{r.alamat}</div>}
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>{r.jumlahHadir} orang</td>
                  <td className="adm-quote" title={r.ucapan ?? ""}>
                    {r.ucapan ? `“${r.ucapan}”` : "-"}
                  </td>
                  <td className="adm-sub">{formatRelatif(r.createdAt)}</td>
                </tr>
              ))}
              {loaded && rsvps.length === 0 && (
                <tr>
                  <td colSpan={6} className="adm-empty">
                    Belum ada konfirmasi masuk dari undangan manapun.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "hadir" ? <span className="adm-badge adm-badge-ok">Hadir</span> : <span className="adm-badge adm-badge-no">Absen</span>;
}
