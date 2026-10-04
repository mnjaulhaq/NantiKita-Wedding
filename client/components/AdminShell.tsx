"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { apiFetch } from "@/lib/api";
import LogoutButton from "@/components/LogoutButton";
import "./admin.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const Icon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
);

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    d: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  },
  {
    href: "/admin/weddings",
    label: "Data Client",
    exact: true,
    d: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21a8 8 0 0116 0",
  },
  {
    href: "/admin/weddings/create",
    label: "Tambah Undangan",
    exact: true,
    d: "M12 5v14M5 12h14",
  },
  {
    href: "/admin/rsvps",
    label: "Data RSVP Global",
    d: "M4 6h16v12H4zM4 7l8 6 8-6",
  },
  {
    href: "/admin/templates",
    label: "Template",
    d: "M12 3a9 9 0 100 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A3.6 3.6 0 0021 9.8C21 6 17 3 12 3z",
  },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("Owner NantiKita");

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const name = json?.data?.name;
        if (name) setUserName(name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // /admin/weddings juga aktif untuk halaman edit & rsvps per klien, tapi bukan untuk /create
  const isActive = (n: (typeof NAV)[number]) => {
    if (n.href === "/admin/weddings")
      return (
        pathname === n.href ||
        (pathname.startsWith("/admin/weddings/") &&
          !pathname.endsWith("/create"))
      );
    return n.exact ? pathname === n.href : pathname.startsWith(n.href);
  };

  return (
    <div className={`admin-root ${jakarta.variable}`}>
      <aside className={`adm-side${open ? " open" : ""}`}>
        <Link href="/admin" className="adm-logo">
          <b>ADMIN NANTIKITA.</b>
        </Link>

        <nav className="adm-nav">
          {NAV.map((n) => {
            const active = isActive(n);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`adm-link${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon d={n.d} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="adm-side-foot">
          <div className="adm-user">
            <div className="adm-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div style={{ textAlign: "left" }}>
              <b>{userName}</b>
              <small>Admin</small>
            </div>
          </div>
          <div className="adm-logout" style={{ marginBottom: 10 }}>
            <LogoutButton />
          </div>
          V.1.0 © 2026 NantiKita.
        </div>
      </aside>

      <div className="adm-main">
        <div className="adm-topbar">
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
          <span className="adm-topname">Manajemen Undangan Digital</span>
        </div>
        <div className="adm-content">{children}</div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          aria-hidden
        />
      )}
    </div>
  );
}
