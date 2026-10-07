const express = require('express');
const router = express.Router();

// Get tasks for current user
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT t.* FROM tasks t
      WHERE t.customer_id = (SELECT id FROM customers WHERE user_id = $1)
         OR t.employee_id = (SELECT id FROM employees WHERE user_id = $1)
    `;
    const result = await req.db.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task (admin/customer)
router.post('/', async (req, res) => {
  try {
    const { customerId, title, description, serviceId, budgetHours, scheduledStart, scheduledEnd } = req.body;
    const { v4: uuidv4 } = require('uuid');

    const taskId = uuidv4();
    await req.db.query(
      `INSERT INTO tasks (id, customer_id, title, description, service_id, budget_hours, scheduled_start, scheduled_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [taskId, customerId, title, description, serviceId, budgetHours, scheduledStart, scheduledEnd]
    );

    res.status(201).json({ id: taskId, message: 'Task created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task status
router.put('/:taskId', async (req, res) => {
  try {
    const { status, actualHours, beforeImageUrl, afterImageUrl } = req.body;
    await req.db.query(
      `UPDATE tasks SET status = $1, actual_hours = $2, before_image_url = $3, after_image_url = $4, updated_at = NOW()
       WHERE id = $5`,
      [status, actualHours, beforeImageUrl, afterImageUrl, req.params.taskId]
    );
    res.json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

module.exports = router;
