import { db } from "../config/db";

export function listAllRsvps(scope: { userId?: bigint } = {}) {
  return db.rsvp.findMany({
    where: {
      wedding: scope.userId ? { is: { userId: scope.userId } } : {},
    },
    include: { wedding: true },
    orderBy: { createdAt: "desc" },
  });
}

export function sumJumlahHadir(scope: { userId?: bigint } = {}) {
  return db.rsvp.aggregate({
    _sum: { jumlahHadir: true },
    where: {
      status: "hadir",
      wedding: scope.userId ? { is: { userId: scope.userId } } : {},
    },
  });
}

export function createRsvp(data: {
  weddingId: bigint;
  namaTamu: string;
  alamat: string;
  jumlahHadir: number;
  status: "hadir" | "tidak_hadir";
  ucapan: string;
}) {
  return db.rsvp.create({ data });
}
