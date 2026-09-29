"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth-client";
import "./login.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

type FieldErrors = { username?: string; password?: string };

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="field-error-text" role="alert">
      <span>⚠️</span> <span>{message}</span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [backendError, setBackendError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBackendError(null);

    // Validasi sisi client (sama seperti script di blade)
    const errors: FieldErrors = {};
    if (!username.trim()) errors.username = "Username wajib diisi, tidak boleh kosong.";
    if (!password.trim()) errors.password = "Password wajib diisi, tidak boleh kosong.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setBackendError(data.errors?.username?.[0] || "Login gagal.");
        return;
      }

      setToken(data.token);
      router.push(data.redirect || "/admin");
      router.refresh();
    } catch {
      setBackendError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`login-root ${jakarta.variable}`}>
      <div className="form-card">
        <div className="form-card-header">
          <h3>Log In to Admin Panel</h3>
          <p className="form-subtitle">Please enter your account details</p>
        </div>

        <div className="form-card-body">
          <form onSubmit={onSubmit} noValidate>
            <div
              className={`custom-floating-field${fieldErrors.username ? " is-invalid-border" : ""}`}
            >
              <input
                type="text"
                name="username"
                id="username"
                placeholder=" "
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: undefined }));
                }}
              />
              <label htmlFor="username">Username</label>
            </div>
            {fieldErrors.username && <ErrorBox message={fieldErrors.username} />}

            <div style={{ height: 12 }} />

            <div
              className={`custom-floating-field${fieldErrors.password ? " is-invalid-border" : ""}`}
            >
              <input
                type="password"
                name="password"
                id="password"
                placeholder=" "
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                }}
              />
              <label htmlFor="password">Password</label>
            </div>
            {fieldErrors.password && <ErrorBox message={fieldErrors.password} />}

            {backendError && <ErrorBox message={backendError} />}

            <button type="submit" className="btn-primary-custom" disabled={loading}>
              {loading ? "Memproses..." : "Log In"}
            </button>
          </form>
        </div>
      </div>

      <div className="auth-copyright">
        &copy; 2026 Admin Panel NANTIKITA. All rights reserved.
      </div>
    </div>
  );
}
