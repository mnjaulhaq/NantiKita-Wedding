"use client";

// Server (Express) mengembalikan JWT di body response (bukan Set-Cookie lintas domain),
// jadi klien yang menyimpannya di cookie miliknya sendiri. Cookie ini TIDAK httpOnly karena
// perlu dibaca oleh JS (untuk header Authorization) dan oleh middleware.ts (untuk proteksi rute).
const COOKIE_NAME = "nk_token";

export function setToken(token: string) {
  const maxAge = 60 * 60 * 24 * 30; // 30 hari, samakan dengan masa berlaku JWT di server
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function clearToken() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
