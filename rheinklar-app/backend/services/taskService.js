const { v4: uuidv4 } = require('uuid');

class TaskService {
  constructor(db) {
    this.db = db;
  }

  // Create task
  async createTask(customerId, title, description, serviceId, budgetHours, scheduledStart, scheduledEnd) {
    const taskId = uuidv4();
    const result = await this.db.query(
      `INSERT INTO tasks (id, customer_id, title, description, service_id, budget_hours, scheduled_start, scheduled_end, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [taskId, customerId, title, description, serviceId, budgetHours, scheduledStart, scheduledEnd]
    );
    return result.rows[0];
  }

  // Assign task to employee
  async assignTask(taskId, employeeId) {
    const result = await this.db.query(
      `UPDATE tasks SET employee_id = $1, status = 'assigned', updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [employeeId, taskId]
    );
    return result.rows[0];
  }

  // Clock in (start task)
  async clockIn(taskId, employeeId) {
    const result = await this.db.query(
      `UPDATE tasks SET status = 'in_progress', actual_start = NOW()
       WHERE id = $1 AND employee_id = $2
       RETURNING *`,
      [taskId, employeeId]
    );
    return result.rows[0];
  }

  // Clock out (end task)
  async clockOut(taskId, employeeId, actualHours, beforeImage, afterImage) {
    const result = await this.db.query(
      `UPDATE tasks SET
        status = 'completed',
        actual_end = NOW(),
        actual_hours = $1,
        before_image_url = $2,
        after_image_url = $3,
        updated_at = NOW()
       WHERE id = $4 AND employee_id = $5
       RETURNING *`,
      [actualHours, beforeImage, afterImage, taskId, employeeId]
    );
    return result.rows[0];
  }

  // Get tasks for employee
  async getEmployeeTasks(employeeId, status = null) {
    let query = `
      SELECT t.*, c.name as customer_name, c.address
      FROM tasks t
      JOIN customers c ON t.customer_id = c.id
      WHERE t.employee_id = $1
    `;
    const params = [employeeId];

    if (status) {
      query += ` AND t.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY t.scheduled_start ASC`;

    const result = await this.db.query(query, params);
    return result.rows;
  }

  // Get tasks for customer
  async getCustomerTasks(customerId) {
    const result = await this.db.query(
      `SELECT t.*, e.name as employee_name
       FROM tasks t
       LEFT JOIN employees e ON t.employee_id = e.id
       WHERE t.customer_id = $1
       ORDER BY t.scheduled_start DESC`,
      [customerId]
    );
    return result.rows;
  }

  // Calculate profitability (actual hours vs budget)
  async getTaskProfitability(taskId) {
    const result = await this.db.query(
      `SELECT
        actual_hours,
        budget_hours,
        ROUND((actual_hours / NULLIF(budget_hours, 0)) * 100, 2) as efficiency_percentage
       FROM tasks WHERE id = $1`,
      [taskId]
    );
    return result.rows[0];
  }

  // Get employee productivity report
  async getEmployeeReport(employeeId, startDate, endDate) {
    const result = await this.db.query(
      `SELECT
        DATE(actual_start) as date,
        COUNT(*) as tasks_completed,
        SUM(actual_hours) as total_hours,
        AVG(actual_hours) as avg_task_duration
       FROM tasks
       WHERE employee_id = $1
         AND status = 'completed'
         AND actual_start >= $2
         AND actual_end <= $3
       GROUP BY DATE(actual_start)
       ORDER BY date DESC`,
      [employeeId, startDate, endDate]
    );
    return result.rows;
  }
}

module.exports = TaskService;
