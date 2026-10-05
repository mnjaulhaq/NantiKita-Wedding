import { Router } from "express";
import * as AuthController from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, errorField: "username" });
const registerLimiter = rateLimit({ windowMs: 15 * 60_000, max: 5, errorField: "email" });
const otpLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, errorField: "otp_code" });
// Registrasi tetap tersedia lewat URL khusus di frontend.
// Semua akun yang berhasil mendaftar otomatis menjadi owner.
router.post("/register", registerLimiter, asyncHandler(AuthController.register));
router.post("/verify-otp", otpLimiter, asyncHandler(AuthController.verifyOtp));
router.post("/login", loginLimiter, asyncHandler(AuthController.login));
router.post(
  "/logout",
  asyncHandler(requireAuth),
  asyncHandler(AuthController.logout),
);
router.get(
  "/me",
  asyncHandler(requireAuth),
  asyncHandler(AuthController.me),
);
export default router;
