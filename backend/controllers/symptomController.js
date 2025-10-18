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

  // Generate AI response
  const prompt = `You are a helpful, licensed medical assistant AI. Based on the following symptoms, provide:
  1. The top 3 possible medical conditions.
  2. One concise recommendation for what the person should do next (e.g., see a doctor, go to urgent care, rest, etc.).
  Keep it factual and under 150 words.

  Symptoms: ${symptoms}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const aiResponse = completion.choices[0].message.content;

  // Save (encrypted) if user is logged in
  if (req.user) {
    await SymptomRecord.create({
      userId: req.user._id,
      encryptedSymptoms: encrypt(symptoms),
      encryptedResults: encrypt(aiResponse),
    });
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
