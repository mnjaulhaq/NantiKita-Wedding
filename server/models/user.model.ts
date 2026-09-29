import { db } from "../config/db";

export function findUserByUsername(username: string) {
  return db.user.findUnique({ where: { username } });
}

export function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export function findUserById(id: bigint) {
  return db.user.findUnique({ where: { id } });
}

export function createUser(data: {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: string;
  emailVerifiedAt?: Date | null;
}) {
  return db.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      role: "owner",
      emailVerifiedAt: data.emailVerifiedAt ?? null,
    },
  });
}

export function markEmailVerified(id: bigint) {
  return db.user.update({
    where: { id },
    data: { emailVerifiedAt: new Date() },
  });
}

export function deleteUsersByUsername(username: string) {
  return db.user.deleteMany({ where: { username } });
}
