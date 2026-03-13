import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import {
  analyticsSummary,
  batchAnalytics,
  deleteBatch,
  exportBatchXlsx,
  getBatch,
  getStudentInBatch,
  recentBatches,
  reparseBatch,
  resetFailedOrUnknown,
  uploadBatch,
  uploadMiddleware,
  generateRange,
  exportBatchReports,
  exportComprehensiveZip,
} from "../controllers/batches.controller.js";

const router = Router();

router.post("/batches/upload", requireAuth, uploadMiddleware, uploadBatch);
router.post("/batches/generate-range", requireAuth, generateRange);
router.get("/batches/recent", requireAuth, recentBatches);
router.get("/batches/analytics/summary", requireAuth, analyticsSummary);
router.get("/batches/analytics/summary/export", requireAuth, (req, res, next) => {
  // We'll define exportAnalyticsSummary below in controller
  import("../controllers/batches.controller.js").then(m => m.exportAnalyticsSummary(req, res, next));
});
router.get("/batches/:id", requireAuth, getBatch);
router.get("/batches/:id/analytics", requireAuth, batchAnalytics);
router.get("/batches/:id/students/:enrollment", requireAuth, getStudentInBatch);
router.post("/batches/:id/reparse", requireAuth, reparseBatch);
router.post("/batches/:id/reset", requireAuth, resetFailedOrUnknown);
router.get("/batches/:id/export.xlsx", requireAuth, exportBatchXlsx);
router.get("/batches/:id/export/v2", requireAuth, exportBatchReports);
router.get("/batches/:id/export/zip", requireAuth, exportComprehensiveZip);
router.delete("/batches/:id", requireAuth, deleteBatch);

export default router;
