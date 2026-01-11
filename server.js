// server.js - Secure Backend for Tact (Vercel Ready)
// Uses Groq API for analysis

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Groq from 'groq-sdk';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Security: Enforce CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '*'],
  methods: ['POST', 'OPTIONS']
}));

app.use(express.json());

// Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Take a deep breath. You are refining too fast." },
  standardHeaders: true,
  legacyHeaders: false,
});

// IMPORTANT: Path must match your frontend call and Vercel route
app.use('/api/analyze', limiter);

const sanitizeInput = (text) => {
  if (!text) return "";
  return text.replace(/<[^>]*>?/gm, '');
};

app.post('/api/analyze', async (req, res) => {
  try {
    const { text, settings } = req.body;

    const cleanText = sanitizeInput(text);
    const receiver = sanitizeInput(settings?.receiverType || "General Audience");
    const tone = sanitizeInput(settings?.intendedTone || "Neutral");
    const traits = sanitizeInput(settings?.userTraits || "None");

    if (!cleanText || cleanText.trim().length === 0) {
      return res.status(400).json({ error: "Text is required." });
    }

    if (cleanText.length > 2000) {
      return res.status(400).json({ error: "Text is too long." });
    }

    const systemPrompt = `
      Act as a strict, high-stakes communication coach. Your job is to save the user from embarrassment, job loss, or damaged relationships.
      
      Context:
      - Receiver: ${receiver}
      - Intended Tone: ${tone}
      - User Traits: ${traits}

      Return a JSON object with the following structure:
      {
        "score": number, // 0-100 score.
        "summary": string, // One sentence summary.
        "audience_perception": {
          "primary_receiver": string,
          "neutral_observer": string
        },
        "highlights": [
          {
             "substring": string, // The exact matching substring from the user text.
             "severity": "high" | "medium" | "low",
             "reason": string,
             "better_alternative": string
          }
        ],
        "rewritten_message": string,
        "rewritten_score": number
      }

      Strict Scoring Rules:
      - Score < 50: DANGEROUS. Contains insults, wildly inappropriate slang for the receiver (e.g. 'lol' to a boss), or hostility.
      - Score 50-69: Risky, passive-aggressive, or too casual.
      - If input has slang (lol, u, thx) directed at Boss/Client, score MUST be < 50.

      Task:
      Analyze the text below.
    `;

    const userMessage = `Text to analyze: "${cleanText}"`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: 'groq/compound',
      temperature: 0,
      max_completion_tokens: 1024,
      top_p: 1,
      seed: 123456,
      stop: null,
      compound_custom: {
        "tools": {
          "enabled_tools": [
            "web_search",
            "code_interpreter",
            "visit_website"
          ]
        }
      }
    });

    const content = completion.choices[0]?.message?.content || '{}';

    // Helper to extract JSON if model adds markdown or chatter
    const extractJson = (str) => {
      const jsonRegex = /{[\s\S]*}/;
      const match = str.match(jsonRegex);
      return match ? match[0] : str;
    };

    const cleanContent = extractJson(content);
    let jsonResult;
    try {
      jsonResult = JSON.parse(cleanContent);
    } catch (e) {
      // Fallback: If strict parsing fails, try to just wrap it assuming it might be incomplete or malformed, but likely it's just garbage text. 
      // For now, let's just log the raw content for debugging if it fails again.
      console.error("Failed to parse JSON. Raw content:", content);
      throw new Error("Invalid JSON response from model");
    }

    // Optimization: If score is high (>85), no need for a rewrite.
    if (jsonResult.score > 85) {
      jsonResult.rewritten_message = "";
    }

    res.json(jsonResult);

  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze text." });
  }
});

export default app;

// Local dev startup handled by start-server.js