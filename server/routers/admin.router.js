import { Router } from "express";
import * as AdminController from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
const router = Router();
router.use(asyncHandler(requireAuth));
router.get("/dashboard", asyncHandler(AdminController.dashboard));
router.get("/rsvps", asyncHandler(AdminController.globalRsvps));
router.get("/weddings", asyncHandler(AdminController.listWeddings));
router.post("/weddings", asyncHandler(AdminController.createWedding));
router.get("/weddings/:id", asyncHandler(AdminController.getWedding));
router.put("/weddings/:id", asyncHandler(AdminController.updateWedding));
router.delete("/weddings/:id", asyncHandler(AdminController.deleteWedding));
router.get("/weddings/:id/rsvps", asyncHandler(AdminController.weddingRsvps));
router.get("/templates", asyncHandler(AdminController.listTemplates));
router.patch(
  "/templates/:key",
  asyncHandler(AdminController.updateTemplateStatus),
);
export default router;
