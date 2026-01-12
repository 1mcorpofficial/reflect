"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
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
import { Textarea as SimpleTextarea } from "@/components/ui/textarea";
import { QuestionConfigEditor } from "@/components/question-config-editor";
import {
  QUESTION_TYPE_LABELS,
  defaultConfig,
  type QuestionType,
} from "@/lib/question-types";
import { ActivityStatusBadge } from "@/components/ActivityStatusBadge";
import { csrfFetch } from "@/lib/csrf-client";

type ParticipantPreview = {
  id: string;
  displayName: string;
  personalCode?: string;
  membershipId: string;
  participantId?: string;
  email?: string | null;
  joinedAt?: string;
};

type Activity = {
  id: string;
  title: string;
  status: string;
  privacyMode: string;
  description?: string | null;
  openAt?: string | null;
  closeAt?: string | null;
  timezone?: string | null;
};

type QuestionDraft = {
  id: string;
  prompt: string;
  helperText?: string;
  type: QuestionType;
  required: boolean;
  config?: Record<string, unknown>;
};

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function starterQuestions(): QuestionDraft[] {
  return [
    {
      id: newId(),
      prompt: "Kaip pavyko pamoka?",
      type: "TRAFFIC_LIGHT",
      required: true,
      config: defaultConfig("TRAFFIC_LIGHT") as Record<string, unknown>,
    },
    {
      id: newId(),
      prompt: "Koks motyvacijos lygis?",
      type: "THERMOMETER",
      required: true,
      config: defaultConfig("THERMOMETER") as Record<string, unknown>,
    },
  ];
}

function getActivityState(activity: Activity) {
  const now = new Date();
  const openAt = activity.openAt ? new Date(activity.openAt) : null;
  const closeAt = activity.closeAt ? new Date(activity.closeAt) : null;
  if (activity.status === "CLOSED") return "CLOSED";
  if (openAt && openAt > now) return "PLANNED";
  if (closeAt && closeAt < now) return "CLOSED";
  if (activity.status === "PUBLISHED") return "OPEN";
  return "DRAFT";
}

const PRESETS: Array<{
  id: string;
  label: string;
  title: string;
  description: string;
  questions: Array<Omit<QuestionDraft, "id">>;
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

export default function GroupPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const [participants, setParticipants] = useState<ParticipantPreview[]>([]);
  const [csv, setCsv] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState("Pamokos refleksija");
  const [description, setDescription] = useState("Greita refleksija po pamokos.");
  const [privacyMode, setPrivacyMode] = useState<"NAMED" | "ANONYMOUS">("NAMED");
  const [questions, setQuestions] = useState<QuestionDraft[]>(() => starterQuestions());
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [timezone, setTimezone] = useState(() => {
    if (typeof Intl !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
    }
    return "UTC";
  });
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const [participantsList, setParticipantsList] = useState<ParticipantPreview[]>([]);
  const [loadStatus, setLoadStatus] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    const res = await fetch(`/api/groups/${groupId}/activities`);
    if (!res.ok) return;
    const data = await res.json();
    setActivities(data.activities ?? []);
  }, [groupId]);

  const loadParticipants = useCallback(async () => {
    setLoadStatus("Kraunama...");
    const res = await fetch(`/api/groups/${groupId}/participants`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setParticipantsList(data.participants ?? []);
      setLoadStatus(null);
    } else {
      setLoadStatus(data.error ?? "Nepavyko gauti dalyvių");
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      void loadActivities();
      void loadParticipants();
    }
  }, [groupId, loadActivities, loadParticipants]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: newId(),
        prompt: "Naujas klausimas",
        type: "FREE_TEXT",
        required: false,
        config: defaultConfig("FREE_TEXT") as Record<string, unknown>,
      },
    ]);
  };

  const updateQuestion = (id: string, updates: Partial<QuestionDraft>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const moveQuestion = (id: string, direction: "up" | "down") => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx === -1) return prev;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const importParticipants = async () => {
    setImportStatus("Importuojama...");
    const res = await csrfFetch(`/api/groups/${groupId}/participants/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setParticipants(data.participants ?? []);
      await loadParticipants();
      setImportStatus("Importuota");
    } else {
      setImportStatus(data.error ?? "Klaida");
    }
  };

  const createActivity = async () => {
    if (questions.length === 0) {
      setCreateStatus("Pridėkite bent vieną klausimą");
      return;
    }

    const toIsoOrUndefined = (value: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return undefined;
      return date.toISOString();
    };

    setCreateStatus("Kuriama...");
    const res = await csrfFetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
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
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setCreateStatus("Sukurta (DRAFT)");
      setQuestions(starterQuestions());
      setTitle("Pamokos refleksija");
      setDescription("Greita refleksija po pamokos.");
      setOpenAt("");
      setCloseAt("");
      setTimezone(
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"
          : "UTC",
      );
      await loadActivities();
    } else {
      setCreateStatus(data.error ?? "Klaida");
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setTitle(preset.title);
    setDescription(preset.description);
    setQuestions(
      preset.questions.map((q) => ({
        id: newId(),
        prompt: q.prompt,
        helperText: q.helperText,
        type: q.type,
        required: q.required,
        config: q.config,
      })),
    );
    setCreateStatus(`pritaikytas šablonas: ${preset.label}`);
  };

  const changeStatus = async (activityId: string, status: "PUBLISHED" | "CLOSED") => {
    await csrfFetch(`/api/activities/${activityId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadActivities();
  };

  return (
    <div className="page-shell flex max-w-6xl flex-col gap-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge variant="muted">Grupė</Badge>
          <h1 className="text-3xl font-semibold mt-2">Grupės valdymas</h1>
          <p className="text-muted-foreground text-sm">
            Importuok dalyvius, kurk veiklas, publikuok.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importuoti dalyvius (CSV)</CardTitle>
          <CardDescription>Formatu: vardas,el.p. (antra eilutė ir toliau)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SimpleTextarea
            rows={6}
            placeholder={"Name, email\nJonas, jonas@example.com"}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Button onClick={importParticipants}>Importuoti</Button>
            {importStatus && (
              <span className="text-sm text-muted-foreground">{importStatus}</span>
            )}
          </div>
          {participants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Sugeneruoti kodai</p>
              <div className="grid gap-2 md:grid-cols-2">
                {participants.map((p) => (
                  <Card key={p.membershipId}>
                    <CardContent className="py-3">
                      <p className="font-medium">{p.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        Kodas: {p.personalCode}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {loadStatus && (
            <p className="text-sm text-muted-foreground">{loadStatus}</p>
          )}
          {!loadStatus && participantsList.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Dalyviai</p>
              <div className="grid gap-2 md:grid-cols-2">
                {participantsList.map((p) => (
                  <Card key={p.membershipId}>
                    <CardContent className="py-3">
                      <p className="font-medium">{p.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.email ?? "el. paštas nenurodytas"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Prisijungė:{" "}
                        {p.joinedAt
                          ? new Date(p.joinedAt).toLocaleString()
                          : "—"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nauja veikla</CardTitle>
          <CardDescription>
            DRAFT sukuriama su pradiniais klausimais, publikuok kai pasiruošęs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Pavadinimas"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Aprašymas"
          />
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1 text-sm">
              <Label>Atidarymo laikas</Label>
              <Input
                type="datetime-local"
                value={openAt}
                onChange={(e) => setOpenAt(e.target.value)}
              />
            </div>
            <div className="space-y-1 text-sm">
              <Label>Uždarymo laikas</Label>
              <Input
                type="datetime-local"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
              />
            </div>
            <div className="space-y-1 text-sm">
              <Label>Laiko zona (nebūtina)</Label>
              <Input
                placeholder="pvz. Europe/Vilnius"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Klausimai</Label>
                <p className="text-xs text-muted-foreground">
                  Korpusas fiksuotas, bet labels/values konfigūruojami. „Nežinau“ visada turi follow-up.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={addQuestion}>
                Pridėti klausimą
              </Button>
            </div>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="space-y-3 rounded-xl border border-border bg-card/70 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="muted">#{idx + 1}</Badge>
                      <Badge variant="secondary">
                        {QUESTION_TYPE_LABELS[q.type]}
                      </Badge>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
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
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={idx === 0}
                        onClick={() => moveQuestion(q.id, "up")}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={idx === questions.length - 1}
                        onClick={() => moveQuestion(q.id, "down")}
                      >
                        ↓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeQuestion(q.id)}
                        disabled={questions.length <= 1}
                      >
                        Šalinti
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Klausimo tekstas</Label>
                      <Input
                        value={q.prompt}
                        onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
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
                        {(
                          [
                            "TRAFFIC_LIGHT",
                            "EMOTION",
                            "SCALE",
                            "THERMOMETER",
                            "MULTI_SELECT",
                            "PIE_100",
                            "SENTENCE_COMPLETION",
                            "FREE_TEXT",
                          ] satisfies QuestionType[]
                        ).map((type) => (
                          <option value={type} key={type}>
                            {QUESTION_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Pagalbinis tekstas</Label>
                      <Input
                        placeholder="nebūtina"
                        value={q.helperText ?? ""}
                        onChange={(e) =>
                          updateQuestion(q.id, { helperText: e.target.value || undefined })
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <QuestionConfigEditor
                        question={q}
                        onChange={(config) => updateQuestion(q.id, { config })}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Pridėkite bent vieną klausimą.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={privacyMode}
              onChange={(e) =>
                setPrivacyMode(e.target.value as "NAMED" | "ANONYMOUS")
              }
            >
              <option value="NAMED">Vardinė</option>
              <option value="ANONYMOUS">Anoniminė</option>
            </select>
            <Button onClick={createActivity}>Sukurti veiklą (DRAFT)</Button>
            {createStatus && (
              <span className="text-sm text-muted-foreground">{createStatus}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Veiklos</CardTitle>
          <CardDescription>Publikuok arba uždaryk veiklą.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {activities.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
            >
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary">{a.status}</Badge>
                  <Badge variant="muted">{a.privacyMode}</Badge>
                  <ActivityStatusBadge
                    status={getActivityState(a)}
                    openAt={a.openAt}
                    closeAt={a.closeAt}
                    timezone={a.timezone}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeStatus(a.id, "PUBLISHED")}
                >
                  Publish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeStatus(a.id, "CLOSED")}
                >
                  Close
                </Button>
                <Button asChild size="sm">
                  <a href={`/dashboard?activityId=${a.id}`}>Analytics</a>
                </Button>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground">Nėra veiklų.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
