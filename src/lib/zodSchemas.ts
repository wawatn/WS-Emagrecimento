import { z } from 'zod';

// Regex para validação de data no formato YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Helpers estritos para conversão e higienização de inputs numéricos opcionais
const parseOptionalFloat = (val: unknown): number | null => {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return val;
  const parsed = parseFloat(String(val).replace(',', '.'));
  return isNaN(parsed) ? null : parsed;
};

const parseOptionalInt = (val: unknown): number | null => {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return val;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? null : parsed;
};

// 1. Schema de Peso Diário
export const weightSchema = z.object({
  date: z.string().regex(dateRegex, 'Data inválida. Use o formato AAAA-MM-DD'),
  weight: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val))
    .refine((val) => !isNaN(val) && val > 0, 'O peso deve ser um número maior que zero'),
  notes: z.string().optional().nullable(),
});

export type WeightInput = z.input<typeof weightSchema>;

// 2. Schema de Treino
export const trainingSchema = z.object({
  date: z.string().regex(dateRegex, 'Data inválida'),
  modality: z.enum(['Ciclismo', 'Futebol', 'Caminhada', 'Corrida', 'Academia', 'Outro'], {
    message: 'Selecione uma modalidade',
  }),
  cycling_type: z
    .union([
      z.enum(['Recuperação', 'Z2', 'Z3', 'Z4', 'Z5', 'Longão', 'Livre']),
      z.literal(''),
      z.null(),
      z.undefined()
    ])
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  duration: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === undefined || val === null || val === '') return 45;
      return typeof val === 'string' ? parseInt(val, 10) : val;
    })
    .refine((val) => !isNaN(val) && val > 0, 'A duração deve ser maior que zero minutos'),
  calories: z.any().transform(parseOptionalInt).optional().nullable(),
  distance: z.any().transform(parseOptionalFloat).optional().nullable(),
  avg_hr: z.any().transform(parseOptionalInt).optional().nullable(),
  max_hr: z.any().transform(parseOptionalInt).optional().nullable(),
  avg_cadence: z.any().transform(parseOptionalInt).optional().nullable(),
  avg_speed: z.any().transform(parseOptionalFloat).optional().nullable(),
  elevation: z.any().transform(parseOptionalFloat).optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine((data) => {
  if (data.modality === 'Ciclismo' && !data.cycling_type) {
    return false;
  }
  return true;
}, {
  message: 'Selecione o tipo de treino para Ciclismo (Zonas ou Longão)',
  path: ['cycling_type'],
});

export type TrainingInput = z.input<typeof trainingSchema>;

// 3. Schema de Medidas Corporais
export const measurementSchema = z.object({
  date: z.string().regex(dateRegex, 'Data inválida'),
  chest: z.any().transform(parseOptionalFloat),
  arm: z.any().transform(parseOptionalFloat),
  abdomen: z.any().transform(parseOptionalFloat),
  waist: z.any().transform(parseOptionalFloat),
  hip: z.any().transform(parseOptionalFloat),
  thigh: z.any().transform(parseOptionalFloat),
  calf: z.any().transform(parseOptionalFloat),
  notes: z.string().optional().nullable(),
});

export type MeasurementInput = z.input<typeof measurementSchema>;

// 4. Schema de Saúde e Sono
export const healthSchema = z.object({
  date: z.string().regex(dateRegex, 'Data inválida'),
  sleep_hours: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 24, 'As horas de sono devem estar entre 0 e 24'),
  sleep_quality: z.enum(['Ruim', 'Regular', 'Bom', 'Excelente'], {
    message: 'Selecione a qualidade do sono',
  }),
  leg_pain: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val) : val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 10, 'A dor nas pernas deve ser de 0 a 10'),
  rpe: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val) : val))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 10, 'A percepção de esforço (RPE) deve ser de 1 a 10'),
  mood: z.enum(['Irritado', 'Cansado', 'Normal', 'Feliz', 'Energizado'], {
    message: 'Selecione seu humor',
  }),
  energy: z.enum(['Muito Baixa', 'Baixa', 'Normal', 'Alta', 'Muito Alta'], {
    message: 'Selecione seu nível de energia',
  }),
});

export type HealthInput = z.input<typeof healthSchema>;
