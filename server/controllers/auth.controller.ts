import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendOtpEmail } from "../config/mailer";
import { signSession, signPendingVerification, verifyPendingVerification } from "../middlewares/auth.middleware";
import * as UserModel from "../models/user.model";
import * as OtpModel from "../models/otp.model";

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Display name tidak boleh kosong.")
    .regex(/^[a-zA-Z][a-zA-Z0-9\s]*$/, "Display name harus diawali huruf dan tidak boleh mengandung simbol."),
  username: z
    .string()
    .min(5, "Username minimal harus 5 karakter.")
    .regex(/^[a-zA-Z][a-zA-Z0-9._-]*$/, "Username harus diawali huruf dan tidak boleh hanya berisi simbol."),
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(8, "Kata sandi minimal harus 8 karakter."),
  password_confirmation: z.string(),
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
  }
  const data = parsed.data;

  if (data.password !== data.password_confirmation) {
    return res.status(422).json({ errors: { password: ["Konfirmasi kata sandi tidak cocok."] } });
  }

  if (await UserModel.findUserByUsername(data.username)) {
    return res.status(422).json({ errors: { username: ["Username sudah terdaftar."] } });
  }
  if (await UserModel.findUserByEmail(data.email)) {
    return res.status(422).json({ errors: { email: ["Email sudah digunakan akun lain."] } });
  }

  const hashed = await bcrypt.hash(data.password, 10);
  await UserModel.createUser({ name: data.name, username: data.username, email: data.email, password: hashed });

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await OtpModel.createOtp({ username: data.username, otpCode, expiresAt });
  await sendOtpEmail(data.email, otpCode);

  const verifyToken = signPendingVerification(data.username, data.email);

  return res.json({
    success: true,
    message: "Registrasi berhasil! Silakan cek email Anda untuk kode OTP.",
    verify_token: verifyToken,
  });
}

export async function checkUsername(req: Request, res: Response) {
  const { username } = req.body;
  const exists = username ? !!(await UserModel.findUserByUsername(username)) : false;
  res.json({ available: !exists });
}

export async function checkEmail(req: Request, res: Response) {
  const { email } = req.body;
  const exists = email ? !!(await UserModel.findUserByEmail(email)) : false;
  res.json({ available: !exists });
}

export async function verifyOtp(req: Request, res: Response) {
  const { otp_code, verify_token } = req.body;
  if (!otp_code || isNaN(Number(otp_code))) {
    return res.status(422).json({ errors: { otp_code: ["Kode OTP wajib diisi dan harus berupa angka."] } });
  }

  const pending = verify_token ? verifyPendingVerification(verify_token) : null;
  if (!pending) {
    return res.status(400).json({
      errors: { username: ["Sesi verifikasi telah berakhir, silakan registrasi ulang."] },
      redirect: "/register-admin",
    });
  }
  const verifyUsername = pending.username;

  const otpData = await OtpModel.findLatestOtp(verifyUsername);
  const isExpired = otpData ? otpData.expiresAt.getTime() < Date.now() : true;

  if (!otpData || String(otp_code) !== otpData.otpCode || isExpired) {
    if (otpData && isExpired) {
      await UserModel.deleteUsersByUsername(verifyUsername);
      await OtpModel.deleteOtpsByUsername(verifyUsername);
      return res.status(400).json({
        errors: { otp_code: ["Durasi OTP telah kadaluarsa (lebih dari 5 menit). Data Anda dihapus, silakan registrasi ulang."] },
        redirect: "/register-admin",
      });
    }
    return res.status(422).json({ errors: { otp_code: ["Kode OTP salah. Silakan periksa kembali email Anda."] } });
  }

  const user = await UserModel.findUserByUsername(verifyUsername);
  if (!user) {
    return res.status(400).json({ errors: { username: ["User tidak ditemukan."] }, redirect: "/register-admin" });
  }

  await UserModel.markEmailVerified(user.id);
  await OtpModel.deleteOtpsByUsername(verifyUsername);

  const token = signSession({ userId: user.id, username: user.username });
  return res.json({ success: true, message: "Verifikasi berhasil, selamat datang!", redirect: "/admin", token });
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(422).json({ errors: { username: ["Username dan password wajib diisi."] } });
  }

  const user = await UserModel.findUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ errors: { username: ["Username atau password salah."] } });
  }

  const token = signSession({ userId: user.id, username: user.username });
  return res.json({ success: true, redirect: "/admin", token });
}

export async function logout(_req: Request, res: Response) {
  // Stateless JWT: cukup minta klien menghapus token yang tersimpan.
  return res.json({ success: true, redirect: "/login" });
}

export async function me(req: Request, res: Response) {
  const user = (req as any).user;
  return res.json({ data: { id: user.id, name: user.name, username: user.username, email: user.email } });
}
