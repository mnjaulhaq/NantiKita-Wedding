"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { formatRelatif } from "@/lib/format";

type Rsvp = {
  id: number;
  namaTamu: string;
  alamat: string;
  status: string;
  jumlahHadir: number;
  ucapan: string | null;
  createdAt: string;
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

  if (notFound)
    return (
      <p className="adm-error" role="alert">
        Data klien tidak ditemukan.
      </p>
    );
  if (!wedding) return <p className="adm-muted">Memuat...</p>;

  const weddingId = wedding.id;

  // Link unduh PDF butuh token lewat query string karena ini <a> biasa, bukan fetch.
  async function downloadPdf() {
    try {
      const res = await apiFetch(`/api/admin/weddings/${weddingId}/pdf`);
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `rsvp-${weddingId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh PDF.");
    }
  }

  const totalHadir = wedding.rsvps
    .filter((r) => r.status === "hadir")
    .reduce((sum, r) => sum + r.jumlahHadir, 0);
  const totalTidakHadir = wedding.rsvps.filter(
    (r) => r.status === "tidak_hadir",
  ).length;

  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/weddings" className="adm-back">
            ← Kembali ke Data Client
          </Link>
          <h2>
            {wedding.namaPria} &amp; {wedding.namaWanita}
          </h2>
          <p>Daftar kehadiran tamu (RSVP)</p>
        </div>
        <button
          type="button"
          onClick={downloadPdf}
          className="adm-btn adm-btn-primary"
        >
          Unduh PDF
        </button>
      </div>

      <div className="adm-stats adm-stats-3">
        <div className="adm-stat hi">
          <span>Tamu hadir</span>
          <strong>
            {totalHadir}
            <em>orang</em>
          </strong>
        </div>
        <div className="adm-stat">
          <span>Berhalangan hadir</span>
          <strong>
            {totalTidakHadir}
            <em>tamu</em>
          </strong>
        </div>
        <div className="adm-stat">
          <span>Ucapan masuk</span>
          <strong>
            {wedding.rsvps.length}
            <em>ucapan</em>
          </strong>
        </div>
      </div>

      <div className="adm-card" style={{ padding: 16 }}>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nama tamu</th>
                <th>Status</th>
                <th>Jumlah hadir</th>
                <th>Ucapan / doa restu</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {wedding.rsvps.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="adm-name">{r.namaTamu}</span>
                    {r.alamat && <div className="adm-sub">{r.alamat}</div>}
                  </td>
                  <td>
                    {r.status === "hadir" ? (
                      <span className="adm-badge adm-badge-ok">Hadir</span>
                    ) : (
                      <span className="adm-badge adm-badge-no">Absen</span>
                    )}
                  </td>
                  <td>{r.jumlahHadir} orang</td>
                  <td className="adm-quote" title={r.ucapan ?? ""}>
                    {r.ucapan ? `“${r.ucapan}”` : "-"}
                  </td>
                  <td className="adm-sub">{formatRelatif(r.createdAt)}</td>
                </tr>
              ))}
              {wedding.rsvps.length === 0 && (
                <tr>
                  <td colSpan={5} className="adm-empty">
                    Belum ada tamu yang mengisi konfirmasi kehadiran.
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
