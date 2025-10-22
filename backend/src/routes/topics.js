import { Router } from "express";
const router = Router();
import { getTopics } from "../controllers/topicsController.js";

router.get("/", getTopics);

export default router;
