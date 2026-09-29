import { db } from "../config/db";

export function listAllRsvps(scope: { userId?: number } = {}) {
  return db.rsvp.findMany({ where: { wedding: scope }, include: { wedding: true }, orderBy: { createdAt: "desc" } });
}

export function sumJumlahHadir(scope: { userId?: number } = {}) {
  return db.rsvp.aggregate({ _sum: { jumlahHadir: true }, where: { status: "hadir", wedding: scope } });
}

export function createRsvp(data: {
  weddingId: number;
  namaTamu: string;
  alamat: string;
  jumlahHadir: number;
  status: string;
  ucapan: string;
}) {
  return db.rsvp.create({ data });
}
