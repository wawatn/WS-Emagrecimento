'use client';

import React, { useState, useMemo } from 'react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { weightSchema, measurementSchema, WeightInput, MeasurementInput } from '@/lib/zodSchemas';
import {
  Scale,
  Ruler,
  Calendar,
  Plus,
  Trash2,
  TrendingDown,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export function WeightsTab() {
  const { useWeights, useMeasurements, upsertWeight, deleteWeight, upsertMeasurement, deleteMeasurement } = useFitnessData();
  const { data: weights = [], isLoading: isLoadingWeights } = useWeights();
  const { data: measurements = [], isLoading: isLoadingMeasurements } = useMeasurements();

  const [subTab, setSubTab] = useState<'weight' | 'measurements'>('weight');
  const [isWeightOpen, setIsWeightOpen] = useState(false);
  const [isMeasureOpen, setIsMeasureOpen] = useState(false);

  // Forms Setup
  const weightForm = useForm<WeightInput>({
    resolver: zodResolver(weightSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const measureForm = useForm<MeasurementInput>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onWeightSubmit = async (data: WeightInput) => {
    try {
      const parsed = weightSchema.parse(data);
      await upsertWeight({
        date: parsed.date,
        weight: parsed.weight,
        notes: parsed.notes || null,
      });
      setIsWeightOpen(false);
      weightForm.reset();
    } catch (err) {
      console.error(err);
    }
  };

  const onMeasureSubmit = async (data: MeasurementInput) => {
    try {
      const parsed = measurementSchema.parse(data);
      await upsertMeasurement({
        date: parsed.date,
        measurements: {
          chest: parsed.chest || null,
          arm: parsed.arm || null,
          abdomen: parsed.abdomen || null,
          waist: parsed.waist || null,
          hip: parsed.hip || null,
          thigh: parsed.thigh || null,
          calf: parsed.calf || null,
          notes: parsed.notes || null,
        },
      });
      setIsMeasureOpen(false);
      measureForm.reset();
    } catch (err) {
      console.error(err);
    }
  };

  // Prepara dados de Peso para o gráfico
  const weightChartData = useMemo(() => {
    return [...weights]
      .slice(0, 15)
      .reverse()
      .map((w) => ({
        date: new Date(w.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
        peso: w.weight,
      }));
  }, [weights]);

  // Prepara dados de Medidas (Cintura vs Abdômen) para o gráfico
  const measurementsChartData = useMemo(() => {
    return [...measurements]
      .slice(0, 10)
      .reverse()
      .map((m) => ({
        date: new Date(m.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
        cintura: m.waist,
        abdomen: m.abdomen,
      }));
  }, [measurements]);

  return (
    <div className="space-y-6">
      {/* Selector SubTab */}
      <div className="flex rounded-2xl bg-[#131929]/50 border border-[#1f293d]/30 p-1">
        <button
          onClick={() => setSubTab('weight')}
          className={`flex-1 rounded-xl py-3 text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
            subTab === 'weight' ? 'bg-[#090d16] text-emerald-400 shadow-sm' : 'text-[#6b7280]'
          }`}
        >
          <Scale className="h-4 w-4" />
          Acompanhamento de Peso
        </button>
        <button
          onClick={() => setSubTab('measurements')}
          className={`flex-1 rounded-xl py-3 text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
            subTab === 'measurements' ? 'bg-[#090d16] text-emerald-400 shadow-sm' : 'text-[#6b7280]'
          }`}
        >
          <Ruler className="h-4 w-4" />
          Medidas Corporais
        </button>
      </div>

      {/* RENDER TELA PESO */}
      {subTab === 'weight' && (
        <div className="space-y-6">
          <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-xs text-[#6b7280] font-bold uppercase tracking-wider">Histórico de Balança</p>
              <h3 className="text-lg font-black text-[#f3f4f6]">Registros de Peso</h3>
            </div>
            
            <button
              onClick={() => setIsWeightOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#10b981] px-5 py-3 font-bold text-[#090d16] shadow-lg shadow-[#10b981]/15 hover:brightness-110 active:scale-[0.98]"
            >
              <Plus className="h-4.5 w-4.5" />
              Lançar Peso
            </button>
          </section>

          {/* Gráfico de Peso Principal */}
          <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5">
            <h3 className="text-sm font-black text-[#f3f4f6] mb-4">Tendência Geral do Peso</h3>
            <div className="h-72 w-full">
              {weightChartData.length >= 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1f293d/30" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={10} domain={['dataMin - 3', 'dataMax + 3']} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#131929', borderColor: '#1f293d', borderRadius: '12px' }}
                      labelStyle={{ color: '#9ca3af', fontSize: '12px' }}
                      itemStyle={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-sm text-[#4b5563]">
                  Registre o peso por pelo menos 2 dias para visualizar a tendência gráfica.
                </div>
              )}
            </div>
          </div>

          {/* Lista de Registros */}
          <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5">
            <h3 className="text-sm font-black text-[#f3f4f6] mb-4">Pesagens Anteriores</h3>
            {isLoadingWeights ? (
              <p className="text-sm text-[#6b7280]">Carregando histórico...</p>
            ) : weights.length === 0 ? (
              <p className="text-sm text-[#4b5563]">Nenhum registro de peso lançado.</p>
            ) : (
              <div className="divide-y divide-[#1f293d]/30 space-y-3.5">
                {weights.map((w, idx) => {
                  // Calcular diferença do peso anterior para mostrar seta de perda/ganho
                  const nextWeight = weights[idx + 1];
                  const diff = nextWeight ? w.weight - nextWeight.weight : null;

                  return (
                    <div key={w.id} className="flex items-center justify-between pt-3.5 first:pt-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#090d16] border border-[#1f293d]/50 text-emerald-400">
                          <Scale className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#f3f4f6]">{w.weight.toFixed(1)} kg</span>
                          <span className="text-[10px] text-[#6b7280]">
                            {new Date(w.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {diff !== null && (
                          <span
                            className={`flex items-center gap-0.5 text-xs font-bold ${
                              diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-red-400' : 'text-[#6b7280]'
                            }`}
                          >
                            {diff < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : diff > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : null}
                            {diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg` : 'Estável'}
                          </span>
                        )}
                        <button
                          onClick={() => deleteWeight(w.id)}
                          className="text-[#4b5563] hover:text-red-400 p-2"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER TELA MEDIDAS */}
      {subTab === 'measurements' && (
        <div className="space-y-6">
          <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-xs text-[#6b7280] font-bold uppercase tracking-wider">Histórico Fita Métrica</p>
              <h3 className="text-lg font-black text-[#f3f4f6]">Registros de Medidas</h3>
            </div>
            
            <button
              onClick={() => setIsMeasureOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#10b981] px-5 py-3 font-bold text-[#090d16] shadow-lg shadow-[#10b981]/15 hover:brightness-110 active:scale-[0.98]"
            >
              <Plus className="h-4.5 w-4.5" />
              Lançar Medidas
            </button>
          </section>

          {/* Gráfico Cintura vs Abdômen */}
          <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5">
            <h3 className="text-sm font-black text-[#f3f4f6] mb-4">Cintura vs Abdômen (Belly Fat Reduction)</h3>
            <div className="h-72 w-full">
              {measurementsChartData.length >= 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={measurementsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1f293d/30" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#131929', borderColor: '#1f293d', borderRadius: '12px' }}
                      labelStyle={{ color: '#9ca3af', fontSize: '12px' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line type="monotone" name="Cintura (cm)" dataKey="cintura" stroke="#3b82f6" strokeWidth={2.5} />
                    <Line type="monotone" name="Abdômen (cm)" dataKey="abdomen" stroke="#10b981" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-sm text-[#4b5563]">
                  Registre suas medidas por pelo menos 2 dias para comparar a redução abdominal graficamente.
                </div>
              )}
            </div>
          </div>

          {/* Histórico Medidas */}
          <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5">
            <h3 className="text-sm font-black text-[#f3f4f6] mb-4">Histórico de Medidas</h3>
            {isLoadingMeasurements ? (
              <p className="text-sm text-[#6b7280]">Carregando histórico...</p>
            ) : measurements.length === 0 ? (
              <p className="text-sm text-[#4b5563]">Nenhum registro de fita métrica lançado.</p>
            ) : (
              <div className="divide-y divide-[#1f293d]/30 space-y-4">
                {measurements.map((m) => (
                  <div key={m.id} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-emerald-400">
                        {new Date(m.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <button
                        onClick={() => deleteMeasurement(m.id)}
                        className="text-[#4b5563] hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-[#9ca3af]">
                      <div className="bg-[#090d16]/40 p-2 rounded-xl border border-[#1f293d]/30">
                        <p className="font-bold text-[#6b7280]">Cintura</p>
                        <p className="font-black text-[#f3f4f6] text-xs mt-0.5">{m.waist ? `${m.waist}cm` : '--'}</p>
                      </div>
                      <div className="bg-[#090d16]/40 p-2 rounded-xl border border-[#1f293d]/30">
                        <p className="font-bold text-[#6b7280]">Abdômen</p>
                        <p className="font-black text-[#f3f4f6] text-xs mt-0.5">{m.abdomen ? `${m.abdomen}cm` : '--'}</p>
                      </div>
                      <div className="bg-[#090d16]/40 p-2 rounded-xl border border-[#1f293d]/30">
                        <p className="font-bold text-[#6b7280]">Braço</p>
                        <p className="font-black text-[#f3f4f6] text-xs mt-0.5">{m.arm ? `${m.arm}cm` : '--'}</p>
                      </div>
                      <div className="bg-[#090d16]/40 p-2 rounded-xl border border-[#1f293d]/30">
                        <p className="font-bold text-[#6b7280]">Peito</p>
                        <p className="font-black text-[#f3f4f6] text-xs mt-0.5">{m.chest ? `${m.chest}cm` : '--'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIALOG MODAL: LANÇAR PESO */}
      <AnimatePresence>
        {isWeightOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-[#1f293d]/50 bg-[#131929] p-6 shadow-2xl text-[#f3f4f6]"
            >
              <h3 className="text-base font-black flex items-center gap-2 pb-4 border-b border-[#1f293d]/30 mb-4">
                <Scale className="h-5 w-5 text-emerald-400" />
                Registrar Pesagem Diária
              </h3>

              <form onSubmit={weightForm.handleSubmit(onWeightSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Data</label>
                  <input
                    type="date"
                    {...weightForm.register('date')}
                    className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Peso (kg)</label>
                  <input
                    type="text"
                    placeholder="Ex: 104.5"
                    {...weightForm.register('weight')}
                    className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                  />
                  {weightForm.formState.errors.weight && (
                    <span className="text-[10px] text-red-400">{weightForm.formState.errors.weight.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Anotações</label>
                  <textarea
                    placeholder="Ex: Em jejum, após ir ao banheiro"
                    rows={2}
                    {...weightForm.register('notes')}
                    className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWeightOpen(false);
                      weightForm.reset();
                    }}
                    className="flex-1 rounded-xl border border-[#1f293d] py-3 text-xs font-bold text-[#9ca3af] hover:bg-[#090d16] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#10b981] py-3 text-xs font-bold text-[#090d16] hover:brightness-105 transition-all shadow-lg shadow-emerald-500/10"
                  >
                    Salvar Peso
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG MODAL: LANÇAR MEDIDAS */}
      <AnimatePresence>
        {isMeasureOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-[#1f293d]/50 bg-[#131929] p-6 shadow-2xl text-[#f3f4f6]"
            >
              <h3 className="text-base font-black flex items-center gap-2 pb-4 border-b border-[#1f293d]/30 mb-4">
                <Ruler className="h-5 w-5 text-emerald-400" />
                Registrar Fita Métrica
              </h3>

              <form onSubmit={measureForm.handleSubmit(onMeasureSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Data</label>
                  <input
                    type="date"
                    {...measureForm.register('date')}
                    className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6b7280]">Cintura (cm)</label>
                    <input
                      type="text"
                      placeholder="Ex: 95"
                      {...measureForm.register('waist')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2 text-xs outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6b7280]">Abdômen</label>
                    <input
                      type="text"
                      placeholder="Ex: 102"
                      {...measureForm.register('abdomen')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2 text-xs outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6b7280]">Braço</label>
                    <input
                      type="text"
                      placeholder="Ex: 38"
                      {...measureForm.register('arm')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2 text-xs outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6b7280]">Peito (cm)</label>
                    <input
                      type="text"
                      placeholder="Ex: 110"
                      {...measureForm.register('chest')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2 text-xs outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6b7280]">Quadril</label>
                    <input
                      type="text"
                      placeholder="Ex: 108"
                      {...measureForm.register('hip')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2 text-xs outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6b7280]">Coxa</label>
                    <input
                      type="text"
                      placeholder="Ex: 62"
                      {...measureForm.register('thigh')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2 text-xs outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Anotações</label>
                  <textarea
                    placeholder="Opcional..."
                    rows={2}
                    {...measureForm.register('notes')}
                    className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMeasureOpen(false);
                      measureForm.reset();
                    }}
                    className="flex-1 rounded-xl border border-[#1f293d] py-3 text-xs font-bold text-[#9ca3af] hover:bg-[#090d16] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#10b981] py-3 text-xs font-bold text-[#090d16] hover:brightness-105 transition-all shadow-lg shadow-emerald-500/10"
                  >
                    Salvar Medidas
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
