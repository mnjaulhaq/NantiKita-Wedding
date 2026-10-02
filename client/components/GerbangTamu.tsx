"use client";

// Port dari resources/views/.../dashboard_tamu.blade.php (Laravel).
// Halaman "gerbang" tempat tamu mengetik nama, asal, dan konfirmasi kehadiran
// sebelum undangan dibuka. Logika JS vanilla di Blade (eksekusiTahapSatu,
// aktifkanEditNama, eksekusiTahapFinal, toggleJumlahOrang) diganti state React.

import { useRef, useState } from "react";
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
import { dataRsvpPath, isClientKeyword } from "@/lib/guest";
import "./gerbang-tamu.css";

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
    id: string | number;
    slug: string;
    namaPria: string;
    namaWanita: string;
    tanggalAcara: string;
  };
  theme: string;
  paket: string;
};

type Status = "" | "hadir" | "tidak_hadir";

// Padanan Carbon translatedFormat('l, d F Y'). Pakai UTC karena tanggal_acara
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

export default function GerbangTamu({ wedding, theme, paket }: Props) {
  const router = useRouter();
  const namaRef = useRef<HTMLInputElement>(null);

  // step 1 = baru ketik nama ("Lanjutkan"), step 2 = isi asal & kehadiran ("Buka Undangan")
  const [step, setStep] = useState<1 | 2>(1);
  const [nama, setNama] = useState("");
  const [asal, setAsal] = useState("");
  const [status, setStatus] = useState<Status>("");
  const [jumlah, setJumlah] = useState("1");

  const hadir = status === "hadir";

  // ---- eksekusiTahapSatu() ----
  function tahapSatu() {
    const namaInput = nama.trim();

    if (namaInput === "") {
      alert("Silakan ketik nama Anda terlebih dahulu!");
      return;
    }

    // "admin"/"client" bukan nama tamu: buka dashboard data RSVP milik pengantin
    // (halaman terpisah dari panel admin NantiKita, yang khusus untuk owner).
    if (isClientKeyword(namaInput)) {
      router.push(dataRsvpPath(wedding.slug));
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(namaInput)) {
      alert("Nama hanya boleh berisi huruf dan spasi saja!");
      return;
    }

    setStep(2);
  }

  // ---- aktifkanEditNama() ----
  function editNama() {
    setStep(1);
    namaRef.current?.focus();
  }

  // ---- toggleJumlahOrang() ----
  function onStatusChange(value: Status) {
    setStatus(value);
    setJumlah(value === "hadir" ? "1" : "0");
  }

  // ---- eksekusiTahapFinal() ----
  // Di Blade: form GET ke URL yang sama. Di sini: navigasi ke URL yang sama
  // dengan query string yang sama, dibaca oleh app/wedding/[slug]/page.tsx.
  function tahapFinal(form: HTMLFormElement) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const params = new URLSearchParams({
      theme,
      paket,
      to: nama.trim(),
      asal: asal.trim(),
      status,
    });
    // Input jumlah berstatus disabled saat "Berhalangan", jadi tidak ikut terkirim.
    if (hadir) params.set("jumlah_hadir", jumlah);
    router.push(`/wedding/${wedding.slug}?${params.toString()}`);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Enter di input & klik tombol utama lewat sini
    if (step === 1) tahapSatu();
    else tahapFinal(e.currentTarget);
  }

  return (
    <main
      className={`gt-root ${alexBrush.variable} ${montserrat.variable} relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#0d0f12] text-[#e2e8f0] antialiased`}
    >
      {/* Ornamen gradasi pendar emas di pojok halaman */}
      <div className="absolute top-[-20%] left-[-20%] -z-10 h-[500px] w-[500px] rounded-full bg-linear-to-tr from-[#d4af37]/10 to-transparent blur-[120px]" />
      <div className="absolute right-[-20%] bottom-[-20%] -z-10 h-[600px] w-[600px] rounded-full bg-linear-to-br from-[#aa841e]/5 to-transparent blur-[150px]" />

      <div className="z-50 flex w-full max-w-md flex-col items-center p-6 text-center">
        {/* Header */}
        <div className="mb-10 space-y-3 select-none">
          <p className="text-[10px] font-bold tracking-[0.6em] text-[#c5a880] uppercase">
            The Wedding of
          </p>
          <h1 className="gt-script bg-linear-to-b from-[#f9f5e8] via-[#dfba6b] to-[#b89742] bg-clip-text text-6xl text-transparent drop-shadow-sm transition-all duration-300 md:text-7xl">
            {wedding.namaPria} &amp; {wedding.namaWanita}
          </h1>
          <p className="text-xs font-semibold tracking-[0.3em] text-[#c5a880] uppercase opacity-90">
            {formatHariTanggal(wedding.tanggalAcara)}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex w-full flex-col items-center"
        >
          <div className="w-full space-y-4">
            {/* CARD 1: input nama */}
            <div className="group/card1 rounded-2xl border border-white/10 bg-black/40 px-6 py-6 text-left shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#dfba6b]/40">
              {step === 2 && (
                <div className="gt-badge-in mb-3 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#dfba6b] uppercase">
                    <BsPatchCheckFill className="text-[#dfba6b]" /> Tamu Eksklusif
                    Terverifikasi
                  </p>
                  <span className="rounded-full border border-[#dfba6b]/20 bg-[#dfba6b]/10 px-2.5 py-0.5 text-[9px] font-bold tracking-wide text-[#dfba6b]">
                    Verified
                  </span>
                </div>
              )}

              {step === 1 && (
                <p className="mb-3 text-[11px] font-semibold tracking-widest text-gray-400 uppercase transition-colors duration-300 group-hover/card1:text-[#dfba6b]">
                  Kepada Yth. Bapak/Ibu/Saudara/i:
                </p>
              )}

              <div
                className={
                  step === 1
                    ? "relative flex items-center border-b-2 border-white/10 py-1 transition-all duration-300 focus-within:border-[#dfba6b]"
                    : "relative flex items-center py-1 transition-all duration-300"
                }
              >
                <input
                  ref={namaRef}
                  type="text"
                  name="to"
                  placeholder="Ketik nama Anda di sini..."
                  required
                  autoComplete="off"
                  readOnly={step === 2}
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className={`w-full bg-transparent text-xl font-bold tracking-wide text-white transition-all duration-300 placeholder:text-gray-600 focus:outline-none ${
                    step === 1 ? "text-left" : "text-center"
                  }`}
                />

                {step === 2 && (
                  <button
                    type="button"
                    onClick={editNama}
                    aria-label="Ubah nama"
                    className="ml-2 transform cursor-pointer transition-transform hover:scale-110 focus:outline-none active:scale-95"
                  >
                    <BsPencilSquare className="text-base text-gray-400 hover:text-[#dfba6b]" />
                  </button>
                )}
              </div>
            </div>

            {/* CARD 2: asal, konfirmasi & jumlah */}
            {step === 2 && (
              <div className="gt-fade-in-slide group/card2 space-y-4 rounded-2xl border border-white/10 bg-black/40 px-6 py-6 text-left opacity-0 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#dfba6b]/40">
                {/* Asal / Kota */}
                <div className="group/input space-y-1.5">
                  <label
                    htmlFor="gt-asal"
                    className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-colors duration-300 group-hover/input:text-[#dfba6b]"
                  >
                    Asal / Kota
                  </label>
                  <div className="relative flex items-center">
                    <BsGeoAlt className="absolute left-3 text-sm text-gray-500 transition-all duration-300 group-focus-within/input:scale-110 group-focus-within/input:text-[#dfba6b]" />
                    <input
                      id="gt-asal"
                      type="text"
                      name="asal"
                      placeholder="Contoh: Bandung"
                      required
                      value={asal}
                      onChange={(e) => setAsal(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pr-4 pl-9 text-sm font-semibold text-white transition-all duration-300 hover:border-gray-600 focus:border-[#dfba6b] focus:bg-black/40 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Konfirmasi kehadiran */}
                <div className="group/select space-y-1.5">
                  <label
                    htmlFor="gt-status"
                    className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-colors duration-300 group-hover/select:text-[#dfba6b]"
                  >
                    Konfirmasi Kehadiran
                  </label>
                  <div className="relative flex items-center">
                    <BsCalendarCheck className="absolute left-3 text-sm text-gray-500 transition-all duration-300 group-focus-within/select:scale-110 group-focus-within/select:text-[#dfba6b]" />
                    <select
                      id="gt-status"
                      name="status"
                      required
                      value={status}
                      onChange={(e) => onStatusChange(e.target.value as Status)}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-black/20 py-2.5 pr-4 pl-9 text-sm font-semibold text-white transition-all duration-300 hover:border-gray-600 focus:border-[#dfba6b] focus:bg-black/40 focus:outline-none"
                    >
                      <option value="" disabled className="bg-[#121212]">
                        -- Pilih Kehadiran --
                      </option>
                      <option value="hadir" className="bg-[#121212]">
                        Akan Hadir
                      </option>
                      <option value="tidak_hadir" className="bg-[#121212]">
                        Berhalangan
                      </option>
                    </select>
                    <BsChevronDown className="pointer-events-none absolute right-3 text-xs text-gray-500 transition-transform duration-300 group-focus-within/select:rotate-180" />
                  </div>
                </div>

                {/* Jumlah orang */}
                <div className="group/jumlah space-y-1.5">
                  <label
                    htmlFor="gt-jumlah"
                    className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-colors duration-300 group-hover/jumlah:text-[#dfba6b]"
                  >
                    Jumlah Orang Yang Hadir
                  </label>
                  <div className="relative flex items-center">
                    <BsPeople
                      className={`absolute left-3 text-sm transition-all duration-300 ${
                        hadir ? "text-[#dfba6b]" : "text-gray-600"
                      }`}
                    />
                    <input
                      id="gt-jumlah"
                      type="number"
                      name="jumlah_hadir"
                      min={1}
                      max={10}
                      disabled={!hadir}
                      required={hadir}
                      value={jumlah}
                      onChange={(e) => setJumlah(e.target.value)}
                      className={`w-full rounded-xl border py-2.5 pr-4 pl-9 text-center text-sm font-bold transition-all duration-300 focus:outline-none ${
                        hadir
                          ? "border-white/10 bg-black/20 text-white hover:border-gray-600 focus:border-[#dfba6b] focus:bg-black/40"
                          : "cursor-not-allowed border-white/5 bg-white/5 text-gray-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 text-[10px] font-medium tracking-wide text-gray-500 italic transition-all duration-300 select-none">
            {step === 1
              ? "*Ketik nama Anda lalu klik tombol Lanjutkan"
              : "*Pastikan semua data di atas telah diisi dengan benar"}
          </p>

          {/* Tombol utama emas metalik dengan efek shimmer */}
          <button
            type="submit"
            className={`gt-shimmer relative mt-4 cursor-pointer overflow-hidden rounded-full bg-linear-to-r to-[#b89742] px-12 py-3.5 text-xs font-bold tracking-widest text-[#0d0f12] uppercase shadow-xl shadow-[#dfba6b]/10 transition-all duration-300 hover:scale-105 hover:shadow-[#dfba6b]/20 active:scale-95 ${
              step === 1
                ? "from-[#b89742] via-[#dfba6b]"
                : "from-[#dfba6b] via-[#dfba6b]"
            }`}
          >
            {step === 1 ? "Lanjutkan" : "Buka Undangan"}
          </button>
        </form>
      </div>
    </main>
  );
}