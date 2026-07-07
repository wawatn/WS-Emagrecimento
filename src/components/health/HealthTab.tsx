'use client';

import React, { useState, useMemo } from 'react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { healthSchema, HealthInput } from '@/lib/zodSchemas';
import {
  Heart,
  Plus,
  BedDouble,
  Activity,
  Smile,
  Zap,
  Trash2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export function HealthTab() {
  const { useHealth, upsertHealth, deleteHealth } = useFitnessData();
  const { data: healthEntries = [], isLoading } = useHealth();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<HealthInput>({
    resolver: zodResolver(healthSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      sleep_quality: 'Bom',
      leg_pain: 0,
      rpe: 5,
      mood: 'Normal',
      energy: 'Normal',
    },
  });

  const onSubmit = async (data: HealthInput) => {
    try {
      const parsed = healthSchema.parse(data);
      await upsertHealth({
        date: parsed.date,
        health: {
          sleep_hours: parsed.sleep_hours,
          sleep_quality: parsed.sleep_quality,
          leg_pain: parsed.leg_pain,
          rpe: parsed.rpe,
          mood: parsed.mood,
          energy: parsed.energy,
        },
      });
      setIsOpen(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const currentLegPain = watch('leg_pain');
  const currentRpe = watch('rpe');

  // Prepara dados de Sono para o gráfico
  const sleepChartData = useMemo(() => {
    return [...healthEntries]
      .slice(0, 7)
      .reverse()
      .map((h) => ({
        date: new Date(h.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        horas: h.sleep_hours,
      }));
  }, [healthEntries]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs text-[#6b7280] font-bold uppercase tracking-wider">Recuperação e Vitalidade</p>
          <h3 className="text-lg font-black text-[#f3f4f6]">Registros de Saúde</h3>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#10b981] px-5 py-3 font-bold text-[#090d16] shadow-lg shadow-[#10b981]/15 hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4.5 w-4.5" />
          Registrar Diário
        </button>
      </section>

      {/* 2. GRÁFICO DE HORAS DE SONO */}
      <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5">
        <h3 className="text-sm font-black text-[#f3f4f6] mb-4">Volume de Sono Semanal</h3>
        <div className="h-56 w-full">
          {sleepChartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} domain={[0, 12]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131929', borderColor: '#1f293d', borderRadius: '12px' }}
                  labelStyle={{ color: '#9ca3af', fontSize: '12px' }}
                />
                <Bar dataKey="horas" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-sm text-[#4b5563]">
              Lançe dados de sono por pelo menos 2 dias para ver a comparação gráfica.
            </div>
          )}
        </div>
      </div>

      {/* 3. HISTÓRICO DE SAÚDE */}
      <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5">
        <h3 className="text-sm font-black text-[#f3f4f6] mb-4">Diário de Saúde</h3>
        {isLoading ? (
          <p className="text-sm text-[#6b7280]">Carregando histórico...</p>
        ) : healthEntries.length === 0 ? (
          <p className="text-sm text-[#4b5563]">Nenhum registro de saúde lançado.</p>
        ) : (
          <div className="divide-y divide-[#1f293d]/30 space-y-4">
            {healthEntries.map((h) => (
              <div key={h.id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-400">
                      {new Date(h.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteHealth(h.id)}
                    className="text-[#4b5563] hover:text-red-400 p-1"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Grid de Métricas do Dia */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {/* Sono */}
                  <div className="flex items-center gap-2.5 rounded-xl bg-[#090d16]/30 border border-[#1f293d]/25 p-3">
                    <BedDouble className="h-4.5 w-4.5 text-blue-400" />
                    <div>
                      <p className="text-[9px] text-[#6b7280] font-bold uppercase">Sono</p>
                      <p className="text-xs font-bold text-[#f3f4f6]">{h.sleep_hours}h • {h.sleep_quality}</p>
                    </div>
                  </div>

                  {/* Dor Pernas */}
                  <div className="flex items-center gap-2.5 rounded-xl bg-[#090d16]/30 border border-[#1f293d]/25 p-3">
                    <Activity className="h-4.5 w-4.5 text-orange-400" />
                    <div>
                      <p className="text-[9px] text-[#6b7280] font-bold uppercase">Fadiga Pernas</p>
                      <p className="text-xs font-bold text-[#f3f4f6]">{h.leg_pain}/10 (Dor)</p>
                    </div>
                  </div>

                  {/* Humor */}
                  <div className="flex items-center gap-2.5 rounded-xl bg-[#090d16]/30 border border-[#1f293d]/25 p-3">
                    <Smile className="h-4.5 w-4.5 text-yellow-400" />
                    <div>
                      <p className="text-[9px] text-[#6b7280] font-bold uppercase">Humor</p>
                      <p className="text-xs font-bold text-[#f3f4f6]">{h.mood}</p>
                    </div>
                  </div>

                  {/* Energia */}
                  <div className="flex items-center gap-2.5 rounded-xl bg-[#090d16]/30 border border-[#1f293d]/25 p-3">
                    <Zap className="h-4.5 w-4.5 text-emerald-400" />
                    <div>
                      <p className="text-[9px] text-[#6b7280] font-bold uppercase">Energia</p>
                      <p className="text-xs font-bold text-[#f3f4f6]">{h.energy}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DIALOG MODAL: LANÇAR DIÁRIO DE SAÚDE */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-[#1f293d]/50 bg-[#131929] p-6 shadow-2xl text-[#f3f4f6] overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-base font-black flex items-center gap-2 pb-4 border-b border-[#1f293d]/30 mb-4">
                <Heart className="h-5 w-5 text-emerald-400" />
                Registrar Estado de Saúde Diário
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Data</label>
                    <input
                      type="date"
                      {...register('date')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Horas de Sono</label>
                    <input
                      type="text"
                      placeholder="Ex: 7.5"
                      {...register('sleep_hours')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs outline-none"
                    />
                    {errors.sleep_hours && <span className="text-[10px] text-red-400">{errors.sleep_hours.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6b7280]">Qualidade Sono</label>
                    <select
                      {...register('sleep_quality')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] p-2 text-xs outline-none focus:border-emerald-500/50"
                    >
                      <option value="Ruim">Ruim</option>
                      <option value="Regular">Regular</option>
                      <option value="Bom">Bom</option>
                      <option value="Excelente">Excelente</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6b7280]">Humor</label>
                    <select
                      {...register('mood')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] p-2 text-xs outline-none focus:border-emerald-500/50"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Irritado">Irritado</option>
                      <option value="Cansado">Cansado</option>
                      <option value="Feliz">Feliz</option>
                      <option value="Energizado">Energizado</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6b7280]">Energia</label>
                    <select
                      {...register('energy')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] p-2 text-xs outline-none focus:border-emerald-500/50"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Muito Baixa">Muito Baixa</option>
                      <option value="Baixa">Baixa</option>
                      <option value="Alta">Alta</option>
                      <option value="Muito Alta">Muito Alta</option>
                    </select>
                  </div>
                </div>

                {/* Dor nas pernas (Slider range 0-10) */}
                <div className="space-y-1 bg-[#090d16]/30 border border-[#1f293d]/25 p-3 rounded-2xl">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-[#6b7280] uppercase tracking-wider text-[10px]">Dor nas Pernas (Fadiga)</label>
                    <span className="font-black text-emerald-400 text-sm">{currentLegPain}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    {...register('leg_pain')}
                    className="w-full h-1.5 rounded-lg bg-[#090d16] outline-none accent-emerald-500 mt-2"
                  />
                  <div className="flex justify-between text-[9px] text-[#4b5563] font-bold">
                    <span>Sem dor (0)</span>
                    <span>Moderada (5)</span>
                    <span>Extrema (10)</span>
                  </div>
                </div>

                {/* Percepção de Esforço RPE (Slider range 1-10) */}
                <div className="space-y-1 bg-[#090d16]/30 border border-[#1f293d]/25 p-3 rounded-2xl">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-[#6b7280] uppercase tracking-wider text-[10px]">Percepção de Esforço (RPE)</label>
                    <span className="font-black text-emerald-400 text-sm">{currentRpe}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    {...register('rpe')}
                    className="w-full h-1.5 rounded-lg bg-[#090d16] outline-none accent-emerald-500 mt-2"
                  />
                  <div className="flex justify-between text-[9px] text-[#4b5563] font-bold">
                    <span>Recuperativo (1)</span>
                    <span>Limiar / Z4 (7)</span>
                    <span>Máximo (10)</span>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      reset();
                    }}
                    className="flex-1 rounded-xl border border-[#1f293d] py-3 text-xs font-bold text-[#9ca3af] hover:bg-[#090d16] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#10b981] py-3 text-xs font-bold text-[#090d16] hover:brightness-105 transition-all shadow-lg shadow-emerald-500/10"
                  >
                    Salvar Registro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
