import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Rsvp, Wedding } from "@prisma/client";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10 },
  title: { fontSize: 16, marginBottom: 4, fontWeight: 700 },
  subtitle: { fontSize: 11, marginBottom: 16, color: "#555" },
  row: { flexDirection: "row", borderBottom: "1px solid #ddd", paddingVertical: 6 },
  headerRow: { flexDirection: "row", borderBottom: "2px solid #333", paddingBottom: 6, fontWeight: 700 },
  colNo: { width: "6%" },
  colNama: { width: "22%" },
  colAlamat: { width: "22%" },
  colStatus: { width: "16%" },
  colJumlah: { width: "12%" },
  colUcapan: { width: "22%" },
  summary: { marginTop: 16, fontSize: 11 },
});

function RsvpReportDocument({ wedding, rsvps }: { wedding: Wedding; rsvps: Rsvp[] }) {
  const totalHadir = rsvps.filter((r) => r.status === "hadir").reduce((a, r) => a + r.jumlahHadir, 0);
  const totalTidakHadir = rsvps.filter((r) => r.status === "tidak_hadir").length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Laporan RSVP - {wedding.namaPria} & {wedding.namaWanita}</Text>
        <Text style={styles.subtitle}>
          Slug: {wedding.slug} | Tanggal Acara: {wedding.tanggalAcara.toLocaleDateString("id-ID")}
        </Text>

        <View style={styles.headerRow}>
          <Text style={styles.colNo}>No</Text>
          <Text style={styles.colNama}>Nama Tamu</Text>
          <Text style={styles.colAlamat}>Asal/Kota</Text>
          <Text style={styles.colStatus}>Status</Text>
          <Text style={styles.colJumlah}>Jumlah</Text>
          <Text style={styles.colUcapan}>Ucapan</Text>
        </View>

        {rsvps.map((r, i) => (
          <View style={styles.row} key={r.id}>
            <Text style={styles.colNo}>{i + 1}</Text>
            <Text style={styles.colNama}>{r.namaTamu}</Text>
            <Text style={styles.colAlamat}>{r.alamat}</Text>
            <Text style={styles.colStatus}>{r.status === "hadir" ? "Hadir" : "Tidak Hadir"}</Text>
            <Text style={styles.colJumlah}>{r.jumlahHadir}</Text>
            <Text style={styles.colUcapan}>{r.ucapan}</Text>
          </View>
        ))}

        <View style={styles.summary}>
          <Text>Total Tamu Hadir: {totalHadir}</Text>
          <Text>Total Konfirmasi Tidak Hadir: {totalTidakHadir}</Text>
          <Text>Total Entri RSVP: {rsvps.length}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateRsvpPdf(wedding: Wedding, rsvps: Rsvp[]) {
  return renderToBuffer(<RsvpReportDocument wedding={wedding} rsvps={rsvps} />);
}
