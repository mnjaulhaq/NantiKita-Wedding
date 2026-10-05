import { db } from "../config/db.js";
export function findUserByUsername(username) {
    return db.user.findUnique({ where: { username } });
}
export function findUserByEmail(email) {
    return db.user.findUnique({ where: { email } });
}
export function findUserById(id) {
    return db.user.findUnique({ where: { id } });
}
export function createUser(data) {
    return db.user.create({
        data: {
            name: data.name,
            username: data.username,
            email: data.email,
            password: data.password,
            role: "owner",
            createdAt: new Date(),
            emailVerifiedAt: data.emailVerifiedAt ?? null,
        },
    });
}
export function markEmailVerified(id) {
    return db.user.update({
        where: { id },
        data: { emailVerifiedAt: new Date() },
    });
}
export function deleteUsersByUsername(username) {
    return db.user.deleteMany({ where: { username } });
}

export function deleteUserById(id) {
  return db.user.delete({ where: { id } });
}