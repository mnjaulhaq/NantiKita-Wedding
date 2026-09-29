import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { rateLimit } from "../middlewares/rateLimit";

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10 });
const registerLimiter = rateLimit({ windowMs: 15 * 60_000, max: 5 });
const otpLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10 });

// Registrasi tetap tersedia lewat URL khusus di frontend.
// Semua akun yang berhasil mendaftar otomatis menjadi owner.
router.post("/register", registerLimiter, AuthController.register);
router.post("/verify-otp", otpLimiter, AuthController.verifyOtp);
router.post("/login", loginLimiter, AuthController.login);
router.post("/logout", requireAuth, AuthController.logout);
router.get("/me", requireAuth, AuthController.me);

export default router;
