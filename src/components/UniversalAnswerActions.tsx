"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type AnswerStatus = "ANSWERED" | "UNKNOWN" | "DECLINED";

type UniversalAnswerActionsProps = {
  questionId: string;
  currentStatus?: AnswerStatus;
  followUpPrompts?: string[];
  followUpAnswers?: Array<{ prompt: string; value: unknown }>;
  onDecline: () => void;
  onUnknown: (prompts?: string[]) => void;
  onFollowUpComplete: () => void;
  onFollowUpChange: (index: number, value: unknown) => void;
  disabled?: boolean;
};

export function UniversalAnswerActions({
  questionId,
  currentStatus,
  followUpPrompts = [],
  followUpAnswers = [],
  onDecline,
  onUnknown,
  onFollowUpComplete,
  onFollowUpChange,
  disabled = false,
}: UniversalAnswerActionsProps) {
  const isUnknown = currentStatus === "UNKNOWN";
  const isDeclined = currentStatus === "DECLINED";
  const isAnswered = currentStatus === "ANSWERED";

  return (
    <div className="space-y-3">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Button
          size="sm"
          variant={isAnswered ? "default" : "outline"}
          onClick={() => {
            if (!isAnswered) {
              onFollowUpComplete();
            }
          }}
          disabled={disabled}
          type="button"
        >
          Atsakysiu
        </Button>
        <Button
          size="sm"
          variant={isUnknown ? "default" : "outline"}
          onClick={() => onUnknown(followUpPrompts)}
          disabled={disabled}
          type="button"
        >
          Nežinau
        </Button>
        <Button
          size="sm"
          variant={isDeclined ? "default" : "outline"}
          onClick={onDecline}
          disabled={disabled}
          type="button"
        >
          Nenoriu atsakyti
        </Button>
      </div>

      {/* Follow-up section for UNKNOWN */}
      {isUnknown && followUpPrompts && followUpPrompts.length > 0 && (
        <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">
            Padėk sau atsakyti: trumpi follow-up klausimai (iki 2).
          </p>
          {followUpPrompts.slice(0, 2).map((prompt, idx) => (
            <div key={`${questionId}-followup-${idx}`} className="space-y-1">
              <Label className="text-sm">{prompt}</Label>
              <Textarea
                rows={2}
                value={(followUpAnswers[idx]?.value as string) ?? ""}
                onChange={(e) => onFollowUpChange(idx, e.target.value)}
                disabled={disabled}
                placeholder="Parašyk čia..."
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Užpildę, grįžkite ir pasirinkite atsakymą arba &ldquo;Nenoriu atsakyti&rdquo;.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onFollowUpComplete}
            disabled={disabled}
          >
            Grįžti prie klausimo
          </Button>
        </div>
      )}
    </div>
  );
}
