import Link from "next/link";
import {
  BsCheckCircleFill,
  BsInstagram,
  BsWhatsapp,
  BsXCircleFill,
} from "react-icons/bs";
import {
  BASIC_FEATURES,
  INSTAGRAM_URL,
  PACKAGES,
  PREMIUM_FEATURES,
  STEPS,
  waLink,
} from "@/lib/marketing";
import "../app/landing.css";

// Bagian-bagian ini dipakai di landing (/) dan katalog (/katalog).
// Wajib dirender di dalam elemen ber-class "landing-root" (token warna & font ada di sana).

export function StepsSection() {
  return (
    <section id="cara-order" className="lp-section lp-section-steps">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <h2>Cara order</h2>
          <p>Tiga langkah, dan Anda tidak perlu mengurus apa pun sendiri.</p>
        </div>
        <ol className="lp-steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <div className="lp-step-top">
                <span className="lp-step-no">{i + 1}</span>
                {i < STEPS.length - 1 && <span className="lp-step-line" />}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PricingSection({ children }: { children?: React.ReactNode }) {
  return (
    <section id="harga" className="lp-dark lp-pricing">
      <div className="lp-wrap">
        <div className="lp-section-head lp-on-dark">
          <h2>Dua paket, harga jelas</h2>
          <p>Pesan lewat WhatsApp. Admin akan membantu sampai undangan Anda siap.</p>
        </div>

        <div className="lp-price-grid">
          <article className="lp-price">
            <div className="lp-price-head">
              <h3>{PACKAGES.basic.name}</h3>
              <div className="lp-price-amount">{PACKAGES.basic.price}</div>
              <div className="lp-price-sub">{PACKAGES.basic.sub}</div>
            </div>
            <ul className="lp-features">
              {BASIC_FEATURES.map((f) => (
                <li key={f.text} className={f.ok ? "" : "lp-no"}>
                  {f.ok ? (
                    <BsCheckCircleFill className="lp-ic-ok" aria-hidden />
                  ) : (
                    <BsXCircleFill className="lp-ic-no" aria-hidden />
                  )}
                  {f.text}
                </li>
              ))}
            </ul>
            <a
              href={waLink("Halo Admin Nanti Kita, saya mau order Paket Basic")}
              className="lp-btn lp-btn-outline lp-btn-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pesan Basic lewat WhatsApp
            </a>
          </article>

          <article className="lp-price lp-price-main">
            <span className="lp-price-flag">Paling lengkap</span>
            <div className="lp-price-head">
              <h3>{PACKAGES.premium.name}</h3>
              <div className="lp-price-amount">{PACKAGES.premium.price}</div>
              <div className="lp-price-sub">{PACKAGES.premium.sub}</div>
            </div>
            <ul className="lp-features">
              {PREMIUM_FEATURES.map((text) => (
                <li key={text}>
                  <BsCheckCircleFill className="lp-ic-ok" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
            <a
              href={waLink("Halo Admin Nanti Kita, saya mau order Paket Premium")}
              className="lp-btn lp-btn-primary lp-btn-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pesan Premium lewat WhatsApp
            </a>
          </article>
        </div>

        {children}
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-top">
        <div>
          <Link href="/" className="lp-logo">
            NantiKita.
          </Link>
          <p>Platform undangan pernikahan digital.</p>
        </div>
        <div className="lp-footer-links">
          <Link href="/">Beranda</Link>
          <Link href="/katalog">Katalog tema</Link>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            <BsInstagram aria-hidden /> Instagram
          </a>
          <a href={waLink()} target="_blank" rel="noopener noreferrer">
            <BsWhatsapp aria-hidden /> WhatsApp
          </a>
        </div>
      </div>
      <p className="lp-copy">&copy; 2026 NantiKita. All rights reserved.</p>
    </footer>
  );
}
