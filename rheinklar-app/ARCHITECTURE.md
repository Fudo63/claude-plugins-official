# 🏗️ RHEINKLAR PROFESSIONAL ARCHITECTURE

**Version:** 2.0 (Production-Ready)  
**Status:** Design Phase  
**Target:** Enterprise SaaS for Facility Management  

---

## 🎯 VISION

Rheinklar ist eine **professionelle, skalierbare Facility-Management-Plattform** für:
- Hauswartungsunternehmen
- Immobilienverwaltungen
- Gebäudeverwaltungen
- Facility-Management-Teams

**Nicht:** Ein Admin-Dashboard  
**Sondern:** Ein echtes Business-Tool, das täglich funktioniert

---

## 📐 DATENMODELL (PROFESSIONELL)

```
┌─────────────────────────────────────────────┐
│         ORGANIZATION (Mandant)              │
│  - Name, Branding, Einstellungen            │
│  - Subscription, Billing                    │
│  - Created, Updated                         │
└──────────┬──────────────────────────────────┘
           │
    ┌──────┴──────┬─────────┬──────────┐
    │             │         │          │
    ▼             ▼         ▼          ▼
┌────────┐  ┌─────────┐ ┌──────┐  ┌──────┐
│GEBÄUDE │  │MITARBEITER│KUNDEN│  │PARTNERS
│        │  │          │      │  │
│- Adresse│ │- Name    │- Name│  │- Firma
│- PLZ   │  │- Email   │- Tel │  │- Kontakt
│- Stadt │  │- Rolle   │- Addr│  │- Bew.
│- BFS   │  │- Status  │- Vers│  │- Rating
└────┬───┘  └────┬─────┘ └──┬──┘  └──┬───┘
     │            │         │        │
     ▼            │         │        │
┌──────────┐      │         │        │
│FLÄCHEN   │      │         │        │
│WOHNUNGEN │      │         │        │
│- Nummer  │      │         │        │
│- Fläche  │      │         │        │
│- Mieter  │      │         │        │
└────┬─────┘      │         │        │
     │            │         │        │
     ▼            │         │        │
┌──────────┐      │         │        │
│ANLAGEN   │      │         │        │
│GERÄTE    │      │         │        │
│- Typ     │      │         │        │
│- Hersteller│    │         │        │
│- Wartung │      │         │        │
│- Seriennr│      │         │        │
└────┬─────┘      │         │        │
     │            │         │        │
     └─────┬──────┴─────────┴────────┘
           │
           ▼
    ┌─────────────────┐
    │    AUFTRÄGE     │
    │  TICKETS        │
    │  INSPEKTIONEN   │
    │  WARTUNGEN      │
    │                 │
    │- Typ            │
    │- Status         │
    │- Priorität      │
    │- Zugewiesene    │
    │- Zeitstempel    │
    │- Kosten         │
    │- Dokumente      │
    └────────┬────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
   AKTIVITÄTEN   KOSTEN
   KALENDER      RECHNUNGEN
   BERICHTE      VERTRÄGE
```

---

## 📊 KERNENTITÄTEN (DETAILLIERT)

### 1. **ORGANIZATION (Mandant)**
```sql
organizations
├─ id (UUID)
├─ name (String)
├─ logo_url (String)
├─ primary_color (Hex)
├─ timezone (Enum)
├─ language (Enum: de, fr, en)
├─ address (String)
├─ phone (String)
├─ website (String)
├─ subscription_tier (Enum: starter, professional, enterprise)
├─ subscription_expires_at (DateTime)
├─ billing_email (String)
├─ settings (JSON: notifications, workflows, etc)
├─ max_users (Int)
├─ max_buildings (Int)
├─ created_at (DateTime)
├─ updated_at (DateTime)
└─ deleted_at (DateTime - Soft Delete)
```

### 2. **USERS & ROLES**
```sql
users
├─ id (UUID)
├─ organization_id (FK)
├─ email (String, Unique per Org)
├─ password_hash (String)
├─ full_name (String)
├─ phone (String)
├─ avatar_url (String)
├─ role (Enum: admin, manager, technician, customer)
├─ permissions (JSON: granular permissions)
├─ status (Enum: active, inactive, suspended)
├─ two_fa_enabled (Boolean)
├─ last_login_at (DateTime)
├─ preferences (JSON: theme, language, etc)
├─ created_at (DateTime)
└─ updated_at (DateTime)

permissions
├─ id (UUID)
├─ name (String: can_view_buildings, can_edit_tasks, etc)
├─ category (Enum: buildings, tasks, users, reporting, etc)
├─ description (String)
└─ default_roles (String[])
```

### 3. **GEBÄUDE & STRUKTUR**
```sql
buildings
├─ id (UUID)
├─ organization_id (FK)
├─ name (String)
├─ address (String)
├─ postal_code (String)
├─ city (String)
├─ country (Enum)
├─ bfs_number (String - Swiss BFS)
├─ coordinates (Point: Lat/Lng)
├─ year_built (Int)
├─ total_area (Float - m²)
├─ building_type (Enum: residential, office, commercial, mixed)
├─ floors (Int)
├─ manager_id (FK → users)
├─ notes (Text)
├─ documents (String[] - URLs)
├─ created_at (DateTime)
└─ updated_at (DateTime)

units (Wohnungen, Flächen)
├─ id (UUID)
├─ building_id (FK)
├─ unit_number (String)
├─ floor (Int)
├─ area (Float - m²)
├─ rooms (Int)
├─ occupant_id (FK → customers)
├─ lease_start (Date)
├─ lease_end (Date)
├─ status (Enum: occupied, vacant, under_maintenance)
├─ notes (Text)
└─ created_at (DateTime)

assets (Anlagen, Geräte)
├─ id (UUID)
├─ building_id (FK)
├─ unit_id (FK - optional)
├─ asset_type (Enum: heating, cooling, electrical, plumbing, etc)
├─ name (String)
├─ manufacturer (String)
├─ model (String)
├─ serial_number (String)
├─ installation_date (Date)
├─ warranty_expires_at (Date)
├─ last_maintenance_at (Date)
├─ next_maintenance_due_at (Date)
├─ documents (String[] - manuals, etc)
├─ status (Enum: operational, needs_maintenance, out_of_service)
└─ created_at (DateTime)
```

### 4. **TASKS/TICKETS/WORK ORDERS**
```sql
tasks (Aufträge, Tickets, Inspektionen)
├─ id (UUID)
├─ organization_id (FK)
├─ building_id (FK)
├─ unit_id (FK - optional)
├─ asset_id (FK - optional)
├─ task_type (Enum: maintenance, repair, inspection, complaint, emergency)
├─ priority (Enum: low, medium, high, critical)
├─ status (Enum: open, assigned, in_progress, on_hold, completed, cancelled)
├─ title (String)
├─ description (Text)
├─ assigned_to_id (FK → users)
├─ created_by_id (FK → users)
├─ customer_id (FK → customers)
├─ scheduled_start (DateTime)
├─ scheduled_end (DateTime)
├─ actual_start (DateTime)
├─ actual_end (DateTime)
├─ estimated_duration (Int - minutes)
├─ actual_duration (Int - minutes)
├─ estimated_cost (Decimal)
├─ actual_cost (Decimal)
├─ materials_used (JSON: [{name, quantity, cost}])
├─ documents (String[] - photos, reports)
├─ comments (String[] - updates)
├─ sla_target_date (DateTime)
├─ sla_met (Boolean)
├─ created_at (DateTime)
├─ updated_at (DateTime)
└─ completed_at (DateTime)

task_history (Audit Trail)
├─ id (UUID)
├─ task_id (FK)
├─ changed_by_id (FK → users)
├─ changed_field (String)
├─ old_value (String)
├─ new_value (String)
├─ changed_at (DateTime)
```

### 5. **INSPEKTIONEN (Spezial-Feature)**
```sql
inspections
├─ id (UUID)
├─ organization_id (FK)
├─ building_id (FK)
├─ inspection_type (Enum: routine, safety, compliance, damage_assessment)
├─ inspector_id (FK → users)
├─ scheduled_date (Date)
├─ actual_date (Date)
├─ status (Enum: scheduled, in_progress, completed)
├─ findings (JSON: [{finding_id, severity, location, photos, notes}])
├─ checklist_items (JSON: [{item, completed, notes}])
├─ documents (String[])
├─ created_at (DateTime)
└─ completed_at (DateTime)
```

### 6. **KOSTEN & RECHNUNGEN**
```sql
invoices
├─ id (UUID)
├─ organization_id (FK)
├─ customer_id (FK)
├─ invoice_number (String - unique per org)
├─ task_id (FK - optional)
├─ amount (Decimal)
├─ currency (Enum: CHF, EUR, USD)
├─ status (Enum: draft, sent, viewed, paid, overdue, cancelled)
├─ issue_date (Date)
├─ due_date (Date)
├─ payment_date (Date)
├─ line_items (JSON: [{description, quantity, unit_price, tax_rate, total}])
├─ notes (Text)
├─ documents (String[] - PDF, etc)
├─ viewed_at (DateTime)
└─ created_at (DateTime)

expenses
├─ id (UUID)
├─ organization_id (FK)
├─ task_id (FK)
├─ amount (Decimal)
├─ category (Enum: materials, labor, equipment, travel, other)
├─ description (String)
├─ date (Date)
├─ receipt_url (String)
└─ created_at (DateTime)
```

### 7. **KALENDER & VERFÜGBARKEIT**
```sql
calendar_events
├─ id (UUID)
├─ organization_id (FK)
├─ title (String)
├─ type (Enum: task, meeting, unavailable, maintenance_window)
├─ start_time (DateTime)
├─ end_time (DateTime)
├─ assigned_to_id (FK → users)
├─ building_id (FK - optional)
├─ recurrence (JSON: {rule, freq, interval, until})
├─ notes (Text)
└─ created_at (DateTime)

availability (Mitarbeiterverfügbarkeit)
├─ id (UUID)
├─ user_id (FK)
├─ date (Date)
├─ available_hours (Int)
├─ scheduled_hours (Int)
├─ notes (String)
└─ created_at (DateTime)
```

### 8. **DOKUMENTE & DATEIEN**
```sql
documents
├─ id (UUID)
├─ organization_id (FK)
├─ owner_id (FK → users)
├─ document_type (Enum: contract, manual, report, receipt, photo, other)
├─ title (String)
├─ file_url (String - cloud storage)
├─ file_size (Int)
├─ mime_type (String)
├─ building_id (FK - optional)
├─ unit_id (FK - optional)
├─ asset_id (FK - optional)
├─ task_id (FK - optional)
├─ tags (String[])
├─ created_at (DateTime)
└─ expires_at (DateTime - optional)
```

### 9. **AUDIT & LOGGING**
```sql
audit_logs
├─ id (UUID)
├─ organization_id (FK)
├─ user_id (FK)
├─ action (String: create, update, delete, view, export)
├─ resource_type (String: task, building, user, invoice)
├─ resource_id (UUID)
├─ changes (JSON: {field, old_value, new_value})
├─ ip_address (String)
├─ user_agent (String)
└─ created_at (DateTime)
```

---

## 🏛️ BACKEND ARCHITEKTUR

```
backend/
├─ src/
│  ├─ config/              # Configuration
│  │  ├─ database.ts
│  │  ├─ auth.ts
│  │  ├─ storage.ts
│  │  └─ email.ts
│  │
│  ├─ middleware/          # Express Middleware
│  │  ├─ auth.ts           # JWT verification
│  │  ├─ permissions.ts    # Role-based access
│  │  ├─ validation.ts     # Request validation
│  │  ├─ errorHandler.ts   # Error handling
│  │  └─ logging.ts        # Request logging
│  │
│  ├─ modules/             # Feature modules
│  │  ├─ organizations/
│  │  │  ├─ organization.controller.ts
│  │  │  ├─ organization.service.ts
│  │  │  ├─ organization.repository.ts
│  │  │  └─ organization.routes.ts
│  │  │
│  │  ├─ buildings/
│  │  ├─ tasks/
│  │  ├─ users/
│  │  ├─ invoices/
│  │  ├─ inspections/
│  │  ├─ documents/
│  │  ├─ calendar/
│  │  └─ reporting/
│  │
│  ├─ services/            # Business logic
│  │  ├─ taskService.ts
│  │  ├─ invoiceService.ts
│  │  ├─ emailService.ts
│  │  ├─ storageService.ts
│  │  └─ notificationService.ts
│  │
│  ├─ utils/               # Utilities
│  │  ├─ validators.ts
│  │  ├─ formatters.ts
│  │  ├─ helpers.ts
│  │  └─ constants.ts
│  │
│  └─ types/               # TypeScript types
│     └─ index.ts
│
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
│
└─ server.ts               # Entry point
```

---

## 🎨 FRONTEND ARCHITEKTUR (React + TypeScript)

```
frontend/
├─ src/
│  ├─ components/          # Reusable components
│  │  ├─ common/           # Universal (Button, Input, etc)
│  │  ├─ layout/           # Layout (Header, Sidebar, etc)
│  │  ├─ buildings/        # Building-specific
│  │  ├─ tasks/            # Task-specific
│  │  ├─ forms/            # Complex forms
│  │  └─ charts/           # Data visualization
│  │
│  ├─ pages/               # Page components
│  │  ├─ Dashboard.tsx
│  │  ├─ Buildings.tsx
│  │  ├─ Tasks.tsx
│  │  ├─ Inspections.tsx
│  │  ├─ Calendar.tsx
│  │  ├─ Reporting.tsx
│  │  └─ Settings.tsx
│  │
│  ├─ hooks/               # Custom React hooks
│  │  ├─ useAuth.ts
│  │  ├─ useFetch.ts
│  │  ├─ useForm.ts
│  │  └─ usePagination.ts
│  │
│  ├─ services/            # API calls
│  │  ├─ api.ts            # Axios instance
│  │  ├─ taskService.ts
│  │  ├─ buildingService.ts
│  │  └─ userService.ts
│  │
│  ├─ store/               # State management (Zustand)
│  │  ├─ authStore.ts
│  │  ├─ uiStore.ts
│  │  └─ dataStore.ts
│  │
│  ├─ styles/              # Global styles + Design System
│  │  ├─ index.css
│  │  ├─ variables.css     # CSS custom properties
│  │  ├─ typography.css
│  │  └─ layout.css
│  │
│  ├─ utils/               # Utilities
│  │  ├─ formatters.ts
│  │  ├─ validators.ts
│  │  └─ helpers.ts
│  │
│  └─ App.tsx              # Root component
│
├─ public/
│  └─ assets/              # Static assets
│
└─ index.tsx               # Entry point
```

---

## 🎨 DESIGN SYSTEM

### Farbpalette
```css
/* Primary */
--primary-50: #e3f2fd
--primary-100: #bbdefb
--primary-500: #1e40af (Main Brand)
--primary-900: #0c1d47

/* Secondary */
--secondary-500: #0891b2
--secondary-900: #164e63

/* Status */
--success: #16a34a
--warning: #ea580c
--danger: #dc2626
--info: #0284c7

/* Neutral */
--gray-50: #f9fafb
--gray-500: #6b7280
--gray-900: #111827
```

### Komponenten
- Button (Primary, Secondary, Tertiary, Sizes)
- Input (Text, Email, Password, Number)
- Select / Dropdown / Combobox
- Checkbox / Radio
- Toggle
- Modal / Dialog
- Notification / Toast
- Badge
- Table
- Pagination
- Tabs
- Accordion
- Stepper
- DatePicker
- TimePicker
- FileUpload
- Skeleton Loader
- Empty State

---

## 🔐 SICHERHEIT

- [ ] JWT Authentication
- [ ] 2FA Support
- [ ] Role-Based Access Control (RBAC)
- [ ] Row-Level Security (RLS)
- [ ] Input Validation
- [ ] SQL Injection Prevention
- [ ] XSS Prevention
- [ ] CSRF Protection
- [ ] Rate Limiting
- [ ] Audit Logging
- [ ] Encrypted Sensitive Data
- [ ] GDPR Compliance
- [ ] Swiss Data Protection Compliance

---

## 📊 TOP 5 CRITICAL FEATURES (PRIORITÄT)

### 1. **Task Management** (MVP)
- Create, assign, track tasks
- Status transitions
- Photos & documentation
- Time tracking
- Cost tracking

### 2. **Building Management** (MVP)
- Building hierarchy
- Unit management
- Asset registry
- Document storage

### 3. **Dashboard** (MVP)
- KPIs & metrics
- Recent activity
- Quick actions
- Calendar preview

### 4. **Calendar & Planning** (High Priority)
- Visual calendar
- Task scheduling
- Availability management
- Resource planning

### 5. **Inspections** (High Priority)
- Inspection workflows
- Checklists
- Photo documentation
- Findings tracking

---

## 📈 SKALIERUNGSZIELE

- [ ] 10-100 Organizations
- [ ] 1000-10000 Users
- [ ] 100k+ Tasks annually
- [ ] Sub-second response times
- [ ] 99.9% Uptime SLA
- [ ] CDN for static assets
- [ ] Database replication
- [ ] Read replicas for reporting
- [ ] Message queue for async tasks
- [ ] Caching strategy (Redis)

---

## 🚀 DEPLOYMENT & DEVOPS

```
Infrastruktur:
├─ Docker containers
├─ Kubernetes (optional)
├─ PostgreSQL (Managed service)
├─ S3-compatible storage
├─ CDN (Cloudflare)
├─ Monitoring (DataDog / New Relic)
├─ Logging (ELK Stack)
├─ CI/CD (GitHub Actions)
└─ Backup & Disaster Recovery
```

---

## 📅 IMPLEMENTATION TIMELINE

```
Week 1-2:  Backend setup + Database + Core APIs
Week 3-4:  Frontend setup + Design System + Layouts
Week 5:    Task Management Implementation
Week 6:    Building Management Implementation
Week 7:    Dashboard & Reporting
Week 8:    Calendar & Inspections
Week 9:    Polish + Testing
Week 10:   Performance + Security Review
```

---

**Status: Ready for implementation phase**
