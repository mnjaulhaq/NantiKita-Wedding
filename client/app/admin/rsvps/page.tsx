"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BsEye } from "react-icons/bs";
import { apiFetch } from "@/lib/api";
import { formatRelatif } from "@/lib/format";

type RsvpWithWedding = {
  id: number | string;
  weddingId: number | string;
  namaTamu: string;
  alamat: string;
  status: string;
  jumlahHadir: number;
  ucapan: string | null;
  createdAt: string;
  wedding: { namaPria: string; namaWanita: string };
};

type WeddingOption = {
  id: number | string;
  namaPria: string;
  namaWanita: string;
};

const ALL = "all";

export default function GlobalRsvpsPage() {
  const [rsvps, setRsvps] = useState<RsvpWithWedding[]>([]);
  const [weddings, setWeddings] = useState<WeddingOption[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  // id undangan yang dipilih, atau "all". ID dibandingkan sebagai string
  // karena API bisa mengirim BigInt sebagai angka atau teks.
  const [selected, setSelected] = useState<string>(ALL);

  useEffect(() => {
    // Daftar undangan diambil terpisah supaya undangan yang belum punya RSVP
    // tetap muncul di pilihan filter.
    Promise.all([
      apiFetch("/api/admin/rsvps").then((res) => res.json()),
      apiFetch("/api/admin/weddings").then((res) => res.json()),
    ])
      .then(([rsvpJson, weddingJson]) => {
        setRsvps(rsvpJson.data || []);
        setWeddings(weddingJson.data || []);
      })
      .catch(() => setError("Data RSVP belum bisa dimuat. Coba muat ulang halaman."))
      .finally(() => setLoaded(true));
  }, []);

  // Jumlah konfirmasi per undangan, ditampilkan di pilihan filter.
  const countByWedding = useMemo(() => {
    const map = new Map<string, number>();
    rsvps.forEach((r) => {
      const key = String(r.weddingId);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [rsvps]);

  const visible = useMemo(
    () =>
      selected === ALL
        ? rsvps
        : rsvps.filter((r) => String(r.weddingId) === selected),
    [rsvps, selected],
  );

  const totalHadir = visible
    .filter((r) => r.status === "hadir")
    .reduce((sum, r) => sum + r.jumlahHadir, 0);

  const selectedWedding = weddings.find((w) => String(w.id) === selected);

  return (
    <>
      <div className="adm-head">
        <div>
          <h2>RSVP Global</h2>
          <p>Konfirmasi kehadiran dan ucapan dari semua undangan klien.</p>
        </div>
      </div>

      <div className="adm-card" style={{ padding: 0 }}>
        <div className="adm-filter">
          <div className="adm-field">
            <label htmlFor="filter-wedding" className="adm-label">
              Tampilkan undangan
            </label>
            <select
              id="filter-wedding"
              className="adm-select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              disabled={!loaded}
            >
              <option value={ALL}>Semua undangan ({rsvps.length})</option>
              {weddings.map((w) => (
                <option key={String(w.id)} value={String(w.id)}>
                  {w.namaPria} &amp; {w.namaWanita} ({countByWedding.get(String(w.id)) ?? 0})
                </option>
              ))}
            </select>
          </div>

          {selectedWedding && (
            <Link
              href={`/admin/weddings/${selectedWedding.id}/rsvps`}
              className="adm-btn adm-btn-ghost"
            >
              <BsEye aria-hidden /> Detail &amp; unduh PDF
            </Link>
          )}

          {loaded && !error && (
            <p className="adm-filter-summary" aria-live="polite">
              <b>{visible.length}</b> konfirmasi · <b>{totalHadir}</b> tamu hadir
            </p>
          )}
        </div>

        {error && (
          <p className="adm-error" role="alert" style={{ margin: "0 16px 16px" }}>
            {error}
          </p>
        )}

        <div style={{ padding: 16 }}>
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
                {visible.map((r) => (
                  <tr key={String(r.id)}>
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
                {loaded && !error && visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="adm-empty">
                      {selected === ALL
                        ? "Belum ada konfirmasi masuk dari undangan manapun."
                        : "Belum ada konfirmasi masuk untuk undangan ini."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "hadir" ? (
    <span className="adm-badge adm-badge-ok">Hadir</span>
  ) : (
    <span className="adm-badge adm-badge-no">Absen</span>
  );
}
