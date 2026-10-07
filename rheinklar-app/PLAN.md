# 🏠 Rheinklar Hauswartungs-App - Implementierungsplan

## 📋 Projekt-Übersicht
- **Name**: Rheinklar Hauswartungs-App
- **Kunden**: 500+
- **Mitarbeiter**: 20+
- **Admins**: 3
- **Status**: In Entwicklung

---

## 🏗️ Technische Architektur

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Datenbank**: PostgreSQL
- **Authentication**: JWT + 2FA (SMS/Email)
- **Storage**: Local (Drive)
- **API**: REST

### Frontend (Mobile + Web)
- **iOS/Android**: React Native (Expo)
- **Web (Admin/Dashboard)**: Next.js (React)
- **Styling**: Tailwind CSS
- **State Management**: Redux/Context API
- **Maps**: Google Maps API

### Deployment
- **Server**: Self-hosted (keine externe Services außer Claude)
- **Database**: PostgreSQL lokal oder Cloud (Schweiz)
- **Storage**: Local/S3-compatible

---

## 📊 Datenbank-Schema (Kernmodelle)

### Users
- id, email, password (hashed), phone, role, 2fa_method, created_at, status

### Customers (Mieter)
- id, name, email, phone, address, contract_start, contract_end, insurance_policy, status

### Employees (Mitarbeiter)
- id, name, email, phone, role, status, contract_data, onduty_schedule, location

### Admins
- id, name, email, password, permissions, created_at

### Tasks (Aufträge)
- id, customer_id, employee_id, title, description, status, start_time, end_time, budget_hours, actual_hours, images, created_at

### Invoices (Rechnungen)
- id, customer_id, amount, status, services, read_at, created_at, due_date

### OnCallSchedule (Piketdienst)
- id, employee_id, date, phone, is_active, called_times

### Contracts (Verträge)
- id, type, user_id, signed_by, signature_data, created_at

### Services (Dienstleistungen)
- id, name, description, hourly_rate, category

---

## 🔐 Authentifizierung & Sicherheit

- [x] User Registration mit Email-Validierung
- [x] 2FA (SMS + Email)
- [x] JWT Token-basiert (Access + Refresh)
- [x] Password Hashing (bcrypt)
- [x] Rate-Limiting auf API
- [x] GDPR/Schweizer Datenschutz konform
- [x] Audit Logs für Admin-Aktionen

---

## ✨ Funktionen nach Benutzertyp

### 👤 Kunden
- [ ] Account erstellen mit 2FA
- [ ] Reklamationen einreichen
- [ ] 24/7 Notruf anrufen
- [ ] Schäden melden
- [ ] Reportage erstellen
- [ ] Mietvertrag hochladen
- [ ] Versicherungspolicen speichern
- [ ] Mietvertrag kündigen (mit Bestätigung)
- [ ] Fotos hochladen
- [ ] Spot-Stempel bei Hauswartungen
- [ ] Rechnungen ansehen & Download
- [ ] Rechnung als "gelesen" markieren

### 👨‍💼 Mitarbeiter
- [ ] Auftragslist anschauen
- [ ] Zeit stempeln (An/Abmelden pro Auftrag)
- [ ] Fotos vor/nachher hochladen
- [ ] Ferien eintragen
- [ ] Verträge digital unterschreiben
- [ ] Piketdienst erhalten (per SMS/Call Forward)
- [ ] Offline-Modus (Daten später synchen)
- [ ] Standort teilen während Auftrag

### 👑 Admin (3 Accounts)
- [ ] Alle Mitarbeiter-Accounts erstellen
- [ ] Ferien genehmigen/ablehnen
- [ ] Aufträge verteilen
- [ ] Zeiterfassung überwachen (Rentabilität)
- [ ] Standort-Tracking (live)
- [ ] Piketplan verwalten
- [ ] Rechnungen generieren
- [ ] Offerten bestätigen/ablehnen
- [ ] Verträge digital unterschreiben
- [ ] Kundendaten sperren/löschen
- [ ] Notizen hinterlegen
- [ ] Reports exportieren (PDF/Excel)
- [ ] Alle Profile verwalten

### 🤝 Partner
- [ ] Offerten hochladen
- [ ] Aufträge anschauen
- [ ] Verträge digital unterschreiben

---

## 🧪 Test-Strategie

### Unit Tests
- Auth-Logik
- API-Endpoints
- Datenbankfunktionen

### Integration Tests
- Workflow: Kunde registriert → Admin sieht → Auftrag erstellen
- Workflow: Piketdienst → SMS wird gesendet → Mitarbeiter antwortet
- Workflow: Auftrag abgeschlossen → Rechnung generiert → Kunde sieht

### E2E Tests (manuell)
- Alle Benutzerflows durchspielen
- Mobile + Web testen
- Performance prüfen
- Offline-Modus testen
- 2FA testen
- Digital-Signatur testen

### Performance Tests
- Loading-Zeit < 2 Sekunden
- 500+ Kunden gleichzeitig
- 20+ Mitarbeiter tracking

---

## 📅 Implementierungs-Phasen

### Phase 1: Backend Foundation (Tag 1-2)
- PostgreSQL Setup
- Express API Grundstruktur
- Authentication & JWT
- User Management

### Phase 2: Core Features Backend (Tag 3-5)
- Tasks/Aufträge CRUD
- Zeiterfassung
- Rechnungsgenerierung
- Piketdienst-Logik

### Phase 3: Frontend Setup (Tag 6)
- React Native Projekt
- Next.js Admin Dashboard
- Navigation/Routing
- State Management

### Phase 4: Frontend Features (Tag 7-10)
- Auth-Screens
- Kunden-App (alle Features)
- Mitarbeiter-App (alle features)
- Admin-Dashboard (vollständig)

### Phase 5: Integration & Testing (Tag 11-12)
- Backend + Frontend verbinden
- Alle Workflows testen
- Bugs fixen
- Performance optimieren

### Phase 6: Deployment & Demo (Tag 13)
- Deployment vorbereiten
- Demo aufbauen
- Dokumentation
- Präsentation

---

## ⚠️ Critical Path
1. ✅ Database Schema
2. ✅ API Authentication
3. ✅ Task Management (Kunden + Mitarbeiter)
4. ✅ Invoice Generation
5. ✅ Mobile App funktionsfähig
6. ✅ Admin Dashboard
7. ✅ Testing aller Workflows

---

## 📝 Notizen
- Alle Zeiten in UTC speichern, lokal anzeigen
- Bilder komprimieren vor Upload
- Offline-Queue für Mitarbeiter-App
- SMS über Twilio ODER eigenes System?
  → Für "zentral halten": Eigenes SMS-System via Email-to-SMS Gateway
- E-Signaturen: Penneo oder DocuSign? → Entscheidung: DocuSign API
- WCAG Compliance in allen Screens beachten
