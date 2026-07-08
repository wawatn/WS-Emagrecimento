'use client';

import React, { useMemo } from 'react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { PlannedWorkout } from '@/types/database.types';
import {
  TrendingDown,
  Zap,
  Clock,
  Flame,
  Award,
  Calendar,
  AlertCircle,
  TrendingUp,
  Target,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function DashboardTab() {
  const { useWeights, useTrainings, useProfile } = useFitnessData();
  const { data: profile } = useProfile();
  const { data: weights = [] } = useWeights();
  const { data: trainings = [] } = useTrainings();

  // Meta de frequência semanal dinâmica (do perfil ou padrão 3)
  const targetFrequency = profile?.weekly_training_target || 3;

  // 1. CÁLCULO DE MÉTRICAS DE PESO
  const weightStats = useMemo(() => {
    if (weights.length === 0) {
      return {
        current: 0,
        start: profile?.start_weight || 0,
        lost: 0,
        target: profile?.target_weight || 100,
        streak: 0,
      };
    }

    const sortedAsc = [...weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sortedDesc = [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const start = profile?.start_weight || sortedAsc[0].weight;
    const current = sortedDesc[0].weight;
    const lost = start - current;
    const target = profile?.target_weight || 100;

    // Cálculo da sequência de dias consecutivos registrando peso
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = new Set(weights.map((w) => w.date));
    let checkDate = new Date(today);

    if (!dates.has(checkDate.toISOString().split('T')[0])) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (dates.has(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { current, start, lost, target, streak };
  }, [weights, profile]);

  // 2. CÁLCULO DE MÉTRICAS DE TREINO
  const trainingStats = useMemo(() => {
    const today = new Date();
    
    // Treinos da semana atual (começando no Domingo)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Treinos do mês atual
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const weeklyTrainings = trainings.filter((t) => new Date(t.date + 'T00:00:00') >= startOfWeek);
    const monthlyTrainings = trainings.filter((t) => new Date(t.date + 'T00:00:00') >= startOfMonth);

    const totalHours = trainings.reduce((acc, t) => acc + t.duration, 0) / 60;
    const totalCalories = trainings.reduce((acc, t) => acc + (t.calories || 0), 0);

    const uniqueDays = new Set(trainings.map((t) => t.date));
    const daysTrained = uniqueDays.size;

    // Sequência de treinos
    let trainingStreak = 0;
    let checkDate = new Date(today);
    checkDate.setHours(0, 0, 0, 0);

    const todayStr = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];

    const hasTrainedRecently = uniqueDays.has(todayStr) || uniqueDays.has(yesterdayStr);

    if (hasTrainedRecently) {
      let currentCheck = uniqueDays.has(todayStr) ? new Date(today) : new Date(checkDate);
      currentCheck.setHours(0, 0, 0, 0);
      
      while (uniqueDays.has(currentCheck.toISOString().split('T')[0])) {
        trainingStreak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      }
    }

    return {
      daysTrained,
      weeklyCount: weeklyTrainings.length,
      monthlyCount: monthlyTrainings.length,
      totalHours,
      totalCalories,
      streak: trainingStreak,
      weeklyTrainings, // Retornado para cruzamento com o planejador
    };
  }, [trainings]);

  // 3. METAS E METAS INTERMEDIÁRIAS
  const goalProgress = useMemo(() => {
    const current = weightStats.current;
    if (current === 0) return null;

    const milestones = [120, 115, 110, 105, 100];
    let activeMilestone = 100;
    let previousMilestone = weightStats.start > 0 ? Math.ceil(weightStats.start) : 130;

    for (let i = 0; i < milestones.length; i++) {
      if (current > milestones[i]) {
        activeMilestone = milestones[i];
        previousMilestone = i === 0 ? Math.max(previousMilestone, milestones[0] + 5) : milestones[i - 1];
        break;
      }
    }

    const totalDiff = previousMilestone - activeMilestone;
    const currentDiff = previousMilestone - current;
    const percent = Math.min(Math.max((currentDiff / totalDiff) * 100, 0), 100);

    // Previsão baseada nas últimas 3 semanas
    let forecastWeeks = 'Sem dados de ritmo';
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    const weightsLast3Weeks = weights
      .filter((w) => new Date(w.date) >= threeWeeksAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (weightsLast3Weeks.length >= 2) {
      const firstWeight = weightsLast3Weeks[0].weight;
      const lastWeight = weightsLast3Weeks[weightsLast3Weeks.length - 1].weight;
      const weightLost3W = firstWeight - lastWeight;

      if (weightLost3W > 0.1) {
        const weeklyLossRate = weightLost3W / 3;
        const remainingWeight = current - activeMilestone;
        const weeks = remainingWeight / weeklyLossRate;
        forecastWeeks = weeks <= 0 ? 'Meta atingida!' : `${Math.ceil(weeks)} semanas`;
      }
    }

    return {
      activeMilestone,
      previousMilestone,
      percent,
      forecastWeeks,
    };
  }, [weightStats, weights]);

  // 4. MOTOR DE INSIGHTS
  const insights = useMemo(() => {
    const list: string[] = [];
    if (weightStats.current === 0) return ['Seja bem-vindo! Faça seus primeiros registros de peso e treinos para ver os insights.'];

    if (weightStats.lost > 0) {
      list.push(`Você já eliminou ${weightStats.lost.toFixed(1)} kg no total desde o início.`);
    }

    if (weights.length >= 2) {
      const sorted = [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      const weight30DaysAgo = sorted.find((w) => new Date(w.date) <= last30Days);
      if (weight30DaysAgo) {
        const lost30 = weight30DaysAgo.weight - sorted[0].weight;
        if (lost30 > 0) {
          list.push(`Você perdeu ${lost30.toFixed(1)} kg nos últimos 30 dias. Bom ritmo!`);
        }
      }
    }

    if (trainingStats.weeklyCount > 0) {
      list.push(`Você treinou ${trainingStats.weeklyCount} ${trainingStats.weeklyCount === 1 ? 'vez' : 'vezes'} esta semana.`);
    }

    if (goalProgress) {
      const rem = weightStats.current - goalProgress.activeMilestone;
      if (rem > 0) {
        list.push(`Faltam apenas ${rem.toFixed(1)} kg para alcançar sua meta de ${goalProgress.activeMilestone} kg.`);
      }
    }

    if (list.length === 0) {
      list.push('Continue registrando peso e treinos diariamente para gerar insights de ritmo e consistência.');
    }

    return list.slice(0, 3);
  }, [weightStats, trainingStats, goalProgress, weights]);

  // Gráfico de Peso Simplificado
  const chartData = useMemo(() => {
    return [...weights]
      .slice(0, 10)
      .reverse()
      .map((w) => ({
        date: new Date(w.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
        peso: w.weight,
      }));
  }, [weights]);

  // Cruzamento do Cronograma Planejado com os treinos realizados na semana
  const workoutPlanStatus = useMemo(() => {
    if (!profile?.weekly_workout_plan || !Array.isArray(profile.weekly_workout_plan)) {
      return [];
    }

    const plan = profile.weekly_workout_plan as PlannedWorkout[];
    const weeklyTrainings = trainingStats.weeklyTrainings;

    // Mapeador de nomes de dias para dias da semana Javascript (0 = Domingo, 1 = Segunda...)
    const dayMap: Record<string, number> = {
      'Segunda-feira': 1,
      'Terça-feira': 2,
      'Quarta-feira': 3,
      'Quinta-feira': 4,
      'Sexta-feira': 5,
      'Sábado': 6,
      'Domingo': 0,
    };

    return plan.map((p) => {
      const targetDay = dayMap[p.day];
      
      // Checar se o usuário já realizou o treino da modalidade programada neste dia da semana
      const isCompleted = weeklyTrainings.some((t) => {
        const trainingDate = new Date(t.date + 'T00:00:00');
        const trainingDay = trainingDate.getDay();
        
        // Verifica se coincide a modalidade (ou qualquer treino se for livre/outro) e o dia
        const matchesDay = trainingDay === targetDay;
        const matchesModality = 
          p.modality === 'Descanso' ? false :
          t.modality === p.modality;

        return matchesDay && matchesModality;
      });

      return {
        ...p,
        completed: isCompleted,
      };
    });
  }, [profile, trainingStats.weeklyTrainings]);

  return (
    <div className="space-y-6">
      {/* 1. INSIGHTS INTELIGENTES */}
      <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 to-blue-950/20 p-5">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
          <AlertCircle className="h-4 w-4" />
          Dashboard Inteligente
        </h3>
        <ul className="space-y-2.5">
          {insights.map((insight, idx) => (
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className="text-sm font-semibold text-[#e5e7eb] leading-relaxed"
            >
              • {insight}
            </motion.li>
          ))}
        </ul>
      </section>

      {/* 2. METRIC CARDS */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Card 1: Peso Atual */}
        <div className="rounded-2xl border border-[#1f293d]/50 bg-[#131929]/50 p-4">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span className="text-xs font-bold uppercase tracking-wider">Peso Atual</span>
            <TrendingDown className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#f3f4f6]">
            {weightStats.current > 0 ? `${weightStats.current.toFixed(1)} kg` : '--'}
          </p>
          <span className="text-[10px] text-[#6b7280] font-semibold">
            Iniciou com: {weightStats.start > 0 ? `${weightStats.start.toFixed(1)} kg` : '--'}
          </span>
        </div>

        {/* Card 2: Eliminado */}
        <div className="rounded-2xl border border-[#1f293d]/50 bg-[#131929]/50 p-4">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span className="text-xs font-bold uppercase tracking-wider">Eliminado</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">
            {weightStats.lost > 0 ? `-${weightStats.lost.toFixed(1)} kg` : '0.0 kg'}
          </p>
          <span className="text-[10px] text-[#6b7280] font-semibold">
            Falta: {weightStats.current > 0 ? `${(weightStats.current - weightStats.target).toFixed(1)} kg` : '--'}
          </span>
        </div>

        {/* Card 3: Consistência Semanal Dinâmica */}
        <div className="rounded-2xl border border-[#1f293d]/50 bg-[#131929]/50 p-4">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span className="text-xs font-bold uppercase tracking-wider">Frequência</span>
            <Calendar className="h-4 w-4 text-[#3b82f6]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#f3f4f6]">
            {trainingStats.weeklyCount} / {targetFrequency}
          </p>
          <span className="text-[10px] text-[#6b7280] font-semibold">
            Treinos esta semana (Meta: {targetFrequency}x)
          </span>
        </div>

        {/* Card 4: Streak de Treinos */}
        <div className="rounded-2xl border border-[#1f293d]/50 bg-[#131929]/50 p-4">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span className="text-xs font-bold uppercase tracking-wider">Streak Ativo</span>
            <Zap className="h-4 w-4 text-orange-400 animate-pulse" />
          </div>
          <p className="mt-2 text-2xl font-black text-orange-400">
            {trainingStats.streak} {trainingStats.streak === 1 ? 'Dia' : 'Dias'}
          </p>
          <span className="text-[10px] text-[#6b7280] font-semibold">
            Consistência registrada
          </span>
        </div>
      </section>

      {/* Barra de Progresso de Frequência Semanal */}
      <section className="rounded-2xl border border-[#1f293d]/40 bg-[#131929]/20 p-4">
        <div className="flex justify-between items-center text-xs font-bold mb-2">
          <span className="text-[#9ca3af]">Consistência da Semana Atual</span>
          <span className="text-emerald-400">
            {Math.min(Math.round((trainingStats.weeklyCount / targetFrequency) * 100), 100)}% da meta
          </span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#090d16] border border-[#1f293d]/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((trainingStats.weeklyCount / targetFrequency) * 100, 100)}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          />
        </div>
      </section>

      {/* 3. METAS INTERMEDIÁRIAS */}
      {goalProgress && (
        <section className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-black text-[#f3f4f6]">
              <Target className="h-4.5 w-4.5 text-emerald-400" />
              Meta Intermediária Ativa: {goalProgress.activeMilestone} kg
            </h3>
            <span className="text-xs font-bold text-[#6b7280] bg-[#090d16] px-2.5 py-1 rounded-lg border border-[#1f293d]/50">
              Predição: {goalProgress.forecastWeeks}
            </span>
          </div>

          <div className="relative h-4 w-full overflow-hidden rounded-full bg-[#090d16] border border-[#1f293d]/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress.percent}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6b7280] font-bold mt-2">
            <span>Partida: {goalProgress.previousMilestone} kg</span>
            <span className="text-emerald-400">{goalProgress.percent.toFixed(0)}% Concluído</span>
            <span>Meta: {goalProgress.activeMilestone} kg</span>
          </div>
        </section>
      )}

      {/* 4. PLANEJADOR DE TREINOS E GRÁFICO */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Gráfico de Peso Simplificado */}
        <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5 md:col-span-2">
          <h3 className="text-sm font-black text-[#f3f4f6] mb-4">Evolução do Peso (10 registros)</h3>
          <div className="h-64 w-full">
            {chartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} />
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
                <TrendingDown className="h-10 w-10 mb-2 opacity-35" />
                Registre o peso por pelo menos 2 dias para desenhar o gráfico.
              </div>
            )}
          </div>
        </div>

        {/* Planejador de Rotina da Semana */}
        <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5 space-y-4">
          <h3 className="text-sm font-black text-[#f3f4f6]">Rotina Planejada da Semana</h3>
          
          {workoutPlanStatus.length === 0 ? (
            <div className="text-xs text-[#6b7280] leading-relaxed py-6 text-center">
              Você ainda não programou sua rotina semanal. Vá em <strong>Ajustes & Metas</strong> para planejar seus treinos!
            </div>
          ) : (
            <div className="space-y-3">
              {workoutPlanStatus.map((item) => (
                <div
                  key={item.day}
                  className={`flex items-center justify-between rounded-xl p-2.5 border text-xs ${
                    item.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                      : item.modality === 'Descanso'
                      ? 'bg-zinc-950/20 border-[#1f293d]/20 text-[#6b7280]'
                      : 'bg-[#090d16]/30 border-[#1f293d]/30 text-[#9ca3af]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-[10px] text-[#6b7280]">{item.day.split('-')[0]}</span>
                    <span className="font-extrabold text-xs">
                      {item.modality === 'Descanso' ? '💤 Descanso' : item.modality}
                      {item.cycling_type && item.cycling_type !== 'Livre' ? ` (${item.cycling_type})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.duration && (
                      <span className="text-[10px] bg-[#090d16]/60 px-1.5 py-0.5 rounded font-bold text-[#6b7280]">
                        {item.duration} min
                      </span>
                    )}
                    {item.completed ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                    ) : item.modality !== 'Descanso' ? (
                      <Circle className="h-4.5 w-4.5 text-[#1f293d]" />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
