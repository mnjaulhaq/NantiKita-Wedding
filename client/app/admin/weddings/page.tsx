"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { confirmDelete, errorPopup, toastSuccess } from "@/lib/alert";
import { formatTanggal } from "@/lib/format";

type Wedding = {
  id: number;
  namaPria: string;
  namaWanita: string;
  tanggalAcara: string;
  tema: string;
  paket: string;
  slug: string;
};

export default function WeddingsIndexPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    // ASUMSI: GET /api/admin/weddings mengembalikan { data: Wedding[] }
    apiFetch("/api/admin/weddings")
      .then((res) => res.json())
      .then((json) => {
        setWeddings(json.data || []);
        setLoaded(true);
      });
  }, []);

  async function copyLink(w: Wedding) {
    const url = `${origin}/wedding/${w.slug}?theme=${w.tema}&paket=${w.paket}&to=NamaTamu`;
    try {
      await navigator.clipboard.writeText(url);
      toastSuccess("Tautan undangan berhasil disalin!");
    } catch (err) {
      console.error("Gagal menyalin teks: ", err);
    }
  }

  async function onDelete(id: number) {
    if (!(await confirmDelete())) return;
    const res = await apiFetch(`/api/admin/weddings/${id}`, { method: "DELETE" });
    if (!res.ok) return errorPopup("Data klien belum bisa dihapus.");
    setWeddings((list) => list.filter((w) => w.id !== id));
    toastSuccess("Data klien berhasil dihapus.");
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h2>Data Client</h2>
          <p>Semua pengantin yang memakai jasa NantiKita.</p>
        </div>
        <Link href="/admin/weddings/create" className="adm-btn adm-btn-primary">
          Tambah undangan
        </Link>
      </div>

      <div className="adm-card" style={{ padding: 16 }}>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Pengantin</th>
                <th>Tanggal acara</th>
                <th>Tema</th>
                <th>Paket</th>
                <th>Link undangan</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {weddings.map((w) => (
                <tr key={w.id}>
                  <td className="adm-name">
                    {w.namaPria} &amp; {w.namaWanita}
                  </td>
                  <td>{formatTanggal(w.tanggalAcara)}</td>
                  <td>
                    <span className="adm-badge adm-badge-plain" style={{ textTransform: "capitalize" }}>
                      {w.tema}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge ${w.paket === "premium" ? "adm-badge-gold" : "adm-badge-plain"}`}>
                      {w.paket === "premium" ? "Premium" : "Basic"}
                    </span>
                  </td>
                  <td>
                    <div className="adm-linkbox">
                      <input type="text" readOnly aria-label="Link undangan" value={`${origin}/wedding/${w.slug}`} />
                      <button type="button" onClick={() => copyLink(w)} className="adm-btn adm-btn-ghost adm-btn-sm">
                        Salin
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <Link href={`/admin/weddings/${w.id}/rsvps`} className="adm-btn adm-btn-ghost adm-btn-sm">
                        RSVP
                      </Link>
                      <Link href={`/admin/weddings/${w.id}/edit`} className="adm-btn adm-btn-ghost adm-btn-sm">
                        Edit
                      </Link>
                      <button type="button" onClick={() => onDelete(w.id)} className="adm-btn adm-btn-danger adm-btn-sm">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loaded && weddings.length === 0 && (
                <tr>
                  <td colSpan={6} className="adm-empty">
                    Belum ada client. Klik &quot;Tambah undangan&quot; untuk memulai.
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
