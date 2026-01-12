"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PrivacyGuardMessageProps = {
  reason: "min_count" | "anonymous_mode";
  minCount?: number;
  currentCount?: number;
  suggestions?: string[];
};

export function PrivacyGuardMessage({
  reason,
  minCount = 5,
  currentCount,
  suggestions,
}: PrivacyGuardMessageProps) {
  const defaultSuggestions = [
    "Palaukite daugiau atsakymų",
    "Arba pakeiskite privacy mode į NAMED (jei galima)",
  ];

  const finalSuggestions = suggestions ?? defaultSuggestions;

  if (reason === "min_count") {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30">
                  Privatumo apsauga
                </Badge>
              </div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Per mažai atsakymų anoniminiam režimui
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Reikia bent <strong>{minCount}</strong> atsakymų anoniminiam režimui dėl privatumo
                apsaugos.
                {currentCount !== undefined && (
                  <> Dabar yra <strong>{currentCount}</strong> atsakymų.</>
                )}
              </p>
              {finalSuggestions.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    Ką daryti:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-amber-700 dark:text-amber-300">
                    {finalSuggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
