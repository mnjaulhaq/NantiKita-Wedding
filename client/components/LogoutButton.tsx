"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearToken } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  async function onLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    clearToken();
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={onLogout} className="underline">
      Logout
    </button>
  );
}
