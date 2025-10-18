import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import geminiRoutes from './routes/geminiRoutes.js';
import liteapiRoutes from './routes/liteapiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'SmartStay AI Backend', time: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    liteapiBase: process.env.LITEAPI_BASE_URL ? 'set' : 'missing'
  });
});

app.use('/api/gemini', geminiRoutes);
app.use('/api/liteapi', liteapiRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`SmartStay AI backend running on http://localhost:${PORT}`);
  console.log('Config:', {
    clientOrigin: CLIENT_ORIGIN,
    geminiModel: process.env.GEMINI_MODEL,
    geminiKeySuffix: (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').slice(-4),
    liteapiBaseSet: !!process.env.LITEAPI_BASE_URL
  });
});
