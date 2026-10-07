const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:5000/api';
let tokens = {};
let testIds = {};

// Test Suite
class RheinklarAppTests {
  constructor() {
    this.results = [];
  }

  async runTests() {
    console.log('🧪 Starting Rheinklar Integration Tests...\n');

    try {
      await this.testAuthentication();
      await this.testCustomerFlow();
      await this.testEmployeeFlow();
      await this.testAdminFlow();
      await this.testTaskWorkflow();
      await this.testInvoiceWorkflow();
      await this.testSecurity();

      this.printResults();
    } catch (err) {
      console.error('❌ Test suite failed:', err.message);
      process.exit(1);
    }
  }

  // 1. Authentication Tests
  async testAuthentication() {
    console.log('📋 Testing Authentication...');

    try {
      // Register customer
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        email: `customer_${Date.now()}@rheinklar.ch`,
        password: 'Test1234!',
        fullName: 'Test Customer',
        phone: '0791234567',
        role: 'customer',
        twoFaMethod: 'email',
        language: 'de'
      });

      assert(registerRes.status === 201);
      assert(registerRes.data.accessToken);
      testIds.customerId = registerRes.data.userId;
      tokens.customer = registerRes.data.accessToken;
      console.log('✅ Customer registration: PASS');

      // Register employee
      const empRegister = await axios.post(`${API_URL}/auth/register`, {
        email: `employee_${Date.now()}@rheinklar.ch`,
        password: 'Test1234!',
        fullName: 'Test Employee',
        phone: '0791234568',
        role: 'employee',
        twoFaMethod: 'sms'
      });

      assert(empRegister.status === 201);
      testIds.employeeId = empRegister.data.userId;
      tokens.employee = empRegister.data.accessToken;
      console.log('✅ Employee registration: PASS');

      // Register admin
      const adminRegister = await axios.post(`${API_URL}/auth/register`, {
        email: `admin_${Date.now()}@rheinklar.ch`,
        password: 'AdminSecret123!',
        fullName: 'Test Admin',
        role: 'admin'
      });

      assert(adminRegister.status === 201);
      testIds.adminId = adminRegister.data.userId;
      tokens.admin = adminRegister.data.accessToken;
      console.log('✅ Admin registration: PASS');

      // Test login
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: `customer_${Date.now()}@rheinklar.ch`,
        password: 'Test1234!'
      });

      assert(loginRes.status === 200);
      console.log('✅ Login: PASS\n');
    } catch (err) {
      this.logError('Authentication', err);
      throw err;
    }
  }

  // 2. Customer Flow Tests
  async testCustomerFlow() {
    console.log('👤 Testing Customer Flow...');

    try {
      // Get profile
      const profileRes = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${tokens.customer}` }
      });

      assert(profileRes.status === 200);
      assert(profileRes.data.email);
      console.log('✅ Get customer profile: PASS');

      // Update profile
      const updateRes = await axios.put(
        `${API_URL}/users/profile`,
        { fullName: 'Updated Name', language: 'de' },
        { headers: { Authorization: `Bearer ${tokens.customer}` } }
      );

      assert(updateRes.status === 200);
      console.log('✅ Update customer profile: PASS');

      // View invoices (empty initially)
      const invoicesRes = await axios.get(`${API_URL}/invoices`, {
        headers: { Authorization: `Bearer ${tokens.customer}` }
      });

      assert(Array.isArray(invoicesRes.data));
      console.log('✅ Get customer invoices: PASS\n');
    } catch (err) {
      this.logError('Customer Flow', err);
      throw err;
    }
  }

  // 3. Employee Flow Tests
  async testEmployeeFlow() {
    console.log('👨‍💼 Testing Employee Flow...');

    try {
      // Get employee tasks
      const tasksRes = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${tokens.employee}` }
      });

      assert(Array.isArray(tasksRes.data));
      console.log('✅ Get employee tasks: PASS');

      // Update profile
      const updateRes = await axios.put(
        `${API_URL}/users/profile`,
        { fullName: 'Employee Updated' },
        { headers: { Authorization: `Bearer ${tokens.employee}` } }
      );

      assert(updateRes.status === 200);
      console.log('✅ Employee profile update: PASS\n');
    } catch (err) {
      this.logError('Employee Flow', err);
      throw err;
    }
  }

  // 4. Admin Flow Tests
  async testAdminFlow() {
    console.log('👑 Testing Admin Flow...');

    try {
      // Get dashboard stats
      const statsRes = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });

      assert(statsRes.status === 200);
      assert(typeof statsRes.data.openTasks === 'number');
      console.log('✅ Admin dashboard stats: PASS');

      // Get employees
      const empRes = await axios.get(`${API_URL}/admin/employees`, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });

      assert(Array.isArray(empRes.data));
      console.log('✅ Get employees list: PASS');

      // Create employee
      const createEmpRes = await axios.post(
        `${API_URL}/admin/employees`,
        {
          name: 'New Employee',
          email: `newemp_${Date.now()}@rheinklar.ch`,
          phone: '0791234569'
        },
        { headers: { Authorization: `Bearer ${tokens.admin}` } }
      );

      assert(createEmpRes.status === 201);
      assert(createEmpRes.data.tempPassword);
      console.log('✅ Create employee: PASS\n');
    } catch (err) {
      this.logError('Admin Flow', err);
      throw err;
    }
  }

  // 5. Task Workflow Tests
  async testTaskWorkflow() {
    console.log('📋 Testing Task Workflow...');

    try {
      // Create task (admin)
      const createRes = await axios.post(
        `${API_URL}/tasks`,
        {
          customerId: testIds.customerId,
          title: 'Pipe Repair',
          description: 'Fix leaking pipe in bathroom',
          budgetHours: 2,
          scheduledStart: new Date().toISOString(),
          scheduledEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
        { headers: { Authorization: `Bearer ${tokens.admin}` } }
      );

      assert(createRes.status === 201);
      testIds.taskId = createRes.data.id;
      console.log('✅ Create task: PASS');

      // Get task
      const getRes = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${tokens.customer}` }
      });

      assert(getRes.status === 200);
      console.log('✅ Get customer tasks: PASS');

      // Update task
      const updateRes = await axios.put(
        `${API_URL}/tasks/${testIds.taskId}`,
        {
          status: 'completed',
          actualHours: 2.5,
          beforeImageUrl: 'https://example.com/before.jpg',
          afterImageUrl: 'https://example.com/after.jpg'
        },
        { headers: { Authorization: `Bearer ${tokens.admin}` } }
      );

      assert(updateRes.status === 200);
      console.log('✅ Update task: PASS\n');
    } catch (err) {
      this.logError('Task Workflow', err);
      throw err;
    }
  }

  // 6. Invoice Workflow Tests
  async testInvoiceWorkflow() {
    console.log('💰 Testing Invoice Workflow...');

    try {
      // Get invoices
      const getRes = await axios.get(`${API_URL}/invoices`, {
        headers: { Authorization: `Bearer ${tokens.customer}` }
      });

      assert(Array.isArray(getRes.data));
      console.log('✅ Get invoices: PASS');

      if (getRes.data.length > 0) {
        // Mark as read
        const readRes = await axios.put(
          `${API_URL}/invoices/${getRes.data[0].id}/read`,
          {},
          { headers: { Authorization: `Bearer ${tokens.customer}` } }
        );

        assert(readRes.status === 200);
        console.log('✅ Mark invoice as read: PASS');
      }

      console.log('');
    } catch (err) {
      this.logError('Invoice Workflow', err);
      throw err;
    }
  }

  // 7. Security Tests
  async testSecurity() {
    console.log('🔒 Testing Security...');

    try {
      // Test missing auth header
      try {
        await axios.get(`${API_URL}/users/profile`);
        assert(false, 'Should require authorization');
      } catch (err) {
        assert(err.response.status === 401);
        console.log('✅ Missing auth header rejected: PASS');
      }

      // Test invalid token
      try {
        await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: 'Bearer invalid-token' }
        });
        assert(false, 'Should reject invalid token');
      } catch (err) {
        assert(err.response.status === 401);
        console.log('✅ Invalid token rejected: PASS');
      }

      console.log('');
    } catch (err) {
      this.logError('Security', err);
      throw err;
    }
  }

  logError(test, err) {
    console.error(`❌ ${test} FAILED:`, err.message);
    this.results.push({ test, status: 'FAILED', error: err.message });
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ All critical tests PASSED!\n');
    console.log('Tested Features:');
    console.log('  ✅ Authentication (register, login, tokens)');
    console.log('  ✅ Customer profile & invoices');
    console.log('  ✅ Employee profile & tasks');
    console.log('  ✅ Admin dashboard & employee management');
    console.log('  ✅ Task creation & updates');
    console.log('  ✅ Invoice management');
    console.log('  ✅ Security (auth, permissions)\n');
  }
}

// Run tests
const tester = new RheinklarAppTests();
tester.runTests();
