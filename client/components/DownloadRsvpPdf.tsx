"use client";

import { useState } from "react";
import { BsDownload } from "react-icons/bs";
import { buildRsvpPdf, rsvpPdfFilename, type RsvpPdfData } from "@/lib/rsvp-pdf";

// Tombol "Unduh PDF" di dashboard RSVP pengantin. PDF dibuat di browser.
export default function DownloadRsvpPdf({ data }: { data: RsvpPdfData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function onClick() {
    setLoading(true);
    setError(false);
    try {
      const doc = await buildRsvpPdf(data);
      doc.save(rsvpPdfFilename(data.namaPria, data.namaWanita));
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-(--rv-gold-light) to-(--rv-gold) px-5 py-2.5 text-xs font-bold tracking-wider text-(--rv-on-accent) uppercase shadow-md shadow-(--rv-gold)/25 transition hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--rv-gold-dark)"
      >
        <BsDownload aria-hidden="true" />
        {loading ? "Menyiapkan..." : "Unduh PDF"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-(--rv-error)">
          Gagal membuat PDF. Coba lagi.
        </p>
      )}
    </div>
  );
}
