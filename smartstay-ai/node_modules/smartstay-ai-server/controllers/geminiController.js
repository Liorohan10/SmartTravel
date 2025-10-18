import axios from 'axios';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

async function callGemini(prompt, system = '') {
  // Google Gemini REST (Generative Language) simple call via axios
  // Endpoint style: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=API_KEY
  const API_KEY = getGeminiApiKey();
  if (!API_KEY) {
    const err = new Error('Gemini API key not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY in server/.env');
    err.status = 500; throw err;
  }
  
  const modelsToTry = [GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-1.5-flash'];
  const payload = {
    contents: [
      ...(system ? [{ role: 'user', parts: [{ text: system }] }] : []),
      { role: 'user', parts: [{ text: prompt }] }
    ]
  };
  const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY };

  let lastError;
  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      console.log('[Gemini] Calling model:', model);
      const { data } = await axios.post(url, payload, { headers });
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) console.warn('[Gemini] Empty response text from model', model);
      if (model !== GEMINI_MODEL) console.warn(`[Gemini] Fallback succeeded using ${model}`);
      return text;
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      const message = err.response?.data?.error?.message || err.message;
      console.warn('[Gemini] Model failed:', { model, status, message });
      // If NOT_FOUND or method unsupported, try next model
      if (status === 404 || message?.includes('not supported')) continue;
      // Other errors (e.g., auth) shouldn't fallback hide the root cause
      break;
    }
  }
  throw lastError || new Error('Unknown Gemini error');
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
}

export async function chatWithGemini(req, res) {
  try {
    const { messages, persona } = req.body;
    const system = persona || 'You are SmartStay AI, a helpful travel planner and hotel booking assistant.';
    const prompt = (messages || []).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const reply = await callGemini(prompt, system);
    res.json({ reply });
  } catch (err) {
    console.error('Gemini chat error:', err.response?.data || err.message);
    res.status(err.response?.status || err.status || 500).json({ error: 'Gemini chat failed', detail: err.response?.data || err.message });
  }
}

export async function summarizeHotel(req, res) {
  try {
    const { hotel } = req.body; // expect hotel object with name, location, amenities, ratings, reviews
    const prompt = `Summarize this hotel for a traveler. Include highlights, vibe, ideal visitors.\nHotel JSON:\n${JSON.stringify(hotel)}`;
    const reply = await callGemini(prompt);
    res.json({ summary: reply });
  } catch (err) {
    console.error('Gemini summarize error:', err.response?.data || err.message);
    res.status(err.response?.status || err.status || 500).json({ error: 'Gemini summarize failed', detail: err.response?.data || err.message });
  }
}

export async function compareHotels(req, res) {
  try {
    const { hotels } = req.body; // array of up to 3 hotels
    const prompt = `Compare these hotels and recommend who each suits best (families, business, nightlife, etc). Keep it concise.\nHotels JSON:\n${JSON.stringify(hotels)}`;
    const reply = await callGemini(prompt);
    res.json({ comparison: reply });
  } catch (err) {
    console.error('Gemini compare error:', err.response?.data || err.message);
    res.status(err.response?.status || err.status || 500).json({ error: 'Gemini compare failed', detail: err.response?.data || err.message });
  }
}

export async function smartFilterQuery(req, res) {
  try {
    const { query } = req.body; // natural language filter
    const prompt = `Translate this natural language hotel filter into a compact JSON. Fields: destination (string), minPrice (number), maxPrice (number), stars (number|optional), amenities (string[]), neighborhood (string|optional). Only output JSON with no commentary.\nQuery: ${query}`;
    const reply = await callGemini(prompt);
    let filterObj = null;
    try { filterObj = JSON.parse(reply) } catch {}
    res.json({ filter: filterObj || reply });
  } catch (err) {
    console.error('Gemini smart filter error:', err.response?.data || err.message);
    res.status(err.response?.status || err.status || 500).json({ error: 'Gemini smart filter failed', detail: err.response?.data || err.message });
  }
}

export async function travelPlan(req, res) {
  try {
    const { destination, days = 3, preferences = '' } = req.body;
    const prompt = `Create a day-wise travel plan for ${destination} for ${days} days. Include attractions, restaurants, and route suggestions. Preferences: ${preferences}`;
    const reply = await callGemini(prompt);
    res.json({ plan: reply });
  } catch (err) {
    console.error('Gemini travel plan error:', err.response?.data || err.message);
    res.status(err.response?.status || err.status || 500).json({ error: 'Gemini travel plan failed', detail: err.response?.data || err.message });
  }
}

export async function geminiHealth(req, res) {
  const key = getGeminiApiKey();
  res.json({
    configured: !!key,
    model: GEMINI_MODEL,
    keySuffix: key ? key.slice(-4) : null,
  });
}
