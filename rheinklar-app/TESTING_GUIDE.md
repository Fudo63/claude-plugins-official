# 🧪 Rheinklar App - Testing & Validation Guide

## Test-Szenarien die wir testen

### 1️⃣ **Authentication Flow**
```
✅ User Registration (Kunde, Mitarbeiter, Admin)
✅ Email-Validierung
✅ 2FA (Email/SMS)
✅ Login mit Tokens
✅ Token Refresh
✅ Logout
✅ Failed Login (wrong password)
✅ Account suspend/block
```

### 2️⃣ **Customer Flow**
```
✅ Register as customer
✅ View dashboard
✅ Create complaint/reklamation
✅ Call 24/7 hotline
✅ View tasks
✅ Upload before/after photos
✅ View invoices
✅ Mark invoice as read
✅ Download invoice (PDF)
✅ Renew/cancel lease
✅ Upload insurance
```

### 3️⃣ **Employee Flow**
```
✅ Login as employee
✅ View assigned tasks
✅ Clock in/out (time tracking)
✅ Upload photos (before/after)
✅ Update task status
✅ Request vacation
✅ Receive on-call shifts (SMS/Phone)
✅ Answer emergency call
✅ Sign contracts digitally
✅ View location tracking
```

### 4️⃣ **Admin Flow**
```
✅ Admin dashboard (stats)
✅ Create employee account
✅ Approve/deny vacation
✅ Assign tasks to employees
✅ Monitor employee time tracking
✅ Monitor employee location
✅ Generate invoices
✅ Confirm offerts from partners
✅ View customer records
✅ Suspend/unblock customer
✅ Export reports (PDF/Excel)
✅ Sign contracts
✅ Access all data
```

### 5️⃣ **Partner Flow**
```
✅ Login as partner
✅ Upload offerts
✅ View assigned tasks/projects
✅ Sign contracts
```

### 6️⃣ **Critical Features**
```
✅ Performance (< 2 seconds load time)
✅ Mobile responsiveness (iOS/Android)
✅ Offline mode (employees can work offline)
✅ Data sync after offline
✅ WCAG Accessibility compliance
✅ Dark/Light mode
✅ Multi-language (DE/FR/EN)
✅ Error handling & user feedback
✅ Security (no SQL injection, XSS, etc)
✅ Data privacy (GDPR/Schweizer DSG)
```

## Test Results
- [ ] All tests passed
- [ ] Performance OK
- [ ] Mobile works
- [ ] No critical bugs
- [ ] User feedback positive

---

## Automated Test Checklist

Run this after each change to ensure nothing breaks:

```bash
# Backend Tests
npm run test:auth
npm run test:api
npm run test:db

# Frontend Tests
npm run test:ui
npm run test:performance

# Integration Tests
npm run test:integration

# Security Tests
npm run test:security
```

