require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

// Import routes
const authRoutes  = require('./routes/auth');
const wordRoutes  = require('./routes/words');
const scoreRoutes = require('./routes/scores');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security middleware ──────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rate limiting — protects against brute force on PIN login
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { error: 'Too many login attempts, please try again later' }
});

app.use('/api', limiter);
app.use('/api/auth', authLimiter);

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/words',  wordRoutes);
app.use('/api/scores', scoreRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Tentacle Tenses API', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// ── Start ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🐙 Tentacle Tenses API running on http://localhost:${PORT}`);
});