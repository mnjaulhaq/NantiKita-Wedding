import { notFound } from "next/navigation";
import { apiFetchServer } from "@/lib/api";
import { isThemeActive } from "@/lib/themes";
import RsvpForm from "@/components/RsvpForm";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

type Wedding = {
  namaPria: string;
  namaWanita: string;
  tanggalAcara: string;
  lokasiAcara: string;
  slug: string;
};

export default async function WeddingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const res = await apiFetchServer(`/api/wedding/${slug}`);
  if (!res.ok) notFound();
  const { data: wedding } = (await res.json()) as { data: Wedding };

  const theme = sp.theme || "rustic";
  const tamuDariUrl = sp.to;
  const isDariKatalog = !!sp.from_katalog || (tamuDariUrl || "").toLowerCase() === "john doe";

  // Kalau dibuka lewat link generate admin (tanpa parameter tamu) dan bukan mode demo katalog,
  // tampilkan halaman "gerbang depan" tempat tamu mengetik namanya sendiri.
  if (!isDariKatalog && (!tamuDariUrl || tamuDariUrl === "NamaTamu")) {
    return <GerbangTamu wedding={wedding} theme={theme} />;
  }

  const tamuFinal = isDariKatalog ? "John Doe" : tamuDariUrl!;
  const themeReady = isThemeActive(theme);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto space-y-8">
      {!themeReady && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm p-3 rounded">
          Tema &quot;{theme}&quot; sedang disiapkan. Menampilkan tampilan sementara.
        </div>
      )}

      <section className="text-center space-y-2">
        <p className="uppercase tracking-widest text-sm text-gray-500">The Wedding of</p>
        <h1 className="text-3xl font-bold">
          {wedding.namaPria} &amp; {wedding.namaWanita}
        </h1>
        <p className="text-gray-600">
          {new Date(wedding.tanggalAcara).toLocaleDateString("id-ID", { dateStyle: "full" })}
        </p>
        <p className="text-gray-600">{wedding.lokasiAcara}</p>
        <p className="mt-4 text-sm text-gray-500">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p className="font-semibold">{tamuFinal}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Konfirmasi Kehadiran</h2>
        <RsvpForm slug={wedding.slug} />
      </section>
    </main>
  );
}

function GerbangTamu({ wedding, theme }: { wedding: { namaPria: string; namaWanita: string; slug: string }; theme: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-6 text-center">
      <p className="uppercase tracking-widest text-sm text-gray-500">The Wedding of</p>
      <h1 className="text-3xl font-bold">
        {wedding.namaPria} &amp; {wedding.namaWanita}
      </h1>
      <GerbangForm slug={wedding.slug} theme={theme} />
    </main>
  );
}

function GerbangForm({ slug, theme }: { slug: string; theme: string }) {
  return (
    <form action={`/wedding/${slug}`} method="get" className="flex flex-col gap-3 w-full max-w-xs">
      <input type="hidden" name="theme" value={theme} />
      <input
        name="to"
        placeholder="Nama Anda"
        required
        className="border rounded px-3 py-2 text-center"
      />
      <button className="bg-black text-white rounded py-2">Buka Undangan</button>
    </form>
  );
}
