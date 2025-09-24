// Express backend server
const express = require('express');
const cors = require('cors');
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

app.listen(PORT, () => {
  console.log(`Dev server listening on http://localhost:${PORT}`);
});
