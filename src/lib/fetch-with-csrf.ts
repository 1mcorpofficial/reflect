/**
 * Fetch wrapper with automatic CSRF token handling
 */

let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

/**
 * Gets CSRF token from API and caches it
 */
async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  // If already fetching, wait for that promise
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  // Start fetching
  csrfTokenPromise = (async () => {
    try {
      const res = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to get CSRF token");
      }
      const data = (await res.json()) as { token: string };
      csrfTokenCache = data.token;
      return data.token;
    } catch (error) {
      csrfTokenCache = null;
      csrfTokenPromise = null;
      throw error;
    }
  })();

  return csrfTokenPromise;
}

/**
 * Clears CSRF token cache (useful after logout)
 */
export function clearCsrfToken() {
  csrfTokenCache = null;
  csrfTokenPromise = null;
}

/**
 * Fetch wrapper that automatically adds CSRF token for state-changing requests
 */
export async function fetchWithCsrf(
  url: string | URL,
  options?: RequestInit,
): Promise<Response> {
  const method = options?.method?.toUpperCase() ?? "GET";
  const isStateChanging = !["GET", "HEAD", "OPTIONS"].includes(method);

  // For state-changing requests, add CSRF token
  if (isStateChanging) {
    const token = await getCsrfToken();
    const headers = new Headers(options?.headers);
    headers.set("x-csrf-token", token);

    return fetch(url, {
      ...options,
      headers,
      credentials: "include", // Ensure cookies are sent
    });
  }

  // For safe methods, just pass through
  return fetch(url, {
    ...options,
    credentials: "include",
  });
}
