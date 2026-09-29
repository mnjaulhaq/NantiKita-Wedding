"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";

type Wedding = {
  id: number;
  namaPria: string;
  namaWanita: string;
  tema: string;
  paket: string;
  slug: string;
  tanggalAcara: string;
};

type Dashboard = {
  totalWeddings: number;
  totalRevenue: number;
  totalGuestsHadir: number;
  recentWeddings: Wedding[];
};

const ic = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

function sapaan() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    apiFetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((json) => setData(json.data));
  }, []);

  if (!data) return <p className="adm-muted">Memuat...</p>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tanggal = today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // Acara terdekat: dari klien terbaru yang tanggalnya belum lewat
  const upcoming = data.recentWeddings
    .map((w) => ({ w, d: new Date(w.tanggalAcara) }))
    .filter(({ d }) => d.getTime() >= today.getTime())
    .sort((a, b) => a.d.getTime() - b.d.getTime())
    .slice(0, 4);

  const premium = data.recentWeddings.filter((w) => w.paket === "premium").length;
  const basic = data.recentWeddings.length - premium;
  const total = data.recentWeddings.length || 1;

  return (
    <>
      <section className="adm-hero">
        <div>
          <span className="adm-date">{tanggal}</span>
          <h2>{sapaan()}, ini kondisi bisnis NantiKita hari ini</h2>
          <p>Pantau klien, omzet, dan konfirmasi tamu dalam satu layar.</p>
        </div>
        <div className="adm-hero-actions">
          <Link href="/admin/weddings/create" className="adm-btn adm-btn-light">
            Tambah undangan
          </Link>
          <Link href="/admin/rsvps" className="adm-btn" style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>
            Lihat RSVP
          </Link>
        </div>
      </section>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-top">
            <span>Klien aktif</span>
            <div className="adm-stat-ic">{ic("M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21a8 8 0 0116 0")}</div>
          </div>
          <strong>
            {data.totalWeddings}
            <em>pasangan</em>
          </strong>
        </div>
        <div className="adm-stat hi">
          <div className="adm-stat-top">
            <span>Estimasi omzet kasar</span>
            <div className="adm-stat-ic">{ic("M12 3v18M16 7.5C16 6 14.2 5 12 5S8 6 8 7.5 9.8 10 12 10.5s4 1.5 4 3S14.2 16 12 16s-4-1-4-2.5")}</div>
          </div>
          <strong>{formatRupiah(data.totalRevenue)}</strong>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-top">
            <span>Tamu hadir (konfirmasi)</span>
            <div className="adm-stat-ic">{ic("M4 6h16v12H4zM4 7l8 6 8-6")}</div>
          </div>
          <strong>
            {data.totalGuestsHadir}
            <em>orang</em>
          </strong>
        </div>
      </div>

      <div className="adm-grid-2">
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3>Klien terbaru</h3>
              <p className="adm-card-sub">Pendaftaran undangan yang baru masuk.</p>
            </div>
            <Link href="/admin/weddings">Lihat semua</Link>
          </div>
          <div className="adm-list">
            {data.recentWeddings.length === 0 && <p className="adm-empty">Belum ada klien baru. Tambah undangan pertama untuk memulai.</p>}
            {data.recentWeddings.map((w) => (
              <Link key={w.id} href={`/admin/weddings/${w.id}/rsvps`} className="adm-row">
                <div className="adm-avatar">{w.namaPria.charAt(0).toUpperCase()}</div>
                <div className="adm-row-main">
                  <b>
                    {w.namaPria} &amp; {w.namaWanita}
                  </b>
                  <small>
                    Tema <span style={{ textTransform: "capitalize" }}>{w.tema}</span> · {formatTanggalPendek(w.tanggalAcara)}
                  </small>
                </div>
                <span className={`adm-badge ${w.paket === "premium" ? "adm-badge-gold" : "adm-badge-plain"}`} style={{ textTransform: "capitalize" }}>
                  {w.paket}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="adm-stack">
          <div className="adm-card">
            <h3>Acara terdekat</h3>
            <p className="adm-card-sub">Dari klien terbaru.</p>
            <div className="adm-list">
              {upcoming.length === 0 && <p className="adm-empty" style={{ padding: "16px 0" }}>Tidak ada acara mendatang.</p>}
              {upcoming.map(({ w, d }) => {
                const sisa = Math.round((d.getTime() - today.getTime()) / 86400000);
                return (
                  <div key={w.id} className="adm-row">
                    <div className="adm-when">
                      <b>{d.getDate()}</b>
                      <small>{d.toLocaleDateString("id-ID", { month: "short" })}</small>
                    </div>
                    <div className="adm-row-main">
                      <b>
                        {w.namaPria} &amp; {w.namaWanita}
                      </b>
                      <small>{sisa === 0 ? "Hari ini" : `${sisa} hari lagi`}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="adm-card">
            <h3>Komposisi paket</h3>
            <p className="adm-card-sub">Dari klien terbaru.</p>
            <div className="adm-bar" role="img" aria-label={`Premium ${premium}, Basic ${basic}`}>
              <i style={{ width: `${(premium / total) * 100}%`, background: "var(--g-700)" }} />
              <i style={{ width: `${(basic / total) * 100}%`, background: "#b9c7bd" }} />
            </div>
            <div className="adm-legend">
              <span>
                <span className="adm-dot" style={{ background: "var(--g-700)" }} />
                Premium <b>{premium}</b>
              </span>
              <span>
                <span className="adm-dot" style={{ background: "#b9c7bd" }} />
                Basic <b>{basic}</b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
