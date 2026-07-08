'use client';

import React, { useState, useEffect } from 'react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { PlannedWorkout } from '@/types/database.types';
import { Settings, Save, Sparkles, HelpCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

const MODALITIES = [
  { value: 'Descanso', label: '💤 Descanso' },
  { value: 'Ciclismo', label: '🚴 Ciclismo' },
  { value: 'Futebol', label: '⚽ Futebol' },
  { value: 'Caminhada', label: '🚶 Caminhada' },
  { value: 'Corrida', label: '🏃 Corrida' },
  { value: 'Academia', label: '🏋️ Academia' },
  { value: 'Outro', label: '💪 Outro' },
];

const CYCLING_TYPES = [
  { value: 'Livre', label: 'Livre / Passeio' },
  { value: 'Recuperação', label: 'Recuperação (Leve)' },
  { value: 'Z2', label: 'Z2 (Aeróbico Base)' },
  { value: 'Z3', label: 'Z3 (Ritmo / Tempo)' },
  { value: 'Z4', label: 'Z4 (Limiar LTHR)' },
  { value: 'Z5', label: 'Z5 (Capacidade)' },
  { value: 'Longão', label: 'Longão / Endurance' },
];

export function SettingsTab() {
  const { useProfile, updateProfile } = useFitnessData();
  const { data: profile } = useProfile();

  // Estados do Perfil
  const [displayName, setDisplayName] = useState('');
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState(3);

  // Estado do Planejador Semanal
  const [weeklyPlan, setWeeklyPlan] = useState<PlannedWorkout[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Iniciar campos com os dados existentes do banco
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setStartWeight(profile.start_weight?.toString() || '');
      setTargetWeight(profile.target_weight?.toString() || '100');
      setWeeklyTarget(profile.weekly_training_target || 3);
      
      // Carregar plano de treinos existente ou inicializar plano de descanso
      if (profile.weekly_workout_plan && Array.isArray(profile.weekly_workout_plan)) {
        setWeeklyPlan(profile.weekly_workout_plan as PlannedWorkout[]);
      } else {
        const defaultPlan = DAYS_OF_WEEK.map((day) => ({
          day,
          modality: 'Descanso',
          cycling_type: null,
          duration: null,
        }));
        setWeeklyPlan(defaultPlan);
      }
    }
  }, [profile]);

  const handlePlanChange = (
    index: number,
    field: keyof PlannedWorkout,
    value: any
  ) => {
    const updated = [...weeklyPlan];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    
    // Se mudar para Descanso, limpar outros campos
    if (field === 'modality' && value === 'Descanso') {
      updated[index].cycling_type = null;
      updated[index].duration = null;
    }
    
    setWeeklyPlan(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        display_name: displayName || null,
        start_weight: startWeight ? parseFloat(startWeight.replace(',', '.')) : null,
        target_weight: targetWeight ? parseFloat(targetWeight.replace(',', '.')) : 100,
        weekly_training_target: weeklyTarget,
        weekly_workout_plan: weeklyPlan,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      alert('Erro ao salvar configurações do perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <section className="flex items-center justify-between border-b border-[#1f293d]/30 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-400" />
          <h3 className="text-base font-black text-[#f3f4f6]">Ajustes e Metas</h3>
        </div>
      </section>

      {/* Alerta de Sucesso */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs font-bold text-emerald-400">
          <CheckCircle className="h-4.5 w-4.5" />
          Configurações salvas e metas atualizadas com sucesso!
        </div>
      )}

      {/* FORMULÁRIO PRINCIPAL */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Bloco 1: Perfil e Balança */}
        <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5 space-y-4">
          <h4 className="text-sm font-black text-[#f3f4f6] flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
            Metas de Peso e Dados
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Seu Nome</label>
              <input
                type="text"
                placeholder="Ex: Wagner Santos"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Peso Inicial (kg)</label>
              <input
                type="text"
                placeholder="Ex: 110.0"
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Meta de Peso Final (kg)</label>
              <input
                type="text"
                placeholder="Ex: 100.0"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Frequência Semanal */}
        <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5 space-y-3">
          <h4 className="text-sm font-black text-[#f3f4f6]">Meta de Frequência Semanal</h4>
          <p className="text-[11px] text-[#6b7280] leading-relaxed">
            Quantas vezes por semana você planeja se exercitar? Isso ajustará o progresso de consistência no Painel.
          </p>

          <div className="flex gap-2.5 max-w-sm pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setWeeklyTarget(num)}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all border ${
                  weeklyTarget === num
                    ? 'bg-[#10b981] border-emerald-500 text-[#090d16] shadow-md shadow-emerald-500/10'
                    : 'bg-[#090d16] border-[#1f293d] text-[#9ca3af]'
                }`}
              >
                {num}x
              </button>
            ))}
          </div>
        </div>

        {/* Bloco 3: Programar Rotina de Treinos */}
        <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5 space-y-4">
          <div>
            <h4 className="text-sm font-black text-[#f3f4f6] mb-0.5">Programar Rotina Semanal de Treinos</h4>
            <p className="text-[11px] text-[#6b7280] leading-normal">
              Defina a sua rotina ideal. Seus treinos planejados ficarão visíveis como referência no seu Painel.
            </p>
          </div>

          <div className="divide-y divide-[#1f293d]/20 space-y-4">
            {weeklyPlan.map((plan, idx) => (
              <div key={plan.day} className="grid grid-cols-1 gap-3 sm:grid-cols-4 pt-4 first:pt-0 items-center">
                {/* Dia da Semana */}
                <span className="text-xs font-black text-[#f3f4f6]">{plan.day}</span>

                {/* Modalidade */}
                <div>
                  <select
                    value={plan.modality}
                    onChange={(e) => handlePlanChange(idx, 'modality', e.target.value)}
                    className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] p-2.5 text-xs outline-none focus:border-emerald-500/50"
                  >
                    {MODALITIES.map((mod) => (
                      <option key={mod.value} value={mod.value}>
                        {mod.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-zona (só ciclismo) */}
                <div>
                  {plan.modality === 'Ciclismo' ? (
                    <select
                      value={plan.cycling_type || 'Livre'}
                      onChange={(e) => handlePlanChange(idx, 'cycling_type', e.target.value)}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] p-2.5 text-xs outline-none focus:border-emerald-500/50"
                    >
                      {CYCLING_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  ) : plan.modality !== 'Descanso' ? (
                    <span className="text-[10px] text-[#4b5563] italic">Treino Padrão</span>
                  ) : (
                    <span className="text-[10px] text-[#4b5563] italic">Folga Programada</span>
                  )}
                </div>

                {/* Duração */}
                <div>
                  {plan.modality !== 'Descanso' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Minutos"
                        value={plan.duration || ''}
                        onChange={(e) =>
                          handlePlanChange(
                            idx,
                            'duration',
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2 text-xs outline-none focus:border-emerald-500/50"
                      />
                      <span className="text-[10px] text-[#6b7280] font-bold">min</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Salvar Geral */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#10b981] py-4 font-bold text-[#090d16] shadow-lg shadow-[#10b981]/15 hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
        >
          <Save className="h-4.5 w-4.5" />
          {isSaving ? 'Gravando Alterações...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}
