'use client';

import React, { useState, useMemo } from 'react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { CalendarDays, ChevronLeft, ChevronRight, Scale, Dumbbell } from 'lucide-react';

export function CalendarTab() {
  const { useTrainings, useWeights } = useFitnessData();
  const { data: trainings = [] } = useTrainings();
  const { data: weights = [] } = useWeights();

  const [currentDate, setCurrentDate] = useState(new Date());

  // Navegação do Calendário
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Mapeamento dos Dias do Mês
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // dia da semana do dia 1
    const totalDays = new Date(year, month + 1, 0).getDate(); // total de dias do mês

    const days: { dateStr: string | null; dayNum: number | null }[] = [];

    // Preencher dias em branco da semana anterior
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dateStr: null, dayNum: null });
    }

    // Preencher dias reais
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: day });
    }

    return days;
  }, [currentDate]);

  // Indexar dados por data para busca rápida O(1)
  const dataIndexed = useMemo(() => {
    const weightMap: Record<string, number> = {};
    weights.forEach((w) => {
      weightMap[w.date] = w.weight;
    });

    const trainingMap: Record<string, typeof trainings[0]> = {};
    trainings.forEach((t) => {
      trainingMap[t.date] = t;
    });

    return { weightMap, trainingMap };
  }, [weights, trainings]);

  // Retorna classe CSS para o background do treino no dia
  const getDayBgColor = (dateStr: string) => {
    const training = dataIndexed.trainingMap[dateStr];
    if (!training) return 'bg-[#131929]/20 hover:bg-[#131929]/40 border-[#1f293d]/30';

    if (training.modality === 'Futebol') return 'bg-blue-950/20 border-blue-500/30 hover:bg-blue-950/30';
    if (training.modality === 'Ciclismo') {
      if (training.cycling_type === 'Z5') return 'bg-red-950/20 border-red-500/30 hover:bg-red-950/30';
      if (training.cycling_type === 'Z4') return 'bg-orange-950/20 border-orange-500/30 hover:bg-orange-950/30';
      if (training.cycling_type === 'Z2') return 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/30';
    }
    return 'bg-zinc-950/20 border-zinc-500/30 hover:bg-zinc-950/30';
  };

  const getModalityLabelColor = (modality: string, zone?: string | null) => {
    if (modality === 'Futebol') return 'text-blue-400';
    if (modality === 'Ciclismo') {
      if (zone === 'Z5') return 'text-red-400';
      if (zone === 'Z4') return 'text-orange-400';
      if (zone === 'Z2') return 'text-emerald-400';
    }
    return 'text-zinc-400';
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      {/* 1. HEADER DO MÊS */}
      <section className="flex items-center justify-between border-b border-[#1f293d]/30 pb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-emerald-400" />
          <h3 className="text-base font-black capitalize text-[#f3f4f6]">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1f293d] bg-[#131929]/50 hover:bg-[#131929] transition-all"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1f293d] bg-[#131929]/50 hover:bg-[#131929] transition-all"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </section>

      {/* Legenda de Cores */}
      <div className="flex flex-wrap gap-3.5 text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
          <span>Z2 (Ciclismo)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-orange-500/20 border border-orange-500/40" />
          <span>Z4 (Ciclismo)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-500/20 border border-red-500/40" />
          <span>Z5 (Ciclismo)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-blue-500/20 border border-blue-500/40" />
          <span>Futebol</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-zinc-700/20 border border-zinc-500/40" />
          <span>Outros / Academia</span>
        </div>
      </div>

      {/* 2. GRID DO CALENDÁRIO */}
      <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-4">
        {/* Dias da Semana */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-wider text-[#4b5563] pb-3 border-b border-[#1f293d]/20 mb-2">
          {weekDays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Células de Dias */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((cell, idx) => {
            const hasData = cell.dateStr !== null;
            const dayWeight = hasData ? dataIndexed.weightMap[cell.dateStr!] : null;
            const dayTraining = hasData ? dataIndexed.trainingMap[cell.dateStr!] : null;

            return (
              <div
                key={idx}
                className={`relative flex flex-col justify-between rounded-xl border p-2 aspect-square transition-all ${
                  hasData ? getDayBgColor(cell.dateStr!) : 'border-transparent bg-transparent opacity-0 pointer-events-none'
                }`}
              >
                {/* Dia do Mês */}
                <span className="text-xs font-black text-[#9ca3af]">{cell.dayNum}</span>

                {/* Dados Integrados do Dia */}
                <div className="flex flex-col gap-1 w-full text-[8px] md:text-[9px] font-black tracking-tight leading-none mt-1">
                  {/* Peso */}
                  {dayWeight && (
                    <span className="flex items-center gap-0.5 text-zinc-400">
                      <Scale className="h-2 w-2 text-[#4b5563]" />
                      {dayWeight.toFixed(1)}k
                    </span>
                  )}

                  {/* Treino */}
                  {dayTraining && (
                    <span className={`flex items-center gap-0.5 truncate font-extrabold ${getModalityLabelColor(dayTraining.modality, dayTraining.cycling_type)}`}>
                      <Dumbbell className="h-2 w-2" />
                      {dayTraining.modality === 'Ciclismo' && dayTraining.cycling_type
                        ? dayTraining.cycling_type
                        : dayTraining.modality}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
