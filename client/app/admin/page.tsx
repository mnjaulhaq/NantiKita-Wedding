"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Wedding = {
  id: number;
  namaPria: string;
  namaWanita: string;
  tema: string;
  paket: string;
  slug: string;
};

type Dashboard = {
  totalWeddings: number;
  totalRevenue: number;
  totalGuestsHadir: number;
  recentWeddings: Wedding[];
};

export default function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    apiFetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((json) => setData(json.data));
  }, []);

  if (!data) return <p className="text-sm text-gray-500">Memuat...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Klien" value={data.totalWeddings} />
        <StatCard label="Estimasi Omzet" value={`Rp ${data.totalRevenue.toLocaleString("id-ID")}`} />
        <StatCard label="Total Tamu Hadir" value={data.totalGuestsHadir} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Klien Terbaru</h2>
          <Link href="/admin/weddings/create" className="text-sm underline">
            + Tambah Klien
          </Link>
        </div>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">Pasangan</th>
              <th className="p-2">Tema</th>
              <th className="p-2">Paket</th>
              <th className="p-2">Slug</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.recentWeddings.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="p-2">{w.namaPria} &amp; {w.namaWanita}</td>
                <td className="p-2">{w.tema}</td>
                <td className="p-2 capitalize">{w.paket}</td>
                <td className="p-2 text-gray-500">/wedding/{w.slug}</td>
                <td className="p-2">
                  <Link href={`/admin/weddings/${w.id}/edit`} className="underline mr-3">Edit</Link>
                  <Link href={`/admin/weddings/${w.id}/rsvps`} className="underline">RSVP</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
