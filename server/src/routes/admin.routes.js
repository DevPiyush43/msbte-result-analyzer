import { Router } from "express";
import { createUser, listUsers, toggleUserStatus } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { seedSystemAdmin } from "../config/seed.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Only SYSTEM_ADMIN and ADMIN can access these routes
router.use(requireAuth);
router.use(authorize(["SYSTEM_ADMIN", "ADMIN"]));

router.post("/users", createUser);
router.get("/users", listUsers);
router.patch("/users/:id/status", toggleUserStatus);

router.post("/seed-admin", asyncHandler(async (req, res) => {
  await seedSystemAdmin();
  res.json({ message: "Seeding triggered" });
}));

export default router;
