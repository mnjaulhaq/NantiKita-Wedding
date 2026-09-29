import { db } from "../config/db";

type WeddingInput = {
  namaPria: string;
  namaWanita: string;
  tanggalAcara: Date;
  lokasiAcara: string;
  paket: "basic" | "premium";
  tema: string;
  musikUrl?: string | null;
};

// scope = hasil getScope(req): {} untuk owner, { userId } untuk admin biasa.
type Scope = { userId?: bigint };

// Publik (undangan tamu): tanpa scope.
export function findWeddingBySlug(slug: string) {
  return db.wedding.findUnique({ where: { slug } });
}

export function findWeddingById(id: bigint, scope: Scope = {}) {
  return db.wedding.findFirst({ where: { id, ...scope } });
}

export function findWeddingWithRsvps(id: bigint, scope: Scope = {}) {
  return db.wedding.findFirst({
    where: { id, ...scope },
    include: { rsvps: { orderBy: { createdAt: "desc" } } },
  });
}

export function listWeddings(scope: Scope = {}) {
  return db.wedding.findMany({ where: scope, orderBy: { createdAt: "desc" } });
}

export function listRecentWeddings(take: number, scope: Scope = {}) {
  return db.wedding.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function countWeddings(
  scope: Scope = {},
  where: { paket?: "basic" | "premium" } = {},
) {
  return db.wedding.count({ where: { ...scope, ...where } });
}

export function createWedding(
  slug: string,
  data: WeddingInput,
  userId: bigint,
) {
  return db.wedding.create({ data: { ...data, slug, userId } });
}

// Pemanggil wajib sudah memastikan kepemilikan lewat findWeddingById(id, scope).
export function updateWedding(id: bigint, data: WeddingInput) {
  return db.wedding.update({ where: { id }, data });
}

export function deleteWedding(id: bigint) {
  return db.wedding.delete({ where: { id } });
}
