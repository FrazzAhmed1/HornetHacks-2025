import asyncHandler from "express-async-handler";
import OpenAI from "openai";
import { encrypt, decrypt } from "../utils/encrypt.js";
import SymptomRecord from "../models/symptomRecordModel.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @desc Analyze symptoms and suggest possible conditions
// @route POST /api/symptoms
// @access Public (guest or logged-in)
export const analyzeSymptoms = asyncHandler(async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.trim() === "") {
    res.status(400);
    throw new Error("Please provide symptoms for analysis");
  }

  // Query OpenAI
  const prompt = `You are a helpful medical assistant. Based on the following symptoms, provide three possible conditions and one short advice for next steps:\n\nSymptoms: ${symptoms}`;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const aiResponse = completion.choices[0].message.content;

  // Encrypt and save if user is logged in
  if (req.user) {
    const encrypted = {
      encryptedSymptoms: encrypt(symptoms),
      encryptedResults: encrypt(aiResponse),
      userId: req.user._id,
    };

    await SymptomRecord.create(encrypted);
  }

  res.json({ result: aiResponse });
});

// @desc Get user's past symptom records
// @route GET /api/symptoms
// @access Private
export const getUserRecords = asyncHandler(async (req, res) => {
  const records = await SymptomRecord.find({ userId: req.user._id }).sort({ createdAt: -1 });

  const decryptedRecords = records.map((record) => ({
    id: record._id,
    symptoms: decrypt(record.encryptedSymptoms),
    results: decrypt(record.encryptedResults),
    createdAt: record.createdAt,
  }));

  res.json(decryptedRecords);
});
