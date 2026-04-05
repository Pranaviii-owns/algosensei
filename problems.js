// routes/problems.js
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ObjectId } from "mongodb";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL = "models/gemini-flash-latest"; // fallback safe

// Safe JSON parser
function safeJsonParse(text) {
  try {
    if (!text) return null;
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("JSON parse failed:", err.message, "\nRaw text:", text);
    return null;
  }
}

// Retry wrapper for Gemini AI
async function generateWithRetry(prompt, retries = 3, timeout = 10000) {
  for (let i = 0; i < retries; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeout)
        ),
      ]);
      return result.response.text();
    } catch (err) {
      console.error(`Gemini attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) return null; // final attempt failed
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

// Export router factory
export default (client) => {
  const db = client.db("algoSensiDB");
  const problemsCollection = db.collection("problems");

  // Add new problem
  router.post("/", async (req, res) => {
    try {
      if (!req.body.title || !req.body.description) {
        return res.status(400).json({ error: "Title and description required" });
      }

      const baseDoc = {
        title: req.body.title,
        description: req.body.description,
        code: req.body.code || "",
        createdAt: new Date(),
      };

      // Prompt for Gemini AI
      const prompt = `
You are an expert DSA tutor.
Given the problem below, respond ONLY with valid JSON using this exact structure:
{
  "problemExplanation": "Clear explanation of the problem",
  "approach": "Algorithm or technique to use",
  "timeComplexity": "Big O notation",
  "spaceComplexity": "Big O notation",
  "complexityExplanation": "Why these complexities are correct",
  "pseudocode": "Step by step pseudocode",
  "solutions": {
    "java": "Java code solution",
    "python": "Python code solution",
    "javascript": "JavaScript code solution",
    "cpp": "C++ code solution"
  }
}

Problem:
${req.body.description}
      `;

      // Call AI
      const rawText = await generateWithRetry(prompt);
      const parsed = safeJsonParse(rawText);

      // Fallback if AI fails
      const analysis = parsed || {
        problemExplanation: "Pending AI analysis",
        approach: "Pending",
        timeComplexity: "Pending",
        spaceComplexity: "Pending",
        complexityExplanation: "Pending",
        pseudocode: "Pending",
        solutions: {
          java: "// solution not available",
          python: "# solution not available",
          javascript: "// solution not available",
          cpp: "// solution not available"
        }
      };

      const finalDoc = { ...baseDoc, ...analysis };
      const dbResult = await problemsCollection.insertOne(finalDoc);

      res.status(201).json({ _id: dbResult.insertedId, ...finalDoc });
    } catch (err) {
      console.error("Error creating problem:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get all problems
  router.get("/", async (req, res) => {
    try {
      const problems = await problemsCollection.find().sort({ createdAt: -1 }).toArray();
      res.json(problems);
    } catch (err) {
      console.error("Error fetching problems:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Generate / update solution for a specific problem
  router.post("/:id/generate", async (req, res) => {
    try {
      const problemId = req.params.id;
      const problem = await problemsCollection.findOne({ _id: new ObjectId(problemId) });
      if (!problem) return res.status(404).json({ error: "Problem not found" });

      const prompt = `
You are an expert DSA tutor.
Analyze and solve the problem below.
Respond ONLY in valid JSON with this structure:
{
  "problemExplanation": "...",
  "approach": "...",
  "timeComplexity": "...",
  "spaceComplexity": "...",
  "complexityExplanation": "...",
  "pseudocode": "...",
  "solutions": {
    "java": "...",
    "python": "...",
    "javascript": "...",
    "cpp": "..."
  }
}

Problem:
${problem.description}
      `;

      const rawText = await generateWithRetry(prompt);
      const parsed = safeJsonParse(rawText);

      const finalUpdate = parsed || {
        problemExplanation: "Pending AI analysis",
        approach: "Pending",
        timeComplexity: "Pending",
        spaceComplexity: "Pending",
        complexityExplanation: "Pending",
        pseudocode: "Pending",
        solutions: {
          java: "// solution not available",
          python: "# solution not available",
          javascript: "// solution not available",
          cpp: "// solution not available"
        }
      };

      await problemsCollection.updateOne({ _id: new ObjectId(problemId) }, { $set: finalUpdate });
      res.json({ ...problem, ...finalUpdate });

    } catch (err) {
      console.error("Error generating solution:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};