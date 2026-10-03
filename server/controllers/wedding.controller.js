import { z } from "zod";
import { themeOptions } from "../config/themes.js";
import * as WeddingModel from "../models/wedding.model.js";
import * as RsvpModel from "../models/rsvp.model.js";
export function listThemes(_req, res) {
  res.json({ data: themeOptions() });
}
export async function getWeddingBySlug(req, res) {
  const wedding = await WeddingModel.findWeddingBySlug(req.params.slug);
  if (!wedding)
    return res.status(404).json({ message: "Undangan tidak ditemukan." });
  res.json({ data: wedding });
}
// Dashboard RSVP untuk pengantin (kata kunci "admin"/"client" di halaman gerbang).
// Hanya mengirim field yang dibutuhkan, tanpa userId/relasi internal.
export async function getRsvpsBySlug(req, res) {
  const wedding = await WeddingModel.findWeddingBySlugWithRsvps(
    req.params.slug,
  );
  if (!wedding)
    return res.status(404).json({ message: "Undangan tidak ditemukan." });
  res.json({
    data: {
      slug: wedding.slug,
      namaPria: wedding.namaPria,
      namaWanita: wedding.namaWanita,
      tanggalAcara: wedding.tanggalAcara,
      rsvps: wedding.rsvps.map((r) => ({
        id: r.id,
        namaTamu: r.namaTamu,
        alamat: r.alamat,
        status: r.status,
        jumlahHadir: r.jumlahHadir,
        ucapan: r.ucapan,
        createdAt: r.createdAt,
      })),
    },
  });
}
const rsvpSchema = z.object({
  nama_tamu: z
    .string()
    .min(2, "Nama minimal terdiri dari 2 karakter.")
    .max(255)
    .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh diisi huruf dan spasi saja."),
  alamat: z.string().min(2).max(255),
  status: z.enum(["hadir", "tidak_hadir"]),
  jumlah_hadir: z.number().int().min(0).max(10),
  // Opsional: form RSVP tidak lagi meminta ucapan (kolom di DB nullable).
  ucapan: z.string().trim().max(1000).optional(),
});
export async function submitRsvp(req, res) {
  const raw = req.body;
  const body = {
    ...raw,
    nama_tamu: String(raw.nama_tamu ?? "").trim(),
    alamat: String(raw.alamat ?? "").trim(),
    jumlah_hadir:
      raw.status === "tidak_hadir" ? 0 : Number(raw.jumlah_hadir ?? 1),
  };
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
  }
  const data = parsed.data;
  const wedding = await WeddingModel.findWeddingBySlug(req.params.slug);
  if (!wedding)
    return res.status(404).json({ message: "Undangan tidak ditemukan." });
  await RsvpModel.createRsvp({
    weddingId: wedding.id,
    namaTamu: data.nama_tamu,
    alamat: data.alamat,
    jumlahHadir: data.status === "tidak_hadir" ? 0 : data.jumlah_hadir,
    status: data.status,
    ucapan: data.ucapan || null,
  });
  res.json({
    success: true,
    message:
      "Terima kasih! Konfirmasi kehadiran dan ucapan Anda telah tersimpan.",
  });
}
const ucapanSchema = z.object({
  nama_tamu: z.string().trim().min(2).max(255),
  ucapan: z
    .string()
    .trim()
    .min(1, "Silakan tulis ucapan atau doa restu Anda.")
    .max(1000),
});
export async function submitUcapan(req, res) {
  const parsed = ucapanSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
  }
  const wedding = await WeddingModel.findWeddingBySlug(req.params.slug);
  if (!wedding)
    return res.status(404).json({ message: "Undangan tidak ditemukan." });
  const ok = await RsvpModel.setUcapanTerbaru(
    wedding.id,
    parsed.data.nama_tamu,
    parsed.data.ucapan,
  );
  if (!ok)
    return res
      .status(404)
      .json({
        message:
          "Konfirmasi kehadiran Anda belum ditemukan. Silakan isi RSVP terlebih dahulu.",
      });
  res.json({
    success: true,
    message: "Terima kasih! Ucapan dan doa restu Anda telah tersimpan.",
  });
}
