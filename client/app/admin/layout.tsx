// Proteksi rute /admin sudah ditangani middleware.ts (verifikasi JWT dari cookie nk_token),
// jadi layout ini tinggal merender shell. Data user diambil di AdminShell (client-side)
// lewat GET /api/auth/me ke server, karena layout ini sudah tidak punya akses DB langsung.
import AdminShell from "@/components/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
