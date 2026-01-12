# Dokumentacijos Indeksas

**Atnaujinta:** 2026-01-12

---

## 📚 Pagrindinė Dokumentacija

### Pradžia
- [`NEXT_STEPS.md`](./NEXT_STEPS.md) - Kiti žingsniai ir rekomendacijos
- [`TODO.md`](./TODO.md) - Darbų sąrašas

### Vadovai (Guides)
- [`guides/MIGRATION_GUIDE.md`](./guides/MIGRATION_GUIDE.md) - Migracijos vadovas
- [`guides/QUICK_START.md`](./guides/QUICK_START.md) - Greitas startas
- [`guides/QUICK_START_DEPLOYMENT.md`](./guides/QUICK_START_DEPLOYMENT.md) - Deployment greitas startas
- [`guides/SETUP.md`](./guides/SETUP.md) - Setup instrukcijos

### Specifikacijos (Specs)
- [`specs/WORKSPACES_SPEC.md`](./specs/WORKSPACES_SPEC.md) - Workspace architektūros specifikacija
- [`specs/WORKSPACE_ENDPOINT_MAP.md`](./specs/WORKSPACE_ENDPOINT_MAP.md) - Endpoint mapping
- [`specs/ARCHITECTURE.md`](./specs/ARCHITECTURE.md) - Bendroji architektūra
- [`specs/DECISIONS.md`](./specs/DECISIONS.md) - Architektūros sprendimai
- [`specs/GDPR.md`](./specs/GDPR.md) - GDPR compliance

---

## ✅ Atlikti Darbai

### Pagrindinis Dokumentas
- [`completed/COMPLETED_WORK.md`](./completed/COMPLETED_WORK.md) - **VISI ATLIKTI DARBAI** (sujungti visi completion reports)

### Patikrinimo Dokumentai
- [`completed/ACCEPTANCE_CRITERIA_VERIFICATION.md`](./completed/ACCEPTANCE_CRITERIA_VERIFICATION.md) - Acceptance criteria patikrinimas
- [`completed/VERIFICATION_CHECKLIST.md`](./completed/VERIFICATION_CHECKLIST.md) - Patikrinimo checklist
- [`completed/TESTING.md`](./completed/TESTING.md) - Testavimo dokumentacija

---

## 🔍 Audit Dokumentacija

### Pagrindinis Audit Report
- [`audit/AUDIT_COMPLETE.md`](./audit/AUDIT_COMPLETE.md) - **PILNAS AUDIT REPORT** (sujungti visi audit failai)

### Detalūs Audit Failai
- [`audit/AUDIT_BASELINE.md`](./audit/AUDIT_BASELINE.md) - Baseline snapshot
- [`audit/AUDIT_REPORT.md`](./audit/AUDIT_REPORT.md) - Initial audit findings
- [`audit/AUDIT_FIXES_APPLIED.md`](./audit/AUDIT_FIXES_APPLIED.md) - BLOCKER fixes
- [`audit/FINAL_AUDIT_COMPLETE.md`](./audit/FINAL_AUDIT_COMPLETE.md) - Final audit completion
- [`audit/RBAC_AUDIT.md`](./audit/RBAC_AUDIT.md) - RBAC audit
- [`audit/TENANT_ISOLATION_REPORT.md`](./audit/TENANT_ISOLATION_REPORT.md) - Tenant isolation report
- [`audit/TENANT_ISOLATION_FIXES.md`](./audit/TENANT_ISOLATION_FIXES.md) - Tenant isolation fixes
- [`audit/MIGRATIONS_AUDIT.md`](./audit/MIGRATIONS_AUDIT.md) - Migrations audit
- [`audit/SECURITY_AUDIT.md`](./audit/SECURITY_AUDIT.md) - Security audit
- [`audit/AUDIT_CONTEXT.md`](./audit/AUDIT_CONTEXT.md) - Audit context
- [`audit/ISSUES_LOG.md`](./audit/ISSUES_LOG.md) - Issues log
- [`audit/ORG_SCOPING_AUDIT.md`](./audit/ORG_SCOPING_AUDIT.md) - Organization scoping audit
- [`audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md`](./audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md) - Rate limit audit

---

## 🏗️ Infrastruktūra

- [`infra/DEPLOY.md`](./infra/DEPLOY.md) - Deployment instrukcijos
- [`infra/BACKUP_RESTORE.md`](./infra/BACKUP_RESTORE.md) - Backup ir restore procedūros

---

## 📦 Archyvas

### 2026-01 Archyvas
- [`archive/2026-01/`](./archive/2026-01/) - 2026-01 mėnesio archyvas

### Seni Setup Failai
- [`archive/old-setup/`](./archive/old-setup/) - Seni setup dokumentai

---

## 🔗 Greitas Prieiga

### Svarbiausi Dokumentai
1. **Atlikti darbai:** [`completed/COMPLETED_WORK.md`](./completed/COMPLETED_WORK.md)
2. **Audit report:** [`audit/AUDIT_COMPLETE.md`](./audit/AUDIT_COMPLETE.md)
3. **Migracijos:** [`guides/MIGRATION_GUIDE.md`](./guides/MIGRATION_GUIDE.md)
4. **Specifikacija:** [`specs/WORKSPACES_SPEC.md`](./specs/WORKSPACES_SPEC.md)

---

## 📁 Folderių Struktūra

```
docs/
├── INDEX.md                    # Šis failas
├── NEXT_STEPS.md              # Kiti žingsniai
├── TODO.md                    # Darbų sąrašas
│
├── completed/                 # Atlikti darbai
│   ├── COMPLETED_WORK.md      # VISI ATLIKTI DARBAI (sujungti)
│   └── ...
│
├── audit/                     # Audit dokumentacija
│   ├── AUDIT_COMPLETE.md      # PILNAS AUDIT REPORT (sujungti)
│   └── ...
│
├── guides/                     # Vadovai
│   ├── MIGRATION_GUIDE.md
│   ├── QUICK_START.md
│   └── ...
│
├── specs/                      # Specifikacijos
│   ├── WORKSPACES_SPEC.md
│   ├── WORKSPACE_ENDPOINT_MAP.md
│   └── ...
│
├── infra/                      # Infrastruktūra
│   ├── DEPLOY.md
│   └── BACKUP_RESTORE.md
│
└── archive/                    # Archyvas
    ├── 2026-01/
    └── old-setup/
```

---

**Pastaba:** Visi "atlikti darbai" failai sujungti į `completed/COMPLETED_WORK.md`. Visi audit failai sujungti į `audit/AUDIT_COMPLETE.md`.
