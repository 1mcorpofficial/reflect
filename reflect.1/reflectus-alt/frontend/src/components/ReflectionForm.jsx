import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../lib/api.js";
import { clearDraft, loadDraft, saveDraft } from "../lib/storage.js";
import { Button, Card, Input, Textarea, Badge } from "./ui";

const ratingOptions = [
  { value: 1, label: "Blogai" },
  { value: 2, label: "Silpnai" },
  { value: 3, label: "Vidutiniškai" },
  { value: 4, label: "Gerai" },
  { value: 5, label: "Puikiai" }
];

export default function ReflectionForm({ template, user, onSubmitted, onCancel, extraPayload = {} }) {
  const draftKey = `${user.id}-${template.id}-${extraPayload.assignmentId || "free"}`;
  const cached = useMemo(() => loadDraft(draftKey) || {}, [draftKey]);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const debounceRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(template.schema),
    defaultValues: cached
  });

  const { register, handleSubmit, watch, formState, getValues, setValue } = form;
  const { errors } = formState;

  useEffect(() => {
    const subscription = watch((value) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveDraft(draftKey, value);
      }, 2000);
    });
    return () => subscription.unsubscribe();
  }, [watch, draftKey]);

  function filledRequiredCount() {
    const requiredFields = template.fields.filter(f => f.required);
    return requiredFields.filter(f => {
      const v = getValues()[f.key];
      if (typeof v === "number") return !Number.isNaN(v);
      if (typeof v === "boolean") return v === true;
      return Boolean(v && String(v).trim().length);
    }).length;
  }

  const requiredTotal = template.fields.filter(f => f.required).length;
  const progress = requiredTotal ? Math.round((filledRequiredCount() / requiredTotal) * 100) : 100;

  function renderField(field) {
    const common = {
      ...register(field.key, { valueAsNumber: field.type === "rating" ? true : undefined })
    };

    if (field.type === "rating") {
      const current = watch(field.key);
      return (
        <div className="space-y-2" key={field.key}>
          <input type="hidden" {...common} />
          <label className="flex items-center justify-between text-sm font-medium text-slate-800">
            <span>{field.label}</span>
            {field.required ? <Badge color="blue">Privaloma</Badge> : null}
          </label>
          <div className="flex flex-wrap gap-2">
            {ratingOptions.map(opt => {
              const active = Number(current) === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue(field.key, opt.value, { shouldValidate: true })}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                    active ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="font-semibold">{opt.value}</span>
                  <span className="text-xs text-slate-500">{opt.label}</span>
                </button>
              );
            })}
          </div>
          {errors?.[field.key] ? (
            <div className="text-xs text-rose-600">Pasirinkite vertinimą 1–5.</div>
          ) : null}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div className="space-y-2" key={field.key}>
          <label className="flex items-center justify-between text-sm font-medium text-slate-800">
            <span>{field.label}</span>
            {field.required ? <Badge color="blue">Privaloma</Badge> : null}
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            {...register(field.key)}
          >
            <option value="">Pasirinkite...</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors?.[field.key] ? (
            <div className="text-xs text-rose-600">Šis laukas privalomas.</div>
          ) : null}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <div className="space-y-2" key={field.key}>
          <label className="text-sm font-medium text-slate-800">{field.label}</label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <input type="checkbox" className="h-4 w-4" {...register(field.key)} />
            <span className="text-sm text-slate-700">Pažymėti</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2" key={field.key}>
        <label className="flex items-center justify-between text-sm font-medium text-slate-800">
          <span>{field.label}</span>
          {field.required ? <Badge color="blue">Privaloma</Badge> : null}
        </label>
        {field.type === "textarea" ? (
          <Textarea rows={4} placeholder={field.label} className="min-h-[120px]" {...common} />
        ) : (
          <Input placeholder={field.label} {...common} />
        )}
        {errors?.[field.key] ? (
          <div className="text-xs text-rose-600">Šis laukas privalomas.</div>
        ) : null}
      </div>
    );
  }

  async function submit(values) {
    setSubmitting(true);
    setMessage("");
    try {
      const payload = {
        templateId: template.id,
        studentId: user.id,
        classId: extraPayload.classId ?? user.classId ?? null,
        answers: values,
        status: "submitted",
        ...extraPayload
      };
      if (values.mood) payload.mood = values.mood;
      const { item } = await api.createReflection(payload);
      clearDraft(draftKey);
      onSubmitted?.(item);
    } catch (err) {
      setMessage(err?.message || "Nepavyko pateikti");
    } finally {
      setSubmitting(false);
    }
  }

  function saveAsDraft() {
    const values = getValues();
    saveDraft(draftKey, values);
    setSavingDraft(true);
    setMessage("Juodraštis išsaugotas (localStorage)");
    setTimeout(() => setSavingDraft(false), 1500);
  }

  return (
    <form className="mx-auto max-w-4xl space-y-4" onSubmit={handleSubmit(submit)}>
      <Card className="space-y-5 p-6 sm:p-8 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Refleksijos forma</p>
            <h2 className="text-2xl font-semibold text-slate-900">{template.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{template.description}</p>
          </div>
          <Badge color="blue" className="self-start">1–5 min</Badge>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-5">
          {template.fields.map(field => renderField(field))}
        </div>

        {message ? <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{message}</div> : null}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={saveAsDraft} disabled={savingDraft}>
            {savingDraft ? "Saugoma..." : "Išsaugoti juodraštį"}
          </Button>
          <div className="flex items-center gap-2">
            {onCancel ? (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Atšaukti
              </Button>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Pateikiama..." : "Pateikti"}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
