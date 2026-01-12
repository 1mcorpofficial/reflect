import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generates a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomUUID?.() ?? `csrf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Gets CSRF token from cookie or generates a new one
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME);
  if (existing?.value) return existing.value;
  const token = generateCsrfToken();
  return token;
}

/**
 * Validates CSRF token from request
 */
export async function validateCsrfToken(req: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

/**
 * Creates error response for CSRF validation failure
 */
export function createCsrfErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: "CSRF token validation failed", code: "CSRF_INVALID" },
    { status: 403 },
  );
}

/**
 * Middleware to check CSRF token for state-changing requests
 */
export async function requireCsrfToken(req: Request): Promise<
  | { ok: true }
  | { ok: false; response: NextResponse }
> {
  const method = req.method.toUpperCase();
  // Only check CSRF for state-changing methods
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return { ok: true };
  }

  const isValid = await validateCsrfToken(req);
  if (!isValid) {
    return { ok: false, response: createCsrfErrorResponse() };
  }

  return { ok: true };
}
