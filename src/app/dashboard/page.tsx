"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PrivacyGuardMessage } from "@/components/PrivacyGuardMessage";
import { fetchWithCsrf } from "@/lib/fetch-with-csrf";

type Group = {
  id: string;
  name: string;
  description?: string | null;
  code?: string;
};

type Activity = {
  id: string;
  title: string;
  status: string;
  privacyMode: "NAMED" | "ANONYMOUS";
  openAt?: string | null;
  closeAt?: string | null;
  timezone?: string | null;
};

type Participant = {
  membershipId: string;
  participantId?: string;
  displayName: string;
  email?: string | null;
  joinedAt?: string | null;
};

type QuestionAnalytics = {
  questionId: string;
  prompt: string;
  type: string;
  responses: number;
  answeredCount?: number;
  unknownCount?: number;
  declinedCount?: number;
  average: number | null;
  distribution: Record<string, number>;
};

type Analytics = {
  activityId: string;
  totalParticipants: number;
  totalResponses: number;
  completionRate: number;
  perQuestion: QuestionAnalytics[];
  trend?: Array<{ date: string; responses: number; completionRate: number }>;
};

type ExportResponse = {
  responses?: Array<{ participantId?: string } & Record<string, unknown>>;
};

type ResponseAnswer = {
  questionId: string;
  prompt: string;
  status?: string | null;
  value?: unknown;
  meta?: unknown;
};

type ResponseItem = {
  id: string;
  submittedAt?: string | null;
  participant?: { id: string; displayName: string; email?: string | null } | null;
  answers: ResponseAnswer[];
};

type ResponsesPayload = {
  responses: ResponseItem[];
  privacyMode: "NAMED" | "ANONYMOUS";
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Kraunama...</p>}>
      <DashboardBody />
    </Suspense>
  );
}

function DashboardBody() {
  const searchParams = useSearchParams();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityId, setActivityId] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pending, setPending] = useState<Participant[]>([]);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [privacyNotice, setPrivacyNotice] = useState<{
    reason: "min_count";
    minCount: number;
    currentCount?: number;
  } | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [responsesStatus, setResponsesStatus] = useState<string | null>(null);
  const [responsesNotice, setResponsesNotice] = useState<{
    reason: "min_count";
    minCount: number;
    currentCount?: number;
  } | null>(null);

  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === activityId),
    [activities, activityId],
  );

  const filteredActivities = useMemo(() => {
    if (statusFilter === "ALL") return activities;
    return activities.filter((a) => a.status === statusFilter);
  }, [activities, statusFilter]);

  const buildPrivacyMessage = useCallback((data: Record<string, unknown>) => {
    const raw = String(data.details ?? "");
    const match = raw.match(/(\d+)/);
    const min = Number(data.minCount ?? match?.[1] ?? "5");
    const current = typeof data.currentCount === "number" ? data.currentCount : undefined;
    return {
      reason: "min_count" as const,
      minCount: min,
      currentCount: current,
    };
  }, []);

  const buildAnalyticsUrl = useCallback((id: string) => {
    const params = new URLSearchParams();
    if (fromDate) {
      const from = new Date(`${fromDate}T00:00:00`);
      if (!Number.isNaN(from.getTime())) {
        params.set("from", from.toISOString());
      }
    }
    if (toDate) {
      const to = new Date(`${toDate}T23:59:59`);
      if (!Number.isNaN(to.getTime())) {
        params.set("to", to.toISOString());
      }
    }
    const query = params.toString();
    return query ? `/api/activities/${id}/analytics?${query}` : `/api/activities/${id}/analytics`;
  }, [fromDate, toDate]);

  const loadGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/groups");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Nepavyko gauti grupių");
      }
      const data = await res.json();
      const list = (data.groups ?? []) as Group[];
      setGroups(list);
      if (!groupId && list.length > 0) {
        setGroupId(list[0].id);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nepavyko gauti grupių");
    }
  }, [groupId]);

  const loadActivities = useCallback(async (targetGroupId: string) => {
    try {
      const res = await fetchWithCsrf(`/api/groups/${targetGroupId}/activities`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Nepavyko gauti veiklų");
      }
      const data = await res.json();
      const list = (data.activities ?? []) as Activity[];
      setActivities(list);
      if (!activityId && list.length > 0) {
        setActivityId(list[0].id);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nepavyko gauti veiklų");
    }
  }, [activityId]);

  const loadParticipants = useCallback(async (targetGroupId: string) => {
    try {
      const res = await fetchWithCsrf(`/api/groups/${targetGroupId}/participants`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Nepavyko gauti dalyvių");
      }
      const data = await res.json();
      setParticipants((data.participants ?? []) as Participant[]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nepavyko gauti dalyvių");
    }
  }, []);

  const loadAnalytics = useCallback(
    async (targetId?: string) => {
      const id = targetId ?? activityId;
      if (!id) return;
      setStatus("Kraunama...");
      setPrivacyNotice(null);
      try {
        const res = await fetchWithCsrf(buildAnalyticsUrl(id));
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 403 && String(data.error ?? "").includes("Not enough")) {
            setPrivacyNotice(buildPrivacyMessage(data as Record<string, unknown>));
            setStatus(null);
            setAnalytics(null);
            return;
          }
          throw new Error(data.error ?? "Nepavyko gauti analitikos");
        }
        const data = (await res.json()) as Analytics;
        setAnalytics(data);
        setStatus(null);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Įvyko klaida");
        setAnalytics(null);
      }
    },
    [activityId, buildAnalyticsUrl, buildPrivacyMessage],
  );

  const loadPending = useCallback(async () => {
    if (!activityId || !groupId) return;
    if (selectedActivity?.privacyMode === "ANONYMOUS") {
      setPending([]);
      setPendingStatus("Anon režime vardiniai sąrašai nerodomi.");
      return;
    }
    setPendingStatus("Kraunama...");
    try {
      const res = await fetchWithCsrf(`/api/activities/${activityId}/export?format=json`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403 && String(data.error ?? "").includes("Not enough")) {
          setPrivacyNotice(buildPrivacyMessage(data as Record<string, unknown>));
          setPendingStatus("Nepakanka atsakymų anoniminiam režimui.");
          return;
        }
        throw new Error(data.error ?? "Nepavyko gauti atsakymų");
      }
      const data = (await res.json()) as ExportResponse;
      const respondedIds = new Set(
        (data.responses ?? [])
          .map((row) => row.participantId)
          .filter((id): id is string => Boolean(id)),
      );
      const pendingList = participants.filter(
        (p) => p.participantId && !respondedIds.has(p.participantId),
      );
      setPending(pendingList);
      setPendingStatus(
        pendingList.length > 0
          ? null
          : "Visi pateikė arba nėra dalyvių.",
      );
    } catch (error) {
      setPendingStatus(error instanceof Error ? error.message : "Nepavyko gauti sąrašo");
    }
  }, [activityId, groupId, participants, selectedActivity, buildPrivacyMessage]);

  const loadResponses = useCallback(async () => {
    if (!activityId) return;
    setResponsesStatus("Kraunama...");
    setResponsesNotice(null);
    try {
      const res = await fetchWithCsrf(`/api/activities/${activityId}/responses`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403 && String(data.error ?? "").includes("Not enough")) {
          setResponsesNotice(buildPrivacyMessage(data as Record<string, unknown>));
          setResponsesStatus("Nepakanka atsakymų anoniminiam režimui.");
          return;
        }
        throw new Error(data.error ?? "Nepavyko gauti atsakymų");
      }
      const data = (await res.json()) as ResponsesPayload;
      setResponses(data.responses ?? []);
      setResponsesStatus(
        data.responses && data.responses.length > 0 ? null : "Nėra atsakymų.",
      );
    } catch (error) {
      setResponsesStatus(
        error instanceof Error ? error.message : "Nepavyko gauti atsakymų",
      );
    }
  }, [activityId, buildPrivacyMessage]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!groupId) return;
    void loadActivities(groupId);
    void loadParticipants(groupId);
  }, [groupId, loadActivities, loadParticipants]);

  useEffect(() => {
    if (!activityId) return;
    if (!filteredActivities.find((a) => a.id === activityId)) {
      setActivityId(filteredActivities[0]?.id ?? "");
    }
  }, [activityId, filteredActivities]);

  useEffect(() => {
    const fromQuery = searchParams.get("activityId");
    if (fromQuery) {
      setActivityId(fromQuery);
      void loadAnalytics(fromQuery);
    }
  }, [searchParams, loadAnalytics]);

  useEffect(() => {
    if (!activityId) return;
    void loadAnalytics(activityId);
    setPending([]);
    setPendingStatus(null);
    setResponses([]);
    setResponsesStatus(null);
    setResponsesNotice(null);
  }, [activityId, loadAnalytics]);

  const formatAnswerValue = (answer: ResponseAnswer) => {
    if (answer.status && answer.status !== "ANSWERED") {
      return answer.status === "DECLINED" ? "Nenoriu atsakyti" : "Nežinau";
    }
    if (answer.value === null || answer.value === undefined) return "-";
    if (typeof answer.value === "string" || typeof answer.value === "number") {
      return String(answer.value);
    }
    return JSON.stringify(answer.value);
  };

  const extractFollowUps = (answer: ResponseAnswer) => {
    const meta = answer.meta as { followUpAnswers?: Array<{ prompt: string; value: unknown }> } | null;
    return meta?.followUpAnswers ?? [];
  };

  const handleExport = async (format: "csv" | "pdf" | "xlsx") => {
    if (!activityId) return;
    setExportStatus("Paruošiama...");
    setPrivacyNotice(null);
    try {
      const res = await fetchWithCsrf(
        `/api/activities/${activityId}/export?format=${format}`,
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403 && String(data.error ?? "").includes("Not enough")) {
          setPrivacyNotice(buildPrivacyMessage(data as Record<string, unknown>));
          setExportStatus("Nepakanka atsakymų anoniminiam režimui.");
          return;
        }
        throw new Error(data.error ?? `Nepavyko parsiųsti ${format.toUpperCase()}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-${activityId}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setExportStatus(`${format.toUpperCase()} paruoštas.`);
    } catch (error) {
      setExportStatus(
        error instanceof Error
          ? error.message
          : `Nepavyko parsiųsti ${format.toUpperCase()}`,
      );
    } finally {
      setTimeout(() => setExportStatus(null), 1500);
    }
  };

  return (
    <div className="page-shell flex max-w-6xl flex-col gap-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="muted">Dashboard</Badge>
            <span className="text-sm text-muted-foreground">
              Completion, pasiskirstymai, tendencijos
            </span>
          </div>
          <h1 className="text-2xl font-semibold">Mokytojo suvestinė</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrai</CardTitle>
          <CardDescription>Pasirinkite grupę ir veiklą.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label>Grupė</Label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Pasirinkite grupę</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Veikla</Label>
            <select
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Pasirinkite veiklą</option>
              {filteredActivities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Statusas</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">Visi</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Nuo</Label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Iki</Label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-end gap-2 sm:col-span-4">
            <Button onClick={() => loadAnalytics()} disabled={!activityId}>
              Atnaujinti analitiką
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("csv")}
              disabled={!activityId}
            >
              Eksportuoti CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("pdf")}
              disabled={!activityId}
            >
              Eksportuoti PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("xlsx")}
              disabled={!activityId}
            >
              Eksportuoti XLSX
            </Button>
          </div>
          {selectedActivity && (
            <div className="space-y-1 text-xs text-muted-foreground sm:col-span-4">
              <div>Statusas: {selectedActivity.status}</div>
              {selectedActivity.openAt && (
                <div>Atidaryta nuo: {new Date(selectedActivity.openAt).toLocaleString()}</div>
              )}
              {selectedActivity.closeAt && (
                <div>Uždaryta po: {new Date(selectedActivity.closeAt).toLocaleString()}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {groups.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nėra grupių</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sukurkite grupę prieš analizuojant refleksijas.
          </CardContent>
        </Card>
      )}

      {status && <p className="text-sm text-muted-foreground">{status}</p>}
      {exportStatus && <p className="text-sm text-muted-foreground">{exportStatus}</p>}
      {privacyNotice && (
        <PrivacyGuardMessage
          reason={privacyNotice.reason}
          minCount={privacyNotice.minCount}
          currentCount={privacyNotice.currentCount}
        />
      )}

      {!activityId && groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pasirinkite veiklą</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Pasirinkus veiklą, bus rodoma suvestinė ir eksportas.
          </CardContent>
        </Card>
      )}

      {analytics && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Užpildymas</CardTitle>
              <CardDescription>
                Pateiktos refleksijos / grupės dalyvių skaičius.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-4xl font-semibold">
                {(analytics.completionRate * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.totalResponses} ats. iš {analytics.totalParticipants} dalyvių
              </p>
              <p className="text-sm text-muted-foreground">
                Neužpildė: {Math.max(0, analytics.totalParticipants - analytics.totalResponses)}
              </p>
              <div className="h-3 w-full rounded-full bg-muted">
                <div
                  className="h-3 rounded-full bg-primary"
                  style={{ width: `${Math.min(100, analytics.completionRate * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Greita suvestinė</CardTitle>
              <CardDescription>
                Vidurkiai skaitiniams klausimams, pasiskirstymai tekstiniams.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.perQuestion.slice(0, 2).map((q) => (
                <div key={q.questionId} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">{q.prompt}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.responses} atsakymų
                  </p>
                  {q.average !== null && (
                    <p className="text-sm">
                      Vidurkis: <span className="font-semibold">{q.average.toFixed(2)}</span>
                    </p>
                  )}
                </div>
              ))}
              {analytics.perQuestion.length === 0 && (
                <p className="text-xs text-muted-foreground">Nėra klausimų.</p>
              )}
            </CardContent>
          </Card>

          {analytics.trend && analytics.trend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tendencija</CardTitle>
                <CardDescription>
                  Atsakymų skaičius per laiką pagal pasirinktą periodą.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.trend.map((point) => (
                  <div key={point.date} className="flex items-center gap-3 text-xs">
                    <span className="min-w-[90px] text-muted-foreground">
                      {point.date}
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, point.completionRate * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground">
                      {point.responses} ats.
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Kas nepildė</CardTitle>
              <CardDescription>
                Vardinis režimas rodo sąrašą, anon režime – tik skaičius.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={loadPending}
                disabled={!activityId || !groupId}
              >
                Atnaujinti sąrašą
              </Button>
              {pendingStatus && (
                <p className="text-xs text-muted-foreground">{pendingStatus}</p>
              )}
              {pending.length > 0 && (
                <div className="space-y-2">
                  {pending.map((p) => (
                    <div key={p.membershipId} className="rounded-lg border border-border p-2">
                      <p className="text-sm font-medium">{p.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.email ?? "el. paštas nenurodytas"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Per klausimą</CardTitle>
              <CardDescription>Pasiskirstymai ir vidurkiai.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.perQuestion.map((q) => (
                <div key={q.questionId} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{q.prompt}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.responses} ats.
                      </p>
                    </div>
                    {q.average !== null && (
                      <Badge variant="secondary">Vidurkis {q.average.toFixed(2)}</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Atsakyta: {q.answeredCount ?? q.responses}</span>
                    <span>Nežinau: {q.unknownCount ?? 0}</span>
                    <span>Nenoriu atsakyti: {q.declinedCount ?? 0}</span>
                  </div>
                  <QuestionDistribution question={q} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activityId && !analytics && !status && !privacyNotice && (
        <Card>
          <CardHeader>
            <CardTitle>Nėra suvestinių</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Dar nėra pateiktų refleksijų arba duomenys dar nepaskaičiuoti.
          </CardContent>
        </Card>
      )}

      {activityId && (
        <Card>
          <CardHeader>
            <CardTitle>Atsakymai</CardTitle>
            <CardDescription>
              Peržiūrėkite pateiktus atsakymus (vardinis režimas rodo dalyvį).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={loadResponses} disabled={!activityId}>
                Krauti atsakymus
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setResponses([]);
                  setResponsesStatus(null);
                  setResponsesNotice(null);
                }}
              >
                Išvalyti
              </Button>
            </div>
            {responsesStatus && (
              <p className="text-xs text-muted-foreground">{responsesStatus}</p>
            )}
            {responsesNotice && (
              <PrivacyGuardMessage
                reason={responsesNotice.reason}
                minCount={responsesNotice.minCount}
                currentCount={responsesNotice.currentCount}
              />
            )}
            {responses.length > 0 && (
              <div className="space-y-4">
                {responses.map((resp) => (
                  <div key={resp.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {resp.participant?.displayName ?? "Anoniminis atsakymas"}
                        </p>
                        {resp.participant ? (
                          <p className="text-xs text-muted-foreground">
                            {resp.participant.email ?? "el. paštas nenurodytas"}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Anoniminis režimas</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {resp.submittedAt
                          ? new Date(resp.submittedAt).toLocaleString()
                          : "data nežinoma"}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {resp.answers.map((answer) => {
                        const followUps = extractFollowUps(answer);
                        return (
                          <div
                            key={`${resp.id}-${answer.questionId}`}
                            className="rounded-lg border border-dashed border-border bg-muted/30 p-3"
                          >
                            <p className="text-xs text-muted-foreground">{answer.prompt}</p>
                            <p className="text-sm font-medium">
                              {formatAnswerValue(answer)}
                            </p>
                            {followUps.length > 0 && (
                              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                {followUps.map((followUp, idx) => (
                                  <div key={`${resp.id}-${answer.questionId}-${idx}`}>
                                    {followUp.prompt}: {String(followUp.value ?? "")}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QuestionDistribution({ question }: { question: QuestionAnalytics }) {
  const entries = Object.entries(question.distribution);
  if (entries.length === 0) {
    return <p className="mt-2 text-xs text-muted-foreground">Nėra atsakymų</p>;
  }
  const maxVal = Math.max(...entries.map(([, v]) => Number(v) || 0), 1);
  const isPie = question.type === "PIE_100";

  return (
    <div className="mt-3 space-y-2">
      {entries.map(([key, val]) => {
        const numeric = Number(val) || 0;
        const width = Math.min(100, (numeric / maxVal) * 100);
        return (
          <div key={key} className="flex items-center gap-2">
            <div className="min-w-[100px] text-xs text-muted-foreground">{key}</div>
            <div className="h-2 flex-1 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="text-xs tabular-nums">
              {numeric}
              {isPie ? "%" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
