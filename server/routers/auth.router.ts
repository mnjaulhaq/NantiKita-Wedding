import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/check-username", AuthController.checkUsername);
router.post("/check-email", AuthController.checkEmail);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/login", AuthController.login);
router.post("/logout", requireAuth, AuthController.logout);
router.get("/me", requireAuth, AuthController.me);

export default router;
