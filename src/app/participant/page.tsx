"use client";

import { useEffect, useMemo, useState } from "react";
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
import { defaultConfig } from "@/lib/question-types";
import { UniversalAnswerActions } from "@/components/UniversalAnswerActions";
import { csrfFetch } from "@/lib/csrf-client";
import { ActivityStatusBadge } from "@/components/ActivityStatusBadge";

type QuestionType =
  | "TRAFFIC_LIGHT"
  | "EMOTION"
  | "SCALE"
  | "THERMOMETER"
  | "SENTENCE_COMPLETION"
  | "FREE_TEXT"
  | "MULTI_SELECT"
  | "PIE_100";

type Question = {
  id: string;
  prompt: string;
  helperText?: string | null;
  type: QuestionType;
  required: boolean;
  order: number;
  config?: Record<string, unknown> | null;
  followUp?: Array<{
    prompt: string;
    helperText?: string | null;
    type: QuestionType;
    config?: Record<string, unknown> | null;
  }>;
};

type Activity = {
  id: string;
  title: string;
  description?: string | null;
  privacyMode: "NAMED" | "ANONYMOUS";
  openAt?: string | null;
  closeAt?: string | null;
  timezone?: string | null;
  state?: "OPEN" | "PLANNED" | "CLOSED" | "OTHER";
  questionnaire: { questions: Question[] };
  responses?: { id: string }[];
};

type HistoryItem = {
  id: string;
  submittedAt: string | null;
  activity: { id: string; title: string; privacyMode: "NAMED" | "ANONYMOUS" };
};

type AnswerStatus = "ANSWERED" | "UNKNOWN" | "DECLINED";
type FollowUpAnswer = { prompt: string; value: unknown };
type AnswerState = {
  value?: unknown;
  status?: AnswerStatus;
  followUpAnswers?: FollowUpAnswer[];
};

type AnswerMap = Record<string, AnswerState>;

const fallbackActivities: Activity[] = [
  {
    id: "demo-activity",
    title: "Pamokos refleksija",
    description: "Greita refleksija po pamokos ar susitikimo.",
    privacyMode: "NAMED",
    questionnaire: {
      questions: [
        {
          id: "q1",
          prompt: "Kaip jautiesi po pamokos?",
          type: "TRAFFIC_LIGHT",
          required: true,
          order: 0,
        },
        {
          id: "q2",
          prompt: "Koks tavo motyvacijos lygis?",
          type: "THERMOMETER",
          required: true,
          order: 1,
          config: { min: 1, max: 10 },
        },
        {
          id: "q3",
          prompt: "Baik sakinį: Šiandien išmokau...",
          type: "SENTENCE_COMPLETION",
          required: false,
          order: 2,
        },
      ],
    },
  },
];

export default function ParticipantPage() {
  const [activities, setActivities] = useState<Activity[]>(fallbackActivities);
  const [selectedId, setSelectedId] = useState(fallbackActivities[0]?.id ?? "");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === selectedId),
    [activities, selectedId],
  );

  const draftKey = selectedActivity
    ? `reflectus-draft-${selectedActivity.id}`
    : null;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/participants/activities");
        if (!res.ok) return;
        const data = await res.json();
        if (data.activities?.length) {
          const list = data.activities as Activity[];
          const defaultActivity =
            list.find((a) => a.state === "OPEN") ?? list[0];
          setActivities(list);
          setSelectedId(defaultActivity?.id ?? "");
          setCurrentIndex(0);
        }
      } catch {
        // fallback demo data
      }
    };
    fetchActivities();
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/participants/history");
        if (!res.ok) return;
        const data = await res.json();
        setHistory(data.responses ?? []);
      } catch {
        //
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!draftKey) return;
    const saved = typeof window !== "undefined" ? localStorage.getItem(draftKey) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        const normalized: AnswerMap = {};
        for (const [key, val] of Object.entries(parsed ?? {})) {
          if (val && typeof val === "object" && !Array.isArray(val)) {
            normalized[key] = val as AnswerState;
          } else {
            normalized[key] = { value: val, status: "ANSWERED" };
          }
        }
        setAnswers(normalized);
      } catch {
        setAnswers({});
      }
    } else {
      setAnswers({});
    }
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey) return;
    const handle = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(answers));
    }, 400);
    return () => clearTimeout(handle);
  }, [answers, draftKey]);

  if (!selectedActivity) {
    return (
      <div className="page-shell max-w-md py-10 text-center">
        <p className="text-muted-foreground">
          Nėra aktyvių veiklų. Patikrinkite vėliau.
        </p>
      </div>
    );
  }

  const setAnswerValue = (questionId: string, value: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? {}),
        value,
        status: prev[questionId]?.status ?? "ANSWERED",
      },
    }));
  };

  const setAnswerStatus = (
    questionId: string,
    status: AnswerStatus,
    followUpPrompts?: string[],
  ) => {
    setAnswers((prev) => {
      const existing = prev[questionId] ?? {};
      const followUpAnswers =
        status === "UNKNOWN"
          ? (followUpPrompts ?? []).map((prompt, idx) => ({
              prompt: prompt || `Papildomas klausimas ${idx + 1}`,
              value:
                existing.followUpAnswers?.[idx]?.value ??
                "",
            }))
          : undefined;
      return {
        ...prev,
        [questionId]: {
          ...existing,
          status,
          value: status === "DECLINED" ? undefined : existing.value,
          followUpAnswers,
        },
      };
    });
  };

  const setFollowUpAnswer = (
    questionId: string,
    index: number,
    value: unknown,
  ) => {
    setAnswers((prev) => {
      const existing = prev[questionId] ?? {};
      const currentFollowUps = existing.followUpAnswers ?? [];
      const updated = [...currentFollowUps];
      const prompt = updated[index]?.prompt ?? `Papildomas klausimas ${index + 1}`;
      updated[index] = { prompt, value };
      return {
        ...prev,
        [questionId]: { ...existing, followUpAnswers: updated, status: existing.status ?? "UNKNOWN" },
      };
    });
  };

  const questionCount = selectedActivity?.questionnaire.questions.length ?? 0;
  const answeredCount =
    selectedActivity?.questionnaire.questions.filter((q) => {
      const state = answers[q.id];
      const st = state?.status ?? (state?.value !== undefined ? "ANSWERED" : undefined);
      return st === "ANSWERED" || st === "DECLINED";
    }).length ?? 0;

  const currentQuestion =
    selectedActivity?.questionnaire.questions[currentIndex] ?? null;

  const goNext = () => {
    if (!selectedActivity) return;
    setCurrentIndex((prev) =>
      Math.min(prev + 1, selectedActivity.questionnaire.questions.length - 1),
    );
  };
  const goPrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const missingRequired =
    selectedActivity?.questionnaire.questions.some((q) => {
      if (!q.required) return false;
      const st = answers[q.id]?.status ?? (answers[q.id]?.value !== undefined ? "ANSWERED" : undefined);
      return !st || st === "UNKNOWN";
    }) ?? false;

  const handleSubmit = async () => {
    if (!selectedActivity) return;
    if (selectedActivity.responses?.length) {
      setStatus("Jau pateikta.");
      return;
    }
    setIsSubmitting(true);
    setStatus("Pateikiama...");
    try {
      if (missingRequired) {
        throw new Error(
          "Užpildykite visus privalomus klausimus. Jei pasirinkote „Nežinau“, užpildykite pagalbinius klausimus ir grįžkite prie atsakymo arba pasirinkite „Nenoriu atsakyti“.",
        );
      }
      const payload = {
        answers: (selectedActivity.questionnaire.questions ?? []).map((q) => {
          const state = answers[q.id] ?? {};
          return {
            questionId: q.id,
            value: state.value,
            status: state.status ?? "ANSWERED",
            followUpAnswers: state.followUpAnswers?.map((f) => ({
              prompt: f.prompt,
              value: f.value,
            })),
          };
        }),
      };
      const res = await csrfFetch(
        `/api/activities/${selectedActivity.id}/responses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Nepavyko pateikti atsakymų");
      }
      setStatus("Ačiū! Atsakymai išsaugoti.");
      setActivities((prev) =>
        prev.map((a) =>
          a.id === selectedActivity.id
            ? { ...a, responses: [{ id: "self" }] }
            : a,
        ),
      );
      if (draftKey) localStorage.removeItem(draftKey);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Įvyko klaida");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex max-w-3xl flex-col gap-4 py-6">
      <header className="space-y-2">
        <Badge variant="muted">Dalyvio režimas</Badge>
        <h1 className="text-2xl font-semibold">
          {selectedActivity.title ?? "Refleksija"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {selectedActivity.description ?? "Užpildyk ir pateik atsakymus."}
        </p>
        {(selectedActivity.openAt || selectedActivity.closeAt) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Laiko langas:</span>
            {selectedActivity.openAt && (
              <span>
                nuo {new Date(selectedActivity.openAt).toLocaleString("lt-LT")}
              </span>
            )}
            {selectedActivity.closeAt && (
              <>
                <span>→</span>
                <span>
                  iki {new Date(selectedActivity.closeAt).toLocaleString("lt-LT")}
                </span>
              </>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {activities.map((activity) => {
            const isDisabled =
              activity.state === "PLANNED" || activity.state === "CLOSED";
            return (
              <div key={activity.id} className="flex flex-col gap-1">
                <Button
                  variant={activity.id === selectedId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedId(activity.id)}
                  disabled={isDisabled}
                >
                  {activity.title}
                </Button>
                {activity.state && (
                  <ActivityStatusBadge
                    status={activity.state}
                    openAt={activity.openAt}
                    closeAt={activity.closeAt}
                    timezone={activity.timezone}
                    variant="compact"
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progresas</span>
            <span className="text-sm font-semibold tabular-nums">
              {answeredCount}/{questionCount}
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{
                width: `${questionCount ? Math.min(100, (answeredCount / questionCount) * 100) : 0}%`,
              }}
            />
            {questionCount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground/70">
                {Math.round((answeredCount / questionCount) * 100)}%
              </div>
            )}
          </div>
          {questionCount > 1 && (
            <div className="flex flex-wrap gap-2">
              {selectedActivity.questionnaire.questions.map((q, idx) => {
                const isAnswered =
                  answers[q.id]?.status === "ANSWERED" || answers[q.id]?.status === "DECLINED";
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 w-8 rounded-full text-xs font-medium transition-all ${
                      isAnswered
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "bg-primary/20 text-primary ring-2 ring-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                    aria-label={`Klausimas ${idx + 1}: ${q.prompt}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Autosave į naršyklę kas ~0.4s, kad neprarastum atsakymų net be
          interneto.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Klausimai</CardTitle>
          <CardDescription>
            {selectedActivity.privacyMode === "ANONYMOUS"
              ? "Anoniminė refleksija."
              : "Vardinė refleksija."}
          </CardDescription>
          {selectedActivity.responses?.length ? (
            <Badge variant="secondary">Jau pateikta</Badge>
          ) : null}
          {selectedActivity.state && (
            <ActivityStatusBadge
              status={selectedActivity.state}
              openAt={selectedActivity.openAt}
              closeAt={selectedActivity.closeAt}
              timezone={selectedActivity.timezone}
            />
          )}
        </CardHeader>
    <CardContent className="space-y-4">
      {currentQuestion && (
        <QuestionField
          key={currentQuestion.id}
          question={currentQuestion}
          answer={answers[currentQuestion.id] ?? {}}
          onValueChange={(value) => setAnswerValue(currentQuestion.id, value)}
          onStatusChange={(status, prompts) =>
            setAnswerStatus(
              currentQuestion.id,
              status,
              prompts ??
                currentQuestion.followUp?.map((f) => f.prompt) ??
                undefined,
            )
          }
          onFollowUpChange={(index, value) =>
            setFollowUpAnswer(currentQuestion.id, index, value)
          }
        />
      )}
      {questionCount > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Klausimas {currentIndex + 1} / {questionCount}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={currentIndex === 0}>
              Atgal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={currentIndex >= questionCount - 1}
            >
              Toliau
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (selectedActivity.responses?.length ?? 0) > 0 ||
            selectedActivity.state === "PLANNED" ||
            selectedActivity.state === "CLOSED"
          }
        >
          {selectedActivity.responses?.length
            ? "Jau pateikta"
            : selectedActivity.state === "PLANNED"
              ? "Dar neatidaryta"
              : selectedActivity.state === "CLOSED"
                ? "Uždaryta"
                : "Pateikti atsakymus"}
        </Button>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mano istorija</CardTitle>
          <CardDescription>Vardinė istorija iš serverio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium">{item.activity.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.submittedAt ?? "—"}
                </p>
              </div>
              <Badge variant="muted">{item.activity.privacyMode}</Badge>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Dar neturi pateiktų vardinių refleksijų.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionField({
  question,
  answer,
  onValueChange,
  onStatusChange,
  onFollowUpChange,
}: {
  question: Question;
  answer: AnswerState;
  onValueChange: (val: unknown) => void;
  onStatusChange: (status: AnswerStatus, prompts?: string[]) => void;
  onFollowUpChange: (index: number, value: unknown) => void;
}) {
  const status = answer.status ?? "ANSWERED";
  const disabled = status === "DECLINED";
  const value = answer.value;
  const followUpPrompts =
    question.followUp?.map((f) => f.prompt) ??
    [
      "Kas trukdo atsakyti?",
      "Ką reikėtų paaiškinti?",
      "Kokios informacijos trūksta?",
    ];
  const followUps =
    answer.followUpAnswers ??
    followUpPrompts.map((prompt) => ({ prompt, value: "" }));

  const renderControl = () => {
    if (question.type === "TRAFFIC_LIGHT") {
      const config = question.config as { options?: Array<{ value: string; label: string }> } | undefined;
      const defaultCfg = defaultConfig("TRAFFIC_LIGHT") as { options: Array<{ value: string; label: string }> };
      const options =
        config?.options?.filter((opt) => opt.value && opt.label) ??
        defaultCfg.options;
      return (
        <div className="flex gap-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={value === option.value ? "default" : "outline"}
              onClick={() => onValueChange(option.value)}
              disabled={disabled}
            >
              {option.label}
            </Button>
          ))}
        </div>
      );
    }

    if (question.type === "EMOTION") {
      const config = question.config as { options?: Array<{ value: string; label: string }> } | undefined;
      const defaultCfg = defaultConfig("EMOTION") as { options: Array<{ value: string; label: string }> };
      const options =
        config?.options?.filter((opt) => opt.value && opt.label) ??
        defaultCfg.options;
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options.map((option) => (
              <Button
                key={option.value}
                variant={value === option.value ? "default" : "outline"}
                onClick={() => onValueChange(option.value)}
                disabled={disabled}
                className="justify-start"
              >
                {option.label}
              </Button>
            ))}
          </div>
          {options.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Emocijos neapibrėžtos (susisiekite su fasilitatoriumi).
            </p>
          )}
        </div>
      );
    }

    if (question.type === "SCALE" || question.type === "THERMOMETER") {
      const min = Number(question.config?.min ?? (question.type === "SCALE" ? 1 : 1));
      const max = Number(
        question.config?.max ?? (question.type === "SCALE" ? 5 : 10),
      );
      const step = Number(question.config?.step ?? 1);
      const displayValue =
        typeof value === "number" ? value : Number(value ?? min) || min;
      const statements =
        Array.isArray((question.config as { statements?: string[] } | undefined)?.statements)
          ? ((question.config as { statements?: string[] }).statements as string[])
          : [];

      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={displayValue}
              onChange={(e) => onValueChange(Number(e.target.value))}
              className="w-full accent-primary"
              disabled={disabled}
            />
            <span className="w-10 text-right text-sm text-muted-foreground">
              {displayValue}
            </span>
          </div>
          {statements.length > 0 && (
            <div className="space-y-1 text-xs text-muted-foreground">
              {statements.map((s, idx) => (
                <p key={idx}>• {s}</p>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (question.type === "MULTI_SELECT") {
      const options =
        (question.config as { options?: Array<{ value: string; label: string }> })
          ?.options ?? [];
      const selected = Array.isArray(value) ? (value as string[]) : [];
      const toggle = (opt: string) => {
        if (selected.includes(opt)) {
          onValueChange(selected.filter((v) => v !== opt));
        } else {
          onValueChange([...selected, opt]);
        }
      };
      return (
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                disabled={disabled}
              />
              {opt.label}
            </label>
          ))}
          {options.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Parinktys neapibrėžtos (susisiekite su fasilitatoriumi).
            </p>
          )}
        </div>
      );
    }

    if (question.type === "PIE_100") {
      const categories =
        (question.config as { categories?: Array<{ id?: string; label: string }> })
          ?.categories ?? [];
      const current =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as Record<string, number>)
          : {};
      const total = Object.values(current).reduce((sum, v) => sum + Number(v || 0), 0);
      const update = (key: string, val: number) => {
        const next = { ...current, [key]: val };
        onValueChange(next);
      };
      return (
        <div className="space-y-3">
          {categories.map((cat) => {
            const key = (cat.id ?? cat.label).trim().toLowerCase();
            const val = Number(current[key] ?? 0);
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{cat.label}</span>
                  <span className="text-muted-foreground">{val} / 100</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={val}
                  onChange={(e) => update(key, Number(e.target.value))}
                  className="w-full accent-primary"
                  disabled={disabled}
                />
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Kategorijos neapibrėžtos (susisiekite su fasilitatoriumi).
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Suma turi būti 100. Dabartinė suma:{" "}
            <span className={total === 100 ? "text-green-600" : "text-destructive"}>
              {total}
            </span>
          </p>
        </div>
      );
    }

    const placeholder =
      (question.config as { placeholder?: string })?.placeholder ??
      (question.type === "FREE_TEXT"
        ? (defaultConfig("FREE_TEXT") as { placeholder?: string }).placeholder
        : (defaultConfig("SENTENCE_COMPLETION") as { placeholder?: string }).placeholder) ??
      "";

    return (
      <div className="space-y-2">
        {question.type === "FREE_TEXT" ? (
          <Textarea
            value={(value as string) ?? ""}
            onChange={(e) => onValueChange(e.target.value)}
            rows={4}
            placeholder={placeholder || "Parašyk čia..."}
            disabled={disabled}
          />
        ) : (
          <Input
            value={(value as string) ?? ""}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder || "Baik sakinį..."}
            disabled={disabled}
          />
        )}
        {question.helperText && (
          <p className="text-xs text-muted-foreground">{question.helperText}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="flex items-center gap-2">
          {question.prompt}
          {question.required && <span className="text-destructive">*</span>}
        </Label>
      </div>

      {renderControl()}

      <UniversalAnswerActions
        questionId={question.id}
        currentStatus={status}
        followUpPrompts={followUpPrompts}
        followUpAnswers={followUps}
        onDecline={() => onStatusChange("DECLINED")}
        onUnknown={(prompts) => onStatusChange("UNKNOWN", prompts)}
        onFollowUpComplete={() => onStatusChange("ANSWERED")}
        onFollowUpChange={onFollowUpChange}
      />
    </div>
  );
}
