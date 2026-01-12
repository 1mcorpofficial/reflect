# Dokumentacijos Reorganizacijos Planas

**Data:** 2026-01-12  
**Autorius:** Dokumentacijos architektas  
**Statusas:** PLANAS (dar neįgyvendintas)

---

## A) INVENTORIUS - Visi dokumentai

### Root lygio dokumentai

| Failas | Paskirtis | Dubliacija? | Statusas | Pastaba |
|--------|-----------|-------------|----------|---------|
| `README.md` | Pagrindinė projekto dokumentacija, quick start | ❌ Ne | **KEEP** | Atnaujinti: trumpa įžanga + nuorodos į docs/ |
| `START.md` | Backend/frontend paleidimo komandos (senas) | ⚠️ Taip (su docs/audit/RUNBOOK_DEV.md) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/START.md` - pasenęs |
| `TESTING.md` | Manual testavimo scenarijai | ⚠️ Taip (su docs/STATUS.md) | **MERGE** | Sujungti į `docs/TESTING.md` (išlaikyti test scenarijus) |
| `TRUKSTA.md` | MVP kas trūksta (senas, MongoDB) | ⚠️ Taip (su docs/TODO.md) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/TRUKSTA.md` - pasenęs |
| `PROJEKTO_INFORMACIJA.md` | Išsami projekto info (senas, React+Vite) | ⚠️ Taip (su docs/PROJECT_MAP.md) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/PROJEKTO_INFORMACIJA.md` - pasenęs |
| `IMPLEMENTATION_COMPLETE.md` | Įgyvendinimo suvestinė (senas, React+Vite) | ⚠️ Taip (su docs/completed/) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/IMPLEMENTATION_COMPLETE.md` |
| `backend/ENV.md` | Backend env instrukcijos (senas) | ⚠️ Taip (su env.example) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/backend-ENV.md` |

### docs/ katalogas - Pagrindiniai dokumentai

| Failas | Paskirtis | Dubliacija? | Statusas | Pastaba |
|--------|-----------|-------------|----------|---------|
| `docs/README.md` | Docs index/žemėlapis | ❌ Ne | **RENAME → INDEX.md** | Perkelti į `docs/INDEX.md` |
| `docs/STATUS.md` | Realus statusas (DONE/PARTIAL/MISSING) | ⚠️ Taip (su completed/, FIX_ORDER*) | **MERGE → STATUS.md** | Sujungti su completed/ + FIX_ORDER* → vienas STATUS.md |
| `docs/PROJECT_MAP.md` | Tech stack, routes, schema | ❌ Ne | **RENAME → ARCHITECTURE.md** | Perkelti į `docs/ARCHITECTURE.md` |
| `docs/WORK_PLAN.md` | Aktualus darbų planas | ⚠️ Taip (su TODO.md) | **MERGE → TODO.md** | Sujungti į `docs/TODO.md` |
| `docs/REQUIREMENTS_STATUS.md` | Reikalavimų matrica | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md skyrių |
| `docs/DOCS_SUMMARY.md` | PDF santrauka (8 PDF aprašymai) | ❌ Ne | **KEEP** | Palikti kaip istorinė nuoroda į PDF šaltinius |
| `docs/FOLDERS_STRUCTURE.md` | Katalogų struktūra | ⚠️ Taip (su ARCHITECTURE.md) | **MERGE → ARCHITECTURE.md** | Sujungti į ARCHITECTURE.md |
| `docs/GDPR.md` | GDPR baseline | ❌ Ne | **KEEP** | Palikti kaip atskirą dokumentą |
| `docs/FINAL_WORK_REPORT.md` | Final work report | ⚠️ Taip (su completed/) | **MERGE → STATUS.md** | Sujungti į STATUS.md "Kas padaryta" |
| `docs/AUDIT_MEGA_REPORT.md` | Mega audit report | ⚠️ Taip (su audit/) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/` |
| `docs/AUDIT_REVIEW_DELTA.md` | Audit review delta | ⚠️ Taip (su audit/) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/` |

### docs/ - FIX_ORDER serija (P0 blokeriai)

| Failas | Paskirtis | Dubliacija? | Statusas | Pastaba |
|--------|-----------|-------------|----------|---------|
| `docs/FIX_ORDER_CHECKLIST.md` | P0 blokerių checklist | ⚠️ Taip (su TODO.md) | **MERGE → TODO.md** | Sujungti į TODO.md P0 skyrių |
| `docs/FIX_ORDER_PROGRESS.md` | P0 progress report | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |
| `docs/FIX_ORDER_SUMMARY.md` | P0 summary | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |
| `docs/FIX_ORDER_FINAL.md` | P0 final status | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |
| `docs/FIX_ORDER_COMPLETION_REPORT.md` | P0 completion | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |

### docs/ - P1 serija

| Failas | Paskirtis | Dubliacija? | Statusas | Pastaba |
|--------|-----------|-------------|----------|---------|
| `docs/P1_STATUS.md` | P1 užduočių sąrašas | ⚠️ Taip (su TODO.md) | **MERGE → TODO.md** | Sujungti į TODO.md P1 skyrių |
| `docs/P1_PROGRESS.md` | P1 progress | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |

### docs/pending/ - TODO serija

| Failas | Paskirtis | Dubliacija? | Statusas | Pastaba |
|--------|-----------|-------------|----------|---------|
| `docs/pending/TODO.md` | TODO sąrašas | ⚠️ Taip (su WORK_PLAN.md) | **MERGE → TODO.md** | Sujungti į `docs/TODO.md` |
| `docs/pending/TODO_DETAILED.md` | Detalus TODO | ⚠️ Taip (su TODO.md) | **MERGE → TODO.md** | Sujungti į `docs/TODO.md` |
| `docs/pending/MERGED_TODO.md` | Merged TODO | ⚠️ Taip (su TODO.md) | **MERGE → TODO.md** | Sujungti į `docs/TODO.md` |

### docs/completed/ - Atlikti darbai

| Failas | Paskirtis | Dubliacija? | Statusas | Pastaba |
|--------|-----------|-------------|----------|---------|
| `docs/completed/WORK_DONE.md` | Darbų chronologija | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md "Kas padaryta" |
| `docs/completed/WORK_SUMMARY.md` | Darbų santrauka | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |
| `docs/completed/ALL_STATUS_REPORTS.md` | Visi status reports | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |
| `docs/completed/ALL_WORK_REPORTS.md` | Visi work reports | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |
| `docs/completed/P0_STATUS_REPORT.md` | P0 status | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |
| `docs/completed/P1_STATUS_REPORT.md` | P1 status | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |
| `docs/completed/WORK_SESSION_REPORT.md` | Session report | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md |

### docs/audit/ - Audit dokumentai

| Failas | Paskirtis | Dubliacija? | Statusas | Pastaba |
|--------|-----------|-------------|----------|---------|
| `docs/audit/AUDIT_CONTEXT.md` | Git/versions faktai | ❌ Ne | **KEEP** | Palikti kaip audit įrodymą |
| `docs/audit/ISSUES_LOG.md` | Issue log su DEV_PROOF | ❌ Ne | **KEEP** | Palikti kaip audit įrodymą |
| `docs/audit/RUNBOOK_DEV.md` | Kanoninis dev runbook | ❌ Ne | **KEEP** | Palikti (naudojamas) |
| `docs/audit/ORG_SCOPING_AUDIT.md` | Org scoping audit | ❌ Ne | **KEEP** | Palikti kaip audit įrodymą |
| `docs/audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md` | Rate limit audit | ⚠️ Taip (su STATUS.md) | **MERGE → STATUS.md** | Sujungti į STATUS.md skyrių |

### docs/infra/ - Infrastruktūra

| Failas | Paskirtis | Dubliacija? | Statusas | Pastaba |
|--------|-----------|-------------|----------|---------|
| `docs/infra/DEPLOY.md` | Deploy instrukcijos | ❌ Ne | **KEEP** | Palikti |
| `docs/infra/BACKUP_RESTORE.md` | Backup/restore | ❌ Ne | **KEEP** | Palikti |

### docs/plans/ - Planai (archyvas)

| Failas | Paskirtis | Dubliacija? | Statusas | Pastaba |
|--------|-----------|-------------|----------|---------|
| `docs/plans/MASTER_BACKLOG.md` | Master backlog | ⚠️ Taip (su TODO.md) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/plans/` |
| `docs/plans/MASTER_EXECUTION_PLAN.md` | Execution plan | ⚠️ Taip (su TODO.md) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/plans/` |
| `docs/plans/PLAN_MVP.md` | MVP planas | ⚠️ Taip (su TODO.md) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/plans/` |
| `docs/plans/RETHINK_NOTES.md` | Rethink notes | ⚠️ Taip (su TODO.md) | **ARCHIVE** | Perkelti į `docs/archive/2026-01/plans/` |

### docs/archive/ - Jau archyvuoti

| Failas | Paskirtis | Statusas | Pastaba |
|--------|-----------|----------|---------|
| `docs/archive/GAP_ANALYSIS_20260112_ARCHIVED.md` | Archyvuotas GAP_ANALYSIS | **KEEP** | Jau archyvuotas |
| `docs/archive/GAP_ANALYSIS_ARCHIVE_NOTE.md` | Archive note | **KEEP** | Jau archyvuotas |
| `docs/archive/old-setup/*` | Seni setup failai (8 *.md) | **KEEP** | Jau archyvuoti |
| `docs/archive/*.txt` | Pokalbių transkriptai (9 *.txt) | **KEEP** | Istoriniai dokumentai, palikti |
| `docs/archive/completed/` | Tuščias katalogas | **KEEP** | Palikti struktūrai |
| `docs/archive/pending/` | Tuščias katalogas | **KEEP** | Palikti struktūrai |
| `docs/sources/pdfs/*.pdf` | PDF šaltiniai (8 *.pdf) | **KEEP** | Šaltiniai, palikti |
| `docs/pdf_text/` | Tuščias katalogas (PDF tekstų ištraukimui) | **KEEP** | Palikti struktūrai |
| `docs/setup/` | Tuščias katalogas (deprecated) | **KEEP** | Palikti struktūrai |

### logs/ - Log failai (ne dokumentacija)

| Failas | Paskirtis | Statusas | Pastaba |
|--------|-----------|----------|---------|
| `logs/**/*.txt` | Runtime log'ai | **KEEP** | Ne dokumentacija, palikti |

---

## B) NAUJA TVARKINGA STRUKTŪRA

### Rekomenduojama struktūra:

```
reflectus-app/
├── README.md                    # Trumpa įžanga + nuorodos
│
├── docs/
│   ├── INDEX.md                 # Vienas žemėlapis į visus docs (iš docs/README.md)
│   │
│   ├── SETUP.md                 # Kaip paleisti lokal, env, komandos (iš docs/audit/RUNBOOK_DEV.md)
│   ├── ARCHITECTURE.md          # Kaip sudėtas projektas, moduliai (iš docs/PROJECT_MAP.md + FOLDERS_STRUCTURE.md)
│   ├── TESTING.md               # Testavimo scenarijai (iš root TESTING.md)
│   │
│   ├── STATUS.md                # VIENAS failas: atlikta + daroma + blokatoriai
│   ├── TODO.md                  # VIENAS failas: backlog su prioritetais
│   │
│   ├── GDPR.md                  # GDPR baseline (jau yra, palikti)
│   ├── DECISIONS.md             # Sprendimai/kompromisai (naujas, iš ISSUES_LOG.md sprendimų)
│   │
│   ├── audit/                   # Audit įrodymai (palikti kaip yra)
│   │   ├── AUDIT_CONTEXT.md
│   │   ├── ISSUES_LOG.md
│   │   ├── RUNBOOK_DEV.md       # → Perkelti į docs/SETUP.md, palikti nuorodą
│   │   ├── ORG_SCOPING_AUDIT.md
│   │   └── RATE_LIMIT_AUDIT_LOG_COVERAGE.md
│   │
│   ├── infra/                   # Infrastruktūra (palikti kaip yra)
│   │   ├── DEPLOY.md
│   │   └── BACKUP_RESTORE.md
│   │
│   └── archive/                 # Archyvas (reorganizuoti)
│       ├── 2026-01/             # 2026-01 mėnesio archyvas
│       │   ├── old-setup/       # (jau yra)
│       │   ├── plans/           # (iš docs/plans/)
│       │   ├── START.md         # (iš root)
│       │   ├── TRUKSTA.md       # (iš root)
│       │   ├── PROJEKTO_INFORMACIJA.md
│       │   ├── IMPLEMENTATION_COMPLETE.md
│       │   ├── backend-ENV.md
│       │   ├── AUDIT_MEGA_REPORT.md
│       │   └── AUDIT_REVIEW_DELTA.md
│       │
│       ├── sources/              # PDF šaltiniai (palikti kaip yra)
│       └── GAP_ANALYSIS_*.md    # (jau archyvuoti)
```

---

## C) SUJUNGIMO LOGIKA

### docs/STATUS.md struktūra (sujungti iš):

**Šaltiniai:**
- `docs/STATUS.md` (dabartinis)
- `docs/REQUIREMENTS_STATUS.md` (matrica)
- `docs/completed/WORK_DONE.md` (chronologija)
- `docs/completed/WORK_SUMMARY.md` (santrauka)
- `docs/completed/ALL_STATUS_REPORTS.md` (visi reports)
- `docs/completed/P0_STATUS_REPORT.md` (P0)
- `docs/completed/P1_STATUS_REPORT.md` (P1)
- `docs/FIX_ORDER_PROGRESS.md` (P0 progress)
- `docs/FIX_ORDER_SUMMARY.md` (P0 summary)
- `docs/FIX_ORDER_FINAL.md` (P0 final)
- `docs/FIX_ORDER_COMPLETION_REPORT.md` (P0 completion)
- `docs/P1_PROGRESS.md` (P1 progress)
- `docs/FINAL_WORK_REPORT.md` (final report)
- `docs/audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md` (audit info)

**Nauja struktūra:**

```markdown
# STATUS - Projekto Būsena

**Atnaujinta:** [data]
**Versija:** [versija]

## 📊 Bendra Statistika
- P0 blokeriai: X/Y ✅
- P1 užduotys: X/Y ✅
- P2 užduotys: X/Y ✅

## ✅ Kas Padaryta

### P0 Blokeriai (Production Ready)
[Iš FIX_ORDER serijos + completed/P0_STATUS_REPORT.md]

### P1 Funkcionalumai
[Iš P1_PROGRESS.md + completed/P1_STATUS_REPORT.md]

### Pagrindinės Funkcijos
[Iš STATUS.md "Veikia" + REQUIREMENTS_STATUS.md "DONE"]

### Infrastruktūra
[Iš FINAL_WORK_REPORT.md + audit info]

## 🔄 Kas Daroma Dabar

[Iš STATUS.md "Dalinai" + WORK_PLAN.md "P0/P1"]

## ⚠️ Blokatoriai

[Iš STATUS.md + FIX_ORDER_CHECKLIST.md blokeriai]

## 🐛 Kritinės Skylės

[Iš ISSUES_LOG.md + STATUS.md "Nėra kritinių lūžių"]

## 🎯 Kitas Žingsnis

[Iš STATUS.md "Artimiausi prioritetai" + WORK_PLAN.md]
```

### docs/TODO.md struktūra (sujungti iš):

**Šaltiniai:**
- `docs/pending/TODO.md`
- `docs/pending/TODO_DETAILED.md`
- `docs/pending/MERGED_TODO.md`
- `docs/WORK_PLAN.md` (aktualus planas)
- `docs/FIX_ORDER_CHECKLIST.md` (P0 blokeriai)
- `docs/P1_STATUS.md` (P1 užduotys)
- `docs/plans/MASTER_BACKLOG.md` (backlog)

**Nauja struktūra:**

```markdown
# TODO - Ką Reikia Padaryti

**Atnaujinta:** [data]

## P0 - Kritiniai (Blokeriai)

### P0-1: [Pavadinimas]
- **Kas:** [aprašymas]
- **Kodėl:** [priežastis]
- **Priėmimo kriterijai:** [Done definition]
- **Kur:** [failai/moduliai]
- **Statusas:** [pending/in_progress/done]

[Iš FIX_ORDER_CHECKLIST.md + TODO_DETAILED.md]

## P1 - Svarbu (Ne Blokeriai)

[Iš P1_STATUS.md + WORK_PLAN.md P1]

## P2 - Gali Palaukti

[Iš WORK_PLAN.md P2 + plans/MASTER_BACKLOG.md]

## Pastabos

[Iš MERGED_TODO.md pastabos]
```

---

## D) NUORODOS IR NUOSEKLUMAS

### Pavadinimų standartas

**Rekomendacija:** **Normalus stilius** (ne UPPERCASE)
- `docs/Index.md` → `docs/INDEX.md` (vienintelė išimtis - žemėlapis)
- `docs/Setup.md`
- `docs/Architecture.md`
- `docs/Status.md`
- `docs/Todo.md`
- `docs/Testing.md`
- `docs/Decisions.md`

**Arba:** Visi didžiosiomis (konsistentiškai):
- `docs/INDEX.md`
- `docs/SETUP.md`
- `docs/ARCHITECTURE.md`
- `docs/STATUS.md`
- `docs/TODO.md`
- `docs/TESTING.md`
- `docs/DECISIONS.md`

**Rekomendacija:** **Didžiosios raidės** (aiškiau, atskiria nuo kodo failų)

### Vidinių nuorodų atnaujinimas

**Strategija:**
1. Sukurti `docs/REFACTORING_LOG.md` su visais perkėlimais
2. Naudoti git grep rasti visus nuorodas: `grep -r "docs/STATUS.md" .`
3. Atnaujinti nuorodas po perkėlimų:
   - `docs/STATUS.md` → `docs/STATUS.md` (toks pat)
   - `docs/completed/WORK_DONE.md` → `docs/STATUS.md#kas-padaryta`
   - `docs/pending/TODO.md` → `docs/TODO.md`
   - `docs/FIX_ORDER_CHECKLIST.md` → `docs/TODO.md#p0`

**Automatinis atnaujinimas:**
- Naudoti `sed` arba `find + replace` script'ą
- Patikrinti rankiniu būdu kritinius failus (README.md, INDEX.md)

---

## E) GALUTINIS REZULTATAS

### Naujos struktūros tree

```
reflectus-app/
├── README.md                          # Atnaujintas: trumpa įžanga + nuorodos
│
├── docs/
│   ├── INDEX.md                       # Žemėlapis (iš docs/README.md)
│   │
│   ├── SETUP.md                       # Dev runbook (iš docs/audit/RUNBOOK_DEV.md)
│   ├── ARCHITECTURE.md                # Projektas, moduliai (sujungti PROJECT_MAP + FOLDERS_STRUCTURE)
│   ├── TESTING.md                     # Test scenarijai (iš root TESTING.md)
│   │
│   ├── STATUS.md                      # VIENAS: atlikta + daroma + blokatoriai (sujungti 13+ failų)
│   ├── TODO.md                        # VIENAS: backlog (sujungti 6+ failų)
│   │
│   ├── GDPR.md                        # (jau yra, palikti)
│   ├── DECISIONS.md                   # Sprendimai (naujas, iš ISSUES_LOG.md)
│   │
│   ├── audit/                         # Audit įrodymai
│   │   ├── AUDIT_CONTEXT.md
│   │   ├── ISSUES_LOG.md
│   │   ├── ORG_SCOPING_AUDIT.md
│   │   └── RATE_LIMIT_AUDIT_LOG_COVERAGE.md
│   │
│   ├── infra/                         # Infrastruktūra
│   │   ├── DEPLOY.md
│   │   └── BACKUP_RESTORE.md
│   │
│   └── archive/                       # Archyvas
│       ├── 2026-01/                   # 2026-01 mėnesio archyvas
│       │   ├── old-setup/
│       │   ├── plans/
│       │   ├── START.md
│       │   ├── TRUKSTA.md
│       │   ├── PROJEKTO_INFORMACIJA.md
│       │   ├── IMPLEMENTATION_COMPLETE.md
│       │   ├── backend-ENV.md
│       │   ├── AUDIT_MEGA_REPORT.md
│       │   ├── AUDIT_REVIEW_DELTA.md
│       │   ├── FIX_ORDER_*.md         # (5 failai)
│       │   └── completed/             # (7 failų)
│       │
│       ├── sources/                   # PDF šaltiniai
│       └── GAP_ANALYSIS_*.md
```

### Failų perkelimų/pervadinimų sąrašas

| Senas kelias | Naujas kelias | Tipas |
|--------------|--------------|-------|
| `docs/README.md` | `docs/INDEX.md` | RENAME |
| `docs/PROJECT_MAP.md` | `docs/ARCHITECTURE.md` | RENAME |
| `docs/FOLDERS_STRUCTURE.md` | `docs/ARCHITECTURE.md` | MERGE |
| `docs/audit/RUNBOOK_DEV.md` | `docs/SETUP.md` | MOVE + RENAME |
| `TESTING.md` (root) | `docs/TESTING.md` | MOVE |
| `docs/STATUS.md` | `docs/STATUS.md` | MERGE (sujungti su 13+ failų) |
| `docs/pending/TODO.md` | `docs/TODO.md` | MERGE (sujungti su 6+ failų) |
| `docs/pending/TODO_DETAILED.md` | `docs/TODO.md` | MERGE |
| `docs/pending/MERGED_TODO.md` | `docs/TODO.md` | MERGE |
| `docs/WORK_PLAN.md` | `docs/TODO.md` | MERGE |
| `docs/FIX_ORDER_CHECKLIST.md` | `docs/TODO.md` | MERGE |
| `docs/P1_STATUS.md` | `docs/TODO.md` | MERGE |
| `docs/completed/WORK_DONE.md` | `docs/STATUS.md` | MERGE |
| `docs/completed/WORK_SUMMARY.md` | `docs/STATUS.md` | MERGE |
| `docs/completed/ALL_STATUS_REPORTS.md` | `docs/STATUS.md` | MERGE |
| `docs/completed/P0_STATUS_REPORT.md` | `docs/STATUS.md` | MERGE |
| `docs/completed/P1_STATUS_REPORT.md` | `docs/STATUS.md` | MERGE |
| `docs/completed/WORK_SESSION_REPORT.md` | `docs/STATUS.md` | MERGE |
| `docs/FIX_ORDER_PROGRESS.md` | `docs/STATUS.md` | MERGE |
| `docs/FIX_ORDER_SUMMARY.md` | `docs/STATUS.md` | MERGE |
| `docs/FIX_ORDER_FINAL.md` | `docs/STATUS.md` | MERGE |
| `docs/FIX_ORDER_COMPLETION_REPORT.md` | `docs/STATUS.md` | MERGE |
| `docs/P1_PROGRESS.md` | `docs/STATUS.md` | MERGE |
| `docs/FINAL_WORK_REPORT.md` | `docs/STATUS.md` | MERGE |
| `docs/REQUIREMENTS_STATUS.md` | `docs/STATUS.md` | MERGE |
| `docs/audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md` | `docs/STATUS.md` | MERGE |
| `START.md` (root) | `docs/archive/2026-01/START.md` | ARCHIVE |
| `TRUKSTA.md` (root) | `docs/archive/2026-01/TRUKSTA.md` | ARCHIVE |
| `PROJEKTO_INFORMACIJA.md` (root) | `docs/archive/2026-01/PROJEKTO_INFORMACIJA.md` | ARCHIVE |
| `IMPLEMENTATION_COMPLETE.md` (root) | `docs/archive/2026-01/IMPLEMENTATION_COMPLETE.md` | ARCHIVE |
| `backend/ENV.md` | `docs/archive/2026-01/backend-ENV.md` | ARCHIVE |
| `docs/AUDIT_MEGA_REPORT.md` | `docs/archive/2026-01/AUDIT_MEGA_REPORT.md` | ARCHIVE |
| `docs/AUDIT_REVIEW_DELTA.md` | `docs/archive/2026-01/AUDIT_REVIEW_DELTA.md` | ARCHIVE |
| `docs/plans/*.md` | `docs/archive/2026-01/plans/*.md` | ARCHIVE |

### Sujungimo šaltiniai

**docs/STATUS.md sujungti iš (13+ failų):**
1. `docs/STATUS.md` (dabartinis)
2. `docs/REQUIREMENTS_STATUS.md`
3. `docs/completed/WORK_DONE.md`
4. `docs/completed/WORK_SUMMARY.md`
5. `docs/completed/ALL_STATUS_REPORTS.md`
6. `docs/completed/P0_STATUS_REPORT.md`
7. `docs/completed/P1_STATUS_REPORT.md`
8. `docs/completed/WORK_SESSION_REPORT.md`
9. `docs/FIX_ORDER_PROGRESS.md`
10. `docs/FIX_ORDER_SUMMARY.md`
11. `docs/FIX_ORDER_FINAL.md`
12. `docs/FIX_ORDER_COMPLETION_REPORT.md`
13. `docs/P1_PROGRESS.md`
14. `docs/FINAL_WORK_REPORT.md`
15. `docs/audit/RATE_LIMIT_AUDIT_LOG_COVERAGE.md`

**docs/TODO.md sujungti iš (6+ failų):**
1. `docs/pending/TODO.md`
2. `docs/pending/TODO_DETAILED.md`
3. `docs/pending/MERGED_TODO.md`
4. `docs/WORK_PLAN.md`
5. `docs/FIX_ORDER_CHECKLIST.md`
6. `docs/P1_STATUS.md`
7. `docs/plans/MASTER_BACKLOG.md` (backlog dalis)

### Rizikos ir atsargumas

**Ko negalima sujungti aklai:**

1. **ISSUES_LOG.md** - NE sujungti į STATUS.md
   - **Priežastis:** Tai yra techninis audit log'as, ne statusas
   - **Sprendimas:** Palikti kaip atskirą audit dokumentą

2. **AUDIT_CONTEXT.md** - NE sujungti
   - **Priežastis:** Runtime faktai (git, versions), ne statusas
   - **Sprendimas:** Palikti kaip audit įrodymą

3. **ORG_SCOPING_AUDIT.md** - NE sujungti
   - **Priežastis:** Specifinis audit, ne bendras statusas
   - **Sprendimas:** Palikti kaip audit įrodymą

4. **GDPR.md** - NE sujungti
   - **Priežastis:** Atskiras compliance dokumentas
   - **Sprendimas:** Palikti kaip atskirą dokumentą

5. **DEPLOY.md, BACKUP_RESTORE.md** - NE sujungti
   - **Priežastis:** Operacinės instrukcijos, ne statusas
   - **Sprendimas:** Palikti kaip atskirus infra dokumentus

**Kur reikia atsargumo:**

1. **REQUIREMENTS_STATUS.md → STATUS.md**
   - **Rizika:** Matrica gali būti per detali
   - **Sprendimas:** Sujungti tik "DONE" dalį, "PARTIAL/MISSING" → TODO.md

2. **FIX_ORDER_CHECKLIST.md → TODO.md**
   - **Rizika:** Checklist formatas skiriasi nuo TODO formato
   - **Sprendimas:** Konvertuoti į TODO formatą (Kas/Kodėl/Priėmimo kriterijai)

3. **WORK_DONE.md → STATUS.md**
   - **Rizika:** Chronologija gali būti per ilga
   - **Sprendimas:** Sujungti tik svarbiausius punktus, detali chronologija → archive

4. **PDF šaltiniai (docs/sources/pdfs/)**
   - **Rizika:** PDF failai negali būti sujungti
   - **Sprendimas:** Palikti kaip šaltinius, nuoroda į DOCS_SUMMARY.md

---

## F) ĮGYVENDINIMO PLANAS

### Etapas 1: Archyvas (saugus)
1. Sukurti `docs/archive/2026-01/` katalogą
2. Perkelti senus root failus
3. Perkelti `docs/plans/` → `docs/archive/2026-01/plans/`
4. Perkelti mega reports

### Etapas 2: RENAME ir MOVE (paprasti)
1. `docs/README.md` → `docs/INDEX.md`
2. `docs/PROJECT_MAP.md` → `docs/ARCHITECTURE.md`
3. `TESTING.md` → `docs/TESTING.md`
4. `docs/audit/RUNBOOK_DEV.md` → `docs/SETUP.md`

### Etapas 3: MERGE (atsargiai)
1. Sujungti `docs/FOLDERS_STRUCTURE.md` → `docs/ARCHITECTURE.md`
2. Sujungti visus completed/ → `docs/STATUS.md`
3. Sujungti visus pending/ + FIX_ORDER* + P1* → `docs/TODO.md`

### Etapas 4: Atnaujinti nuorodas
1. Atnaujinti `README.md` nuorodas
2. Atnaujinti `docs/INDEX.md` nuorodas
3. Patikrinti vidines nuorodas

### Etapas 5: Sukurti DECISIONS.md
1. Ištraukti sprendimus iš `ISSUES_LOG.md`
2. Sukurti `docs/DECISIONS.md`

---

## G) GALUTINIS REZULTATAS

### Nauja struktūra (tree)

```
reflectus-app/
├── README.md                    # Atnaujintas
│
├── docs/
│   ├── INDEX.md                 # Žemėlapis
│   ├── SETUP.md                 # Dev runbook
│   ├── ARCHITECTURE.md          # Projektas, moduliai
│   ├── TESTING.md               # Test scenarijai
│   ├── STATUS.md                # VIENAS: atlikta + daroma
│   ├── TODO.md                  # VIENAS: backlog
│   ├── GDPR.md                  # GDPR
│   ├── DECISIONS.md             # Sprendimai
│   │
│   ├── audit/                   # Audit (palikti)
│   ├── infra/                   # Infra (palikti)
│   └── archive/                 # Archyvas
│       └── 2026-01/             # 2026-01 archyvas
```

### Statistika

- **Dokumentų prieš:** ~50+ failų
- **Dokumentų po:** ~15 failų (docs/ root)
- **Sujungta:** 20+ failų → 2 failai (STATUS.md, TODO.md)
- **Archyvuota:** ~25 failų

---

## H) STATISTIKA IR SANTRAUKA

### Dokumentų skaičius

| Kategorija | Skaičius | Veiksmas |
|------------|----------|----------|
| **Root dokumentai** | 7 | 6 → ARCHIVE, 1 → KEEP (README.md) |
| **docs/ pagrindiniai** | 12 | 2 → RENAME, 8 → MERGE, 2 → ARCHIVE |
| **FIX_ORDER serija** | 5 | 5 → MERGE (STATUS.md + TODO.md) |
| **P1 serija** | 2 | 2 → MERGE (STATUS.md + TODO.md) |
| **pending/ TODO** | 3 | 3 → MERGE (TODO.md) |
| **completed/** | 7 | 7 → MERGE (STATUS.md) |
| **audit/** | 5 | 4 → KEEP, 1 → MERGE (STATUS.md) |
| **infra/** | 2 | 2 → KEEP |
| **plans/** | 4 | 4 → ARCHIVE |
| **archive/ (jau archyvuoti)** | ~20 | KEEP (istoriniai) |
| **PDF šaltiniai** | 8 | KEEP |
| **.txt transkriptai** | 9 | KEEP |
| **Tuščiai katalogai** | 3 | KEEP (struktūrai) |

### Veiksmų skaičius

- **KEEP:** ~20 failų (audit, infra, archive, PDF, .txt)
- **RENAME:** 2 failai (README.md → INDEX.md, PROJECT_MAP.md → ARCHITECTURE.md)
- **MOVE:** 2 failai (TESTING.md → docs/TESTING.md, RUNBOOK_DEV.md → docs/SETUP.md)
- **MERGE:** 20+ failų → 2 failai (STATUS.md, TODO.md)
- **ARCHIVE:** ~15 failų → docs/archive/2026-01/

### Rezultatas

- **Prieš:** ~64 dokumentacijos failai (root + docs/)
- **Po:** ~15 dokumentacijos failai (docs/ root)
- **Sumažinta:** ~75% dokumentų (sujungta + archyvuota)
- **Struktūra:** Aiški, vieninga, be dubliavimo

---

## I) KITAS ŽINGSNIS

Kai planas patvirtintas:
1. Sukurti `docs/REFACTORING_LOG.md` su visais pakeitimais
2. Pradėti nuo Etapo 1 (archyvas - saugus)
3. Po kiekvieno etapo - commit + test
4. Atnaujinti nuorodas paskutiniame etape

---

**Statusas:** ✅ PLANAS PARUOŠTAS (laukia patvirtinimo)

**Pastaba:** Šis planas yra **tik analizė ir pasiūlymas**. Jokių failų nebuvo keista, pervadinta ar perkelta. Visi veiksmai laukia patvirtinimo.
