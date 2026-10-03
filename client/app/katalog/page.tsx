"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { BsWhatsapp } from "react-icons/bs";
import { isThemeActive } from "@/lib/themes";
import { DEMO_SLUG, TEMPLATES, waLink } from "@/lib/marketing";
import {
  PricingSection,
  SiteFooter,
  StepsSection,
} from "@/components/MarketingSections";
import "../landing.css";
import "./katalog.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

// Dipakai untuk nama tema pada gambar pengganti kalau screenshot belum ada.
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-playfair",
  display: "swap",
});

const NAV_ITEMS = [
  { id: "katalog", label: "Katalog" },
  { id: "cara-order", label: "Cara order" },
  { id: "harga", label: "Harga" },
];
const SECTION_IDS = NAV_ITEMS.map((n) => n.id);

type Filter = "all" | "ready" | "soon";

const demoHref = (theme: string, paket: "basic" | "premium") =>
  `/wedding/${DEMO_SLUG}?theme=${theme}&paket=${paket}&from_katalog=true`;

/* Menandai menu yang sesuai dengan bagian yang sedang dibaca */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/* Gambar tema. Kalau file gambarnya tidak ada, yang tampil nama tema di atas latar hijau. */
function ThemeThumb({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  // onError bisa terlewat kalau gambar gagal sebelum hydration selesai.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <div className="kt-thumb">
      <span className="kt-thumb-name" aria-hidden="true">
        {title}
      </span>
      {!failed && (
        <img
          ref={ref}
          src={src}
          alt={`Contoh undangan tema ${title}`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function KatalogPage() {
  const active = useActiveSection(SECTION_IDS);
  const [filter, setFilter] = useState<Filter>("all");

  // Tema yang sudah siap dipesan ditaruh di depan.
  const items = useMemo(
    () =>
      TEMPLATES.map((t) => ({ ...t, ready: isThemeActive(t.key) })).sort(
        (a, b) => Number(b.ready) - Number(a.ready),
      ),
    [],
  );

  const counts = {
    all: items.length,
    ready: items.filter((t) => t.ready).length,
    soon: items.filter((t) => !t.ready).length,
  };

  const visible = items.filter((t) =>
    filter === "all" ? true : filter === "ready" ? t.ready : !t.ready,
  );

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "all", label: "Semua" },
    { id: "ready", label: "Siap dipesan" },
    { id: "soon", label: "Segera hadir" },
  ];

  return (
    <div
      id="top"
      className={`landing-root katalog-root ${jakarta.variable} ${playfair.variable}`}
    >
      {/* Navigasi */}
      <nav className="lp-nav" aria-label="Navigasi utama">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo">
            NantiKita.
          </Link>
          <div className="lp-nav-links">
            {NAV_ITEMS.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={active === n.id ? "is-active" : undefined}
                aria-current={active === n.id ? "location" : undefined}
              >
                {n.label}
              </a>
            ))}
          </div>
          <div className="lp-nav-actions">
            <a
              href={waLink("Halo Admin Nanti Kita, saya mau tanya soal undangan digital")}
              className="lp-btn lp-btn-light lp-btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BsWhatsapp aria-hidden /> Hubungi admin
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="lp-dark kt-hero">
        <div className="lp-wrap">
          <h1>Katalog template undangan</h1>
          <p>
            Buka demo setiap tema dalam versi Basic dan Premium, lalu pesan
            lewat WhatsApp.
          </p>
        </div>
      </header>

      {/* Katalog */}
      <section id="katalog" className="kt-section">
        <div className="lp-wrap">
          <div className="kt-toolbar">
            <div className="kt-filters" role="group" aria-label="Filter tema">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`kt-filter${filter === f.id ? " on" : ""}`}
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                  <span>{counts[f.id]}</span>
                </button>
              ))}
            </div>
            <p className="kt-note">
              Demo terbuka di tab baru. Tema berlabel Segera masih disiapkan,
              jadi demonya memakai tampilan sementara.
            </p>
          </div>

          <ul className="kt-grid">
            {visible.map((t) => (
              <li className="kt-card" key={t.key}>
                <ThemeThumb src={t.image} title={t.title} />
                <div className="kt-body">
                  <div className="kt-badges">
                    <span
                      className={`lp-badge ${t.ready ? "lp-badge-ok" : "lp-badge-plain"}`}
                    >
                      {t.ready ? "Siap dipesan" : "Segera"}
                    </span>
                    {t.special && (
                      <span className="lp-badge lp-badge-gold">Special edition</span>
                    )}
                  </div>
                  <h3>{t.title}</h3>
                  <div className="kt-actions">
                    <Link
                      href={demoHref(t.key, "basic")}
                      className="lp-btn lp-btn-outline lp-btn-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Demo Basic
                    </Link>
                    <Link
                      href={demoHref(t.key, "premium")}
                      className="lp-btn lp-btn-primary lp-btn-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Demo Premium
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StepsSection />

      <PricingSection>
        <SiteFooter />
      </PricingSection>

      {/* WhatsApp mengambang */}
      <a
        href={waLink()}
        className="kt-wa"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi admin lewat WhatsApp"
      >
        <BsWhatsapp aria-hidden />
      </a>
    </div>
  );
}
