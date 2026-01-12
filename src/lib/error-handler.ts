import { NextResponse } from "next/server";
import { headers } from "next/headers";

/**
 * Generates a request ID for error tracking
 */
export function generateRequestId(): string {
  return crypto.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Gets or generates request ID from headers
 */
export async function getRequestId(): Promise<string> {
  const headersList = await headers();
  const existing = headersList.get("x-request-id");
  if (existing) return existing;
  return generateRequestId();
}

/**
 * Creates a structured error response with request ID
 */
export function createErrorResponse(
  error: unknown,
  status: number = 500,
  requestId?: string,
): NextResponse {
  const id = requestId ?? generateRequestId();
  const message = error instanceof Error ? error.message : String(error);
  const isDev = process.env.NODE_ENV === "development";

  // Log error with request ID (never expose stack trace to user)
  console.error(`[${id}] Error:`, message);
  if (isDev && error instanceof Error) {
    console.error(`[${id}] Stack:`, error.stack);
  }

  return NextResponse.json(
    {
      error: status >= 500 ? "Internal server error" : message,
      requestId: id,
      ...(isDev && error instanceof Error ? { details: error.message } : {}),
    },
    {
      status,
      headers: {
        "x-request-id": id,
      },
    },
  );
}

/**
 * Wraps an async handler with error handling
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      const requestId = await getRequestId();
      return createErrorResponse(error, 500, requestId);
    }
  };
}
