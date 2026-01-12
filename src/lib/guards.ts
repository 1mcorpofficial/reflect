import { NextResponse } from "next/server";
import {
  getSessionFromRequest,
  type SessionPayload,
  type SessionRole,
} from "./auth";
import { requireCsrfToken } from "./csrf";

type GuardResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse };

function isSafeMethod(method: string) {
  return ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function requireRole(
  req: Request,
  role: SessionRole,
  opts?: { requireOrg?: boolean },
): Promise<GuardResult> {
  // CSRF check for state-changing methods
  const csrfCheck = await requireCsrfToken(req);
  if (!csrfCheck.ok) {
    return csrfCheck;
  }

  if (!isSafeMethod(req.method) && !isSameOrigin(req)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "CSRF protection: origin mismatch", code: "CSRF_ORIGIN_MISMATCH" },
        { status: 403 },
      ),
    };
  }
  const session = getSessionFromRequest(req);
  const isAdmin = session?.role === "admin";
  const hasRole = session?.role === role || (isAdmin && role === "facilitator");
  if (!session || !hasRole) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (
    role === "facilitator" &&
    !isAdmin &&
    opts?.requireOrg !== false &&
    (!session.orgId || !session.orgRole)
  ) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Missing organization context" }, { status: 401 }),
    };
  }
  return { ok: true, session };
}
