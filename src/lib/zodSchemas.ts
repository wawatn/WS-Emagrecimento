import { z } from 'zod';

// Regex para validação de data no formato YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// 1. Schema de Peso Diário
export const weightSchema = z.object({
  date: z.string().regex(dateRegex, 'Data inválida. Use o formato AAAA-MM-DD'),
  weight: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val))
    .refine((val) => !isNaN(val) && val > 0, 'O peso deve ser um número maior que zero'),
  notes: z.string().optional().nullable(),
});

export type WeightInput = z.infer<typeof weightSchema>;

// 2. Schema de Treino
export const trainingSchema = z.object({
  date: z.string().regex(dateRegex, 'Data inválida'),
  modality: z.enum(['Ciclismo', 'Futebol', 'Caminhada', 'Corrida', 'Academia', 'Outro'], {
    message: 'Selecione uma modalidade',
  }),
  cycling_type: z.enum(['Recuperação', 'Z2', 'Z3', 'Z4', 'Z5', 'Longão', 'Livre']).optional().nullable(),
  duration: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val) : val))
    .refine((val) => !isNaN(val) && val > 0, 'A duração deve ser maior que zero minutos'),
  calories: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  distance: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(',', '.')) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  avg_hr: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  max_hr: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  avg_cadence: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  max_cadence: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  avg_speed: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(',', '.')) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  elevation: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(',', '.')) : val === '' ? undefined : val))
    .optional()
    .nullable(),
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

export type TrainingInput = z.infer<typeof trainingSchema>;

// 3. Schema de Medidas Corporais
export const measurementSchema = z.object({
  date: z.string().regex(dateRegex, 'Data inválida'),
  chest: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(',', '.')) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  arm: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(',', '.')) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  abdomen: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(',', '.')) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  waist: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(',', '.')) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  hip: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(',', '.')) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  thigh: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(',', '.')) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  calf: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(',', '.')) : val === '' ? undefined : val))
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

export type MeasurementInput = z.infer<typeof measurementSchema>;

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

export type HealthInput = z.infer<typeof healthSchema>;
