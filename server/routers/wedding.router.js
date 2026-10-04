import { Router } from "express";
import * as WeddingController from "../controllers/wedding.controller.js";
import { rateLimit } from "../middlewares/rateLimit.js";

const guestLimiter = rateLimit({
  windowMs: 10 * 60_000,
  max: 20,
  message:
    "Terlalu banyak pengiriman dari perangkat ini. Coba lagi beberapa menit lagi.",
});

router.post("/wedding/:slug/rsvp", guestLimiter, WeddingController.submitRsvp);
router.post(
  "/wedding/:slug/ucapan",
  guestLimiter,
  WeddingController.submitUcapan,
);
const router = Router();
router.get("/themes", WeddingController.listThemes);
router.get("/wedding/:slug", WeddingController.getWeddingBySlug);
router.get("/wedding/:slug/rsvps", WeddingController.getRsvpsBySlug);
router.post("/wedding/:slug/rsvp", WeddingController.submitRsvp);
router.post("/wedding/:slug/ucapan", WeddingController.submitUcapan);

export default router;
