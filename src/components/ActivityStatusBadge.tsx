"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, XCircle, CheckCircle2 } from "lucide-react";

type ActivityStatus = "OPEN" | "PLANNED" | "CLOSED" | "DRAFT" | "OTHER";

type ActivityStatusBadgeProps = {
  status: ActivityStatus;
  openAt?: string | null;
  closeAt?: string | null;
  timezone?: string | null;
  variant?: "default" | "compact";
};

export function ActivityStatusBadge({
  status,
  openAt,
  closeAt,
  timezone,
  variant = "default",
}: ActivityStatusBadgeProps) {
  const openDate = openAt ? new Date(openAt) : null;
  const closeDate = closeAt ? new Date(closeAt) : null;

  const formatDateTime = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleString("lt-LT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone ?? undefined,
    });
  };

  if (status === "OPEN") {
    return (
      <Badge variant="default" className="gap-1.5 bg-green-600 hover:bg-green-700">
        <CheckCircle2 className="h-3 w-3" />
        <span>Atvira</span>
        {closeDate && variant === "default" && (
          <span className="text-xs opacity-90">
            (užsidarys {formatDateTime(closeDate)})
          </span>
        )}
      </Badge>
    );
  }

  if (status === "PLANNED") {
    return (
      <Badge variant="outline" className="gap-1.5 border-blue-300 text-blue-700">
        <Clock className="h-3 w-3" />
        <span>Neatidaryta</span>
        {openDate && variant === "default" && (
          <span className="text-xs opacity-80">
            (atsidarys {formatDateTime(openDate)})
          </span>
        )}
      </Badge>
    );
  }

  if (status === "CLOSED") {
    return (
      <Badge variant="outline" className="gap-1.5 border-gray-300 text-gray-600">
        <XCircle className="h-3 w-3" />
        <span>Uždaryta</span>
        {closeDate && variant === "default" && (
          <span className="text-xs opacity-80">
            (užsidarė {formatDateTime(closeDate)})
          </span>
        )}
      </Badge>
    );
  }

  if (status === "DRAFT") {
    return (
      <Badge variant="outline" className="gap-1.5 border-amber-300 text-amber-700">
        <Calendar className="h-3 w-3" />
        <span>Juodraštis</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5">
      <span>Neaktyvi</span>
    </Badge>
  );
}
