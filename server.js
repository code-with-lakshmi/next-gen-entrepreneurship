// Express backend server
const express = require('express');
const cors = require('cors');
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

app.listen(PORT, () => {
  console.log(`Dev server listening on http://localhost:${PORT}`);
});
