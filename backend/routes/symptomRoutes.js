import express from "express";
import { analyzeSymptoms, getUserRecords } from "../controllers/symptomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Analyze symptoms (open to guests + logged-in users)
router.post("/", analyzeSymptoms);

// Get user symptom history (protected route)
router.get("/", protect, getUserRecords);

export default router;
