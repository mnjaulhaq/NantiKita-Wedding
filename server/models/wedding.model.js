import { db } from "../config/db.js";
// Publik (undangan tamu): tanpa scope.
export function findWeddingBySlug(slug) {
    return db.wedding.findUnique({ where: { slug } });
}
export function findWeddingById(id, scope = {}) {
    return db.wedding.findFirst({ where: { id, ...scope } });
}
export function findWeddingWithRsvps(id, scope = {}) {
    return db.wedding.findFirst({
        where: { id, ...scope },
        include: { rsvps: { orderBy: { createdAt: "desc" } } },
    });
}
export function listWeddings(scope = {}) {
    return db.wedding.findMany({ where: scope, orderBy: { createdAt: "desc" } });
}
export function listRecentWeddings(take, scope = {}) {
    return db.wedding.findMany({
        where: scope,
        orderBy: { createdAt: "desc" },
        take,
    });
}
export function countWeddings(scope = {}, where = {}) {
    return db.wedding.count({ where: { ...scope, ...where } });
}
export function createWedding(slug, data, userId) {
    return db.wedding.create({ data: { ...data, slug, userId } });
}
// Pemanggil wajib sudah memastikan kepemilikan lewat findWeddingById(id, scope).
export function updateWedding(id, data) {
    return db.wedding.update({ where: { id }, data });
}
export function deleteWedding(id) {
    return db.wedding.delete({ where: { id } });
}
