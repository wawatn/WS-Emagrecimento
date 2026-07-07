import { supabase } from '@/lib/supabase';
import {
  Profile,
  Weight,
  Training,
  BodyMeasurement,
  PhotoEvolution,
  Goal,
  SleepHealth,
} from '@/types/database.types';

// =========================================================================
// SERVICES: PERFIL DE USUÁRIO
// =========================================================================
export const profileService = {
  async get(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// =========================================================================
// SERVICES: REGISTRO DE PESO (WEIGHTS)
// =========================================================================
export const weightService = {
  async getAll(userId: string): Promise<Weight[]> {
    const { data, error } = await supabase
      .from('weights')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async upsert(userId: string, date: string, weight: number, notes?: string | null): Promise<Weight> {
    const { data, error } = await supabase
      .from('weights')
      .upsert({ user_id: userId, date, weight, notes })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('weights').delete().eq('id', id);
    if (error) throw error;
  },
};

// =========================================================================
// SERVICES: REGISTRO DE TREINOS (TRAININGS)
// =========================================================================
export const trainingService = {
  async getAll(userId: string): Promise<Training[]> {
    const { data, error } = await supabase
      .from('trainings')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(userId: string, training: Omit<Training, 'id' | 'user_id' | 'created_at'>): Promise<Training> {
    const { data, error } = await supabase
      .from('trainings')
      .insert({ ...training, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Training>): Promise<Training> {
    const { data, error } = await supabase
      .from('trainings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('trainings').delete().eq('id', id);
    if (error) throw error;
  },
};

// =========================================================================
// SERVICES: MEDIDAS CORPORAIS (BODY MEASUREMENTS)
// =========================================================================
export const measurementService = {
  async getAll(userId: string): Promise<BodyMeasurement[]> {
    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async upsert(
    userId: string,
    date: string,
    measurements: Omit<BodyMeasurement, 'id' | 'user_id' | 'date' | 'created_at'>
  ): Promise<BodyMeasurement> {
    const { data, error } = await supabase
      .from('body_measurements')
      .upsert({ user_id: userId, date, ...measurements })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('body_measurements').delete().eq('id', id);
    if (error) throw error;
  },
};

// =========================================================================
// SERVICES: FOTOS DE EVOLUÇÃO (PHOTOS)
// =========================================================================
export const photoService = {
  async getAll(userId: string): Promise<PhotoEvolution[]> {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(userId: string, photo: Omit<PhotoEvolution, 'id' | 'user_id' | 'created_at'>): Promise<PhotoEvolution> {
    const { data, error } = await supabase
      .from('photos')
      .insert({ ...photo, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('photos').delete().eq('id', id);
    if (error) throw error;
  },

  // Upload de imagem no Storage do Supabase (Bucket: 'evolution-photos')
  async uploadImage(userId: string, file: File, type: 'front' | 'side' | 'back'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${type}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('evolution-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('evolution-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};

// =========================================================================
// SERVICES: METAS (GOALS)
// =========================================================================
export const goalService = {
  async getAll(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('target_weight', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(userId: string, targetWeight: number): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert({ user_id: userId, target_weight: targetWeight, is_completed: false })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  },
};

// =========================================================================
// SERVICES: SONO E SAÚDE (SLEEP_HEALTH)
// =========================================================================
export const healthService = {
  async getAll(userId: string): Promise<SleepHealth[]> {
    const { data, error } = await supabase
      .from('sleep_health')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async upsert(
    userId: string,
    date: string,
    health: Omit<SleepHealth, 'id' | 'user_id' | 'date' | 'created_at'>
  ): Promise<SleepHealth> {
    const { data, error } = await supabase
      .from('sleep_health')
      .upsert({ user_id: userId, date, ...health })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('sleep_health').delete().eq('id', id);
    if (error) throw error;
  },
};
