# GDPR Compliance

**Data:** 2026-01-11  
**Status:** Baseline implemented

---

## Overview

This document describes GDPR compliance features and data handling practices.

---

## Data Export

### User Data Export (Admin Scope)

**Endpoint:** `GET /api/admin/gdpr/export/[userId]`

**Access:** Admin only (via `requireAdmin`)

**Exports:**
- User information (id, email, name, timestamps)
- Activities created by user
- Organization memberships
- Groups created by user

**Format:** JSON

**Usage:**
```bash
curl http://localhost:3000/api/admin/gdpr/export/{userId} \
  -H "Cookie: reflectus_session=admin_session..."
```

**Legacy (suderinamumas):**
- `GET /api/admin/users/[userId]/export`

---

## Data Deletion/Anonymization

### Soft-Delete (Admin Scope)

**Endpoint:** `POST /api/admin/gdpr/delete/[userId]`

**Access:** Admin only

**Action:**
- Anonymizes email: `deleted+{userId}@example.invalid`
- Anonymizes name: "Deleted User"
- Preserves data structure for analytics/historical purposes
- Logs deletion in audit log

**Usage:**
```bash
curl -X POST http://localhost:3000/api/admin/gdpr/delete/{userId} \
  -H "Cookie: reflectus_session=admin_session..."
```

**Legacy (suderinamumas):**
- `POST /api/admin/users/[userId]/anonymize`

---

## Data Retention

### Current Policy

- **User data:** Retained until explicit deletion request
- **Activity data:** Retained for historical analytics
- **Audit logs:** Retained for security/compliance (no PII in logs)

### Future Considerations

- Automated retention policies (e.g., delete after 2 years of inactivity)
- Hard-delete option (complete removal from database)
- Data export before deletion
 - Documented retention SLA (legal/ops)

---

## Privacy by Design

### Anonymous Mode

- Activities can be created in `ANONYMOUS` mode
- Participant identities not linked to responses
- Analytics require minimum 5 responses (min-N guard)

### Data Minimization

- Only necessary data collected
- No unnecessary PII in logs
- Audit logs contain only IDs, not sensitive data

---

## User Rights

### Right to Access

- Admin can export user data via `/api/admin/gdpr/export/[userId]`

### Right to Erasure

- Admin can anonymize user data via `/api/admin/gdpr/delete/[userId]`
- Soft-delete preserves data structure

### Right to Data Portability

- Export endpoint provides JSON format
- Can be extended to CSV/other formats

---

## Security

- All GDPR endpoints require admin authentication
- Audit logging for all GDPR actions
- No PII in audit logs (only IDs)

---

## Notes

- Current implementation is baseline (MVP)
- Hard-delete can be added later if needed
- Automated retention policies can be added later
- User-facing GDPR UI can be added later
