import React from "react";
export async function generateRsvpPdf(wedding, rsvps) {
    const { Document, Page, Text, View, StyleSheet, renderToBuffer } = await import("@react-pdf/renderer");
    const styles = StyleSheet.create({
        page: { padding: 32, fontSize: 10 },
        title: { fontSize: 16, marginBottom: 4, fontWeight: 700 },
        subtitle: { fontSize: 11, marginBottom: 16, color: "#555" },
        row: {
            flexDirection: "row",
            borderBottom: "1px solid #ddd",
            paddingVertical: 6,
        },
        headerRow: {
            flexDirection: "row",
            borderBottom: "2px solid #333",
            paddingBottom: 6,
            fontWeight: 700,
        },
        colNo: { width: "6%" },
        colNama: { width: "22%" },
        colAlamat: { width: "22%" },
        colStatus: { width: "16%" },
        colJumlah: { width: "12%" },
        colUcapan: { width: "22%" },
        summary: { marginTop: 16, fontSize: 11 },
    });
    function RsvpReportDocument({ wedding, rsvps, }) {
        const totalHadir = rsvps
            .filter((r) => r.status === "hadir")
            .reduce((a, r) => a + r.jumlahHadir, 0);
        const totalTidakHadir = rsvps.filter((r) => r.status === "tidak_hadir").length;
        return (React.createElement(Document, null,
            React.createElement(Page, { size: "A4", style: styles.page },
                React.createElement(Text, { style: styles.title },
                    "Laporan RSVP - ",
                    wedding.namaPria,
                    " & ",
                    wedding.namaWanita),
                React.createElement(Text, { style: styles.subtitle },
                    "Slug: ",
                    wedding.slug,
                    " | Tanggal Acara:",
                    " ",
                    wedding.tanggalAcara.toLocaleDateString("id-ID")),
                React.createElement(View, { style: styles.headerRow },
                    React.createElement(Text, { style: styles.colNo }, "No"),
                    React.createElement(Text, { style: styles.colNama }, "Nama Tamu"),
                    React.createElement(Text, { style: styles.colAlamat }, "Asal/Kota"),
                    React.createElement(Text, { style: styles.colStatus }, "Status"),
                    React.createElement(Text, { style: styles.colJumlah }, "Jumlah"),
                    React.createElement(Text, { style: styles.colUcapan }, "Ucapan")),
                rsvps.map((r, i) => (React.createElement(View, { style: styles.row, key: r.id.toString() },
                    React.createElement(Text, { style: styles.colNo }, i + 1),
                    React.createElement(Text, { style: styles.colNama }, r.namaTamu),
                    React.createElement(Text, { style: styles.colAlamat }, r.alamat),
                    React.createElement(Text, { style: styles.colStatus }, r.status === "hadir" ? "Hadir" : "Tidak Hadir"),
                    React.createElement(Text, { style: styles.colJumlah }, r.jumlahHadir),
                    React.createElement(Text, { style: styles.colUcapan }, r.ucapan)))),
                React.createElement(View, { style: styles.summary },
                    React.createElement(Text, null,
                        "Total Tamu Hadir: ",
                        totalHadir),
                    React.createElement(Text, null,
                        "Total Konfirmasi Tidak Hadir: ",
                        totalTidakHadir),
                    React.createElement(Text, null,
                        "Total Entri RSVP: ",
                        rsvps.length)))));
    }
    return renderToBuffer(React.createElement(RsvpReportDocument, { wedding: wedding, rsvps: rsvps }));
}
