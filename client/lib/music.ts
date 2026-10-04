export type MusicSource =
  | { type: "youtube"; id: string }
  | { type: "audio"; src: string };

// Mengenali link YouTube (watch, youtu.be, shorts, embed, music.youtube.com)
// dan link audio langsung (.mp3 dll). Mengembalikan null jika kosong/tidak valid,
// sehingga template memakai musik bawaan.
export function parseMusicUrl(url?: string | null): MusicSource | null {
  const raw = (url ?? "").trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;

    const host = u.hostname.replace(/^(www|m|music)\./, "");
    const isYoutube = host === "youtube.com" || host === "youtu.be";

    let id: string | null = null;
    if (host === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0];
    } else if (host === "youtube.com") {
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v");
      } else {
        const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);
        id = m ? m[1] : null;
      }
    }

    if (id && /^[\w-]{11}$/.test(id)) return { type: "youtube", id };
    if (isYoutube) return null; // link YouTube tanpa ID video (mis. playlist)
    return { type: "audio", src: raw };
  } catch {
    return null;
  }
}