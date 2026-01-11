import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security & Config ---
app.use(cors({ origin: '*' }));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// --- AI Clients ---
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const googleGenAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

// --- Models ---
const GROQ_MODEL = 'groq/compound';
// Using Gemma 2 9B as requested previously
const GOOGLE_MODEL_NAME = 'gemma-2-9b-it';

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', provider: 'Tact API' }));

// --- Provider State ---
let providerIndex = 0; // 0 = Groq, 1 = Google
const PROVIDERS = ['GROQ', 'GOOGLE'];

// --- Helper Functions ---

async function callGroq(prompt) {
  console.log("--- DEBUG START: callGroq ---");
  console.log("Model:", GROQ_MODEL);
  // console.log("Prompt:", prompt); // Uncomment if needed, usually too noisy

  const systemPrompt = `You are Tact, an expert communication coach.
  CRITICAL: Output ONLY a valid JSON object.Do NOT include any conversational text, markdown formatting(like file ticks), or preambles.
    
    JSON Schema:
{
  "score": number(0 - 100),
    "summary": "string",
      "highlights": [{ "text": "substring", "type": "positive" | "negative" | "neutral", "suggestion": "string" }],
        "rewritten_message": "string",
          "rewritten_score": number,
            "audience_perception": { "primary_receiver": "string", "neutral_observer": "string" }
} `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: GROQ_MODEL,
      temperature: 0.0,
      response_format: { type: "json_object" }
    });

    let content = completion.choices[0].message.content;
    console.log("--- RAW RESPONSE FROM GROQ ---");
    console.log(content);

    // CLEANUP: Attempt to extract JSON if model included preamble
    if (!content.trim().startsWith('{')) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) content = match[0];
    }

    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(content);

  } catch (err) {
    console.error("--- ERROR IN callGroq ---", err);
    throw err;
  }
}

async function callGoogle(prompt) {
  console.log("--- DEBUG START: callGoogle ---");
  console.log("Model:", GOOGLE_MODEL_NAME);

  if (!googleGenAI) throw new Error("Google API Key not configured.");

  const model = googleGenAI.getGenerativeModel({
    model: GOOGLE_MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.0
    }
  });

  const systemPrompt = `You are Tact, an expert communication coach.
      CRITICAL: Output ONLY a valid JSON object. No Markdown. No Preambles.
      
      JSON Schema:
      {
        "score": number (0-100),
        "summary": "string",
        "highlights": [ { "text": "substring", "type": "positive"|"negative"|"neutral", "suggestion": "string" } ],
        "rewritten_message": "string",
        "rewritten_score": number,
        "audience_perception": { "primary_receiver": "string", "neutral_observer": "string" }
      }`;

  const finalPrompt = `${systemPrompt}\n\nUSER INPUT TO ANALYZE:\n${prompt}`;

  try {
    const result = await model.generateContent(finalPrompt);
    let text = result.response.text();
    console.log("--- RAW RESPONSE FROM GOOGLE ---");
    console.log(text);

    // Cleanup
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("--- ERROR IN callGoogle ---", err);
    throw err;
  }
}

// --- API Endpoint ---
app.post('/api/analyze', async (req, res) => {
  const { text, settings } = req.body;

  if (!text) return res.status(400).json({ error: 'Text is required' });

  const prompt = `Analyze this message sent to a "${settings.receiverType}" with intended tone "${settings.intendedTone}". User interaction traits: "${settings.userTraits}". Message: "${text}"`;

  // --- Load Balancing & Failover Strategy ---
  let startProvider = PROVIDERS[providerIndex];

  // If Google is not configured, force Groq
  if (startProvider === 'GOOGLE' && !googleGenAI) {
    startProvider = 'GROQ';
  }

  // Rotate index (Round Robin)
  providerIndex = (providerIndex + 1) % PROVIDERS.length;

  try {
    let result;

    // Attempt Primary
    try {
      if (startProvider === 'GROQ') {
        result = await callGroq(prompt);
      } else {
        result = await callGoogle(prompt);
      }
    } catch (primaryError) {
      console.error(`Primary provider ${startProvider} failed. Switching...`);

      // Attempt Failover
      const failoverProvider = startProvider === 'GROQ' ? 'GOOGLE' : 'GROQ';
      if (failoverProvider === 'GROQ') {
        result = await callGroq(prompt);
      } else {
        result = await callGoogle(prompt);
      }
    }

    // Optimization: Clear rewritten message if score is high
    if (result.score && result.score > 85) {
      result.rewritten_message = null;
      result.rewritten_score = null;
    }

    // Inject Provider for Client Debugging (Optional)
    // result._provider = startProvider; 

    res.json(result);

  } catch (error) {
    console.error('All AI Providers failed:', error);
    res.status(500).json({ error: 'Failed to analyze tone. Please try again later.' });
  }
});

// Start Server (Only if run directly, NOT when imported)
import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;