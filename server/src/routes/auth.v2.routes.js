import { Router } from "express";
import { login, me } from "../controllers/auth.v2.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/auth/v2/login", login);
router.get("/auth/v2/me", requireAuth, me);

export default router;
