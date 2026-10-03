import Link from "next/link";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { BsWhatsapp } from "react-icons/bs";
import { TEMPLATES, waLink } from "@/lib/marketing";
import {
  PricingSection,
  SiteFooter,
  StepsSection,
} from "@/components/MarketingSections";
import "./landing.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

// Hanya dipakai untuk nama mempelai di contoh undangan pada hero.
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-playfair",
  display: "swap",
});

const THEME_NAMES = TEMPLATES.map((t) => t.title);

const GUESTS = [
  {
    name: "Sinta Maharani",
    initial: "S",
    status: "Hadir",
    count: "2 orang",
    note: "Selamat ya, ikut bahagia!",
  },
  {
    name: "Dimas Pratama",
    initial: "D",
    status: "Hadir",
    count: "1 orang",
    note: "Sampai jumpa di hari bahagia.",
  },
  {
    name: "Rina Wulandari",
    initial: "R",
    status: "Tidak hadir",
    count: "",
    note: "Maaf belum bisa datang, doa terbaik.",
  },
];

export default function HomePage() {
  return (
    <div className={`landing-root ${jakarta.variable} ${playfair.variable}`}>
      {/* Navigasi */}
      <nav className="lp-nav" aria-label="Navigasi utama">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo">
            NantiKita.
          </Link>
          <div className="lp-nav-links">
            <a href="#fitur">Fitur</a>
            <a href="#cara-order">Cara order</a>
            <a href="#harga">Harga</a>
          </div>
          <div className="lp-nav-actions">
            <Link href="/katalog" className="lp-btn lp-btn-light lp-btn-sm">
              Lihat katalog
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="lp-dark lp-hero">
        <div className="lp-wrap lp-hero-grid">
          <div className="lp-hero-copy">
            <h1>
              Undangan pernikahan digital, lengkap dengan RSVP dan daftar hadir
            </h1>
            <p>
              Pilih tema, kirim satu link ke seluruh tamu, dan lihat siapa saja
              yang hadir. Paket mulai dari Rp&nbsp;99.000.
            </p>
            <div className="lp-cta">
              <Link href="/katalog" className="lp-btn lp-btn-light">
                Lihat katalog tema
              </Link>
              <a
                href={waLink(
                  "Halo Admin Nanti Kita, saya mau tanya soal undangan digital",
                )}
                className="lp-btn lp-btn-ghost-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsWhatsapp aria-hidden /> Tanya lewat WhatsApp
              </a>
            </div>
            <p className="lp-hero-note">
              Tamu cukup membuka link di browser, tanpa perlu menginstal
              aplikasi.
            </p>
          </div>

          {/* Contoh undangan + RSVP yang masuk */}
          <div className="lp-stage" aria-hidden="true">
            <div className="lp-phone">
              <div className="lp-phone-notch" />
              <div className="lp-phone-screen">
                <div className="lp-inv">
                  <p className="lp-inv-top">Pernikahan</p>
                  <div className="lp-inv-names">
                    <span>Budi</span>
                    <span className="lp-inv-amp">&amp;</span>
                    <span>Riri</span>
                  </div>
                  <p className="lp-inv-date">Sabtu, 12 Desember 2026</p>
                  <div className="lp-inv-rule" />
                  <p className="lp-inv-to">
                    Kepada Yth.
                    <b>Sinta Maharani</b>
                  </p>
                  <span className="lp-inv-btn">Konfirmasi kehadiran</span>
                </div>
              </div>
            </div>

            <div className="lp-rsvp">
              <div className="lp-rsvp-head">
                <div>
                  <b>Konfirmasi terbaru</b>
                  <small>Budi &amp; Riri</small>
                </div>
              </div>
              <div className="lp-rsvp-list">
                {GUESTS.map((g) => (
                  <div className="lp-rsvp-row" key={g.name}>
                    <div className="lp-avatar">{g.initial}</div>
                    <div className="lp-rsvp-main">
                      <b>{g.name}</b>
                      <small>{g.note}</small>
                    </div>
                    <span
                      className={`lp-badge ${g.status === "Hadir" ? "lp-badge-ok" : "lp-badge-no"}`}
                    >
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fitur */}
      <section id="fitur" className="lp-section">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <h2>Dari undangan sampai daftar hadir, dalam satu tempat</h2>
            <p>
              Tamu membuka undangan lewat satu link. Konfirmasi dan ucapan
              mereka langsung tersimpan rapi.
            </p>
          </div>

          <div className="lp-bento">
            <article className="lp-card lp-b-list">
              <div className="lp-card-title-row">
                <h3>Daftar hadir yang rapi</h3>
                <span className="lp-badge lp-badge-gold">Premium</span>
              </div>

              <p className="lp-card-sub">
                Setiap konfirmasi tamu masuk ke satu daftar. Unduh sebagai PDF
                untuk dicetak atau dibagikan ke keluarga.
              </p>
              <div
                className="lp-table-wrap"
                role="img"
                aria-label="Contoh daftar hadir tamu"
              >
                <table className="lp-table">
                  <thead>
                    <tr>
                      <th>Nama tamu</th>
                      <th>Status</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="lp-name">Sinta Maharani</span>
                      </td>
                      <td>
                        <span className="lp-badge lp-badge-ok">Hadir</span>
                      </td>
                      <td>2</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="lp-name">Dimas Pratama</span>
                      </td>
                      <td>
                        <span className="lp-badge lp-badge-ok">Hadir</span>
                      </td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="lp-name">Rina Wulandari</span>
                      </td>
                      <td>
                        <span className="lp-badge lp-badge-no">
                          Tidak hadir
                        </span>
                      </td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="lp-name">Keluarga Pak Anwar</span>
                      </td>
                      <td>
                        <span className="lp-badge lp-badge-ok">Hadir</span>
                      </td>
                      <td>4</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="lp-list-foot">
                <span>
                  Total tamu hadir <b>7 orang</b>
                </span>
                <span
                  className="lp-btn lp-btn-outline lp-btn-sm lp-static"
                  aria-hidden="true"
                >
                  Unduh PDF
                </span>
              </div>
            </article>

            <article className="lp-card lp-b-link">
              <h3>Satu link untuk semua tamu</h3>
              <p className="lp-card-sub">
                Setiap pasangan punya alamat undangan sendiri, mudah dibagikan
                lewat WhatsApp atau media sosial.
              </p>
              <div className="lp-browser" aria-hidden="true">
                <div className="lp-browser-bar">
                  <i />
                  <i />
                  <i />
                  <span>/wedding/budi-dan-riri</span>
                </div>
                <div className="lp-browser-body">
                  <span>Budi &amp; Riri</span>
                  <small>12 Desember 2026</small>
                </div>
              </div>
            </article>

            <article className="lp-card lp-b-wish">
                <h3>Ucapan dan doa restu</h3>
              <p className="lp-card-sub">
                Tamu menulis ucapan langsung di halaman undangan, tersimpan
                bersama RSVP mereka.
              </p>
              <blockquote className="lp-quote">
                Selamat menempuh hidup baru. Semoga sakinah, mawaddah, warahmah.
                <cite>Dimas Pratama</cite>
              </blockquote>
            </article>

            <article className="lp-card lp-b-theme">
              <h3>Pilih tema yang cocok</h3>
              <p className="lp-card-sub">
                Setiap tema bisa dicoba dulu lewat demo sebelum Anda memesan.
              </p>
              <ul className="lp-chips">
                {THEME_NAMES.map((t) => (
                  <li key={t} className="lp-badge lp-badge-plain">
                    {t}
                  </li>
                ))}
              </ul>
              <Link href="/katalog" className="lp-textlink">
                Lihat semua tema di katalog
              </Link>
            </article>
          </div>
        </div>
      </section>

      <StepsSection />

      <PricingSection>
        <SiteFooter />
      </PricingSection>
    </div>
  );
}
