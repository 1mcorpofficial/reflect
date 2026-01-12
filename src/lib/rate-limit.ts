type RateEntry = { count: number; reset: number };

const globalStore = globalThis as unknown as {
  __rateLimits?: Map<string, RateEntry>;
};

const store = globalStore.__rateLimits ?? new Map<string, RateEntry>();
if (!globalStore.__rateLimits) {
  globalStore.__rateLimits = store;
}

function getClientId(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const realIp = req.headers.get("x-real-ip") ?? "";
  return forwarded.split(",")[0]?.trim() || realIp || "anon";
}

export function buildRateLimitKey(req: Request, label: string) {
  return `${label}:${getClientId(req)}`;
}

export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((existing.reset - now) / 1000) };
  }

  existing.count += 1;
  store.set(key, existing);
  return { ok: true };
}

