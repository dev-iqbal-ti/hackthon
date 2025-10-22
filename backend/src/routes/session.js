import { Router } from "express";
const router = Router();
import {
  startSession,
  respondToInterview,
  endSession,
  getSessionResult,
  getUserSessions,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/auth.js";

router.post("/start", protect, startSession);
router.post("/respond", protect, respondToInterview);
router.post("/end/:id", protect, endSession);
router.get("/result/:id", protect, getSessionResult);
router.get("/history", protect, getUserSessions);

export default router;
