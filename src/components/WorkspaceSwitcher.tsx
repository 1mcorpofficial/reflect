"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Workspace = {
  id: string;
  name: string;
  type: "ORGANIZATION" | "PERSONAL";
  slug: string | null;
  role: string;
  isActive: boolean;
};

export function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  async function fetchWorkspaces() {
    try {
      const res = await fetch("/api/workspaces");
      if (!res.ok) return;
      const data = await res.json();
      setWorkspaces(data.workspaces || []);
      const active = data.workspaces?.find((w: Workspace) => w.isActive);
      setActiveWorkspace(active || data.workspaces?.[0] || null);
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
    } finally {
      setLoading(false);
    }
  }

  async function switchWorkspace(workspaceId: string) {
    if (switching || workspaceId === activeWorkspace?.id) return;

    setSwitching(true);
    try {
      // Get CSRF token
      const csrfRes = await fetch("/api/csrf-token");
      if (!csrfRes.ok) {
        throw new Error("Failed to get CSRF token");
      }
      const { token: csrfToken } = await csrfRes.json();

      const res = await fetch(`/api/workspaces/${workspaceId}/switch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include", // Include cookies for CSRF
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || "Failed to switch workspace");
      }

      // Refresh the page to update all data
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch workspace:", error);
      alert(`Nepavyko perjungti workspace: ${error instanceof Error ? error.message : "Nežinoma klaida"}`);
    } finally {
      setSwitching(false);
    }
  }

  if (loading) {
    return (
      <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
    );
  }

  if (workspaces.length <= 1) {
    // Don't show switcher if user only has one workspace
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
        disabled={switching}
      >
        <span className="max-w-[120px] truncate">
          {activeWorkspace?.name || "Workspace"}
        </span>
        {activeWorkspace?.type === "PERSONAL" && (
          <Badge variant="secondary" className="text-xs">
            Personal
          </Badge>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-md border bg-popover shadow-lg">
            <div className="p-2">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Workspaces
              </p>
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => switchWorkspace(workspace.id)}
                  disabled={switching || workspace.isActive}
                  className={`w-full rounded-md px-2 py-2 text-left text-sm transition-colors ${
                    workspace.isActive
                      ? "bg-accent font-medium"
                      : "hover:bg-accent/50"
                  } ${switching ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{workspace.name}</span>
                    <div className="flex items-center gap-1">
                      {workspace.type === "PERSONAL" && (
                        <Badge variant="secondary" className="text-xs">
                          Personal
                        </Badge>
                      )}
                      {workspace.isActive && (
                        <span className="text-xs text-muted-foreground">●</span>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {workspace.role}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
