"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BsDownload } from "react-icons/bs";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
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
      if (!res.ok) {
        setNotFound(true);
        return;
      }

      const json = await res.json();
      setWedding(json.data);
    });
  }, [params.id]);

  if (notFound) {
    return (
      <p className="adm-error" role="alert">
        Data klien tidak ditemukan.
      </p>
    );
  }

  if (!wedding) {
    return <p className="adm-muted">Memuat...</p>;
  }

  // Setelah pengecekan di atas, kita simpan ke konstanta
  // supaya TypeScript tahu nilainya pasti tidak null.
  const currentWedding = wedding;

  const totalHadir = currentWedding.rsvps
    .filter((r) => r.status === "hadir")
    .reduce((sum, r) => sum + r.jumlahHadir, 0);

  const totalTidakHadir = currentWedding.rsvps.filter(
    (r) => r.status === "tidak_hadir",
  ).length;

  function downloadPdf() {
    try {
      const doc = new jsPDF();

      // ============================
      // HEADER PDF
      // ============================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);

      doc.text(
        `Daftar RSVP - ${currentWedding.namaPria} & ${currentWedding.namaWanita}`,
        14,
        20,
      );

      // ============================
      // RINGKASAN
      // ============================

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(
        `Total tamu hadir: ${totalHadir} orang`,
        14,
        28,
      );

      doc.text(
        `Berhalangan hadir: ${totalTidakHadir} tamu`,
        14,
        34,
      );

      doc.text(
        `Total konfirmasi: ${currentWedding.rsvps.length}`,
        14,
        40,
      );

      // ============================
      // TABEL RSVP
      // ============================

      autoTable(doc, {
        startY: 48,

        head: [
          [
            "No",
            "Nama Tamu",
            "Alamat",
            "Status",
            "Jumlah Hadir",
            "Ucapan / Doa",
            "Waktu",
          ],
        ],

        body: currentWedding.rsvps.map((r, index) => [
          index + 1,
          r.namaTamu,
          r.alamat || "-",
          r.status === "hadir" ? "Hadir" : "Absen",
          r.status === "hadir" ? `${r.jumlahHadir} orang` : "-",
          r.ucapan || "-",
          new Date(r.createdAt).toLocaleString("id-ID"),
        ]),

        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: "middle",
        },

        headStyles: {
          fontStyle: "bold",
        },

        margin: {
          top: 48,
          right: 14,
          bottom: 20,
          left: 14,
        },

        didDrawPage: (data) => {
          const pageHeight = doc.internal.pageSize.height;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);

          doc.text(
            `Halaman ${data.pageNumber}`,
            14,
            pageHeight - 10,
          );
        },
      });

      // ============================
      // NAMA FILE
      // ============================

      const safeNamaPria = currentWedding.namaPria.replace(
        /[\\/:*?"<>|]/g,
        "-",
      );

      const safeNamaWanita = currentWedding.namaWanita.replace(
        /[\\/:*?"<>|]/g,
        "-",
      );

      const filename = `RSVP-${safeNamaPria}-${safeNamaWanita}.pdf`;

      // ============================
      // DOWNLOAD
      // ============================

      doc.save(filename);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Gagal mengunduh PDF.");
    }
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/weddings" className="adm-back">
            ← Kembali ke Data Client
          </Link>

          <h2>
            {currentWedding.namaPria} &amp; {currentWedding.namaWanita}
          </h2>

          <p>Daftar kehadiran tamu (RSVP)</p>
        </div>

        <button
          type="button"
          onClick={downloadPdf}
          className="adm-btn adm-btn-primary"
        >
          <BsDownload aria-hidden /> Unduh PDF
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
            {currentWedding.rsvps.length}
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
              {currentWedding.rsvps.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="adm-name">
                      {r.namaTamu}
                    </span>

                    {r.alamat && (
                      <div className="adm-sub">
                        {r.alamat}
                      </div>
                    )}
                  </td>

                  <td>
                    {r.status === "hadir" ? (
                      <span className="adm-badge adm-badge-ok">
                        Hadir
                      </span>
                    ) : (
                      <span className="adm-badge adm-badge-no">
                        Absen
                      </span>
                    )}
                  </td>

                  <td>
                    {r.jumlahHadir} orang
                  </td>

                  <td
                    className="adm-quote"
                    title={r.ucapan ?? ""}
                  >
                    {r.ucapan
                      ? `“${r.ucapan}”`
                      : "-"}
                  </td>

                  <td className="adm-sub">
                    {formatRelatif(r.createdAt)}
                  </td>
                </tr>
              ))}

              {currentWedding.rsvps.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="adm-empty"
                  >
                    Belum ada tamu yang mengisi
                    konfirmasi kehadiran.
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