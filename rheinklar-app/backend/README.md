# Rheinklar Backend API

## Setup

### 1. Installation
```bash
npm install
```

### 2. Database Setup
```bash
# Create database
createdb rheinklar_db

# Run schema
psql rheinklar_db < schema.sql
```

### 3. Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Start Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/profile` - Get current user
- `PUT /api/users/profile` - Update profile

### Tasks
- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:taskId` - Update task

### Invoices
- `GET /api/invoices` - Get invoices
- `PUT /api/invoices/:invoiceId/read` - Mark as read

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/employees` - List employees
- `POST /api/admin/employees` - Create employee

## Testing
```bash
npm test
```
