import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signSession } from "../middlewares/auth.middleware";
import * as UserModel from "../models/user.model";
import * as OtpModel from "../models/otp.model";
import { sendOtpEmail } from "../config/mailer";

function normalizeEmail(email: string) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizeUsername(username: string) {
  return String(username || "").trim();
}

function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function register(req: Request, res: Response) {
  const { name, username, email, password, password_confirmation } =
    req.body ?? {};
  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = normalizeEmail(email);

  if (
    !name ||
    !normalizedUsername ||
    !normalizedEmail ||
    !password ||
    !password_confirmation
  ) {
    return res.status(422).json({
      errors: {
        general: [
          "Nama, username, email, password, dan konfirmasi password wajib diisi.",
        ],
      },
    });
  }

  if (String(password).length < 8) {
    return res
      .status(422)
      .json({ errors: { password: ["Password minimal 8 karakter."] } });
  }

  if (password !== password_confirmation) {
    return res
      .status(422)
      .json({
        errors: { password_confirmation: ["Konfirmasi password tidak cocok."] },
      });
  }

  const existingUsername =
    await UserModel.findUserByUsername(normalizedUsername);
  if (existingUsername) {
    return res
      .status(409)
      .json({ errors: { username: ["Username sudah digunakan."] } });
  }

  const existingEmail = await UserModel.findUserByEmail(normalizedEmail);
  if (existingEmail) {
    return res
      .status(409)
      .json({ errors: { email: ["Email sudah digunakan."] } });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await UserModel.createUser({
    name: String(name).trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    role: "owner",
    emailVerifiedAt: null,
  });

  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60_000);

  await OtpModel.deleteOtpsByUsername(normalizedUsername);
  await OtpModel.createOtp({
    username: normalizedUsername,
    otpCode,
    expiresAt,
  });

  try {
    await sendOtpEmail(normalizedEmail, otpCode);
  } catch (error) {
    await OtpModel.deleteOtpsByUsername(normalizedUsername);
    await UserModel.deleteUsersByUsername(normalizedUsername);
    console.error("Gagal mengirim OTP:", error);
    return res.status(500).json({
      errors: { general: ["Kode OTP gagal dikirim. Silakan coba lagi."] },
    });
  }

  // Token pendek untuk mengikat proses verifikasi ke akun yang baru dibuat.
  // Token ini bukan token login/JWT.
  const verifyToken = Buffer.from(`${user.id}:${normalizedUsername}`).toString(
    "base64url",
  );

  return res.status(201).json({
    success: true,
    message:
      "Akun berhasil dibuat. Silakan verifikasi OTP yang dikirim ke email.",
    data: {
      id: user.id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: "owner",
    },
    verify_token: verifyToken,
    redirect: "/verify-otp",
  });
}

export async function verifyOtp(req: Request, res: Response) {
  const { otp_code, verify_token } = req.body ?? {};

  if (!otp_code || !verify_token) {
    return res
      .status(422)
      .json({ errors: { otp_code: ["Kode OTP wajib diisi."] } });
  }

  let userId: bigint;
  let username: string;
  try {
    const decoded = Buffer.from(String(verify_token), "base64url").toString(
      "utf8",
    );
    const separator = decoded.indexOf(":");
    if (separator <= 0) throw new Error("invalid token");
    const rawUserId = decoded.slice(0, separator);
    if (!/^\d+$/.test(rawUserId)) throw new Error("invalid token");
    userId = BigInt(rawUserId);
    username = decoded.slice(separator + 1);
    if (userId <= 0n || !username) throw new Error("invalid token");
  } catch {
    return res
      .status(422)
      .json({
        errors: {
          otp_code: ["Sesi verifikasi tidak valid. Silakan daftar ulang."],
        },
        redirect: "/register-owner",
      });
  }

  const user = await UserModel.findUserById(userId);
  if (!user || user.username !== username || user.role !== "owner") {
    return res
      .status(422)
      .json({
        errors: { otp_code: ["Akun verifikasi tidak ditemukan."] },
        redirect: "/register-owner",
      });
  }

  if (user.emailVerifiedAt) {
    return res
      .status(409)
      .json({
        errors: { otp_code: ["Email sudah diverifikasi. Silakan login."] },
        redirect: "/login",
      });
  }

  const otp = await OtpModel.findLatestOtp(username);
  if (!otp) {
    return res
      .status(422)
      .json({
        errors: {
          otp_code: ["Kode OTP tidak ditemukan atau sudah tidak berlaku."],
        },
      });
  }

  if (otp.expiresAt.getTime() < Date.now()) {
    await OtpModel.deleteOtpsByUsername(username);
    return res
      .status(422)
      .json({
        errors: {
          otp_code: ["Kode OTP sudah kedaluwarsa. Silakan daftar ulang."],
        },
        redirect: "/register-owner",
      });
  }

  if (String(otp_code).trim() !== otp.otpCode) {
    return res.status(422).json({ errors: { otp_code: ["Kode OTP salah."] } });
  }

  await UserModel.markEmailVerified(user.id);
  await OtpModel.deleteOtpsByUsername(username);

  return res.json({
    success: true,
    message: "Akun berhasil diverifikasi.",
    token: signSession({ userId: user.id.toString(), username: user.username }),
    redirect: "/admin",
  });
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(422)
      .json({ errors: { username: ["Username dan password wajib diisi."] } });
  }

  const user = await UserModel.findUserByUsername(normalizeUsername(username));
  if (
    !user ||
    user.role !== "owner" ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return res
      .status(401)
      .json({ errors: { username: ["Username atau password salah."] } });
  }

  if (!user.emailVerifiedAt) {
    return res
      .status(403)
      .json({
        errors: {
          username: [
            "Akun belum diverifikasi. Silakan selesaikan verifikasi OTP dari email Anda.",
          ],
        },
      });
  }

  const token = signSession({
    userId: user.id.toString(),
    username: user.username,
  });
  return res.json({ success: true, redirect: "/admin", token });
}

export async function logout(_req: Request, res: Response) {
  return res.json({ success: true, redirect: "/login" });
}

export async function me(req: Request, res: Response) {
  const user = (req as any).user;
  return res.json({
    data: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: "owner",
    },
  });
}
