import { Router } from "express";
import * as AdminController from "../controllers/admin.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
router.use(requireAuth);

router.get("/dashboard", AdminController.dashboard);
router.get("/rsvps", AdminController.globalRsvps);

router.get("/weddings", AdminController.listWeddings);
router.post("/weddings", AdminController.createWedding);
router.get("/weddings/:id", AdminController.getWedding);
router.put("/weddings/:id", AdminController.updateWedding);
router.delete("/weddings/:id", AdminController.deleteWedding);
router.get("/weddings/:id/rsvps", AdminController.weddingRsvps);
router.get("/weddings/:id/pdf", AdminController.downloadPdf);

export default router;
