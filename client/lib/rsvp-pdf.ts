// Membuat PDF laporan RSVP langsung di browser dari data yang sudah dimuat halaman,
// jadi tidak butuh endpoint server (halaman data RSVP pengantin tidak memakai login).
// jsPDF dimuat saat tombol diklik saja supaya tidak membebani halaman.

export type RsvpPdfRow = {
  namaTamu: string;
  alamat: string;
  status: "hadir" | "tidak_hadir";
  jumlahHadir: number;
  ucapan: string | null;
};

export type RsvpPdfData = {
  namaPria: string;
  namaWanita: string;
  tanggalAcara: string; // sudah diformat, mis. "Sabtu, 03 Oktober 2026"
  rsvps: RsvpPdfRow[];
};

const GOLD: [number, number, number] = [138, 100, 32];
const INK: [number, number, number] = [59, 49, 38];
const MUTED: [number, number, number] = [125, 112, 94];

export function rsvpPdfFilename(namaPria: string, namaWanita: string): string {
  const slug = `${namaPria}-${namaWanita}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `laporan-rsvp-${slug || "undangan"}.pdf`;
}

export async function buildRsvpPdf(data: RsvpPdfData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  const totalHadir = data.rsvps
    .filter((r) => r.status === "hadir")
    .reduce((sum, r) => sum + r.jumlahHadir, 0);
  const totalTidakHadir = data.rsvps.filter((r) => r.status === "tidak_hadir").length;

  // Judul
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("LAPORAN KONFIRMASI KEHADIRAN", margin, 48, { charSpace: 1.5 });

  doc.setFontSize(22);
  doc.setTextColor(...GOLD);
  doc.text(`${data.namaPria} & ${data.namaWanita}`, margin, 76);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(data.tanggalAcara, margin, 94);

  // Ringkasan: tiga kotak angka
  const boxY = 112;
  const gap = 10;
  const boxW = (pageW - margin * 2 - gap * 2) / 3;
  const boxes: [string, string][] = [
    [String(totalHadir), "Tamu akan hadir"],
    [String(totalTidakHadir), "Berhalangan hadir"],
    [String(data.rsvps.length), "Total konfirmasi"],
  ];
  boxes.forEach(([value, label], i) => {
    const x = margin + i * (boxW + gap);
    doc.setDrawColor(231, 220, 198);
    doc.setFillColor(255, 253, 248);
    doc.roundedRect(x, boxY, boxW, 58, 6, 6, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...(i === 0 ? GOLD : INK));
    doc.text(value, x + 14, boxY + 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(label, x + 14, boxY + 47);
  });

  // Tabel tamu
  autoTable(doc, {
    startY: boxY + 58 + 20,
    margin: { left: margin, right: margin, bottom: 40 },
    head: [["No", "Nama Tamu", "Asal / Kota", "Status", "Jumlah", "Ucapan"]],
    body: data.rsvps.map((r, i) => [
      String(i + 1),
      r.namaTamu,
      r.alamat,
      r.status === "hadir" ? "Hadir" : "Berhalangan",
      r.status === "hadir" ? `${r.jumlahHadir} orang` : "-",
      r.ucapan?.trim() || "-",
    ]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      textColor: INK,
      lineColor: [231, 220, 198],
      lineWidth: 0.5,
      valign: "top",
    },
    headStyles: {
      fillColor: GOLD,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      lineColor: GOLD,
    },
    alternateRowStyles: { fillColor: [252, 249, 242] },
    columnStyles: {
      0: { cellWidth: 28, halign: "center" },
      1: { cellWidth: 100, fontStyle: "bold" },
      2: { cellWidth: 80 },
      3: { cellWidth: 62 },
      4: { cellWidth: 52 },
      5: { cellWidth: "auto" },
    },
    didDrawPage: () => {
      // Nomor halaman
      const page = doc.getCurrentPageInfo().pageNumber;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`Halaman ${page}`, pageW - margin, doc.internal.pageSize.getHeight() - 20, {
        align: "right",
      });
    },
  });

  if (data.rsvps.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text("Belum ada tamu yang mengirim konfirmasi.", margin, boxY + 58 + 80);
  }

  return doc;
}
