import Link from "next/link";
import { themeOptions } from "@/lib/themes";

export default function KatalogPage() {
  const themes = themeOptions();

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Katalog Tema Undangan</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {themes.map((t) => (
          <div key={t.key} className="border rounded-lg p-4 flex flex-col gap-2">
            <h2 className="font-semibold">{t.label}</h2>
            <span
              className={`text-xs w-fit px-2 py-1 rounded ${
                t.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              {t.status === "active" ? "Siap dipakai" : "Belum siap"}
            </span>
            {t.status === "active" ? (
              <Link
                href={`/wedding/demo?theme=${t.key}&paket=basic&to=John%20Doe&from_katalog=1`}
                className="mt-2 text-sm underline"
              >
                Lihat Demo
              </Link>
            ) : (
              <span className="mt-2 text-sm text-gray-400">Demo belum tersedia</span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
