require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const tedService = require('./services/tedService');
const filterService = require('./services/filterService');
const userRoutes = require('./routes/users');
const noticeRoutes = require('./routes/notices');
const authRoutes = require('./routes/auth-simple'); // Using simple auth instead of Supabase

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notices', noticeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Schedule TED notice fetching every hour
cron.schedule('0 * * * *', async () => {
  console.log('Fetching new TED notices...');
  try {
    await tedService.fetchAndProcessNotices();
    console.log('TED notices processed successfully');
  } catch (error) {
    console.error('Error processing TED notices:', error);
  }
});

app.listen(PORT, () => {
  console.log(`TED Notice App running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});