import { Router } from "express";
import { createUser, listUsers, toggleUserStatus } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = Router();

// Only SYSTEM_ADMIN and ADMIN can access these routes
router.use(requireAuth);
router.use(authorize(["SYSTEM_ADMIN", "ADMIN"]));

router.post("/users", createUser);
router.get("/users", listUsers);
router.patch("/users/:id/status", toggleUserStatus);

export default router;
