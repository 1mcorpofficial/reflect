/**
 * Integration tests for critical API endpoints
 * Run with: npm test
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("API Integration Tests", () => {
  let facilitatorCookie: string = "";
  // Reserved for future tests:
  // let participantCookie: string = "";
  // let testGroupId: string = "";
  // let testActivityId: string = "";

  beforeAll(async () => {
    // Setup: Create test facilitator and participant
    // This would require test database setup
    // For now, we'll use existing demo credentials
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe("Health Check", () => {
    it("should return 200 with status ok", async () => {
      const res = await fetch(`${BASE_URL}/api/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ok");
      expect(data.db).toBe("ok");
    });
  });

  describe("Facilitator Login", () => {
    it("should login with valid credentials", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: process.env.TEST_FAC_EMAIL || "demo@reflectus.local",
          password: process.env.TEST_FAC_PASS || "demo1234",
        }),
      });

      expect(res.status).toBe(200);
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain("reflectus_session");
      
      if (setCookie) {
        facilitatorCookie = setCookie.split(";")[0];
      }
    });

    it("should reject invalid credentials", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid@test.com",
          password: "wrong",
        }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe("Analytics Endpoint", () => {
    it("should return 200 for valid activity (even if empty)", async () => {
      if (!facilitatorCookie) {
        // Skip if not set up
        return;
      }

      // TODO: Set up testActivityId in beforeAll
      const testActivityId = ""; // Placeholder - needs to be set up in beforeAll
      if (!testActivityId) {
        return; // Skip test if activity ID not available
      }

      const res = await fetch(`${BASE_URL}/api/activities/${testActivityId}/analytics`, {
        headers: { Cookie: facilitatorCookie },
      });

      // Should not return 500 even if no responses
      expect(res.status).not.toBe(500);
      
      if (res.status === 200) {
        const data = await res.json();
        expect(data).toHaveProperty("activityId");
        expect(data).toHaveProperty("totalParticipants");
        expect(data).toHaveProperty("totalResponses");
      }
    });
  });

  describe("Export Endpoint", () => {
    it("should return CSV for valid activity", async () => {
      if (!facilitatorCookie) {
        return;
      }

      // TODO: Set up testActivityId in beforeAll
      const testActivityId = ""; // Placeholder - needs to be set up in beforeAll
      if (!testActivityId) {
        return; // Skip test if activity ID not available
      }

      const res = await fetch(
        `${BASE_URL}/api/activities/${testActivityId}/export?format=csv`,
        {
          headers: { Cookie: facilitatorCookie },
        },
      );

      // Should not return 500
      expect(res.status).not.toBe(500);
    });
  });
});
