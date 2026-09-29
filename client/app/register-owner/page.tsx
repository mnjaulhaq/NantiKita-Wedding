"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { apiFetch } from "@/lib/api";
import "./register.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type FieldName = "username" | "email" | "password" | "password_confirmation" | "name";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

const TOTAL_STEPS = 4;

const STEPS: {
  subtitle: string;
  fields: { name: FieldName; label: string; type: string; autoComplete: string }[];
}[] = [
  {
    subtitle: "Silakan tentukan username unik Anda untuk mengakses panel.",
    fields: [{ name: "username", label: "Username", type: "text", autoComplete: "off" }],
  },
  {
    subtitle: "Kami akan mengirimkan 6 digit kode keamanan ke alamat email ini.",
    fields: [{ name: "email", label: "Alamat Email", type: "email", autoComplete: "off" }],
  },
  {
    subtitle: "Gunakan kombinasi kata sandi yang kuat dan aman.",
    fields: [
      { name: "password", label: "Kata Sandi", type: "password", autoComplete: "new-password" },
      {
        name: "password_confirmation",
        label: "Konfirmasi Kata Sandi",
        type: "password",
        autoComplete: "new-password",
      },
    ],
  },
  {
    subtitle: "Bagaimana kami harus memanggil nama Anda di sistem dashboard?",
    fields: [{ name: "name", label: "Display Name", type: "text", autoComplete: "off" }],
  },
];

// Field -> step (untuk lompat ke step yang error dari respons server)
const FIELD_STEP: Record<FieldName, number> = {
  username: 1,
  email: 2,
  password: 3,
  password_confirmation: 3,
  name: 4,
};

const EMPTY_MESSAGES: Record<FieldName, string> = {
  username: "Username wajib diisi, tidak boleh kosong.",
  email: "Alamat email wajib diisi dengan benar.",
  password: "Kata sandi tidak boleh kosong.",
  password_confirmation: "Konfirmasi kata sandi wajib diisi.",
  name: "Display name wajib diisi.",
};

// Validasi format dasar (padanan validateField() di Blade). Return "" jika valid.
function validate(field: FieldName, values: Values): string {
  const value = values[field].trim();
  if (!value) return EMPTY_MESSAGES[field];

  if (field === "username") {
    if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(value))
      return "Username harus diawali dengan huruf dan tidak boleh hanya berisi simbol.";
    if (value.length < 5) return "Username minimal harus 5 karakter.";
  }

  if (field === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return EMPTY_MESSAGES.email;
  }

  if (field === "password" || field === "password_confirmation") {
    const { password, password_confirmation } = values;
    if (password.length < 8) return "Kata sandi minimal harus 8 karakter.";
    if (password_confirmation && password !== password_confirmation)
      return "Konfirmasi kata sandi tidak cocok, pastikan kombinasi hurufnya sama.";
  }

  if (field === "name") {
    if (!/^[a-zA-Z][a-zA-Z0-9\s]*$/.test(value))
      return "Display name harus diawali dengan huruf dan tidak boleh mengandung simbol atau angka di awal.";
  }

  return "";
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Values>({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const current = STEPS[step - 1];

  // Padanan history.pushState / popstate di script Blade
  useEffect(() => {
    window.history.replaceState({ ...window.history.state, step: 1 }, "", `${window.location.pathname}?step=1`);
    function onPopState(e: PopStateEvent) {
      const target = Number(e.state?.step) || 1;
      setStep(Math.min(Math.max(target, 1), TOTAL_STEPS));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function goTo(next: number) {
    setStep(next);
    window.history.pushState(
      { ...window.history.state, step: next },
      "",
      `${window.location.pathname}?step=${next}`
    );
  }

  function setError(field: FieldName, message: string) {
    setErrors((prev) => ({ ...prev, [field]: message || undefined }));
  }

  function onChange(field: FieldName, value: string) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setShake(false);
    // Validasi instan saat mengetik
    setError(field, validate(field, nextValues));
    // Ubah password -> cek ulang konfirmasi juga
    if (field === "password" && nextValues.password_confirmation) {
      setError("password_confirmation", validate("password_confirmation", nextValues));
    }
  }

  function triggerShake() {
    setShake(false);
    requestAnimationFrame(() => setShake(true));
  }

  async function submitAll() {
    setSubmitting(true);
    setErrors({});
    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        // Format error Laravel: { errors: { field: ["pesan", ...] } }
        const serverErrors: Errors = {};
        let firstStep = TOTAL_STEPS;
        for (const [field, messages] of Object.entries<string[]>(data.errors || {})) {
          if (field in FIELD_STEP) {
            serverErrors[field as FieldName] = messages[0];
            firstStep = Math.min(firstStep, FIELD_STEP[field as FieldName]);
          }
        }
        setErrors(serverErrors);
        setSubmitting(false);
        setStep(firstStep);
        return;
      }

      // Jembatan register -> verify-otp lewat token pendek (backend terpisah, tidak ada session Laravel)
      sessionStorage.setItem("nk_verify_token", data.verify_token);
      sessionStorage.setItem("nk_verify_email", values.email.trim());
      router.push("/verify-otp");
    } catch {
      setSubmitting(false);
      setErrors({ name: "Terjadi kesalahan jaringan, coba lagi." });
      setStep(TOTAL_STEPS);
    }
  }

  async function next() {
    if (submitting) return;

    // A. Validasi format dulu
    let valid = true;
    const stepErrors: Errors = {};
    for (const f of current.fields) {
      const msg = validate(f.name, values);
      if (msg) {
        valid = false;
        stepErrors[f.name] = msg;
      }
    }
    if (!valid) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      triggerShake();
      return;
    }

    if (step === TOTAL_STEPS) {
      await submitAll();
      return;
    }
    goTo(step + 1);
  }

  function back() {
    if (step > 1) window.history.back(); // popstate handler yang menurunkan step
  }

  // Pesan error yang tampil: error pertama di antara field pada step ini
  const stepError = current.fields.map((f) => errors[f.name]).find(Boolean);

  return (
    <main className={`reg-page ${jakarta.className}`}>
      <div className="reg-card">
        {!submitting && (
          <div className="reg-header">
            <h1>Daftar Akun Owner</h1>
          </div>
        )}

        <div className="reg-body">
          {submitting ? (
            <div className="reg-loading">
              <div className="reg-dots">
                <div className="reg-dot" />
                <div className="reg-dot" />
                <div className="reg-dot" />
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
              noValidate
            >
              <div key={step} className="reg-stepPanel">
                <p className="reg-subtitle">{current.subtitle}</p>

                <div
                  className={`reg-inputGroup ${shake ? "reg-shake" : ""}`}
                  onAnimationEnd={() => setShake(false)}
                >
                  {current.fields.map((f) => (
                    <div key={f.name} className="reg-inputWrapper">
                      <input
                        id={f.name}
                        name={f.name}
                        type={f.type}
                        className="reg-input"
                        value={values[f.name]}
                        placeholder=" "
                        autoComplete={f.autoComplete}
                        onChange={(e) => onChange(f.name, e.target.value)}
                        onBlur={() => setError(f.name, validate(f.name, values))}
                      />
                      <label htmlFor={f.name} className="reg-label">
                        {f.label}
                      </label>
                    </div>
                  ))}
                </div>

                {stepError && (
                  <div className="reg-error" role="alert">
                    <span>⚠️</span> <span>{stepError}</span>
                  </div>
                )}
              </div>

              <div className="reg-footer">
                <div>
                  {step === 1 ? (
                    <Link href="/login" className="reg-linkFooter">
                      Sudah punya akun? Masuk
                    </Link>
                  ) : (
                    <button type="button" className="reg-btnBack" onClick={back}>
                      Kembali
                    </button>
                  )}
                </div>
                <button type="submit" className="reg-btnPrimary" disabled={submitting}>
                  {step === TOTAL_STEPS ? "Daftar Akun" : "Berikutnya"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="reg-copyright">
        &copy; 2026 Owner Panel NANTIKITA. All rights reserved.
      </div>
    </main>
  );
}