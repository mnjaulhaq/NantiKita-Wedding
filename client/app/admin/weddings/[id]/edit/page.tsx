"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import WeddingForm from "@/components/WeddingForm";

type Wedding = {
  id: number;
  namaPria: string;
  namaWanita: string;
  tanggalAcara: string;
  lokasiAcara: string;
  paket: "basic" | "premium";
  tema: string;
  musikUrl?: string | null;
};

export default function EditWeddingPage() {
  const params = useParams<{ id: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiFetch(`/api/admin/weddings/${params.id}`).then(async (res) => {
      if (!res.ok) return setNotFound(true);
      const json = await res.json();
      setWedding(json.data);
    });
  }, [params.id]);

  if (notFound) return <p className="adm-error" role="alert">Data klien tidak ditemukan.</p>;
  if (!wedding) return <p className="adm-muted">Memuat...</p>;

  return (
    <div>
      <div className="adm-head">
        <div>
          <Link href="/admin/weddings" className="adm-back">← Kembali ke Data Client</Link>
          <h2>Edit undangan</h2>
          <p>{wedding.namaPria} &amp; {wedding.namaWanita}</p>
        </div>
      </div>
      <div className="adm-card" style={{ maxWidth: 820, padding: 32 }}>
      <WeddingForm
        mode="edit"
        weddingId={wedding.id}
        initial={{
          nama_pria: wedding.namaPria,
          nama_wanita: wedding.namaWanita,
          tanggal_acara: wedding.tanggalAcara.slice(0, 10),
          lokasi_acara: wedding.lokasiAcara,
          paket: wedding.paket,
          tema: wedding.tema,
          musik_url: wedding.musikUrl ?? "",
        }}
      />
      </div>
    </div>
  );
}
