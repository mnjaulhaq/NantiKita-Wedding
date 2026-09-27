"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Errors = Record<string, string[]>;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
    setLoading(true);
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErrors(data.errors || {});
      return;
    }
    setSuccess(data.message);
    // Jembatan register -> verify-otp: dulu lewat cookie session Laravel/Next monolit,
    // sekarang lewat token pendek yang disimpan sementara di browser (server terpisah).
    sessionStorage.setItem("nk_verify_token", data.verify_token);
    router.push("/verify-otp");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-lg p-6">
        <h1 className="text-2xl font-bold">Daftar Admin</h1>
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <Field label="Display Name" value={form.name} onChange={(v) => update("name", v)} errors={errors.name} />
        <Field label="Username" value={form.username} onChange={(v) => update("username", v)} errors={errors.username} />
        <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} errors={errors.email} />
        <Field label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} errors={errors.password} />
        <Field
          label="Konfirmasi Password"
          type="password"
          value={form.password_confirmation}
          onChange={(v) => update("password_confirmation", v)}
        />

        <button disabled={loading} className="w-full bg-black text-white rounded py-2 disabled:opacity-50">
          {loading ? "Memproses..." : "Daftar"}
        </button>
        <p className="text-sm text-center">
          Sudah punya akun?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  errors,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  errors?: string[];
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type}
        className="w-full border rounded px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      {errors?.map((e) => (
        <p key={e} className="text-red-600 text-xs mt-1">
          {e}
        </p>
      ))}
    </div>
  );
}
