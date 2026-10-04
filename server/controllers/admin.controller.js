import { z } from "zod";
import { generateRsvpPdf } from "../utils/rsvp-pdf.js";
import * as WeddingModel from "../models/wedding.model.js";
import * as RsvpModel from "../models/rsvp.model.js";
import * as ThemeModel from "../models/theme.model.js";
import { resolveThemes, THEME_STATUSES } from "../config/themes.js";
import { getScope } from "../middlewares/auth.middleware.js";
const HARGA = { basic: 500000, premium: 1000000 };
function slugify(input) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
function parseId(value) {
    if (!/^\d+$/.test(value))
        return null;
    const id = BigInt(value);
    return id > 0n ? id : null;
}
const weddingSchema = z.object({
    nama_pria: z.string().min(1).max(255),
    nama_wanita: z.string().min(1).max(255),
    tanggal_acara: z.string().min(1),
    lokasi_acara: z.string().min(1).max(500),
    paket: z.enum(["basic", "premium"]),
    tema: z.string().min(1),
    musik_url: z.union([z.string().url().max(255), z.literal("")]).optional(),
});
export async function dashboard(req, res) {
    const scope = getScope(req);
    const [totalWeddings, basicCount, premiumCount, totalGuestsHadir, recentWeddings,] = await Promise.all([
        WeddingModel.countWeddings(scope),
        WeddingModel.countWeddings(scope, { paket: "basic" }),
        WeddingModel.countWeddings(scope, { paket: "premium" }),
        RsvpModel.sumJumlahHadir(scope),
        WeddingModel.listRecentWeddings(4, scope),
    ]);
    const totalRevenue = basicCount * HARGA.basic + premiumCount * HARGA.premium;
    res.json({
        data: {
            totalWeddings,
            totalRevenue,
            totalGuestsHadir: totalGuestsHadir._sum?.jumlahHadir ?? 0,
            recentWeddings,
        },
    });
}
export async function globalRsvps(req, res) {
    const rsvps = await RsvpModel.listAllRsvps(getScope(req));
    res.json({ data: rsvps });
}
export async function listWeddings(req, res) {
    const weddings = await WeddingModel.listWeddings(getScope(req));
    res.json({ data: weddings });
}
export async function createWedding(req, res) {
    const parsed = weddingSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const data = parsed.data;
    const baseSlug = slugify(`${data.nama_pria}-dan-${data.nama_wanita}`);
    const clash = await WeddingModel.findWeddingBySlug(baseSlug);
    const finalSlug = clash
        ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
        : baseSlug;
    const wedding = await WeddingModel.createWedding(finalSlug, {
        namaPria: data.nama_pria,
        namaWanita: data.nama_wanita,
        tanggalAcara: new Date(data.tanggal_acara),
        lokasiAcara: data.lokasi_acara,
        paket: data.paket,
        tema: data.tema,
        musikUrl: data.musik_url || null,
    }, req.user.id);
    res.status(201).json({ success: true, data: wedding });
}
export async function getWedding(req, res) {
    const id = parseId(req.params.id);
    if (id === null)
        return res.status(400).json({ message: "Invalid id" });
    const wedding = await WeddingModel.findWeddingWithRsvps(id, getScope(req));
    if (!wedding)
        return res.status(404).json({ message: "Not found" });
    res.json({ data: wedding });
}
export async function updateWedding(req, res) {
    const id = parseId(req.params.id);
    if (id === null)
        return res.status(400).json({ message: "Invalid id" });
    const parsed = weddingSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const data = parsed.data;
    const existing = await WeddingModel.findWeddingById(id, getScope(req));
    if (!existing)
        return res.status(404).json({ message: "Not found" });
    const wedding = await WeddingModel.updateWedding(id, {
        namaPria: data.nama_pria,
        namaWanita: data.nama_wanita,
        tanggalAcara: new Date(data.tanggal_acara),
        lokasiAcara: data.lokasi_acara,
        paket: data.paket,
        tema: data.tema,
        musikUrl: data.musik_url || null,
    });
    res.json({ success: true, data: wedding });
}
export async function deleteWedding(req, res) {
    const id = parseId(req.params.id);
    if (id === null)
        return res.status(400).json({ message: "Invalid id" });
    const existing = await WeddingModel.findWeddingById(id, getScope(req));
    if (!existing)
        return res.status(404).json({ message: "Not found" });
    await WeddingModel.deleteWedding(id);
    res.json({ success: true });
}
export async function weddingRsvps(req, res) {
    const id = parseId(req.params.id);
    if (id === null)
        return res.status(400).json({ message: "Invalid id" });
    const wedding = await WeddingModel.findWeddingWithRsvps(id, getScope(req));
    if (!wedding)
        return res.status(404).json({ message: "Not found" });
    res.json({ data: wedding });
}
export async function downloadPdf(req, res) {
    const id = parseId(req.params.id);
    if (id === null)
        return res.status(400).json({ message: "Invalid id" });
    const wedding = await WeddingModel.findWeddingWithRsvps(id, getScope(req));
    if (!wedding)
        return res.status(404).json({ message: "Not found" });
    const buffer = await generateRsvpPdf(wedding, wedding.rsvps);
    const filename = `laporan-rsvp-${slugify(wedding.namaPria + "-" + wedding.namaWanita)}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
}

export async function listTemplates(_req, res) {
  const [themes, usage] = await Promise.all([
    resolveThemes(),
    ThemeModel.countWeddingsByTheme(),
  ]);
  res.json({ data: themes.map((t) => ({ ...t, usage: usage[t.key] ?? 0 })) });
}
const templateStatusSchema = z.object({ status: z.enum(THEME_STATUSES) });
export async function updateTemplateStatus(req, res) {
  const themes = await resolveThemes();
  const theme = themes.find((t) => t.key === req.params.key);
  if (!theme)
    return res.status(404).json({ message: "Tema tidak ditemukan." });
  const parsed = templateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
  }
  await ThemeModel.saveThemeStatus(theme.key, parsed.data.status);
  res.json({ success: true, data: { ...theme, status: parsed.data.status } });
}
