import { z } from "zod";

export type QuestionType =
  | "TRAFFIC_LIGHT"
  | "EMOTION"
  | "SCALE"
  | "THERMOMETER"
  | "SENTENCE_COMPLETION"
  | "FREE_TEXT"
  | "MULTI_SELECT"
  | "PIE_100";

const optionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

const categoriesSchema = z
  .array(
    z.object({
      id: z.string().min(1).optional(),
      label: z.string().min(1),
    }),
  )
  .min(2);

const trafficLightConfigSchema = z.object({
  options: z
    .array(optionSchema)
    .min(2)
    .max(5)
    .default([
      { value: "green", label: "Žalia" },
      { value: "yellow", label: "Geltona" },
      { value: "red", label: "Raudona" },
    ]),
});

const emotionConfigSchema = z.object({
  options: z
    .array(optionSchema)
    .min(3)
    .max(8)
    .default([
      { value: "😀", label: "😀 Puikiai" },
      { value: "🙂", label: "🙂 Gerai" },
      { value: "😐", label: "😐 Neutralu" },
      { value: "🙁", label: "🙁 Sunkiai" },
      { value: "😞", label: "😞 Blogai" },
    ]),
});

const rangeConfigSchema = z
  .object({
    min: z.number().int().default(1),
    max: z.number().int().default(5),
    step: z.number().int().positive().optional(),
    labels: z.array(z.string().min(1)).optional(),
    statements: z.array(z.string().min(1)).optional(), // thermometer with statements
  })
  .refine((v) => v.max > v.min, {
    message: "max must be greater than min",
    path: ["max"],
  });

const textConfigSchema = z.object({
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
});

const multiSelectConfigSchema = z.object({
  options: z.array(optionSchema).min(2),
  minChoices: z.number().int().min(1).optional(),
  maxChoices: z.number().int().min(1).optional(),
});

const pie100ConfigSchema = z
  .object({
    categories: categoriesSchema,
  })
  .refine(
    (v) => {
      const labels = v.categories.map((c) => c.label.trim().toLowerCase());
      return new Set(labels).size === labels.length;
    },
    { message: "Categories must be unique by label", path: ["categories"] },
  );

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  TRAFFIC_LIGHT: "Šviesoforas",
  EMOTION: "Emocijos",
  SCALE: "Skalė",
  THERMOMETER: "Termometras",
  SENTENCE_COMPLETION: "Neužbaigta frazė",
  FREE_TEXT: "Laisvas tekstas",
  MULTI_SELECT: "Multi-select",
  PIE_100: "Pyragas 100 taškų",
};

export const QUESTION_CONFIG_SCHEMAS: Record<QuestionType, z.ZodTypeAny> = {
  TRAFFIC_LIGHT: trafficLightConfigSchema,
  EMOTION: emotionConfigSchema,
  SCALE: rangeConfigSchema,
  THERMOMETER: rangeConfigSchema,
  SENTENCE_COMPLETION: textConfigSchema,
  FREE_TEXT: textConfigSchema,
  MULTI_SELECT: multiSelectConfigSchema,
  PIE_100: pie100ConfigSchema,
};

export type QuestionConfig<T extends QuestionType = QuestionType> = z.infer<
  (typeof QUESTION_CONFIG_SCHEMAS)[T]
>;

export function normalizeConfig<T extends QuestionType>(
  type: T,
  config: unknown,
): QuestionConfig<T> {
  const schema = QUESTION_CONFIG_SCHEMAS[type];
  return schema.parse(config ?? {});
}

export function defaultConfig<T extends QuestionType>(
  type: T,
): QuestionConfig<T> {
  const schema = QUESTION_CONFIG_SCHEMAS[type];
  const defaultsByType: Partial<Record<QuestionType, Record<string, unknown>>> = {
    TRAFFIC_LIGHT: {},
    EMOTION: {},
    SCALE: {},
    THERMOMETER: {},
    SENTENCE_COMPLETION: {},
    FREE_TEXT: {},
    MULTI_SELECT: {
      options: [
        { value: "opt1", label: "Pasirinkimas 1" },
        { value: "opt2", label: "Pasirinkimas 2" },
      ],
      minChoices: 1,
    },
    PIE_100: {
      categories: [
        { label: "Kategorija A" },
        { label: "Kategorija B" },
      ],
    },
  };
  return schema.parse(defaultsByType[type] ?? {});
}

