import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type QuestionType } from "@/lib/question-types";

type Question = {
  type: QuestionType;
  config?: Record<string, unknown>;
};

export function QuestionConfigEditor({
  question,
  onChange,
}: {
  question: Question;
  onChange: (config: Record<string, unknown>) => void;
}) {
  if (question.type === "SCALE" || question.type === "THERMOMETER") {
    const min = Number((question.config as { min?: number })?.min ?? 1);
    const max = Number(
      (question.config as { max?: number })?.max ?? (question.type === "SCALE" ? 5 : 10),
    );
    const step = Number((question.config as { step?: number })?.step ?? 1);
    const statements =
      (question.config as { statements?: string[] })?.statements ?? [];
    return (
      <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
        <Label>Skalė / Termometras</Label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            type="number"
            value={min}
            onChange={(e) =>
              onChange({ ...(question.config ?? {}), min: Number(e.target.value) })
            }
            placeholder="Min"
          />
          <Input
            type="number"
            value={max}
            onChange={(e) =>
              onChange({ ...(question.config ?? {}), max: Number(e.target.value) })
            }
            placeholder="Max"
          />
          <Input
            type="number"
            value={step}
            onChange={(e) =>
              onChange({ ...(question.config ?? {}), step: Number(e.target.value) })
            }
            placeholder="Žingsnis"
          />
        </div>
        <Label className="text-xs text-muted-foreground">
          Teiginiai (po vieną eilutėje, pasirinktinai)
        </Label>
        <Textarea
          rows={3}
          value={statements.join("\n")}
          onChange={(e) =>
            onChange({
              ...(question.config ?? {}),
              statements: e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </div>
    );
  }

  if (question.type === "MULTI_SELECT") {
    const options =
      (question.config as { options?: Array<{ value: string; label: string }> })
        ?.options ?? [];
    const minChoices = (question.config as { minChoices?: number })?.minChoices;
    const maxChoices = (question.config as { maxChoices?: number })?.maxChoices;
    const updateOption = (idx: number, value: string, label: string) => {
      const next = [...options];
      next[idx] = { value, label };
      onChange({ ...(question.config ?? {}), options: next });
    };
    return (
      <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <Label>Multi-select parinktys</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...(question.config ?? {}),
                options: [
                  ...options,
                  { value: `opt${options.length + 1}`, label: "Nauja parinktis" },
                ],
              })
            }
          >
            Pridėti parinktį
          </Button>
        </div>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={opt.value + idx} className="grid grid-cols-2 gap-2">
              <Input
                value={opt.label}
                onChange={(e) => updateOption(idx, opt.value, e.target.value)}
                placeholder="Label"
              />
              <Input
                value={opt.value}
                onChange={(e) => updateOption(idx, e.target.value, opt.label)}
                placeholder="Value"
              />
            </div>
          ))}
          {options.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Pridėkite bent 2 parinktis.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min pasirinkimų (nebūtina)"
            value={minChoices ?? ""}
            onChange={(e) =>
              onChange({
                ...(question.config ?? {}),
                minChoices: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <Input
            type="number"
            placeholder="Max pasirinkimų (nebūtina)"
            value={maxChoices ?? ""}
            onChange={(e) =>
              onChange({
                ...(question.config ?? {}),
                maxChoices: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>
    );
  }

  if (question.type === "PIE_100") {
    const categories =
      (question.config as { categories?: Array<{ id?: string; label: string }> })
        ?.categories ?? [];
    const updateCategory = (idx: number, label: string) => {
      const next = [...categories];
      next[idx] = { ...(next[idx] ?? {}), label };
      onChange({ ...(question.config ?? {}), categories: next });
    };
    return (
      <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <Label>Pyragas (100 taškų) kategorijos</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...(question.config ?? {}),
                categories: [...categories, { label: "Nauja kategorija" }],
              })
            }
          >
            Pridėti kategoriją
          </Button>
        </div>
        <div className="space-y-2">
          {categories.map((cat, idx) => (
            <Input
              key={`${cat.label}-${idx}`}
              value={cat.label}
              onChange={(e) => updateCategory(idx, e.target.value)}
              placeholder="Kategorijos pavadinimas"
            />
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Pridėkite bent 2 kategorijas (suma turi būti 100 pildant).
            </p>
          )}
        </div>
      </div>
    );
  }

  if (question.type === "TRAFFIC_LIGHT" || question.type === "EMOTION") {
    const options =
      (question.config as { options?: Array<{ value: string; label: string }> })
        ?.options ?? [];
    const updateOption = (idx: number, label: string, value: string) => {
      const next = [...options];
      next[idx] = { value, label };
      onChange({ ...(question.config ?? {}), options: next });
    };
    return (
      <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <Label>
            {question.type === "EMOTION" ? "Emocijų parinktys" : "Šviesoforo parinktys"}
          </Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...(question.config ?? {}),
                options: [
                  ...options,
                  {
                    value: `opt${options.length + 1}`,
                    label: "Nauja parinktis",
                  },
                ],
              })
            }
          >
            Pridėti parinktį
          </Button>
        </div>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={opt.value + idx} className="grid grid-cols-2 gap-2">
              <Input
                value={opt.label}
                onChange={(e) => updateOption(idx, e.target.value, opt.value)}
                placeholder="Label"
              />
              <Input
                value={opt.value}
                onChange={(e) => updateOption(idx, opt.label, e.target.value)}
                placeholder="Value"
              />
            </div>
          ))}
          {options.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Pridėkite bent 2–5 parinktis (pvz. žalia/geltona/raudona).
            </p>
          )}
        </div>
      </div>
    );
  }

  if (question.type === "SENTENCE_COMPLETION" || question.type === "FREE_TEXT") {
    const placeholder =
      (question.config as { placeholder?: string })?.placeholder ?? "";
    return (
      <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
        <Label>Teksto lauko nustatymai</Label>
        <Input
          placeholder="Placeholder (nebūtina)"
          value={placeholder}
          onChange={(e) =>
            onChange({
              ...(question.config ?? {}),
              placeholder: e.target.value || undefined,
            })
          }
        />
      </div>
    );
  }

  return null;
}
