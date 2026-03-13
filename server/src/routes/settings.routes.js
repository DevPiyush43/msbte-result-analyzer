import { Router } from "express";
import { getAllSettings, getSetting, updateSetting } from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = Router();

router.get("/settings", requireAuth, authorize(["SYSTEM_ADMIN"]), getAllSettings);
router.get("/settings/:key", requireAuth, authorize(["SYSTEM_ADMIN"]), getSetting);
router.put("/settings/:key", requireAuth, authorize(["SYSTEM_ADMIN"]), updateSetting);

export default router;
