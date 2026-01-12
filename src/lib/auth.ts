import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";

export type SessionRole = "facilitator" | "participant" | "admin";

export type SessionPayload = {
  sub: string;
  role: SessionRole;
  groupId?: string;
  membershipId?: string;
  orgId?: string; // DEPRECATED: Use activeWorkspaceId instead
  orgRole?: "ORG_ADMIN" | "FACILITATOR"; // DEPRECATED: Use workspaceRole instead
  activeWorkspaceId?: string; // New: Active workspace ID
  workspaceRole?: "ORG_ADMIN" | "STAFF" | "PARTICIPANT" | "OWNER" | "MEMBER"; // New: Role in active workspace
};

export const SESSION_COOKIE = "reflectus_session";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return secret;
}

export async function hashSecret(value: string) {
  return bcrypt.hash(value, 12);
}

export async function verifySecret(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}

export function signSession(
  payload: SessionPayload,
  options?: jwt.SignOptions,
) {
  return jwt.sign(
    payload as jwt.JwtPayload,
    getAuthSecret(),
    {
      algorithm: "HS256",
      expiresIn: options?.expiresIn ?? "7d",
    },
  );
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getAuthSecret()) as JwtPayload;
    return {
      sub: decoded.sub as string,
      role: decoded.role as SessionRole,
      groupId: decoded.groupId as string | undefined,
      membershipId: decoded.membershipId as string | undefined,
      orgId: decoded.orgId as string | undefined, // Backward compatibility
      orgRole: decoded.orgRole as "ORG_ADMIN" | "FACILITATOR" | undefined, // Backward compatibility
      activeWorkspaceId: decoded.activeWorkspaceId as string | undefined,
      workspaceRole: decoded.workspaceRole as
        | "ORG_ADMIN"
        | "STAFF"
        | "PARTICIPANT"
        | "OWNER"
        | "MEMBER"
        | undefined,
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request) {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.replace("Bearer ", "").trim();
  }
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((chunk) => {
      const [key, ...rest] = chunk.trim().split("=");
      return [key, rest.join("=")];
    }),
  );
  return cookies[SESSION_COOKIE] ?? null;
}

export function getSessionFromRequest(req: Request): SessionPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifySession(token);
}

export function buildSessionCookie(token: string, opts?: { maxAge?: number }) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: opts?.maxAge ?? 60 * 60 * 24 * 7,
  };
}
