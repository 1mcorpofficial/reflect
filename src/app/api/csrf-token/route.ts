import { NextResponse } from "next/server";
import { getCsrfToken } from "@/lib/csrf";
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "csrf-token";

/**
 * GET /api/csrf-token
 * Returns CSRF token and sets it in cookie
 */
export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME);
  
  if (existing?.value) {
    return NextResponse.json({ token: existing.value });
  }

  const token = await getCsrfToken();
  const response = NextResponse.json({ token });
  
  // Set cookie: httpOnly=false (needed for JS to read), sameSite=strict, secure in production
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
