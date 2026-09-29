import { db } from "../config/db.js";
export function listAllRsvps(scope = {}) {
    return db.rsvp.findMany({
        where: {
            wedding: scope.userId ? { is: { userId: scope.userId } } : {},
        },
        include: { wedding: true },
        orderBy: { createdAt: "desc" },
    });
}
export function sumJumlahHadir(scope = {}) {
    return db.rsvp.aggregate({
        _sum: { jumlahHadir: true },
        where: {
            status: "hadir",
            wedding: scope.userId ? { is: { userId: scope.userId } } : {},
        },
    });
}
export function createRsvp(data) {
    return db.rsvp.create({ data });
}
