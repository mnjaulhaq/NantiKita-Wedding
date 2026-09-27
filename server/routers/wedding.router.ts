import { Router } from "express";
import * as WeddingController from "../controllers/wedding.controller";

const router = Router();

router.get("/themes", WeddingController.listThemes);
router.get("/wedding/:slug", WeddingController.getWeddingBySlug);
router.post("/wedding/:slug/rsvp", WeddingController.submitRsvp);

export default router;
