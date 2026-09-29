"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Montserrat, Playfair_Display } from "next/font/google";
import {
  BsCheckCircleFill,
  BsInstagram,
  BsList,
  BsWhatsapp,
  BsXCircleFill,
} from "react-icons/bs";
import "./katalog.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const WA_NUMBER = "628976337088";
const DEMO_SLUG = "budi-dan-riri";

/* ------------------------------ Data ------------------------------ */

type TemplateItem = {
  key: string; // dipakai di ?theme=
  title: string;
  image: string;
  alt: string;
  edition?: string;
};

const TEMPLATES: TemplateItem[] = [
  {
    key: "rustic",
    title: "RUSTIC",
    image: "/themes/rustic/assets/img/rustic-thumbnail.jpeg",
    alt: "rustic",
  },
  {
    key: "floral_luxury",
    title: "FLORAL LUXURY",
    edition: "Special Edition :",
    // Placeholder sementara sampai screenshot aslinya ada
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=500",
    alt: "Floral Luxury",
  },
  {
    key: "sage",
    title: "SAGE GREEN & BOTANICAL",
    image: "/themes/sage/assets/img/cover-sage-botanical.jpg",
    alt: "sage green & botanical",
  },
  {
    key: "japandi",
    title: "JAPANDI",
    image: "/themes/japandi/assets/img/cover-japandi.jpg",
    alt: "japandi",
  },
  {
    key: "cinematic",
    title: "CINEMATIC",
    image: "/themes/cinematic/assets/img/cover-cinematic.jpg",
    alt: "cinematic",
  },
  {
    key: "midnight",
    title: "MIDNIGHT & ROMANCE",
    image: "/themes/midnight/assets/img/cover-midnight.jpg",
    alt: "midnight",
  },
];

const BASIC_FEATURES = [
  { text: "Custom Nama Tamu", ok: true },
  { text: "Teks & Protokol Kesehatan", ok: true },
  { text: "Navigasi Peta Lokasi (Google Maps)", ok: true },
  { text: "Galeri Foto (Maks 5 Foto)", ok: true },
  { text: "Fitur Angpao Digital / Rekening", ok: true },
  { text: "Tanpa Background Musik Custom", ok: false },
  { text: "Tanpa Fitur RSVP & Ucapan", ok: false },
];

const PREMIUM_FEATURES = [
  "Semua Fitur Paket Basic",
  "Masa Aktif Lebih Lama",
  "Galeri Foto & Video Tanpa Batas",
  "Background Musik Bebas Request",
  "Fitur RSVP & Konfirmasi Kehadiran",
  "Kolom Ucapan & Doa Restu (Live)",
  "Fitur Spesial Story/Kisah Cinta",
];

const STEPS = [
  {
    no: "01",
    title: "Pilih Desain",
    desc: "Cari dan tentukan template undangan favorit Anda di katalog atas, lalu klik tombol paket yang diinginkan.",
    highlight: false,
  },
  {
    no: "02",
    title: "Isi Data & Musik",
    desc: "Konsultasikan via WhatsApp untuk pengisian data mempelai, galeri foto, lokasi acara, hingga request musik latar.",
    highlight: true,
  },
  {
    no: "03",
    title: "Undangan Siap Kirim",
    desc: "Proses pengerjaan cepat. Undangan digital premium Anda siap disebarkan ke seluruh daftar tamu spesial.",
    highlight: false,
  },
];

const NAV_ITEMS = [
  { label: "Katalog Template", href: "#top" },
  { label: "Harga & Paket", href: "#harga" },
  { label: "Cara Order", href: "#cara-order" },
];

const demoHref = (theme: string, paket: "basic" | "premium") =>
  `/wedding/${DEMO_SLUG}?theme=${theme}&paket=${paket}&from_katalog=true`;

const waOrder = (paket: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Halo Admin Nanti Kita, saya mau order Paket ${paket}`
  )}`;

/* ------------------- Efek hover otomatis saat di-scroll ------------------- */
/* Pengganti IntersectionObserver + .scroll-trigger di blade */

function ScrollTrigger({
  cardClassName,
  children,
}: {
  cardClassName: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { root: null, threshold: 0.5, rootMargin: "-10% 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="k-col" ref={ref}>
      <div className={`${cardClassName}${active ? " auto-hover" : ""}`}>{children}</div>
    </div>
  );
}

/* ------------------------------ Navbar ------------------------------ */

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [slider, setSlider] = useState({ left: 6, width: 0 });
  const [animate, setAnimate] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const moveSlider = useCallback((idx: number) => {
    const item = itemRefs.current[idx];
    const container = centerRef.current;
    if (!item || !container) return;
    const t = item.getBoundingClientRect();
    const c = container.getBoundingClientRect();
    setSlider({ left: t.left - c.left, width: t.width });
  }, []);

  // Posisi awal (tanpa animasi), lalu aktifkan transisi
  useEffect(() => {
    moveSlider(0);
    const id = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(id);
  }, [moveSlider]);

  // Pindah slider saat item aktif berubah & saat resize
  useEffect(() => {
    moveSlider(activeIdx);
    const onResize = () => moveSlider(activeIdx);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIdx, moveSlider]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <div className="container-navbar-custom">
        <a className="navbar-brand-logo" href="#top">
          <img src="/images/Logo NantiKita.png" alt="Logo Nanti Kita" className="nav-logo-img" />
        </a>

        <div className="navbar-center-menu" ref={centerRef}>
          <div
            className={`nav-bg-slider${animate ? "" : " no-animation"}`}
            style={{ left: slider.left, width: slider.width }}
          />
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`center-menu-item${activeIdx === i ? " active" : ""}`}
              href={item.href}
              onClick={() => setActiveIdx(i)}
            >
              {item.label}
            </a>
          ))}
        </div>

        <button
          ref={buttonRef}
          className="custom-hamburger-capsule"
          type="button"
          aria-label="Buka menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <BsList className="menu-icon" />
        </button>

        <div className={`nantikita-menu${menuOpen ? " show" : ""}`} ref={menuRef}>
          <div className="mobile-menu-links">
            <a className="dropdown-item-link" href="#katalog">
              Katalog Template
            </a>
            <a className="dropdown-item-link" href="#harga">
              Harga &amp; Paket
            </a>
            <a className="dropdown-item-link" href="#cara-order">
              Cara Order
            </a>
            <div className="dropdown-divider" />
          </div>

          <div className="dropdown-social-wrapper">
            <span>Hubungi Kami:</span>
            <div className="social-icons-box">
              <a
                className="item-bi"
                href="https://www.instagram.com/nantikitadigitalwedding"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsInstagram /> Instagram
              </a>
              <a
                className="item-bi"
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsWhatsapp /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------ Page ------------------------------ */

export default function KatalogPage() {
  return (
    <div id="top" className={`katalog-root ${montserrat.variable} ${playfair.variable}`}>
      <Navbar />

      {/* Hero */}
      <div className="hero-catalog">
        <h2>Katalog Template</h2>
        <p>Temukan desain undangan digital impian Anda bersama Nanti Kita</p>
      </div>

      {/* Katalog */}
      <div id="katalog" className="k-container">
        <div className="k-grid-katalog">
          {TEMPLATES.map((t) => (
            <div className="k-col" key={t.key}>
              <div className="template-card">
                <div className="card-img-wrapper">
                  <img src={t.image} alt={t.alt} />
                </div>
                <div className="p-2-custom">
                  <div>
                    {t.edition && <div className="edition-label">{t.edition}</div>}
                    <div className="template-title">{t.title}</div>
                  </div>
                  <div className="button-group-wrapper">
                    <div className="template-btns">
                      <Link
                        href={demoHref(t.key, "basic")}
                        className="btn btn-primary"
                        target="_blank"
                      >
                        Lihat Basic
                      </Link>
                    </div>
                    <div className="template-btns">
                      <Link
                        href={demoHref(t.key, "premium")}
                        className="btn btn-secondary"
                        target="_blank"
                      >
                        Lihat Premium
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Harga */}
      <div id="harga" className="k-container">
        <div className="k-row-price">
          <ScrollTrigger cardClassName="price-card">
            <div className="price-header">
              <div className="package-name">PAKET BASIC</div>
              <div className="price-amount">Rp 99.000</div>
              <div className="price-sub">Aktif 3 Bulan</div>
            </div>
            <div className="price-body">
              <ul className="price-features">
                {BASIC_FEATURES.map((f) => (
                  <li key={f.text}>
                    {f.ok ? (
                      <BsCheckCircleFill className="feat-ok" />
                    ) : (
                      <BsXCircleFill className="feat-no" />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="price-footer">
              <a
                href={waOrder("Basic")}
                className="btn-price-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pilih Paket
              </a>
            </div>
          </ScrollTrigger>

          <ScrollTrigger cardClassName="price-card popular">
            <div className="popular-badge">PASTILAH PILIH INI</div>
            <div className="price-header">
              <div className="package-name">PAKET PREMIUM</div>
              <div className="price-amount">Rp 149.000</div>
              <div className="price-sub">Aktif Selamanya / 1 Tahun</div>
            </div>
            <div className="price-body">
              <ul className="price-features">
                {PREMIUM_FEATURES.map((text) => (
                  <li key={text}>
                    <BsCheckCircleFill className="feat-ok" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="price-footer">
              <a
                href={waOrder("Premium")}
                className="btn-price-solid"
                target="_blank"
                rel="noopener noreferrer"
              >
                Order Sekarang
              </a>
            </div>
          </ScrollTrigger>
        </div>
      </div>

      {/* Cara order */}
      <div id="cara-order" className="k-container">
        <div className="k-row-steps">
          {STEPS.map((s) => (
            <ScrollTrigger
              key={s.no}
              cardClassName={`step-card${s.highlight ? " highlight" : ""}`}
            >
              <div className="step-number">{s.no}</div>
              <div className="step-content">
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            </ScrollTrigger>
          ))}
        </div>
      </div>

      {/* WhatsApp floating */}
      <a
        href={`https://wa.me/${WA_NUMBER}`}
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Hubungi Admin via WhatsApp"
      >
        <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="WhatsApp" />
      </a>
    </div>
  );
}
