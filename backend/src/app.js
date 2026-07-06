const express = require('express');
const cors = require('cors');

const authMiddleware = require('./middleware/authMiddleware');
const chatRouter = require('./routes/chat');
const historyRouter = require('./routes/history');
const healthRouter = require('./routes/health');

const app = express();

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// --- Public routes ---
app.use('/api/health', healthRouter);

// --- Protected routes (JWT required) ---
app.use('/api/chat', authMiddleware, chatRouter);
app.use('/api/history', authMiddleware, historyRouter);

module.exports = app;
