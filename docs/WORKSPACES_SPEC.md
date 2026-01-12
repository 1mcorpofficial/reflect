# Workspace (Multi-Tenant) Architektūros Specifikacija

## Versija
1.0 - 2025-01-XX

## Apžvalga
Šis dokumentas aprašo SaaS multi-tenant architektūros įdiegimą Reflectus projekte. Sistema palaiko Workspace modelį, kuris leidžia vartotojams priklausyti keliems workspace (Personal ir Organization).

## Pagrindinės Sprendimų Taisyklės

### D1: Personal Workspace Default
- Kiekvienas vartotojas po registracijos automatiškai gauna Personal Workspace
- Personal Workspace turi OWNER rolę
- Vienas vartotojas turi tik vieną Personal Workspace (pagal taisyklę)

### D2: Organization Workspace Creation
- Organization Workspace sukuriamas tik per:
  - Pirkimą (billing integracija)
  - Platformos super-admin veiksmą
- Pirkimo metu: admin email → workspace → invite/magic link → admin aktyvuoja

### D3: Multi-Workspace Membership
- Vienas vartotojas gali priklausyti keliems workspace
- Pvz.: mokytojas mokykloje + savo asmeninis + šeimos grupė

## Tenant Modelis

### Workspace Tipai
1. **organization**: Mokykla/įmonė/psichologų kabinetas
   - Rolės: ORG_ADMIN, STAFF, PARTICIPANT
2. **personal**: Asmeninis arba mažos grupės (šeima/draugai)
   - Rolės: OWNER, MEMBER

### Duomenų Atskyrimo Taisyklė
**Absoliutus duomenų atskyrimas pagal workspace_id:**
- Jokie objektai (grupės, refleksijos, atsakymai, ataskaitos, kvietimai) negali būti pasiekiami iš kito workspace
- Visos DB užklausos turi būti apribotos workspace_id (arba per join su membership)
- Jokių global query be tenant filtro

## RBAC Matrica

| Rolė | Gali | Negali |
|------|------|--------|
| **ORG_ADMIN** | manage_workspace_settings, invite_staff, assign_roles, create_groups, view_workspace_analytics | access_other_workspaces |
| **STAFF** | create_groups, invite_participants, view_group_analytics_where_member, create_reflections | change_workspace_billing, assign_org_admin |
| **PARTICIPANT** | join_groups_where_invited, fill_reflections, view_own_history | invite_users, view_other_users_private_data |
| **OWNER** | manage_personal_workspace, create_groups, invite_members, kick_members, view_group_summaries | enterprise_features_unless_enabled |
| **MEMBER** | fill_reflections, view_own_history, participate_in_invited_groups | manage_workspace |

## Workspace Selection Mechanizmas

### Principas
Kiekvienas request turi aiškiai žinoti aktyvų workspace.

### Mechanizmai
1. JWT claim: `active_workspace_id` + server-side validation membership
2. Header: `X-Workspace-Id` (su server-side membership check)
3. Session storage: `activeWorkspaceId` (su server-side check)
4. URL param: `/w/:workspaceId/...` (su server-side check)

### Privaloma Taisyklė
Net jei UI/klientas atsiunčia workspaceId, serveris privalo patikrinti, kad user yra ACTIVE narys.

## Tenant Isolation Enforcement

### Backend Middleware
Centralizuotas middleware/guard:
```
resolveWorkspace(user, inputWorkspaceId) 
  → validate membership 
  → attach req.workspace and req.membershipRole 
  → all controllers use it
```

### DB Query Pattern
- Visada įtraukti workspace_id filtrą
- Jei join pagal group/reflection id, taip pat join/validate workspace_id match
- Teikti pirmenybę repository/service sluoksniui vietoj ad-hoc queries

## Saugumo Reikalavimai

1. Invite token saugomas kaip hash, ne plain-text DB
2. Invite token turi expiry ir vienkartinį panaudojimą
3. Visi admin veiksmai reikalauja server-side role check
4. Rate limit login ir invite acceptance
5. Audit log svarbiems veiksmams su workspace_id
6. 404 vietoj 403 kai taikinys neegzistuoja arba nepriklauso tenant'ui
7. Nėra global admin endpoint'ų be super-admin apsaugos

## Migracijos Strategija

### Backward Compatibility
- Jei dabar yra schoolId/classId logika, ji turi būti map'inama į workspace/group
- Iki kol baigtas backfill, API neturi crash'inti dėl null workspace_id
- Visi nauji įrašai nuo PH2 privalo turėti workspace_id

### Data Backfill
- Visi esami įrašai privalo gauti workspace_id
- Jei sistema buvo viena organizacija → sukurti vieną default organization workspace
- Jei buvo keli 'school' objektai → map'inti kiekvieną į atskirą organization workspace

### Constraint Hardening
- Tik po sėkmingo backfill: workspace_id nustatyti NOT NULL kritinėse lentelėse
- Uždėti indeksus ant workspace_id stulpelių
- Uždėti foreign keys su ON DELETE RESTRICT

## Acceptance Criteria

✅ Kiekvienas user turi Personal Workspace po registracijos  
✅ Organization sukūrimas per super-admin su admin email sukuria invite  
✅ Vienas user gali turėti kelis workspace; UI gali perjungti  
✅ Nėra nė vieno endpoint'o, kuris grąžintų kito workspace duomenis  
✅ Migracijos veikia: fresh install ir upgrade iš esamos DB būsenos  
✅ Testai įrodo tenant isolation ir invite saugumą  
✅ Nėra regresijų: esami srautai veikia arba turi aiškiai pažymėtą migracinį fallback
