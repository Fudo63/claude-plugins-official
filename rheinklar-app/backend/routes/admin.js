const express = require('express');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

// Admin Dashboard Stats
router.get('/stats', requireRole(['admin']), async (req, res) => {
  try {
    const tasks = await req.db.query('SELECT COUNT(*) FROM tasks WHERE status = $1', ['open']);
    const employees = await req.db.query('SELECT COUNT(*) FROM employees WHERE status = $1', ['active']);
    const invoices = await req.db.query('SELECT COUNT(*) FROM invoices WHERE status = $1', ['overdue']);

    res.json({
      openTasks: parseInt(tasks.rows[0].count),
      activeEmployees: parseInt(employees.rows[0].count),
      overdueInvoices: parseInt(invoices.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all employees
router.get('/employees', requireRole(['admin']), async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT e.*, u.email FROM employees e JOIN users u ON e.user_id = u.id'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Create employee
router.post('/employees', requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const { generateTokens } = require('../middleware/auth');
    const bcrypt = require('bcryptjs');

    const userId = uuidv4();
    const tempPassword = uuidv4().substring(0, 8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await req.db.query(
      `INSERT INTO users (id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, email, passwordHash, name, 'employee']
    );

    await req.db.query(
      'INSERT INTO employees (user_id, name, email, phone) VALUES ($1, $2, $3, $4)',
      [userId, name, email, phone]
    );

    res.status(201).json({
      message: 'Employee created',
      tempPassword,
      email
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

module.exports = router;
