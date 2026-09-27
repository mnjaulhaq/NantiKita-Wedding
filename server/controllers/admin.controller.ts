import { Request, Response } from "express";
import { z } from "zod";
import { generateRsvpPdf } from "../utils/rsvp-pdf";
import * as WeddingModel from "../models/wedding.model";
import * as RsvpModel from "../models/rsvp.model";

const HARGA = { basic: 500000, premium: 1000000 };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const weddingSchema = z.object({
  nama_pria: z.string().min(1).max(255),
  nama_wanita: z.string().min(1).max(255),
  tanggal_acara: z.string().min(1),
  lokasi_acara: z.string().min(1).max(500),
  paket: z.enum(["basic", "premium"]),
  tema: z.string().min(1),
});

export async function dashboard(_req: Request, res: Response) {
  const [totalWeddings, basicCount, premiumCount, totalGuestsHadir, recentWeddings] = await Promise.all([
    WeddingModel.countWeddings(),
    WeddingModel.countWeddings({ paket: "basic" }),
    WeddingModel.countWeddings({ paket: "premium" }),
    RsvpModel.sumJumlahHadir(),
    WeddingModel.listRecentWeddings(4),
  ]);

  const totalRevenue = basicCount * HARGA.basic + premiumCount * HARGA.premium;

  res.json({
    data: {
      totalWeddings,
      totalRevenue,
      totalGuestsHadir: totalGuestsHadir._sum.jumlahHadir || 0,
      recentWeddings,
    },
  });
}

export async function globalRsvps(_req: Request, res: Response) {
  const rsvps = await RsvpModel.listAllRsvps();
  res.json({ data: rsvps });
}

export async function listWeddings(_req: Request, res: Response) {
  const weddings = await WeddingModel.listWeddings();
  res.json({ data: weddings });
}

export async function createWedding(req: Request, res: Response) {
  const parsed = weddingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
  }
  const data = parsed.data;

  const baseSlug = slugify(`${data.nama_pria}-dan-${data.nama_wanita}`);
  const clash = await WeddingModel.findWeddingBySlug(baseSlug);
  const finalSlug = clash ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}` : baseSlug;

  const wedding = await WeddingModel.createWedding(finalSlug, {
    namaPria: data.nama_pria,
    namaWanita: data.nama_wanita,
    tanggalAcara: new Date(data.tanggal_acara),
    lokasiAcara: data.lokasi_acara,
    paket: data.paket,
    tema: data.tema,
  });

  res.status(201).json({ success: true, data: wedding });
}

export async function getWedding(req: Request, res: Response) {
  const id = Number(req.params.id);
  const wedding = await WeddingModel.findWeddingWithRsvps(id);
  if (!wedding) return res.status(404).json({ message: "Not found" });
  res.json({ data: wedding });
}

export async function updateWedding(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parsed = weddingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
  }
  const data = parsed.data;

  const existing = await WeddingModel.findWeddingById(id);
  if (!existing) return res.status(404).json({ message: "Not found" });

  const wedding = await WeddingModel.updateWedding(id, {
    namaPria: data.nama_pria,
    namaWanita: data.nama_wanita,
    tanggalAcara: new Date(data.tanggal_acara),
    lokasiAcara: data.lokasi_acara,
    paket: data.paket,
    tema: data.tema,
  });

  res.json({ success: true, data: wedding });
}

export async function deleteWedding(req: Request, res: Response) {
  const id = Number(req.params.id);
  const existing = await WeddingModel.findWeddingById(id);
  if (!existing) return res.status(404).json({ message: "Not found" });

  await WeddingModel.deleteWedding(id);
  res.json({ success: true });
}

export async function weddingRsvps(req: Request, res: Response) {
  const id = Number(req.params.id);
  const wedding = await WeddingModel.findWeddingWithRsvps(id);
  if (!wedding) return res.status(404).json({ message: "Not found" });
  res.json({ data: wedding });
}

export async function downloadPdf(req: Request, res: Response) {
  const id = Number(req.params.id);
  const wedding = await WeddingModel.findWeddingWithRsvps(id);
  if (!wedding) return res.status(404).json({ message: "Not found" });

  const buffer = await generateRsvpPdf(wedding, wedding.rsvps);
  const filename = `laporan-rsvp-${slugify(wedding.namaPria + "-" + wedding.namaWanita)}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
}
