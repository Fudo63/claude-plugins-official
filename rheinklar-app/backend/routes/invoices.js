const express = require('express');
const router = express.Router();

// Get invoices for customer
router.get('/', async (req, res) => {
  try {
    const result = await req.db.query(
      `SELECT * FROM invoices WHERE customer_id = (SELECT id FROM customers WHERE user_id = $1)
       ORDER BY created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Mark invoice as read
router.put('/:invoiceId/read', async (req, res) => {
  try {
    await req.db.query(
      'UPDATE invoices SET is_read = TRUE, read_at = NOW() WHERE id = $1',
      [req.params.invoiceId]
    );
    res.json({ message: 'Invoice marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

module.exports = router;
