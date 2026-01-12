"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuestionConfigEditor } from "@/components/question-config-editor";
import {
  QUESTION_TYPE_LABELS,
  defaultConfig,
  type QuestionType,
} from "@/lib/question-types";
import { csrfFetch } from "@/lib/csrf-client";

type Question = {
  id: string;
  prompt: string;
  helperText?: string;
  type: QuestionType;
  required: boolean;
  config?: Record<string, unknown>;
};

const ALL_TYPES: QuestionType[] = [
  "TRAFFIC_LIGHT",
  "EMOTION",
  "SCALE",
  "THERMOMETER",
  "MULTI_SELECT",
  "PIE_100",
  "SENTENCE_COMPLETION",
  "FREE_TEXT",
];

function randomId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

const initialQuestions: Question[] = [
  {
    id: randomId(),
    prompt: "Kaip pavyko pamoka?",
    type: "TRAFFIC_LIGHT",
    required: true,
    config: defaultConfig("TRAFFIC_LIGHT") as Record<string, unknown>,
  },
  {
    id: randomId(),
    prompt: "Koks tavo motyvacijos lygis šiandien?",
    type: "THERMOMETER",
    required: true,
    config: defaultConfig("THERMOMETER") as Record<string, unknown>,
  },
];

const PRESETS: Array<{
  id: string;
  label: string;
  title: string;
  description: string;
  questions: Array<Omit<Question, "id">>;
}> = [
  {
    id: "lesson",
    label: "Pamokos refleksija",
    title: "Pamokos refleksija",
    description: "Greitas pamokos įvertinimas su papildomu komentaru.",
    questions: [
      {
        prompt: "Kaip pavyko pamoka?",
        type: "TRAFFIC_LIGHT",
        required: true,
        config: defaultConfig("TRAFFIC_LIGHT") as Record<string, unknown>,
      },
      {
        prompt: "Koks motyvacijos lygis?",
        type: "THERMOMETER",
        required: true,
        config: { min: 1, max: 10 },
      },
      {
        prompt: "Kas buvo sunkiausia?",
        type: "FREE_TEXT",
        required: false,
        config: { placeholder: "Parašyk vienu sakiniu..." },
      },
    ],
  },
  {
    id: "week",
    label: "Savaitės refleksija",
    title: "Savaitės refleksija",
    description: "Trumpa savaitės apžvalga su pagrindiniais faktoriais.",
    questions: [
      {
        prompt: "Kaip vertini šią savaitę?",
        type: "SCALE",
        required: true,
        config: { min: 1, max: 5, statements: ["Sunku", "Gerai"] },
      },
      {
        prompt: "Kas labiausiai padėjo?",
        type: "MULTI_SELECT",
        required: true,
        config: {
          options: [
            { value: "explanations", label: "Mokytojo paaiškinimas" },
            { value: "practice", label: "Pratimai" },
            { value: "group", label: "Darbas grupėje" },
            { value: "homework", label: "Namų darbai" },
          ],
          minChoices: 1,
        },
      },
      {
        prompt: "Ką norėtum patobulinti kitą savaitę?",
        type: "FREE_TEXT",
        required: false,
        config: { placeholder: "Trumpas komentaras..." },
      },
    ],
  },
  {
    id: "test",
    label: "Kontrolinio refleksija",
    title: "Kontrolinio refleksija",
    description: "Savarankiškas įsivertinimas po kontrolinio.",
    questions: [
      {
        prompt: "Kaip sekėsi kontroliniame?",
        type: "TRAFFIC_LIGHT",
        required: true,
        config: defaultConfig("TRAFFIC_LIGHT") as Record<string, unknown>,
      },
      {
        prompt: "Kiek buvai pasiruošęs(-usi)?",
        type: "SCALE",
        required: true,
        config: { min: 1, max: 5, statements: ["Neužtenkamai", "Puikiai"] },
      },
      {
        prompt: "Kuris klausimas buvo sunkiausias?",
        type: "FREE_TEXT",
        required: false,
        config: { placeholder: "Įvardink temą ar užduotį..." },
      },
    ],
  },
  {
    id: "project",
    label: "Projekto refleksija",
    title: "Projekto refleksija",
    description: "Projekto progreso įsivertinimas ir pasiskirstymas.",
    questions: [
      {
        prompt: "Kaip sekėsi projekte?",
        type: "TRAFFIC_LIGHT",
        required: true,
        config: defaultConfig("TRAFFIC_LIGHT") as Record<string, unknown>,
      },
      {
        prompt: "Kaip pasiskirstė laikas?",
        type: "PIE_100",
        required: true,
        config: {
          categories: [
            { label: "Planavimas" },
            { label: "Įgyvendinimas" },
            { label: "Testavimas" },
            { label: "Pristatymas" },
          ],
        },
      },
      {
        prompt: "Ko išmokai dirbdamas(-a) prie projekto?",
        type: "FREE_TEXT",
        required: false,
        config: { placeholder: "Trumpas sakinys..." },
      },
    ],
  },
];

export default function BuilderPage() {
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("Grupės refleksija");
  const [description, setDescription] = useState(
    "Trumpas klausimynas pamokai ar posėdžiui.",
  );
  const [privacyMode, setPrivacyMode] = useState<"NAMED" | "ANONYMOUS">(
    "NAMED",
  );
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [timezone, setTimezone] = useState(() => {
    if (typeof Intl !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
    }
    return "UTC";
  });
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [status, setStatus] = useState<string | null>(null);

  const toIsoOrUndefined = (value: string) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
  };

  const payload = useMemo(() => {
    return {
      groupId: groupId.trim() || "GROUP_ID_HERE",
      title,
      description,
      privacyMode,
      openAt: toIsoOrUndefined(openAt),
      closeAt: toIsoOrUndefined(closeAt),
      timezone: timezone.trim() || undefined,
      questions: questions.map((q, idx) => ({
        prompt: q.prompt,
        helperText: q.helperText,
        type: q.type,
        order: idx,
        required: q.required,
        config: q.config,
      })),
    };
  }, [groupId, title, description, privacyMode, questions, openAt, closeAt, timezone]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: randomId(),
        prompt: "Naujas klausimas",
        type: "FREE_TEXT",
        required: false,
        config: defaultConfig("FREE_TEXT") as Record<string, unknown>,
      },
    ]);
  };

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setTitle(preset.title);
    setDescription(preset.description);
    setQuestions(
      preset.questions.map((q) => ({
        id: randomId(),
        prompt: q.prompt,
        helperText: q.helperText,
        type: q.type,
        required: q.required,
        config: q.config,
      })),
    );
    setStatus(`pritaikytas šablonas: ${preset.label}`);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    );
  };

  const handleSubmit = async () => {
    setStatus("saving");
    try {
      const res = await csrfFetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Nepavyko išsaugoti");
      }
      const data = await res.json();
      setStatus(`sukurta veikla #${data.activity.id}`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Nepavyko išsaugoti veiklos",
      );
    }
  };

  return (
    <div className="page-shell flex max-w-6xl flex-col gap-6 py-8">
      <div className="space-y-2">
        <Badge variant="muted">Builder · klausimynai</Badge>
        <h1 className="text-3xl font-semibold">Sukurk veiklą ir klausimus</h1>
        <p className="text-muted-foreground">
          Minimalus, mobile-first kūrimo vaizdas. Duomenys siunčiami į
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5">
            /api/activities
          </code>{" "}
          (reikalinga facilitatoriaus sesija).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagrindinė informacija</CardTitle>
          <CardDescription>Grupė, privatumas, planavimas ir aprašymas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="group">Grupės ID</Label>
            <Input
              id="group"
              placeholder="pvz. group_123"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Gaukite ID iš <code>/api/groups</code> kūrimo atsakymo.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Pavadinimas</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="privacy">Privatumas</Label>
            <select
              id="privacy"
              value={privacyMode}
              onChange={(e) =>
                setPrivacyMode(e.target.value as "NAMED" | "ANONYMOUS")
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="NAMED">Vardinis (matomas dalyvis)</option>
              <option value="ANONYMOUS">Anoniminis</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openAt">Atidarymo laikas</Label>
            <Input
              id="openAt"
              type="datetime-local"
              value={openAt}
              onChange={(e) => setOpenAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Tuščia reikšmė reiškia „atidaryta iškart“.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="closeAt">Uždarymo laikas</Label>
            <Input
              id="closeAt"
              type="datetime-local"
              value={closeAt}
              onChange={(e) => setCloseAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Tuščia reikšmė reiškia „be pabaigos“.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="timezone">Laiko zona</Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="pvz. Europe/Vilnius"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Aprašymas</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Šablonai (preset&apos;ai)</CardTitle>
          <CardDescription>
            Greitai pradėkite nuo paruoštų refleksijų tipų.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              onClick={() => applyPreset(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Klausimai</CardTitle>
            <CardDescription>
              Tipai: šviesoforas, skalė/termometras (su teiginiais), multi-select,
              pyragas 100 taškų, neužbaigta frazė, laisvas tekstas.
            </CardDescription>
          </div>
          <Button onClick={addQuestion} variant="outline">
            Pridėti klausimą
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-xl border border-border bg-card/70 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="muted">#{idx + 1}</Badge>
                  <Badge variant="secondary">
                    {QUESTION_TYPE_LABELS[q.type]}
                  </Badge>
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) =>
                      updateQuestion(q.id, { required: e.target.checked })
                    }
                  />
                  Privalomas
                </label>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Klausimo tekstas</Label>
                  <Input
                    value={q.prompt}
                    onChange={(e) =>
                      updateQuestion(q.id, { prompt: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipas</Label>
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const nextType = e.target.value as QuestionType;
                      updateQuestion(q.id, {
                        type: nextType,
                        config: defaultConfig(nextType) as Record<string, unknown>,
                      });
                    }}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {ALL_TYPES.map((type) => (
                      <option value={type} key={type}>
                        {QUESTION_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
              <ConfigEditor
                question={q}
                onChange={(config) => updateQuestion(q.id, { config })}
              />
                </div>
                <div className="space-y-2">
                  <Label>Pagalbinis tekstas</Label>
                  <Input
                    placeholder="nebūtina"
                    value={q.helperText ?? ""}
                    onChange={(e) =>
                      updateQuestion(q.id, { helperText: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payload peržiūra</CardTitle>
          <CardDescription>
            JSON, kuris bus siunčiamas į <code>/api/activities</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="max-h-96 overflow-auto rounded-xl bg-muted p-4 text-xs">
            {JSON.stringify(payload, null, 2)}
          </pre>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleSubmit} className="sm:w-auto">
              Išsaugoti veiklą
            </Button>
            {status && (
              <span className="text-sm text-muted-foreground">{status}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConfigEditor({
  question,
  onChange,
}: {
  question: Question;
  onChange: (config: Record<string, unknown>) => void;
}) {
  return (
    <QuestionConfigEditor
      question={question}
      onChange={onChange}
    />
  );
}
