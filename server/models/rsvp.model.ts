import { db } from "../config/db";

export function listAllRsvps() {
  return db.rsvp.findMany({ include: { wedding: true }, orderBy: { createdAt: "desc" } });
}

export function sumJumlahHadir() {
  return db.rsvp.aggregate({ _sum: { jumlahHadir: true }, where: { status: "hadir" } });
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
