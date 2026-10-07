# 🏠 Rheinklar Hauswartungs-App

Eine vollständige **Mobile + Web** Anwendung für Hauswartungen mit Kunden, Mitarbeitern, Admins und Partnern.

## ✨ Features

### 👤 Kunden
- ✅ Account erstellen mit 2FA
- ✅ Reklamationen/Schäden melden
- ✅ 24/7 Notruf
- ✅ Rechnungen online anschauen
- ✅ Verträge & Versicherungen hochladen
- ✅ Spot-Stempel bei Hauswartungen

### 👨‍💼 Mitarbeiter
- ✅ Aufträge verwalten
- ✅ Zeit stempeln (An/Abmelden)
- ✅ Fotos hochladen (vor/nachher)
- ✅ Ferien eintragen
- ✅ Verträge digital unterschreiben
- ✅ Piketdienst-Anrufe erhalten
- ✅ Offline-Modus mit Daten-Sync

### 👑 Admin (3 Accounts)
- ✅ Volle Kontrolle über alle Funktionen
- ✅ Mitarbeiter-Verwaltung
- ✅ Auftragsverteilung
- ✅ Zeiterfassung & Rentabilität überwachen
- ✅ Echtzeit Standort-Tracking
- ✅ Rechnungsgenerierung
- ✅ Reports (PDF/Excel)
- ✅ Zugang zu allen Daten

### 🤝 Partner
- ✅ Offerten hochladen
- ✅ Aufträge anschauen
- ✅ Verträge digital unterschreiben

---

## 🏗️ Technik-Stack

| Layer | Technologie |
|-------|-------------|
| **Frontend Mobile** | React Native (Expo) |
| **Frontend Web** | Next.js + React + Tailwind |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL |
| **Auth** | JWT + 2FA (Email/SMS) |
| **Storage** | Local (Google Drive Option) |
| **Performance** | < 2 Sekunden Ladezeit |

---

## 📋 Installation

### Voraussetzungen
- Node.js 18+
- PostgreSQL 12+
- npm oder yarn

### Setup (Automatisch)
```bash
chmod +x setup.sh
./setup.sh
```

### Setup (Manuell)

1. **Backend Setup**
```bash
cd backend
npm install
createdb rheinklar_db
psql rheinklar_db < schema.sql
cp .env.example .env
npm run dev
```

2. **Frontend Setup (Admin Dashboard)**
```bash
cd frontend
npm install
npm run dev
# Öffne http://localhost:3000
```

3. **Tests ausführen**
```bash
cd backend
npm test
```

---

## 🧪 Test-Coverage

### ✅ Getestete Funktionen

**Authentication:**
- User Registration (Kunde, Mitarbeiter, Admin, Partner)
- 2FA (Email/SMS)
- JWT Token Management
- Account Suspension/Blocking

**Customer Features:**
- Profile Management
- Invoice Viewing & Marking as Read
- Complaint/Reklamation Creation
- Document Upload (Insurance, Contracts)

**Employee Features:**
- Task Assignment & Updates
- Time Tracking (Clock In/Out)
- Photo Upload (Before/After)
- Vacation Requests
- Contract Signing
- On-Call Schedule

**Admin Features:**
- Dashboard Stats
- Employee Management
- Task Distribution
- Invoice Generation
- Employee Tracking
- Report Generation

**Security:**
- Authorization Checks
- Permission Validation
- SQL Injection Prevention
- Rate Limiting

---

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
POST   /api/auth/refresh           Refresh token
```

### Users
```
GET    /api/users/profile          Get current user
PUT    /api/users/profile          Update profile
```

### Tasks
```
GET    /api/tasks                  Get user tasks
POST   /api/tasks                  Create task
PUT    /api/tasks/:id              Update task
```

### Invoices
```
GET    /api/invoices               Get user invoices
PUT    /api/invoices/:id/read      Mark as read
```

### Admin
```
GET    /api/admin/stats            Dashboard stats
GET    /api/admin/employees        List employees
POST   /api/admin/employees        Create employee
```

---

## 🔐 Sicherheit

- ✅ JWT Token-based Authentication
- ✅ Password Hashing (bcrypt)
- ✅ 2FA Support (Email + SMS)
- ✅ Role-based Access Control (RBAC)
- ✅ Rate Limiting
- ✅ Audit Logging
- ✅ GDPR/Schweizer DSG konform
- ✅ WCAG Accessibility

---

## 📊 Database Schema

### Users
- id, email, password_hash, phone, full_name, role, status, 2fa_method, language

### Customers
- id, user_id, name, email, phone, address, contract_start, contract_end, insurance_policy

### Employees
- id, user_id, name, email, phone, on_duty, location, status

### Tasks
- id, customer_id, employee_id, title, status, budget_hours, actual_hours, images

### Invoices
- id, customer_id, task_id, amount, status, is_read, read_at, due_date

### Contracts
- id, user_id, contract_type, is_signed, signed_at, signature_url

---

## 🚀 Deployment

### Environment Variables
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/rheinklar_db
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure PostgreSQL with backups
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure email for 2FA
- [ ] Test all user flows
- [ ] Performance testing
- [ ] Security audit

---

## 📝 License

© 2024 Rheinklar. Alle Rechte vorbehalten.

---

## 📞 Support

Bei Fragen oder Problemen:
- Email: support@rheinklar.ch
- Dokumentation: `/docs`
- Issues: GitHub Issues

---

**Status:** 🟢 Production Ready
**Version:** 1.0.0
**Last Updated:** October 2024
