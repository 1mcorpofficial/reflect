import { z } from "zod";

export const templates = [
  {
    id: "lesson",
    title: "Pamokos refleksija",
    description: "Greita refleksija po pamokos apie nuotaiką ir supratimą.",
    fields: [
      { key: "mood", label: "Nuotaika", type: "rating", required: true },
      { key: "understanding", label: "Supratau pamoką", type: "rating", required: true },
      { key: "liked", label: "Kas patiko", type: "textarea", required: false },
      { key: "unclear", label: "Kas neaišku", type: "textarea", required: false },
      { key: "question", label: "Klausimas mokytojui", type: "text", required: false },
      { key: "homeworkHelp", label: "Namų darbai / ar reikia pagalbos?", type: "textarea", required: false }
    ],
    schema: z.object({
      mood: z.number().min(1).max(5),
      understanding: z.number().min(1).max(5),
      liked: z.string().optional(),
      unclear: z.string().optional(),
      question: z.string().optional(),
      homeworkHelp: z.string().optional()
    })
  },
  {
    id: "week",
    title: "Savaitės refleksija",
    description: "Apibendrinimas, kas pavyko ir ko reikia kitai savaitei.",
    fields: [
      { key: "wins", label: "Kas pavyko", type: "textarea", required: true },
      { key: "fails", label: "Kas nepavyko", type: "textarea", required: true },
      { key: "nextGoal", label: "Tikslas kitai savaitei", type: "text", required: true },
      { key: "stress", label: "Stresas (1-5)", type: "rating", required: false },
      { key: "sleep", label: "Miego kokybė (1-5)", type: "rating", required: false }
    ],
    schema: z.object({
      wins: z.string().min(1),
      fails: z.string().min(1),
      nextGoal: z.string().min(1),
      stress: z.number().min(1).max(5).optional(),
      sleep: z.number().min(1).max(5).optional()
    })
  },
  {
    id: "exam",
    title: "Kontrolinio/atsiskaitymo refleksija",
    description: "Trumpa refleksija po kontrolinio ar atsiskaitymo.",
    fields: [
      { key: "prep", label: "Pasiruošimas (1-5)", type: "rating", required: true },
      { key: "difficulty", label: "Sunkumas (1-5)", type: "rating", required: true },
      { key: "biggestIssue", label: "Kas labiausiai krito į akis?", type: "textarea", required: true },
      { key: "plan", label: "Planas tobulėjimui", type: "textarea", required: true }
    ],
    schema: z.object({
      prep: z.number().min(1).max(5),
      difficulty: z.number().min(1).max(5),
      biggestIssue: z.string().min(1),
      plan: z.string().min(1)
    })
  },
  {
    id: "project",
    title: "Projekto refleksija",
    description: "Vertinimas apie projekto eigą ir komandą.",
    fields: [
      { key: "contribution", label: "Mano indėlis", type: "textarea", required: true },
      { key: "teamwork", label: "Komandos darbas (1-5)", type: "rating", required: true },
      { key: "blocks", label: "Blokai / iššūkiai", type: "textarea", required: false },
      { key: "redo", label: "Ką daryčiau kitaip", type: "textarea", required: false }
    ],
    schema: z.object({
      contribution: z.string().min(1),
      teamwork: z.number().min(1).max(5),
      blocks: z.string().optional(),
      redo: z.string().optional()
    })
  },
  {
    id: "wellbeing",
    title: "Savijautos check-in",
    description: "Greitas savijautos patikrinimas.",
    fields: [
      { key: "mood", label: "Nuotaika (1-5)", type: "rating", required: true },
      { key: "energy", label: "Energija (1-5)", type: "rating", required: true },
      { key: "focus", label: "Kas dabar svarbu", type: "textarea", required: false },
      { key: "needTalk", label: "Ar reikia pokalbio?", type: "select", options: ["Taip", "Ne"], required: false }
    ],
    schema: z.object({
      mood: z.number().min(1).max(5),
      energy: z.number().min(1).max(5),
      focus: z.string().optional(),
      needTalk: z.string().optional()
    })
  }
];

export function getTemplate(templateId) {
  return templates.find(t => t.id === templateId);
}
