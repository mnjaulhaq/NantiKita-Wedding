"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth-client";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const verifyToken = sessionStorage.getItem("nk_verify_token");
    const res = await apiFetch("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp_code: otp, verify_token: verifyToken }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.errors?.otp_code?.[0] || "Verifikasi gagal.");
      if (data.redirect) router.push(data.redirect);
      return;
    }
    sessionStorage.removeItem("nk_verify_token");
    setToken(data.token);
    router.push(data.redirect || "/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-lg p-6">
        <h1 className="text-2xl font-bold">Verifikasi OTP</h1>
        <p className="text-sm text-gray-600">Masukkan 6 digit kode OTP yang dikirim ke email Anda. Berlaku 5 menit.</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          className="w-full border rounded px-3 py-2 text-center text-xl tracking-widest"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
        />
        <button disabled={loading} className="w-full bg-black text-white rounded py-2 disabled:opacity-50">
          {loading ? "Memverifikasi..." : "Verifikasi"}
        </button>
      </form>
    </main>
  );
}
