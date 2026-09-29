import { getToken, clearToken } from "./auth-client";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Dipakai dari Client Components (browser). Otomatis menempelkan header Authorization
// dari token yang tersimpan di cookie nk_token.
export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  // Sesi habis/tidak valid: hapus token & arahkan ke login (kecuali endpoint auth itu sendiri).
  if (res.status === 401 && token && !path.startsWith("/api/auth/") && typeof window !== "undefined") {
    clearToken();
    window.location.href = "/login";
  }
  return res;
}

// Dipakai dari Server Components (mis. halaman undangan publik) yang tidak butuh auth,
// cukup fetch langsung ke API tanpa cache supaya data selalu segar.
export async function apiFetchServer(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, { ...init, cache: "no-store" });
}
