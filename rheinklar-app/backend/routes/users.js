const express = require('express');
const router = express.Router();

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT id, email, full_name, phone, role, status FROM users WHERE id = $1',
      [req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const { fullName, phone, language } = req.body;
    await req.db.query(
      'UPDATE users SET full_name = $1, phone = $2, language = $3 WHERE id = $4',
      [fullName, phone, language, req.user.userId]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
