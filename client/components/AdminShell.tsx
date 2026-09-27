"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import LogoutButton from "./LogoutButton";

type Me = { id: number; name: string; username: string; email: string };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.data ?? null));
  }, []);

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r p-4 flex flex-col gap-2">
        <h2 className="font-bold mb-4">NantiKita Admin</h2>
        <Link href="/admin" className="text-sm hover:underline">Dashboard</Link>
        <Link href="/admin/weddings/create" className="text-sm hover:underline">Tambah Klien</Link>
        <Link href="/admin/rsvps" className="text-sm hover:underline">RSVP Global</Link>
        <div className="mt-auto text-sm text-gray-500">
          <p className="mb-2">Login sebagai {user?.name || "..."}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
