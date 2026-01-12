"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

type WorkspaceInfo = {
  workspace: {
    id: string;
    name: string;
    type: "ORGANIZATION" | "PERSONAL";
    slug: string | null;
  } | null;
  workspaceRole: string | null;
  isAdmin: boolean;
};

export function WorkspaceInfo() {
  const [info, setInfo] = useState<WorkspaceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfo();
  }, []);

  async function fetchInfo() {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return;
      const data = await res.json();
      setInfo({
        workspace: data.workspace,
        workspaceRole: data.workspaceRole,
        isAdmin: data.isAdmin,
      });
    } catch (error) {
      console.error("Failed to fetch workspace info:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !info?.workspace) {
    return null;
  }

  const roleLabels: Record<string, string> = {
    ORG_ADMIN: "Admin",
    STAFF: "Staff",
    PARTICIPANT: "Dalyvis",
    OWNER: "Savininkas",
    MEMBER: "Narys",
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {info.workspace.type === "ORGANIZATION" && (
        <Badge variant="outline" className="text-xs">
          Organizacija
        </Badge>
      )}
      {info.workspace.type === "PERSONAL" && (
        <Badge variant="secondary" className="text-xs">
          Personal
        </Badge>
      )}
      {info.workspaceRole && (
        <span className="text-xs">
          {roleLabels[info.workspaceRole] || info.workspaceRole}
        </span>
      )}
      {info.isAdmin && (
        <Badge variant="default" className="text-xs">
          Super Admin
        </Badge>
      )}
    </div>
  );
}
