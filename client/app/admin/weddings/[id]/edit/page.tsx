"use client";

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

  if (notFound) return <p className="text-sm text-red-600">Data klien tidak ditemukan.</p>;
  if (!wedding) return <p className="text-sm text-gray-500">Memuat...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Edit Klien: {wedding.namaPria} &amp; {wedding.namaWanita}
      </h1>
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
        }}
      />
    </div>
  );
}
