"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearToken } from "@/lib/auth-client";

// ASUMSI: endpoint logout & halaman login. Sesuaikan dengan yang sudah ada di proyekmu.
const LOGOUT_ENDPOINT = "/api/auth/logout";
const LOGIN_PATH = "/login";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      await apiFetch(LOGOUT_ENDPOINT, { method: "POST" });
    } catch {
      /* tetap lanjut redirect */
    }
    clearToken(); // hapus cookie nk_token, kalau tidak middleware masih menganggap login
    router.replace(LOGIN_PATH);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="text-white text-sm px-4 py-1.5 rounded-md transition hover:opacity-90"
      style={{ backgroundColor: "#8b3a3a" }}
    >
      Log Out
    </button>
  );
}
