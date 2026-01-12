import { prisma } from "../src/lib/prisma";
import { hashSecret } from "../src/lib/auth";
import { hmacLookup } from "../src/lib/hmac";

async function main() {
  const facilitatorEmail = "demo@reflectus.local";
  const facilitator = await prisma.user.upsert({
    where: { email: facilitatorEmail },
    update: {
      passwordHash: await hashSecret("demo1234"),
    },
    create: {
      email: facilitatorEmail,
      name: "Demo Facilitator",
      passwordHash: await hashSecret("demo1234"),
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: "reflectus-demo" },
    update: {},
    create: {
      name: "Reflectus Demo Organizacija",
      slug: "reflectus-demo",
      createdById: facilitator.id,
    },
  });

  await prisma.orgMember.upsert({
    where: { orgId_userId: { orgId: org.id, userId: facilitator.id } },
    update: { status: "ACTIVE", role: "ORG_ADMIN", activatedAt: new Date() },
    create: {
      orgId: org.id,
      userId: facilitator.id,
      role: "ORG_ADMIN",
      status: "ACTIVE",
      activatedAt: new Date(),
    },
  });

  const group = await prisma.group.upsert({
    where: { code: "DEMO1" },
    update: {},
    create: {
      orgId: org.id,
      code: "DEMO1",
      name: "Demo Grupė",
      description: "Pavyzdinė klasė",
      createdById: facilitator.id,
    },
  });

  const participantCode = "CODE1234";
  const participant = await prisma.participant.upsert({
    where: { id: "demo-participant" },
    update: {},
    create: {
      id: "demo-participant",
      displayName: "Demo Mokinys",
      email: null,
    },
  });

  await prisma.groupParticipant.upsert({
    where: { personalCodeLookup: hmacLookup(`${group.id}:${participantCode}`) },
    update: {},
    create: {
      groupId: group.id,
      participantId: participant.id,
      personalCodeHash: await hashSecret(participantCode),
      personalCodeLookup: hmacLookup(`${group.id}:${participantCode}`),
    },
  });

  const activity = await prisma.activity.create({
    data: {
      groupId: group.id,
      createdById: facilitator.id,
      title: "Pamokos refleksija (demo)",
      privacyMode: "NAMED",
      status: "PUBLISHED",
      publishedAt: new Date(),
      questionnaire: {
        create: {
          title: "Pamoka",
          questions: {
            create: [
              {
                prompt: "Kaip pavyko pamoka?",
                type: "TRAFFIC_LIGHT",
                order: 0,
                config: {
                  options: [
                    { value: "green", label: "Puikiai" },
                    { value: "yellow", label: "Vidutiniškai" },
                    { value: "red", label: "Sunkiai" },
                  ],
                },
              },
              {
                prompt: "Koks motyvacijos lygis?",
                type: "THERMOMETER",
                order: 1,
                config: { min: 1, max: 10 },
              },
            ],
          },
        },
      },
    },
  });

  console.log("Seed complete", {
    facilitatorEmail,
    facilitatorPassword: "demo1234",
    orgSlug: org.slug,
    groupCode: group.code,
    participantCode,
    activityId: activity.id,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
