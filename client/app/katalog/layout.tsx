import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Template - NantiKita",
  description:
    "Lihat tema undangan pernikahan digital NantiKita, buka demo versi Basic dan Premium, lalu pesan lewat WhatsApp.",
};

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
