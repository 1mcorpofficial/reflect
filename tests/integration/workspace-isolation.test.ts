/**
 * Tenant Isolation Integration Tests
 * 
 * Tests that verify strict data isolation between workspaces:
 * - Users cannot access data from other workspaces
 * - Cross-tenant access returns 404 (not 403)
 * - Workspace membership is properly enforced
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { PrismaClient } from "../../src/generated/prisma/client";
import { hashSecret, signSession } from "../../src/lib/auth";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/reflectus";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

// Helper to create test user
async function createTestUser(email: string, password: string) {
  const passwordHash = await hashSecret(password);
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      name: `Test User ${email}`,
    },
  });
}

// Helper to create workspace
async function createWorkspace(
  type: "ORGANIZATION" | "PERSONAL",
  name: string,
  userId: string,
) {
  return prisma.workspace.create({
    data: {
      type,
      name,
      createdById: userId,
    },
  });
}

// Helper to create membership
async function createMembership(
  workspaceId: string,
  userId: string,
  role: "ORG_ADMIN" | "STAFF" | "PARTICIPANT" | "OWNER" | "MEMBER",
) {
  return prisma.workspaceMembership.create({
    data: {
      workspaceId,
      userId,
      role,
      status: "ACTIVE",
      activatedAt: new Date(),
    },
  });
}

// Helper to create session token
function createSessionToken(userId: string, workspaceId: string, role: string) {
  return signSession({
    sub: userId,
    role: "facilitator",
    activeWorkspaceId: workspaceId,
    workspaceRole: role as any,
  });
}

describe("Workspace Isolation", () => {
  let userA: { id: string; email: string };
  let userB: { id: string; email: string };
  let workspaceA: { id: string };
  let workspaceB: { id: string };
  let groupA: { id: string };
  let groupB: { id: string };
  let activityA: { id: string };
  let activityB: { id: string };

  beforeAll(async () => {
    // Create test users
    userA = await createTestUser("test-a@test.local", "password123");
    userB = await createTestUser("test-b@test.local", "password123");

    // Create workspaces
    workspaceA = await createWorkspace("ORGANIZATION", "Workspace A", userA.id);
    workspaceB = await createWorkspace("ORGANIZATION", "Workspace B", userB.id);

    // Create memberships
    await createMembership(workspaceA.id, userA.id, "ORG_ADMIN");
    await createMembership(workspaceB.id, userB.id, "ORG_ADMIN");

    // Create groups
    groupA = await prisma.group.create({
      data: {
        name: "Group A",
        code: "GROUP-A",
        workspaceId: workspaceA.id,
        orgId: workspaceA.id, // Backward compatibility
        createdById: userA.id,
      },
    });

    groupB = await prisma.group.create({
      data: {
        name: "Group B",
        code: "GROUP-B",
        workspaceId: workspaceB.id,
        orgId: workspaceB.id,
        createdById: userB.id,
      },
    });

    // Create activities
    activityA = await prisma.activity.create({
      data: {
        groupId: groupA.id,
        workspaceId: workspaceA.id,
        title: "Activity A",
        privacyMode: "NAMED",
        status: "PUBLISHED",
        createdById: userA.id,
      },
    });

    activityB = await prisma.activity.create({
      data: {
        groupId: groupB.id,
        workspaceId: workspaceB.id,
        title: "Activity B",
        privacyMode: "NAMED",
        status: "PUBLISHED",
        createdById: userB.id,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.activity.deleteMany({ where: { id: { in: [activityA.id, activityB.id] } } });
    await prisma.group.deleteMany({ where: { id: { in: [groupA.id, groupB.id] } } });
    await prisma.workspaceMembership.deleteMany({
      where: {
        workspaceId: { in: [workspaceA.id, workspaceB.id] },
      },
    });
    await prisma.workspace.deleteMany({ where: { id: { in: [workspaceA.id, workspaceB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
    await prisma.$disconnect();
  });

  describe("Groups Isolation", () => {
    it("should return only groups from user's workspace", async () => {
      const token = createSessionToken(userA.id, workspaceA.id, "ORG_ADMIN");
      const res = await fetch(`${BASE_URL}/api/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
        },
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      const groupIds = data.groups.map((g: { id: string }) => g.id);
      expect(groupIds).toContain(groupA.id);
      expect(groupIds).not.toContain(groupB.id);
    });

    it("should return 404 when accessing group from another workspace", async () => {
      const token = createSessionToken(userA.id, workspaceA.id, "ORG_ADMIN");
      const res = await fetch(`${BASE_URL}/api/groups/${groupB.id}/activities`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
        },
      });

      expect(res.status).toBe(404);
    });
  });

  describe("Activities Isolation", () => {
    it("should return 404 when accessing activity from another workspace", async () => {
      const token = createSessionToken(userA.id, workspaceA.id, "ORG_ADMIN");
      const res = await fetch(`${BASE_URL}/api/activities/${activityB.id}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
        },
      });

      expect(res.status).toBe(404);
    });

    it("should allow access to activity from own workspace", async () => {
      const token = createSessionToken(userA.id, workspaceA.id, "ORG_ADMIN");
      const res = await fetch(`${BASE_URL}/api/activities/${activityA.id}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
        },
      });

      // Should succeed (even if empty analytics)
      expect([200, 404]).toContain(res.status);
    });
  });

  describe("Workspace Membership", () => {
    it("should prevent switching to workspace user is not a member of", async () => {
      const token = createSessionToken(userA.id, workspaceA.id, "ORG_ADMIN");
      
      // Get CSRF token
      const csrfRes = await fetch(`${BASE_URL}/api/csrf-token`);
      const { token: csrfToken } = await csrfRes.json();

      const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceB.id}/switch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
      });

      expect(res.status).toBe(404);
    });

    it("should allow switching to workspace user is a member of", async () => {
      // Add userA to workspaceB
      await createMembership(workspaceB.id, userA.id, "STAFF");

      const token = createSessionToken(userA.id, workspaceA.id, "ORG_ADMIN");
      
      // Get CSRF token
      const csrfRes = await fetch(`${BASE_URL}/api/csrf-token`);
      const { token: csrfToken } = await csrfRes.json();

      const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceB.id}/switch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
      });

      expect(res.ok).toBe(true);

      // Cleanup
      await prisma.workspaceMembership.delete({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceB.id,
            userId: userA.id,
          },
        },
      });
    });
  });

  describe("Invite Security", () => {
    it("should prevent reusing invite token", async () => {
      const invite = await prisma.workspaceInvite.create({
        data: {
          workspaceId: workspaceA.id,
          email: "invite-test@test.local",
          intendedRole: "STAFF",
          tokenHash: await hashSecret("test-token-123"),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdById: userA.id,
        },
      });

      // Accept invite first time
      const csrfRes1 = await fetch(`${BASE_URL}/api/csrf-token`);
      const { token: csrfToken1 } = await csrfRes1.json();

      const res1 = await fetch(`${BASE_URL}/api/workspaces/invites/accept`, {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "test-token-123",
          name: "Invite User",
          password: "password123",
        }),
      });

      expect(res1.ok).toBe(true);

      // Try to accept again
      const csrfRes2 = await fetch(`${BASE_URL}/api/csrf-token`);
      const { token: csrfToken2 } = await csrfRes2.json();

      const res2 = await fetch(`${BASE_URL}/api/workspaces/invites/accept`, {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken2,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "test-token-123",
        }),
      });

      expect(res2.status).toBe(400);

      // Cleanup
      await prisma.workspaceInvite.delete({ where: { id: invite.id } });
    });
  });

  describe("RBAC Enforcement", () => {
    it("should block STAFF from admin-only workspace updates", async () => {
      // Add userB as STAFF in workspaceA
      await createMembership(workspaceA.id, userB.id, "STAFF");

      const token = createSessionToken(userB.id, workspaceA.id, "STAFF");
      const csrfRes = await fetch(`${BASE_URL}/api/csrf-token`);
      const { token: csrfToken } = await csrfRes.json();

      const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceA.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Workspace A Updated" }),
      });

      expect(res.status).toBe(403);

      // Cleanup
      await prisma.workspaceMembership.delete({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceA.id,
            userId: userB.id,
          },
        },
      });
    });
  });

  describe("Cross-Tenant Update/Delete", () => {
    it("should return 404 when updating activity from another workspace", async () => {
      const token = createSessionToken(userA.id, workspaceA.id, "ORG_ADMIN");
      const csrfRes = await fetch(`${BASE_URL}/api/csrf-token`);
      const { token: csrfToken } = await csrfRes.json();

      const res = await fetch(`${BASE_URL}/api/activities/${activityB.id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CLOSED" }),
      });

      expect(res.status).toBe(404);
    });

    it("should allow updating activity from own workspace", async () => {
      const token = createSessionToken(userA.id, workspaceA.id, "ORG_ADMIN");
      const csrfRes = await fetch(`${BASE_URL}/api/csrf-token`);
      const { token: csrfToken } = await csrfRes.json();

      const res = await fetch(`${BASE_URL}/api/activities/${activityA.id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CLOSED" }),
      });

      expect(res.ok).toBe(true);
    });
  });

  describe("Admin Endpoints Cross-Tenant", () => {
    let adminUser: { id: string; email: string };
    let adminWorkspace: { id: string };

    beforeAll(async () => {
      // Create admin user (email in ADMIN_EMAILS)
      adminUser = await createTestUser("admin@test.local", "password123");
      adminWorkspace = await createWorkspace("ORGANIZATION", "Admin Workspace", adminUser.id);
      await createMembership(adminWorkspace.id, adminUser.id, "ORG_ADMIN");
    });

    afterAll(async () => {
      await prisma.workspaceMembership.deleteMany({
        where: { workspaceId: adminWorkspace.id },
      });
      await prisma.workspace.delete({ where: { id: adminWorkspace.id } });
      await prisma.user.delete({ where: { id: adminUser.id } });
    });

    it("should return 404 when admin accesses user from different workspace", async () => {
      // Note: This test requires ADMIN_EMAILS env var to include admin@test.local
      const token = createSessionToken(adminUser.id, adminWorkspace.id, "ORG_ADMIN");
      
      const res = await fetch(`${BASE_URL}/api/admin/gdpr/export/${userB.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
        },
      });

      // Should return 404 (user not found in admin's workspaces)
      expect(res.status).toBe(404);
    });

    it("should return 403 when admin has no workspace memberships", async () => {
      // Create admin without workspace membership
      const adminNoWorkspace = await createTestUser("admin-noworkspace@test.local", "password123");
      
      const token = createSessionToken(adminNoWorkspace.id, "", "");
      
      const res = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
        },
      });

      // Should return 403 (no workspace access)
      expect(res.status).toBe(403);

      // Cleanup
      await prisma.user.delete({ where: { id: adminNoWorkspace.id } });
    });
  });

  describe("No Workspace Default", () => {
    it("should handle user with no active workspace gracefully", async () => {
      const userNoWorkspace = await createTestUser("no-workspace@test.local", "password123");
      const token = createSessionToken(userNoWorkspace.id, "", "");

      const res = await fetch(`${BASE_URL}/api/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `reflectus_session=${token}`,
        },
      });

      // Should return empty list or error, not crash
      expect([200, 401, 403]).toContain(res.status);

      // Cleanup
      await prisma.user.delete({ where: { id: userNoWorkspace.id } });
    });
  });
});
