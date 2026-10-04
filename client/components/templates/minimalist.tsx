"use client";

import { useEffect, useRef, useState } from "react";
import UcapanForm from "@/components/UcapanForm";

type Wedding = {
  slug: string;
  namaPria: string;
  namaWanita: string;
  tanggalAcara: string;
  lokasiAcara: string;
};

type Props = {
  wedding: Wedding;
  tamu: string;
  themeReady: boolean;
  isDariKatalog: boolean;
};

const asset = (name: string) => `/themes/minimalist/assets/${name}`;

export default function MinimalistTemplate({
  wedding,
  tamu,
  themeReady,
  isDariKatalog,
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [coverLeaving, setCoverLeaving] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<number | null>(null);

  const date = new Date(wedding.tanggalAcara);
  const shortDate = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  const fullDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(date);

  useEffect(() => {
    document.documentElement.classList.add("js");
    return () => document.documentElement.classList.remove("js");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("open", inviteVisible);
    return () => document.body.classList.remove("open");
  }, [inviteVisible]);

  useEffect(() => {
    if (!inviteVisible || !rootRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    rootRef.current.querySelectorAll("#invite section").forEach((section) => {
      let rows = 0;
      Array.from(section.children).forEach((element, index) => {
        if (element.classList.contains("tag")) return;
        element.classList.add("rv");
        if (element instanceof HTMLElement) {
          element.style.transitionDelay = `${Math.min(index * 0.06, 0.24)}s`;
        }
        if (element.matches("img.frame, img.ii, .gframe, .qc")) {
          element.classList.add("z");
        } else if (element.classList.contains("row")) {
          element.classList.add(rows++ % 2 ? "r" : "l");
        } else if (element.matches("h2")) {
          element.classList.add("sp");
        }
        observer.observe(element);
      });
    });
    rootRef.current.querySelectorAll("#invite .slot").forEach((element) => {
      element.classList.add("rv");
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [inviteVisible]);

  function openInvitation() {
    setCoverLeaving(true);
    window.setTimeout(() => {
      setInviteVisible(true);
      window.scrollTo(0, 0);
    }, 750);
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setMusicPlaying(true);
      } catch {
        setMusicPlaying(false);
      }
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  }

  async function copyAccount(account: string, index: number) {
    try {
      await navigator.clipboard.writeText(account);
      setCopiedAccount(index);
      window.setTimeout(() => setCopiedAccount(null), 1500);
    } catch {
      setCopiedAccount(null);
    }
  }

  const accounts = [
    { name: `a.n ${wedding.namaPria} & ${wedding.namaWanita}`, number: "6666666666" },
    { name: `a.n ${wedding.namaPria}`, number: "6666666666" },
    { name: `a.n ${wedding.namaWanita}`, number: "6666666666" },
  ];

  return (
    <main ref={rootRef}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&family=Literata:ital,wght@0,400;1,400&family=Saira+Semi+Condensed:wght@400&family=Dancing+Script:wght@500&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href={asset("css/style.css")} />

      {!themeReady && (
        <p role="status" className="mx-auto max-w-md bg-yellow-50 p-3 text-sm text-yellow-800">
          Tema &quot;minimalist&quot; sedang disiapkan. Menampilkan tampilan sementara.
        </p>
      )}

      <div id="cover" className={coverLeaving ? "leaving" : undefined} style={{ display: inviteVisible ? "none" : undefined }}>
        <p className="wo">THE WEDDING OF</p>
        <h1>{wedding.namaPria} &amp; {wedding.namaWanita}</h1>
        <img className="pimg" src={asset("img/printer.webp")} alt="" />
        <div className="slot">
          <div className="polaroid cv">
            <img className="cph" src={asset("img/cover-photo.jpg")} alt="" />
            <p>{shortDate.replaceAll("/", " - ")}</p>
          </div>
        </div>
        <p className="to">TO : {tamu}</p>
        <button className="btn" type="button" onClick={openInvitation}>Click to open</button>
      </div>

      <div id="invite" style={{ display: inviteVisible ? "block" : "none" }}>
        <div className="wrap">
          <section>
            <h3 className="sm">{wedding.namaPria} &amp; {wedding.namaWanita}</h3>
            <p className="sm2">{shortDate}</p>
            <div className="op">
              <div className="bq">
                <span className="qm">“</span>
                <p>Dan di atas semuanya itu: kenakanlah kasih, sebagai pengikat yang mempersatukan</p>
                <p><em>Kolose 3 : 14</em></p>
              </div>
              <img className="ii" src={asset("img/dinner-table.webp")} alt="" width="150" />
            </div>
          </section>
          <section>
            <h2>The Groom</h2>
            <img className="ii" src={asset("img/loafers.webp")} alt="" width="64" />
            <p>Dengan penuh kasih dan doa restu keluarga</p>
            <img className="frame" src={asset("img/groom.webp")} alt="" />
            <h3>{wedding.namaPria}</h3>
            <img className="ii" src={asset("img/ring.webp")} alt="" width="110" />
            <h3>{wedding.namaWanita}</h3>
            <img className="frame" src={asset("img/bride.webp")} alt="" />
            <p>Dengan penuh kasih dan doa restu keluarga</p>
            <img className="ii" src={asset("img/heels.webp")} alt="" width="64" />
            <h2>The Bride</h2>
            <img className="ii" src={asset("img/couple.webp")} alt="" width="150" />
          </section>
          <section>
            <h2>The Love Story</h2>
            <div className="row">
              <div>
                <h3>Chapter 1 – First Meet, First Spark</h3>
                <p>January 21st, 2024. Mereka bertemu dan mulai menulis kisah bersama.</p>
              </div>
            </div>
            <div className="row">
              <div>
                <h3>Chapter 2 – Official Mode On</h3>
                <p>Dua hati memilih untuk berjalan bersama, saling mendukung dalam setiap langkah.</p>
              </div>
              <img className="pf" src={asset("img/love-bw-1.jpg")} alt="" style={{ transform: "rotate(4deg)" }} />
            </div>
            <div className="row ta-r">
              <div>
                <h3>Chapter 3 – Big Moves, Real Dreams</h3>
                <p>Bersama, mereka membangun impian dan masa depan yang penuh harapan.</p>
              </div>
            </div>
            <div className="row ta-r">
              <img className="pf" src={asset("img/love-bw-2.jpg")} alt="" style={{ transform: "rotate(-4deg)" }} />
              <div>
                <h3>Chapter 4 – Going to Forever</h3>
                <p>Dengan penuh cinta, mereka siap melangkah menuju hari bahagia dan selamanya.</p>
              </div>
            </div>
          </section>
          <section>
            <div className="gframe">
              <h2>Collect Your Photos</h2>
              <img className="pimg" src={asset("img/printer.webp")} alt="" />
              <div className="slot">
                <div className="strip">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
                    <img key={number} className="g" src={asset(`img/gallery-${number}.jpg`)} alt="" />
                  ))}
                  <p style={{ fontSize: 12, letterSpacing: ".2em" }}>{wedding.namaPria[0]} &amp; {wedding.namaWanita[0]}</p>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h2>The Details</h2>
            <h3>Holy Matrimony</h3>
            <img className="ii" src={asset("img/rings.webp")} alt="" width="80" />
            <p className="t">{fullDate}</p>
            <p className="pl">{wedding.lokasiAcara}</p>
            <a className="btn" href={`https://maps.google.com/?q=${encodeURIComponent(wedding.lokasiAcara)}`}>Direction</a>
            <div style={{ height: 44 }} />
            <h3>Wedding Reception</h3>
            <img className="ii" src={asset("img/cake.webp")} alt="" width="70" />
            <p className="t">{fullDate}</p>
            <p className="pl">{wedding.lokasiAcara}</p>
            <a className="btn" href={`https://maps.google.com/?q=${encodeURIComponent(wedding.lokasiAcara)}`}>Direction</a>
          </section>
          <section>
            <div className="qc">
              <div className="qc-back" />
              <div className="qc-card">
                <p>Love isn’t fireworks every day,</p>
                <div className="qc-media"><img src={asset("img/quote-photo.jpg")} alt="" /></div>
                <p>it’s staying when the sparks fade.</p>
              </div>
            </div>
          </section>
          {!isDariKatalog && (
            <section>
              <span className="tag">8. RSVP</span>
              <h2>Wish &amp; Prayer</h2>
              <p>Tinggalkan ucapan dan doa untuk kedua mempelai</p>
              <UcapanForm slug={wedding.slug} nama={tamu} />
            </section>
          )}
          <section>
            <span className="tag">9. VIRTUAL GIFT</span>
            <div className="gift">
              <div className="accts">
                {accounts.map((account, index) => (
                  <div className="acct" key={account.name}>
                    {index > 0 && <hr />}
                    <h3>BCA</h3>
                    <p>{account.name}</p>
                    <div className="num">
                      <span>{account.number}</span>
                      <button type="button" onClick={() => void copyAccount(account.number, index)}>
                        {copiedAccount === index ? "Tersalin" : "Salin"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <h2 className="vg">virt<br />ual<br />gift</h2>
            </div>
          </section>
          <section style={{ border: 0 }}>
            <p style={{ fontSize: 18 }}>see you soon!</p>
            <p style={{ fontSize: 18 }}>love, {wedding.namaPria[0]} &amp; {wedding.namaWanita[0]}</p>
            <img className="ii" src={asset("img/car.webp")} alt="" width="220" />
          </section>
        </div>
      </div>
      <button className={`vinyl${musicPlaying ? " spin" : ""}`} type="button" aria-label="Musik" onClick={() => void toggleMusic()}>
        musik
      </button>
      <audio ref={audioRef} loop preload="auto" src={asset("music/background.mp3")} />
    </main>
  );
}
