const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/questionnaires', require('./routes/questionnaires'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/responses', require('./routes/responses'));
app.use('/api/exports', require('./routes/exports'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function start() {
  await initDB();
  
  // Initialize scheduler for reminders and expiration
  const { initScheduler } = require('./services/scheduler');
  initScheduler();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
