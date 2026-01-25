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
app.use(cors({
  origin: ['https://tact-fix.vercel.app', 'http://localhost:5173', 'http://localhost:3000'] // Allow Prod + Local
}));
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
const GOOGLE_MODEL_NAME = 'gemma-3-12b-it';

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', provider: 'Tact API' }));

// --- Provider State ---
let providerIndex = 0; // 0 = Groq, 1 = Google
const PROVIDERS = ['GROQ', 'GOOGLE'];

// --- Helper Functions ---

async function callGroq(prompt, customSystemPrompt = null) {
  console.log("--- DEBUG START: callGroq ---");
  console.log("Model:", GROQ_MODEL);

  const defaultSystemPrompt = `You are Tact, an expert communication coach.
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

  const systemPrompt = customSystemPrompt || defaultSystemPrompt;

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

async function callGoogle(prompt, customSystemPrompt = null) {
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

  const defaultSystemPrompt = `You are Tact, an expert communication coach.
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

  const systemPrompt = customSystemPrompt || defaultSystemPrompt;

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

// --- Parallax API Endpoint ---
app.post('/api/parallax/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  // Security: Max Length Check
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message too long. Please keep it under 5000 characters.' });
  }

  const parallaxSystemPrompt = `
  You are Parallax, an AI workplace strategist and "Devil's Advocate" decision helper.
  
  Your goal is to help the user navigate this stressful workplace situation.
  
  CRITICAL: Output ONLY a valid JSON object. No Markdown. No Preambles.
  
  JSON Schema:
  {
    "analysis": {
      "internal_monologue": "string (A brief, rational assessment of the risks and handbook policies. Quote generic 'Handbook Sections' regarding Integrity, Financial Risk, etc. if relevant to sound authoritative but generic.)",
      "panic_check": "string (A calming validation of their feelings, e.g., 'It is normal to feel X, but we can fix this.')"
    },
    "options": [
      {
        "id": "A",
        "title": "string (Short, catchy title e.g. 'The Honest Approach')",
        "description": "string (What to do)",
        "risk_level": "Low" | "Medium" | "High",
        "pros": ["string"],
        "cons": ["string"],
        "dos": ["string (Specific phrase or point to include)"],
        "donts": ["string (Specific phrase or point to avoid)"],
        "recommended": boolean
      },
      {
        "id": "B",
        "title": "string",
        "description": "string",
        "risk_level": "Low" | "Medium" | "High",
        "pros": ["string"],
        "cons": ["string"],
        "dos": ["string"],
        "donts": ["string"],
        "recommended": boolean
      }
    ],
    "advice": "string (Which option you recommend and briefly why)"
  }`;

  const userPrompt = `User Situation: "${message}"`;

  // Reuse the existing provider logic
  // --- Load Balancing & Failover Strategy ---
  let startProvider = PROVIDERS[providerIndex];
  if (startProvider === 'GOOGLE' && !googleGenAI) startProvider = 'GROQ';
  providerIndex = (providerIndex + 1) % PROVIDERS.length;

  try {
    let result;
    const executeCall = async (provider) => {
      // NOTE: We pass the parallax system prompt as the second argument
      if (provider === 'GROQ') return await callGroq(userPrompt, parallaxSystemPrompt);
      return await callGoogle(userPrompt, parallaxSystemPrompt);
    };

    try {
      result = await executeCall(startProvider);
    } catch (err) {
      console.error(`Primary provider ${startProvider} failed. Switching...`);
      const failover = startProvider === 'GROQ' ? 'GOOGLE' : 'GROQ';
      result = await executeCall(failover);
    }

    res.json(result);
  } catch (error) {
    console.error('All AI Providers failed:', error);
    res.status(500).json({ error: 'Failed to analyze situation.' });
  }
});

app.post('/api/parallax/draft', async (req, res) => {
  const { situation, strategy, receiver } = req.body;

  if (!situation || !strategy) return res.status(400).json({ error: 'Missing details' });

  const prompt = `
    You are Parallax, an expert communication drafter.
    
    Task: Draft a professional email/message for the user based on their situation and chosen strategy.
    
    Situation: "${situation}"
    Chosen Strategy: "${strategy.title}" - ${strategy.description}
    Receiver: ${receiver || 'Manager'}
    
    Guidelines:
    - Include these points: ${strategy.dos?.join(', ')}
    - AVOID these points: ${strategy.donts?.join(', ')}
    
    CRITICAL: Output ONLY a JSON object.
    {
        "draft": "string (The ready-to-send message text)"
    }
    `;

  // --- Load Balancing & Failover Strategy ---
  let startProvider = PROVIDERS[providerIndex];
  if (startProvider === 'GOOGLE' && !googleGenAI) startProvider = 'GROQ';
  providerIndex = (providerIndex + 1) % PROVIDERS.length;

  try {
    let result;
    const executeCall = async (provider) => {
      // Reusing callGroq/callGoogle but they expect a strict schema... 
      // We need to pass a custom system prompt that matches the Draft schema!
      const draftSystemPrompt = `You are a professional email drafter. Output JSON only. Schema: { "draft": "string" }`;

      if (provider === 'GROQ') return await callGroq(prompt, draftSystemPrompt);
      return await callGoogle(prompt, draftSystemPrompt);
    };

    try {
      result = await executeCall(startProvider);
    } catch (err) {
      console.error(`Primary provider ${startProvider} failed. Switching...`);
      const failover = startProvider === 'GROQ' ? 'GOOGLE' : 'GROQ';
      result = await executeCall(failover);
    }

    res.json(result);
  } catch (error) {
    console.error('Draft generation failed:', error);
    res.status(500).json({ error: 'Failed to generate draft.' });
  }
});

// --- API Endpoint ---
app.post('/api/analyze', async (req, res) => {
  const { text, settings } = req.body;

  if (!text) return res.status(400).json({ error: 'Text is required' });

  // Security: Max Length Check (2500 chars ~ 500 tokens)
  if (text.length > 2500) {
    return res.status(400).json({ error: 'Message too long. Please keep it under 2500 characters.' });
  }

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