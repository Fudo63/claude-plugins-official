const { v4: uuidv4 } = require('uuid');

class InvoiceService {
  constructor(db) {
    this.db = db;
  }

  // Generate invoice from task
  async generateInvoiceFromTask(taskId) {
    try {
      const task = await this.db.query(
        `SELECT t.*, s.name as service_name, s.hourly_rate
         FROM tasks t
         LEFT JOIN services s ON t.service_id = s.id
         WHERE t.id = $1`,
        [taskId]
      );

      if (task.rows.length === 0) throw new Error('Task not found');

      const taskData = task.rows[0];
      const invoiceNumber = `RK-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const amount = (taskData.actual_hours || taskData.budget_hours) * (taskData.hourly_rate || 75);

      const result = await this.db.query(
        `INSERT INTO invoices (invoice_number, customer_id, task_id, amount, services, due_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          invoiceNumber,
          taskData.customer_id,
          taskId,
          amount,
          JSON.stringify([{
            name: taskData.service_name,
            hours: taskData.actual_hours || taskData.budget_hours,
            rate: taskData.hourly_rate
          }]),
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days due date
        ]
      );

      return result.rows[0];
    } catch (err) {
      console.error('Invoice generation error:', err);
      throw err;
    }
  }

  // Get invoices for customer
  async getCustomerInvoices(customerId) {
    const result = await this.db.query(
      'SELECT * FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );
    return result.rows;
  }

  // Mark invoice as read
  async markAsRead(invoiceId) {
    const result = await this.db.query(
      'UPDATE invoices SET is_read = TRUE, read_at = NOW() WHERE id = $1 RETURNING *',
      [invoiceId]
    );
    return result.rows[0];
  }

  // Get overdue invoices
  async getOverdueInvoices() {
    const result = await this.db.query(
      `SELECT * FROM invoices
       WHERE status IN ('sent', 'read') AND due_date < NOW()
       ORDER BY due_date ASC`
    );
    return result.rows;
  }
}

module.exports = InvoiceService;
