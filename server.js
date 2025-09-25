// Express backend server
const express = require('express');
const cors = require('cors');
require('dotenv').config();
// node-fetch is ESM in v3; use dynamic import for CommonJS compatibility
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test root route (plain text)
app.get('/', (_req, res) => {
  res.type('text').send('✅ Backend server is working!');
});

// Sample API route
app.get('/api/hello', (_req, res) => {
  console.log('GET /api/hello');
  res.json({ message: 'Hello from backend!' });
});

// Proxy to ML service: POST /api/analyze
// Forwards JSON body to http://localhost:8001/analyze and returns its JSON response
app.post('/api/analyze', async (req, res) => {
  try {
    const mlUrl = 'http://localhost:8001/analyze';
    const response = await fetch(mlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body ?? {}),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      const errText = await response.text();
      console.error('ML service error', response.status, errText);
      return res.status(502).json({
        error: 'Upstream ML service error',
        status: response.status,
        details: errText,
      });
    }

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    }

    // Fallback if upstream didn't return JSON
    const text = await response.text();
    return res.type('text').send(text);
  } catch (err) {
    console.error('POST /api/analyze failed', err);
    return res.status(500).json({ error: 'Failed to contact ML service' });
  }
});

// AI Mentor route: combines OpenAI (optional) with ML /analyze
// POST /api/ai_mentor { idea: string }
app.post('/api/ai_mentor', async (req, res) => {
  const { idea = '' } = req.body || {};
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1) Call ML analyze in parallel
  const mlPromise = (async () => {
    try {
      const r = await fetch('http://localhost:8001/analyze', { method: 'POST' });
      if (!r.ok) throw new Error(`ML analyze HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      return { error: String(e) };
    }
  })();

  // 2) Call OpenAI for feasibility + suggestions (fallback to demo if key missing)
  const aiPromise = (async () => {
    if (!openaiKey) {
      // Demo mode
      return {
        feasibility: 0.78,
        suggestions: [
          'Validate your target segment with 10–15 customer interviews.',
          'Ship an MVP focusing on a single core outcome.',
          'Allocate budget to 1–2 paid channels and measure CAC weekly.',
          'Define 3 measurable milestones for the next 90 days.'
        ],
        mockup_url: 'https://placehold.co/600x300/111827/EEE?text=AI+Mockup',
      };
    }
    try {
      const prompt = `You are an AI venture mentor. Analyze the following startup idea and return a JSON with keys: feasibility (0-1), suggestions (array of 3-5 concise bullet points). Idea: ${idea}`;
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You respond with strictly valid JSON only.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.4,
        }),
      });
      if (!r.ok) throw new Error(`OpenAI HTTP ${r.status}`);
      const data = await r.json();
      const text = data?.choices?.[0]?.message?.content || '{}';
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = {}; }
      return {
        feasibility: typeof parsed.feasibility === 'number' ? parsed.feasibility : 0.7,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [
          'Focus on a narrow ICP for initial traction.',
          'Instrument analytics to validate retention early.',
          'Iterate pricing with 2–3 experiments.',
        ],
        mockup_url: 'https://placehold.co/600x300/111827/EEE?text=AI+Mockup',
      };
    } catch (e) {
      return {
        feasibility: 0.72,
        suggestions: [
          'Start with a lean MVP and customer interviews.',
          'Track funnel metrics weekly.',
          'Prioritize one scalable acquisition channel.',
        ],
        mockup_url: 'https://placehold.co/600x300/111827/EEE?text=AI+Mockup',
        warning: `AI fallback used: ${String(e)}`,
      };
    }
  })();

  try {
    const [ml, ai] = await Promise.all([mlPromise, aiPromise]);
    return res.json({
      mentor: ai,
      analyze: ml,
    });
  } catch (err) {
    console.error('POST /api/ai_mentor failed', err);
    return res.status(500).json({ error: 'Failed to run AI mentor' });
  }
});

app.listen(PORT, () => {
  console.log(`Dev server listening on http://localhost:${PORT}`);
});
