import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildSessionCookie,
  signSession,
  verifySecret,
} from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import { hmacLookup } from "@/lib/hmac";

const participantLoginSchema = z.object({
  groupCode: z.string().min(3),
  personalCode: z.string().min(4),
});

export async function POST(req: Request) {
  const limiterKey = buildRateLimitKey(req, "participant-login");
  const allowed = checkRateLimit(limiterKey, 20, 60_000);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(allowed.retryAfter ?? 60) },
      },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = participantLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const groupCode = parsed.data.groupCode.trim();
  const personalCode = parsed.data.personalCode.trim();

  const group = await prisma.group.findUnique({
    where: { code: groupCode },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const lookup = hmacLookup(`${group.id}:${personalCode}`);

  const membership = await prisma.groupParticipant.findUnique({
    where: { personalCodeLookup: lookup },
    include: { participant: true, group: true },
  });

  if (!membership || membership.groupId !== group.id) {
    return NextResponse.json(
      { error: "Invalid code for this group" },
      { status: 401 },
    );
  }

  const ok = await verifySecret(personalCode, membership.personalCodeHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid code for this group" },
      { status: 401 },
    );
  }

  const token = signSession({
    sub: membership.participantId,
    role: "participant",
    groupId: group.id,
    membershipId: membership.id,
  });

  const response = NextResponse.json({
    participant: {
      id: membership.participantId,
      displayName: membership.participant.displayName,
      group: { id: group.id, name: group.name, code: group.code },
    },
  });
  response.cookies.set(buildSessionCookie(token));
  void logAudit({
    action: "participant.login",
    targetType: "Group",
    targetId: group.id,
    actorParticipantId: membership.id,
  });
  return response;
}
