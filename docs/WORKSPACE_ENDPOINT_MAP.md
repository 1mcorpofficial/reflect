# Workspace Endpoint Mapping

Šis dokumentas aprašo visus API endpoint'us, kurie turi būti pritaikyti prie workspace-aware architektūros.

## Endpoint'ų Inventorizacija

### Auth Endpoints
- ✅ `/api/auth/register` - **UPDATED**: Dabar kuria Personal Workspace
- ✅ `/api/auth/login` - **UPDATED**: Naudoja Workspace context
- ✅ `/api/auth/me` - **UPDATED**: Grąžina workspace info

### Groups Endpoints
- ✅ `POST /api/groups` - **UPDATED**: Naudoja workspace_id ir role check
- ✅ `GET /api/groups` - **UPDATED**: Filtruoja pagal workspace_id (legacy org fallback)
- ✅ `GET /api/groups/[groupId]/activities` - **UPDATED**: Validuoja workspace priklausomybe
- ✅ `GET /api/groups/[groupId]/participants` - **UPDATED**: Validuoja workspace priklausomybe
- ✅ `POST /api/groups/[groupId]/participants/import` - **UPDATED**: Validuoja workspace priklausomybe

### Activities Endpoints
- ✅ `POST /api/activities` - **UPDATED**: Naudoja workspace_id is group ir role check
- ✅ `GET /api/activities/[activityId]/analytics` - **UPDATED**: Validuoja workspace priklausomybe
- ✅ `GET /api/activities/[activityId]/responses` - **UPDATED**: Validuoja workspace priklausomybe
- ✅ `POST /api/activities/[activityId]/responses` - **UPDATED**: Participant scope + workspaceId nustatymas
- ✅ `PATCH /api/activities/[activityId]/status` - **UPDATED**: Validuoja workspace priklausomybe
- ✅ `GET /api/activities/[activityId]/export` - **UPDATED**: Validuoja workspace priklausomybe

### Participants Endpoints
- ✅ `GET /api/participants/activities` - **UPDATED**: Participant scope per groupId session
- ✅ `GET /api/participants/history` - **UPDATED**: Participant scope per participantId session
- ✅ `POST /api/participants/login` - **UPDATED**: Participant scope per group membership

### Organizations Endpoints
- ⚠️ `POST /api/orgs` - **NEEDS UPDATE**: Turi kurti Organization Workspace
- ⚠️ `GET /api/orgs` - **NEEDS UPDATE**: Turi grąžinti user workspaces

### Workspace Settings
- ✅ `PATCH /api/workspaces/[workspaceId]` - **UPDATED**: ORG_ADMIN/OWNER workspace name update

### Admin Endpoints
- ⚠️ `GET /api/admin/users` - **NEEDS UPDATE**: Turi filtruoti pagal workspace (jei ne super-admin)
- ⚠️ `GET /api/admin/orgs` - **NEEDS UPDATE**: Turi grąžinti visus workspaces
- ⚠️ `GET /api/admin/audit` - **NEEDS UPDATE**: Turi filtruoti pagal workspace_id
- ⚠️ `GET /api/admin/gdpr/export/[userId]` - **NEEDS UPDATE**: Turi patikrinti workspace membership
- ⚠️ `POST /api/admin/gdpr/delete/[userId]` - **NEEDS UPDATE**: Turi patikrinti workspace membership
- ⚠️ `POST /api/admin/users/[userId]/anonymize` - **NEEDS UPDATE**: Turi patikrinti workspace membership
- ⚠️ `GET /api/admin/users/[userId]/export` - **NEEDS UPDATE**: Turi patikrinti workspace membership

## Scoping Strategijos

### 1. Groups
**Dabartinis**: Filtruojama pagal `orgId` iš session  
**Naujas**: Filtruojama pagal `workspaceId` iš tenancy context

**Pakeitimai**:
- `GET /api/groups`: Pridėti `where: { workspaceId: context.workspaceId }`
- `POST /api/groups`: Nustatyti `workspaceId: context.workspaceId` automatiškai

### 2. Activities
**Dabartinis**: Patikrinama per `group.orgId`  
**Naujas**: Patikrinama per `group.workspaceId` arba `activity.workspaceId`

**Pakeitimai**:
- Visi activity endpoint'ai turi patikrinti, kad activity priklauso workspace
- Naudoti `validateResourceWorkspace()` helper

### 3. Responses
**Dabartinis**: Patikrinama per `activity.group.orgId`  
**Naujas**: Patikrinama per `response.workspaceId` arba `activity.workspaceId`

**Pakeitimai**:
- Visi response endpoint'ai turi patikrinti workspace membership
- Automatiškai nustatyti `workspaceId` kuriant response

### 4. Analytics
**Dabartinis**: Filtruojama pagal `orgId`  
**Naujas**: Filtruojama pagal `workspaceId`

**Pakeitimai**:
- Visi analytics query turi filtruoti pagal workspace
- Audit logs turi turėti `workspaceId`

## Rizikingi Endpoint'ai

### Global Listai (be filtro)
- ⚠️ `GET /api/admin/users` - Grąžina visus users (turi filtruoti pagal workspace)
- ⚠️ `GET /api/admin/orgs` - Grąžina visus orgs (turi filtruoti pagal user membership)

### Cross-Tenant Access Rizika
- ⚠️ Visi endpoint'ai, kurie naudoja ID parametrus, turi patikrinti workspace membership
- Pvz.: `GET /api/groups/[groupId]` - net jei žinomas groupId, turi patikrinti workspace

## Implementacijos Planas

### Faza 1: Core Endpoints (PH4)
1. Groups endpoints (create/list)
2. Activities endpoints (create/list/update)
3. Responses endpoints (create/list)

### Faza 2: Admin Endpoints
1. Workspace management endpoints
2. User management (workspace-scoped)
3. Audit logs (workspace-scoped)

### Faza 3: Analytics & Exports
1. Analytics endpoints (workspace-scoped)
2. Export endpoints (workspace-scoped)

## Testavimo Strategija

Kiekvienam endpoint'ui reikia testuoti:
1. ✅ Teisingas workspace - turi veikti
2. ❌ Neteisingas workspace - turi grąžinti 404 (ne 403)
3. ❌ Neegzistuojantis ID - turi grąžinti 404
4. ❌ User be membership - turi grąžinti 403
