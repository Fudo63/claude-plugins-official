require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const invoiceRoutes = require('./routes/invoices');
const adminRoutes = require('./routes/admin');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/rheinklar'
});

pool.on('error', (err) => {
  console.error('Database error:', err);
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Zu viele Anfragen von dieser IP'
});
app.use(limiter);

// Make pool available to routes
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/tasks', verifyToken, taskRoutes);
app.use('/api/invoices', verifyToken, invoiceRoutes);
app.use('/api/admin', verifyToken, adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date()
  });
});

// Start Server
app.listen(PORT, async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    console.log(`✅ Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  pool.end();
  process.exit(0);
});

module.exports = app;
