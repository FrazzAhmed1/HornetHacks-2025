import express from "express";
import { analyzeSymptoms, getUserRecords } from "../controllers/symptomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route: AI symptom analysis
router.post("/", analyzeSymptoms);

// Private route: view past user records
router.get("/", protect, getUserRecords);

export default router;
