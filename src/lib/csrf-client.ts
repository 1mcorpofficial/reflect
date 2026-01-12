let cachedToken: string | null = null;
let inflight: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  if (inflight) return inflight;
  inflight = fetch("/api/csrf-token")
    .then(async (res) => {
      if (!res.ok) {
        throw new Error("Nepavyko gauti CSRF token");
      }
      const data = (await res.json()) as { token?: string };
      if (!data.token) {
        throw new Error("CSRF token trūksta");
      }
      cachedToken = data.token;
      return data.token;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export async function csrfFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return fetch(input, init);
  }
  const token = await fetchCsrfToken();
  const headers = new Headers(init.headers ?? {});
  headers.set("x-csrf-token", token);
  return fetch(input, { ...init, headers });
}
