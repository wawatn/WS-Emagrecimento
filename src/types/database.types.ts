// =========================================================================
// PROJETO 100KG - DEFINIÇÕES DE TIPOS TYPESCRIPT PARA O BANCO DE DADOS
// =========================================================================

export interface PlannedWorkout {
  day: string; // 'Segunda', 'Terça', etc.
  modality: string;
  cycling_type?: string | null;
  duration?: number | null;
}

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  start_weight: number | null;
  target_weight: number;
  weekly_training_target?: number;
  weekly_workout_plan?: PlannedWorkout[] | null;
}

export interface Weight {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  notes: string | null;
  created_at: string;
}

export type TrainingModality = 'Ciclismo' | 'Futebol' | 'Caminhada' | 'Corrida' | 'Academia' | 'Outro';
export type CyclingType = 'Recuperação' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Longão' | 'Livre';

export interface Training {
  id: string;
  user_id: string;
  date: string;
  modality: TrainingModality;
  cycling_type: CyclingType | null;
  duration: number; // em minutos
  calories: number | null;
  distance: number | null; // em km
  avg_hr: number | null;
  max_hr: number | null;
  avg_cadence: number | null;
  max_cadence: number | null;
  avg_speed: number | null; // em km/h
  elevation: number | null; // em metros
  notes: string | null;
  created_at: string;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  date: string;
  chest: number | null;
  arm: number | null;
  abdomen: number | null;
  waist: number | null;
  hip: number | null;
  thigh: number | null;
  calf: number | null;
  notes: string | null;
  created_at: string;
}

export interface PhotoEvolution {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  front_url: string | null;
  side_url: string | null;
  back_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  target_weight: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export type SleepQuality = 'Ruim' | 'Regular' | 'Bom' | 'Excelente';
export type Mood = 'Irritado' | 'Cansado' | 'Normal' | 'Feliz' | 'Energizado';
export type EnergyLevel = 'Muito Baixa' | 'Baixa' | 'Normal' | 'Alta' | 'Muito Alta';

export interface SleepHealth {
  id: string;
  user_id: string;
  date: string;
  sleep_hours: number;
  sleep_quality: SleepQuality;
  leg_pain: number; // 0-10
  rpe: number; // 1-10
  mood: Mood;
  energy: EnergyLevel;
  created_at: string;
}
