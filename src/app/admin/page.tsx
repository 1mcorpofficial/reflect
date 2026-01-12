"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWithCsrf } from "@/lib/fetch-with-csrf";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AuditLog = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  actorUserId: string | null;
  actorParticipantId: string | null;
  createdAt: string;
  metadata?: unknown;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  groupCount: number;
};

type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  orgCount: number;
  activityCount: number;
  groupCount: number;
};

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userActionStatus, setUserActionStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json().catch(() => ({}));
        setIsAdmin(Boolean(data.isAdmin));
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthChecked(true);
      }
    };
    void checkAdmin();
  }, []);

  const healthKey = isAdmin ? "/api/admin/health" : null;
  const auditKey = isAdmin ? "/api/admin/audit" : null;
  const orgsKey = isAdmin ? "/api/admin/orgs" : null;
  const usersKey = isAdmin ? "/api/admin/users" : null;

  const {
    data: health,
    error: healthError,
    isLoading: healthLoading,
    mutate: reloadHealth,
  } = useSWR(healthKey, fetcher);
  const {
    data: audit,
    error: auditError,
    isLoading: auditLoading,
    mutate: reloadAudit,
  } = useSWR(auditKey, fetcher);
  const { data: orgs, error: orgsError, isLoading: orgsLoading } = useSWR(
    orgsKey,
    fetcher,
  );
  const {
    data: users,
    error: usersError,
    isLoading: usersLoading,
    mutate: reloadUsers,
  } = useSWR(
    usersKey,
    fetcher,
  );

  const handleExportUser = async (userId: string) => {
    setUserActionStatus("Paruošiama...");
    try {
      const res = await fetchWithCsrf(`/api/admin/users/${userId}/export`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Nepavyko eksportuoti");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `user-${userId}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setUserActionStatus("Eksportas paruoštas.");
    } catch (error) {
      setUserActionStatus(error instanceof Error ? error.message : "Nepavyko eksportuoti");
    } finally {
      setTimeout(() => setUserActionStatus(null), 1500);
    }
  };

  const handleAnonymizeUser = async (userId: string) => {
    if (!confirm("Ar tikrai anonimizuoti vartotoją?")) return;
    setUserActionStatus("Anonimizuojama...");
    try {
      const res = await fetchWithCsrf(`/api/admin/users/${userId}/anonymize`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Nepavyko anonimizuoti");
      }
      await reloadUsers();
      setUserActionStatus("Vartotojas anonimizuotas.");
    } catch (error) {
      setUserActionStatus(error instanceof Error ? error.message : "Nepavyko anonimizuoti");
    } finally {
      setTimeout(() => setUserActionStatus(null), 1500);
    }
  };

  if (!authChecked) {
    return (
      <div className="page-shell max-w-3xl py-10 text-sm text-muted-foreground">
        Tikrinama administratoriaus prieiga...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-shell flex max-w-3xl flex-col gap-4 py-10">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Neturite administratoriaus teisių.
        </p>
        <Button asChild variant="outline" size="sm">
          <a href="/dashboard">Grįžti į dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="page-shell flex max-w-5xl flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => reloadHealth()}>
            Reload health
          </Button>
          <Button size="sm" variant="outline" onClick={() => reloadAudit()}>
            Reload audit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {healthLoading && <p className="text-sm text-muted-foreground">Kraunama...</p>}
          {healthError && (
            <p className="text-sm text-destructive">Nepavyko: {healthError.message}</p>
          )}
          {health && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="outline">DB: {health.db ?? "unknown"}</Badge>
              <span>Migrations: {health.migrations}</span>
              <span>Timestamp: {health.timestamp}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {auditLoading && <p className="text-sm text-muted-foreground">Kraunama...</p>}
          {auditError && (
            <p className="text-sm text-destructive">Nepavyko: {auditError.message}</p>
          )}
          {audit?.logs?.length ? (
            <div className="space-y-2">
              {audit.logs.map((log: AuditLog) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-border p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{log.action}</Badge>
                    <span className="text-muted-foreground">
                      {log.targetType} {log.targetId ?? ""}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    User: {log.actorUserId ?? "-"} | Participant: {log.actorParticipantId ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {log.createdAt}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nėra audit įrašų.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organizacijos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {orgsLoading && <p className="text-muted-foreground">Kraunama...</p>}
          {orgsError && (
            <p className="text-destructive">Nepavyko: {orgsError.message}</p>
          )}
          {orgs?.organizations?.length ? (
            <div className="space-y-2">
              {orgs.organizations.map((org: Organization) => (
                <div key={org.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{org.name}</Badge>
                    <span className="text-xs text-muted-foreground">Slug: {org.slug}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Groups: {org.groupCount} | Members: {org.memberCount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nėra organizacijų.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vartotojai</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {usersLoading && <p className="text-muted-foreground">Kraunama...</p>}
          {usersError && (
            <p className="text-destructive">Nepavyko: {usersError.message}</p>
          )}
          {userActionStatus && (
            <p className="text-xs text-muted-foreground">{userActionStatus}</p>
          )}
          {users?.users?.length ? (
            <div className="space-y-2">
              {users.users.map((user: User) => (
                <div key={user.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{user.email ?? user.id}</Badge>
                    {user.name && <span>{user.name}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Orgs: {user.orgCount} | Created: {user.createdAt}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportUser(user.id)}
                    >
                      Export JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAnonymizeUser(user.id)}
                    >
                      Anonimizuoti
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nėra vartotojų.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
