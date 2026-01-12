import { NextResponse } from "next/server";
import { getSessionFromRequest } from "./auth";
import { prisma } from "./prisma";
import { requireCsrfToken } from "./csrf";

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

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const emails = getAdminEmails();
  return emails.includes(email.toLowerCase());
}

export async function requireAdmin(req: Request) {
  const csrfCheck = await requireCsrfToken(req);
  if (!csrfCheck.ok) {
    return csrfCheck;
  }
  if (!isSafeMethod(req.method) && !isSameOrigin(req)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "CSRF protection: origin mismatch", code: "CSRF_ORIGIN_MISMATCH" },
        { status: 403 },
      ),
    };
  }
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== "facilitator" && session.role !== "admin")) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const emails = getAdminEmails();
  if (emails.length === 0) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Admin not configured" }, { status: 403 }),
    };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { email: true },
  });
  const email = user?.email?.toLowerCase();
  if (email && emails.includes(email)) {
    return { ok: true as const, session, email };
  }
  return {
    ok: false as const,
    response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
  };
}
