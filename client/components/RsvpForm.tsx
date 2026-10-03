"use client";

// Halaman konfirmasi kehadiran (RSVP) yang dipakai di semua template.
// Tampilan: amplop tertutup -> tamu mengetuk segel -> amplop terbuka -> form muncul.
// Alur form tetap sama:
//   step 1: tamu mengetik nama -> "Lanjutkan"
//   step 2: isi asal, kehadiran, jumlah -> "Buka Undangan"
// Di step 2 data langsung disimpan ke server, lalu tamu diarahkan ke surat undangan.
// Warna mengikuti tema undangan (lihat lib/rsvp-theme.ts).

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alex_Brush, Montserrat } from "next/font/google";
import {
  BsCalendarCheck,
  BsChevronDown,
  BsGeoAlt,
  BsPatchCheckFill,
  BsPencilSquare,
  BsPeople,
} from "react-icons/bs";
import { apiFetch } from "@/lib/api";
import { dataRsvpPath, isClientKeyword, undanganPath } from "@/lib/guest";
import { rsvpThemeStyle } from "@/lib/rsvp-theme";
import "./rsvp-envelope.css";

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alex-brush",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-gt-montserrat",
  display: "swap",
});

type Props = {
  wedding: {
    slug: string;
    namaPria: string;
    namaWanita: string;
    tanggalAcara: string;
  };
  theme: string;
  paket: string;
  // Nama dari link undangan (?to=Nama), kalau ada.
  namaAwal?: string;
};

type Status = "" | "hadir" | "tidak_hadir";
type Phase = "closed" | "opening" | "form";

// Padanan Carbon translatedFormat('l, d F Y'). Pakai UTC karena tanggal acara
// adalah tanggal murni (tanpa jam), supaya harinya tidak bergeser.
function formatHariTanggal(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function RsvpForm({ wedding, theme, paket, namaAwal }: Props) {
  const router = useRouter();
  const namaRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [phase, setPhase] = useState<Phase>("closed");
  const [leaving, setLeaving] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [nama, setNama] = useState(namaAwal ?? "");
  const [asal, setAsal] = useState("");
  const [status, setStatus] = useState<Status>("");
  const [jumlah, setJumlah] = useState("1");
  const [namaError, setNamaError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hadir = status === "hadir";

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  function later(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }

  // ---- Amplop ----
  function bukaAmplop() {
    if (phase !== "closed") return;
    setPhase("opening");
    // Tunggu tutup amplop terbuka & kertas naik, baru tampilkan form
    later(() => setPhase("form"), reducedMotion() ? 50 : 1700);
  }

  // ---- Step 1 -> 2 ----
  function tahapSatu() {
    const namaInput = nama.trim();

    if (namaInput === "") {
      setNamaError("Silakan ketik nama Anda terlebih dahulu.");
      return;
    }

    // "admin"/"client" bukan nama tamu: buka dashboard data RSVP milik pengantin.
    if (isClientKeyword(namaInput)) {
      router.push(dataRsvpPath(wedding.slug));
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(namaInput)) {
      setNamaError("Nama hanya boleh berisi huruf dan spasi saja.");
      return;
    }

    setNamaError(null);
    setStep(2);
  }

  function editNama() {
    setStep(1);
    // Tunggu input tidak lagi readOnly sebelum fokus
    setTimeout(() => namaRef.current?.focus(), 0);
  }

  function onStatusChange(value: Status) {
    setStatus(value);
    setJumlah(value === "hadir" ? "1" : "0");
  }

  // ---- Step 2: simpan RSVP lalu buka surat undangan ----
  async function tahapFinal(form: HTMLFormElement) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setErrors({});
    setFormError(null);
    setLoading(true);

    try {
      const res = await apiFetch(`/api/wedding/${wedding.slug}/rsvp`, {
        method: "POST",
        body: JSON.stringify({
          nama_tamu: nama.trim(),
          alamat: asal.trim(),
          status,
          jumlah_hadir: hadir ? Number(jumlah) : 0,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const fieldErrors: Record<string, string[]> = data.errors || {};
        setErrors(fieldErrors);
        // Kalau nama ditolak server, kembalikan tamu ke step 1 supaya bisa memperbaikinya.
        if (fieldErrors.nama_tamu) {
          setNamaError(fieldErrors.nama_tamu[0]);
          setStep(1);
        } else if (!data.errors) {
          setFormError(data.message || "Gagal mengirim konfirmasi. Silakan coba lagi.");
        }
        setLoading(false);
        return;
      }

      // Form menghilang dulu, baru pindah ke undangan. Tombol tetap nonaktif
      // supaya tidak terkirim dua kali.
      setLeaving(true);
      later(
        () => router.push(undanganPath(wedding.slug, { theme, paket, to: nama.trim() })),
        reducedMotion() ? 0 : 450,
      );
    } catch {
      setFormError("Tidak bisa terhubung ke server. Periksa koneksi Anda lalu coba lagi.");
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Enter di input & klik tombol utama lewat sini
    if (loading) return;
    if (step === 1) tahapSatu();
    else void tahapFinal(e.currentTarget);
  }

  const inisial = `${wedding.namaPria.trim().charAt(0)}&${wedding.namaWanita.trim().charAt(0)}`;

  return (
    <main
      className={`ev-root ${alexBrush.variable} ${montserrat.variable} antialiased`}
      style={rsvpThemeStyle(theme)}
    >
      <div className="ev-glow ev-glow-1" />
      <div className="ev-glow ev-glow-2" />

      <div className="ev-wrap">
        <header className="select-none">
          <p className="ev-eyebrow">The Wedding of</p>
          <h1 className="ev-title">
            {wedding.namaPria} &amp; {wedding.namaWanita}
          </h1>
          <p className="ev-date">{formatHariTanggal(wedding.tanggalAcara)}</p>
        </header>

        {/* ===== Amplop ===== */}
        <div className="ev-collapse" data-phase={phase} aria-hidden={phase === "form"}>
          <div className="ev-collapse-inner">
            <div className="ev-collapse-pad">
              {/* Klik di mana saja pada amplop membuka; tombol segel untuk keyboard & pembaca layar */}
              <div className="ev-envelope" onClick={bukaAmplop}>
                <div className="ev-env-back" />
                <div className="ev-paper" />
                <div className="ev-env-front">
                  <span className="ev-front-label">Undangan Pernikahan</span>
                </div>
                <div className="ev-flap" />
                <button
                  type="button"
                  className="ev-seal"
                  aria-label="Buka amplop undangan"
                  tabIndex={phase === "closed" ? 0 : -1}
                  onClick={(e) => {
                    e.stopPropagation();
                    bukaAmplop();
                  }}
                >
                  {inisial}
                </button>
              </div>
              <p className="ev-tap">Ketuk untuk membuka</p>
            </div>
          </div>
        </div>

        {/* ===== Form ===== */}
        {phase === "form" && (
          <div className={`ev-formwrap ${leaving ? "is-leaving" : ""}`}>
            <form onSubmit={onSubmit} noValidate className="ev-form">
              <div className="ev-cards">
                {/* CARD 1: nama */}
                <div className="ev-card">
                  {step === 2 && (
                    <div className="ev-verified">
                      <p>
                        <BsPatchCheckFill /> Tamu Terdaftar
                      </p>
                      <span>Verified</span>
                    </div>
                  )}

                  {step === 1 && (
                    <label htmlFor="ev-nama" className="ev-label">
                      Kepada Yth. Bapak/Ibu/Saudara/i:
                    </label>
                  )}

                  <div className={`ev-name-row ${step === 1 ? "is-editing" : ""}`}>
                    <input
                      id="ev-nama"
                      ref={namaRef}
                      type="text"
                      name="to"
                      placeholder="Ketik nama Anda di sini..."
                      required
                      autoComplete="off"
                      readOnly={step === 2}
                      value={nama}
                      onChange={(e) => {
                        setNama(e.target.value);
                        if (namaError) setNamaError(null);
                      }}
                      aria-invalid={!!namaError}
                      className={`ev-name-input ${step === 2 ? "is-locked" : ""}`}
                    />
                    {step === 2 && (
                      <button
                        type="button"
                        onClick={editNama}
                        aria-label="Ubah nama"
                        className="ev-edit-btn"
                      >
                        <BsPencilSquare />
                      </button>
                    )}
                  </div>
                  {namaError && (
                    <p role="alert" className="ev-error">
                      {namaError}
                    </p>
                  )}
                </div>

                {/* CARD 2: asal, kehadiran, jumlah */}
                {step === 2 && (
                  <div className="ev-card ev-card-fields">
                    <div className="ev-group">
                      <label htmlFor="ev-asal" className="ev-label">
                        Asal / Kota
                      </label>
                      <div className="ev-field-wrap">
                        <BsGeoAlt className="ev-icon" />
                        <input
                          id="ev-asal"
                          type="text"
                          name="asal"
                          placeholder="Contoh: Bandung"
                          required
                          value={asal}
                          onChange={(e) => setAsal(e.target.value)}
                          className="ev-field"
                        />
                      </div>
                      {errors.alamat?.map((m) => (
                        <p key={m} className="ev-error">{m}</p>
                      ))}
                    </div>

                    <div className="ev-group">
                      <label htmlFor="ev-status" className="ev-label">
                        Konfirmasi Kehadiran
                      </label>
                      <div className="ev-field-wrap">
                        <BsCalendarCheck className="ev-icon" />
                        <select
                          id="ev-status"
                          name="status"
                          required
                          value={status}
                          onChange={(e) => onStatusChange(e.target.value as Status)}
                          className="ev-field"
                        >
                          <option value="" disabled>
                            -- Pilih Kehadiran --
                          </option>
                          <option value="hadir">Akan Hadir</option>
                          <option value="tidak_hadir">Berhalangan</option>
                        </select>
                        <BsChevronDown className="ev-chevron" />
                      </div>
                      {errors.status?.map((m) => (
                        <p key={m} className="ev-error">{m}</p>
                      ))}
                    </div>

                    <div className="ev-group">
                      <label htmlFor="ev-jumlah" className="ev-label">
                        Jumlah Orang Yang Hadir
                      </label>
                      <div className="ev-field-wrap">
                        <BsPeople className={`ev-icon ${hadir ? "is-on" : ""}`} />
                        <input
                          id="ev-jumlah"
                          type="number"
                          inputMode="numeric"
                          name="jumlah_hadir"
                          min={1}
                          max={10}
                          disabled={!hadir}
                          required={hadir}
                          value={jumlah}
                          onChange={(e) => setJumlah(e.target.value)}
                          className="ev-field is-center"
                        />
                      </div>
                      {errors.jumlah_hadir?.map((m) => (
                        <p key={m} className="ev-error">{m}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {formError && (
                <p role="alert" className="ev-error" style={{ marginTop: "1rem" }}>
                  {formError}
                </p>
              )}

              <p className="ev-hint">
                {step === 1
                  ? "*Ketik nama Anda lalu klik tombol Lanjutkan"
                  : "*Pastikan semua data di atas telah diisi dengan benar"}
              </p>

              <button type="submit" disabled={loading} className="ev-button">
                {step === 1 ? "Lanjutkan" : loading ? "Mengirim..." : "Buka Undangan"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
