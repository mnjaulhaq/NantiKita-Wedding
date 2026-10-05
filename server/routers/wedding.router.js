import { Router } from "express";
import * as WeddingController from "../controllers/wedding.controller.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const guestLimiter = rateLimit({
  windowMs: 10 * 60_000,
  max: 20,
  message:
    "Terlalu banyak pengiriman dari perangkat ini. Coba lagi beberapa menit lagi.",
});

const router = Router();
router.get("/themes", asyncHandler(WeddingController.listThemes));
router.get("/wedding/:slug", asyncHandler(WeddingController.getWeddingBySlug));
router.get(
  "/wedding/:slug/rsvps",
  asyncHandler(WeddingController.getRsvpsBySlug),
);
router.post(
  "/wedding/:slug/rsvp",
  guestLimiter,
  asyncHandler(WeddingController.submitRsvp),
);
router.post(
  "/wedding/:slug/ucapan",
  guestLimiter,
  asyncHandler(WeddingController.submitUcapan),
);

export default router;
