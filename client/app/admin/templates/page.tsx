"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { BsEye, BsGrid, BsListUl } from "react-icons/bs";
import { apiFetch } from "@/lib/api";
import { confirmAction, errorPopup, toastSuccess } from "@/lib/alert";
import { DEMO_SLUG, TEMPLATES } from "@/lib/marketing";

type Status = "active" | "dummy";
type Row = {
  key: string;
  title: string;
  status: Status;
  defaultStatus: Status;
  usage: number;
};
type View = "table" | "grid";
type Filter = "all" | Status;

const demoHref = (theme: string, paket: "basic" | "premium") =>
  `/wedding/${DEMO_SLUG}?theme=${theme}&paket=${paket}&from_katalog=true`;

const coverOf = (key: string) => TEMPLATES.find((t) => t.key === key);

function Thumb({ src, title }: { src?: string; title: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <div className="adm-tpl-thumb">
      <span aria-hidden>{title}</span>
      {!failed && src && (
        <img
          ref={ref}
          src={src}
          alt={`Cover tema ${title}`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function StatusSwitch({
  row,
  busy,
  onToggle,
}: {
  row: Row;
  busy: boolean;
  onToggle: (row: Row) => void;
}) {
  const on = row.status === "active";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Status tema ${row.title}`}
      disabled={busy}
      onClick={() => onToggle(row)}
      className={`adm-switch${on ? " on" : ""}`}
    >
      <span className="adm-switch-knob" />
      <span className="adm-switch-text">
        {on ? "Siap dipakai" : "Belum siap"}
      </span>
    </button>
  );
}

export default function TemplatesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [view, setView] = useState<View>("table");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/templates")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => setRows(json.data || []))
      .catch(() => setFailed(true))
      .finally(() => setLoaded(true));
  }, []);

  async function onToggle(row: Row) {
    const next: Status = row.status === "active" ? "dummy" : "active";
    const ok =
      next === "dummy"
        ? await confirmAction(
            `Tandai "${row.title}" belum siap?`,
            row.usage > 0
              ? `${row.usage} undangan klien memakai tema ini dan akan menampilkan tampilan sementara. Katalog juga menampilkannya sebagai "Segera".`
              : 'Di katalog tema ini akan berlabel "Segera".',
            "Ya, tandai belum siap",
          )
        : await confirmAction(
            `Tandai "${row.title}" siap dipakai?`,
            'Tema ini akan tampil sebagai "Siap dipesan" di katalog.',
            "Ya, tandai siap",
          );
    if (!ok) return;

    setBusyKey(row.key);
    try {
      const res = await apiFetch(`/api/admin/templates/${row.key}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      setRows((list) =>
        list.map((r) => (r.key === row.key ? { ...r, status: next } : r)),
      );
      toastSuccess("Status tema diperbarui.");
    } catch {
      errorPopup("Status tema belum bisa diubah.");
    } finally {
      setBusyKey(null);
    }
  }

  const stats = useMemo(
    () => ({
      total: rows.length,
      ready: rows.filter((r) => r.status === "active").length,
      soon: rows.filter((r) => r.status !== "active").length,
      used: rows.reduce((n, r) => n + r.usage, 0),
    }),
    [rows],
  );

  const visible = rows.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (r.title + r.key).toLowerCase().includes(query.trim().toLowerCase()),
  );

  const actions = (r: Row) => (
    <div className="adm-tpl-actions">
      <a
        href={demoHref(r.key, "basic")}
        target="_blank"
        rel="noopener noreferrer"
        className="adm-btn adm-btn-ghost adm-btn-sm"
      >
        <BsEye aria-hidden /> Basic
      </a>
      <a
        href={demoHref(r.key, "premium")}
        target="_blank"
        rel="noopener noreferrer"
        className="adm-btn adm-btn-primary adm-btn-sm"
      >
        <BsEye aria-hidden /> Premium
      </a>
    </div>
  );

  return (
    <>
      <div className="adm-head">
        <div>
          <h2>Template</h2>
          <p>
            Kelola tema undangan dan status siap-pakainya. Perubahan langsung
            tampil di katalog.
          </p>
        </div>
        <a
          href="/katalog"
          target="_blank"
          rel="noopener noreferrer"
          className="adm-btn adm-btn-ghost"
        >
          <BsEye aria-hidden /> Buka katalog
        </a>
      </div>

      <div className="adm-stats adm-stats-4">
        <div className="adm-stat">
          <span>Total tema</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="adm-stat hi">
          <span>Siap dipakai</span>
          <strong>{stats.ready}</strong>
        </div>
        <div className="adm-stat">
          <span>Belum siap</span>
          <strong>{stats.soon}</strong>
        </div>
        <div className="adm-stat">
          <span>Undangan klien</span>
          <strong>{stats.used}</strong>
        </div>
      </div>

      <div className="adm-toolbar">
        <input
          type="search"
          className="adm-search"
          placeholder="Cari tema…"
          aria-label="Cari tema"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="adm-seg" role="group" aria-label="Filter status">
          {(
            [
              ["all", "Semua"],
              ["active", "Siap"],
              ["dummy", "Belum siap"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              className={filter === id ? "on" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="adm-seg" role="group" aria-label="Tampilan">
          <button
            type="button"
            aria-pressed={view === "table"}
            className={view === "table" ? "on" : ""}
            onClick={() => setView("table")}
          >
            <BsListUl aria-hidden /> Tabel
          </button>
          <button
            type="button"
            aria-pressed={view === "grid"}
            className={view === "grid" ? "on" : ""}
            onClick={() => setView("grid")}
          >
            <BsGrid aria-hidden /> Galeri
          </button>
        </div>
      </div>

      {failed && (
        <div className="adm-card adm-empty">
          Data tema belum bisa dimuat. Pastikan server berjalan dan migrasi
          terbaru sudah dijalankan (<code>npx prisma migrate deploy</code>).
        </div>
      )}

      {!failed && view === "table" && (
        <div className="adm-card" style={{ padding: 16 }}>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Tema</th>
                  <th>Key</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Dipakai</th>
                  <th>Demo</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const cat = coverOf(r.key);
                  return (
                    <tr key={r.key}>
                      <td>
                        <div className="adm-tpl-cell">
                          <div className="adm-tpl-mini">
                            <Thumb src={cat?.image} title={r.title} />
                          </div>
                          <div>
                            <span className="adm-name">{r.title}</span>
                            <div className="adm-tpl-badges">
                              {cat?.special && (
                                <span className="adm-badge adm-badge-gold">
                                  Special
                                </span>
                              )}
                              {!cat && (
                                <span className="adm-badge adm-badge-plain">
                                  Belum di katalog
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code>{r.key}</code>
                      </td>
                      <td>
                        <StatusSwitch
                          row={r}
                          busy={busyKey === r.key}
                          onToggle={onToggle}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>{r.usage}</td>
                      <td>{actions(r)}</td>
                    </tr>
                  );
                })}
                {loaded && visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="adm-empty">
                      Tidak ada tema yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!failed && view === "grid" && (
        <>
          <ul className="adm-tpl-grid">
            {visible.map((r) => {
              const cat = coverOf(r.key);
              return (
                <li key={r.key} className="adm-card adm-tpl-card">
                  <Thumb src={cat?.image} title={r.title} />
                  <div className="adm-tpl-body">
                    <div className="adm-tpl-badges">
                      {cat?.special && (
                        <span className="adm-badge adm-badge-gold">
                          Special
                        </span>
                      )}
                      {!cat && (
                        <span className="adm-badge adm-badge-plain">
                          Belum di katalog
                        </span>
                      )}
                      <span className="adm-badge adm-badge-plain">
                        {r.usage} undangan
                      </span>
                    </div>
                    <h3>{r.title}</h3>
                    <code className="adm-tpl-key">{r.key}</code>
                    <StatusSwitch
                      row={r}
                      busy={busyKey === r.key}
                      onToggle={onToggle}
                    />
                    {actions(r)}
                  </div>
                </li>
              );
            })}
          </ul>
          {loaded && visible.length === 0 && (
            <div className="adm-card adm-empty">Tidak ada tema yang cocok.</div>
          )}
        </>
      )}

      <details className="adm-card adm-where">
        <summary>Tempat menyimpan file template</summary>
        <div className="adm-table-wrap" style={{ marginTop: 14 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Isi</th>
                <th>
                  Lokasi (di dalam <code>client/</code>)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tampilan undangan per tema</td>
                <td>
                  <code>components/templates/&lt;NamaTema&gt;.tsx</code>,
                  dipasang di <code>app/wedding/[slug]/undangan/page.tsx</code>
                </td>
              </tr>
              <tr>
                <td>Gambar, font, musik tema</td>
                <td>
                  <code>public/themes/&lt;key&gt;/assets/</code>
                </td>
              </tr>
              <tr>
                <td>Judul dan cover di katalog</td>
                <td>
                  <code>lib/marketing.ts</code> (<code>TEMPLATES</code>)
                </td>
              </tr>
              <tr>
                <td>Daftar tema &amp; status bawaan</td>
                <td>
                  <code>lib/themes.ts</code> dan{" "}
                  <code>server/config/themes.js</code>
                </td>
              </tr>
              <tr>
                <td>Status yang diubah di halaman ini</td>
                <td>
                  tabel <code>theme_settings</code> di database
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
