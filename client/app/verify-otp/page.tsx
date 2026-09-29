"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth-client";
import "./verify-otp.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [otp, setOtp] = useState("");
  const [focused, setFocused] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Padanan session('email') di Blade: disimpan halaman register di sessionStorage
    setEmail(sessionStorage.getItem("nk_verify_email"));
    // Padanan realInput.focus() saat DOMContentLoaded
    inputRef.current?.focus();
  }, []);

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
    sessionStorage.removeItem("nk_verify_email");
    setToken(data.token);
    router.push(data.redirect || "/admin");
    router.refresh();
  }

  return (
    <main className={`otp-page ${jakarta.className}`}>
      <div className="otp-card">
        <h1 className="otp-title">Verifikasi OTP</h1>

        <p className="otp-subtitle">
          Kami telah mengirimkan 6 digit kode keamanan ke{" "}
          <strong className="otp-email">{email ?? "email Anda"}</strong>. Masukkan kodenya di bawah ini.
        </p>

        <form onSubmit={onSubmit}>
          <div className={`otp-boxes ${focused ? "is-focused" : ""}`}>
            {/* Input asli tersembunyi di atas kotak-kotak visual */}
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={OTP_LENGTH}
              autoComplete="one-time-code"
              className="otp-real-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              required
            />

            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <div key={i} className={`otp-box ${i === otp.length ? "active-box" : ""}`}>
                {otp[i] ?? ""}
              </div>
            ))}
          </div>

          {error && (
            <div className="otp-error" role="alert">
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}

          <button type="submit" className="otp-btn" disabled={loading || otp.length < OTP_LENGTH}>
            {loading ? "Memverifikasi..." : "Verifikasi Akun"}
          </button>
        </form>
      </div>

      <div className="otp-copyright">&copy; 2026 Admin Panel NANTIKITA. All rights reserved.</div>
    </main>
  );
}