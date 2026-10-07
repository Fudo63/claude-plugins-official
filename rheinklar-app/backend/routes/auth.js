const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { generateTokens } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, role, twoFaMethod, language } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existing = await req.db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user
    await req.db.query(
      `INSERT INTO users (id, email, password_hash, phone, full_name, role, two_fa_method, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, email, passwordHash, phone, fullName, role, twoFaMethod || 'email', language || 'de']
    );

    // Create role-specific record
    if (role === 'customer') {
      await req.db.query(
        'INSERT INTO customers (user_id, name, email, phone) VALUES ($1, $2, $3, $4)',
        [userId, fullName, email, phone]
      );
    } else if (role === 'employee') {
      await req.db.query(
        'INSERT INTO employees (user_id, name, email, phone) VALUES ($1, $2, $3, $4)',
        [userId, fullName, email, phone]
      );
    }

    const { accessToken, refreshToken } = generateTokens(userId, role);

    res.status(201).json({
      message: 'User registered successfully',
      userId,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const result = await req.db.query(
      'SELECT id, password_hash, role, status FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await req.db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.json({
      message: 'Login successful',
      userId: user.id,
      role: user.role,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh Token
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
