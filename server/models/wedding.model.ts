import { db } from "../config/db";

type WeddingInput = {
  namaPria: string;
  namaWanita: string;
  tanggalAcara: Date;
  lokasiAcara: string;
  paket: string;
  tema: string;
};

export function findWeddingBySlug(slug: string) {
  return db.wedding.findUnique({ where: { slug } });
}

export function findWeddingById(id: number) {
  return db.wedding.findUnique({ where: { id } });
}

export function findWeddingWithRsvps(id: number) {
  return db.wedding.findUnique({
    where: { id },
    include: { rsvps: { orderBy: { createdAt: "desc" } } },
  });
}

export function listWeddings() {
  return db.wedding.findMany({ orderBy: { createdAt: "desc" } });
}

export function listRecentWeddings(take: number) {
  return db.wedding.findMany({ orderBy: { createdAt: "desc" }, take });
}

export function countWeddings(where?: { paket?: string }) {
  return db.wedding.count({ where });
}

export function createWedding(slug: string, data: WeddingInput) {
  return db.wedding.create({ data: { ...data, slug } });
}

export function updateWedding(id: number, data: WeddingInput) {
  return db.wedding.update({ where: { id }, data });
}

export function deleteWedding(id: number) {
  return db.wedding.delete({ where: { id } });
}
