'use client';

import React, { useMemo } from 'react';
import { useFitnessData } from '@/hooks/useFitnessData';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function DashboardTab() {
  const { useWeights, useTrainings, useProfile } = useFitnessData();
  const { data: profile } = useProfile();
  const { data: weights = [] } = useWeights();
  const { data: trainings = [] } = useTrainings();

  // 1. CÁLCULO DE MÉTRICAS DE PESO
  const weightStats = useMemo(() => {
    if (weights.length === 0) {
      return {
        current: 0,
        start: 0,
        lost: 0,
        target: profile?.target_weight || 100,
        streak: 0,
      };
    }

    // Ordenados por data crescente para histórico e decrescente para mais recentes
    const sortedAsc = [...weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sortedDesc = [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const start = sortedAsc[0].weight;
    const current = sortedDesc[0].weight;
    const lost = start - current;
    const target = profile?.target_weight || 100;

    // Cálculo da sequência de dias consecutivos registrando peso (streak)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = new Set(weights.map((w) => w.date));
    let checkDate = new Date(today);

    // Se não registrou hoje, checa a partir de ontem
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

    const weeklyTrainings = trainings.filter((t) => new Date(t.date) >= startOfWeek);
    const monthlyTrainings = trainings.filter((t) => new Date(t.date) >= startOfMonth);

    const totalHours = trainings.reduce((acc, t) => acc + t.duration, 0) / 60;
    const totalCalories = trainings.reduce((acc, t) => acc + (t.calories || 0), 0);

    // Dias treinados (sem duplicar treinos no mesmo dia)
    const uniqueDays = new Set(trainings.map((t) => t.date));
    const daysTrained = uniqueDays.size;

    // Cálculo da sequência de dias seguidos de treino (streak)
    let trainingStreak = 0;
    const uniqueDatesSorted = Array.from(uniqueDays).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    let checkDate = new Date(today);
    checkDate.setHours(0, 0, 0, 0);

    // Permite 1 dia de descanso antes de quebrar a sequência
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
    };
  }, [trainings]);

  // 3. METAS E METAS INTERMEDIÁRIAS
  const goalProgress = useMemo(() => {
    const current = weightStats.current;
    if (current === 0) return null;

    const milestones = [120, 115, 110, 105, 100];
    
    // Determinar a meta intermediária ativa
    // A meta ativa é a menor milestone que ainda é menor/igual ao peso atual, ou a primeira da lista que é menor que o peso atual.
    let activeMilestone = 100;
    let previousMilestone = 130; // Ponto de partida padrão

    for (let i = 0; i < milestones.length; i++) {
      if (current > milestones[i]) {
        activeMilestone = milestones[i];
        previousMilestone = i === 0 ? milestones[0] + 10 : milestones[i - 1];
        break;
      }
    }

    // Porcentagem de progresso da milestone ativa
    // Se o peso está descendo de previousMilestone para activeMilestone
    const totalDiff = previousMilestone - activeMilestone;
    const currentDiff = previousMilestone - current;
    const percent = Math.min(Math.max((currentDiff / totalDiff) * 100, 0), 100);

    // Previsão de chegada baseada nas últimas 3 semanas de perda de peso
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
        const weeklyLossRate = weightLost3W / 3; // Média semanal
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

  // 4. MOTOR DE INSIGHTS INTELIGENTES
  const insights = useMemo(() => {
    const list: string[] = [];
    if (weightStats.current === 0) return ['Seja bem-vindo! Faça seus primeiros registros de peso e treinos para ver os insights.'];

    // Insight 1: Peso perdido absoluto
    if (weightStats.lost > 0) {
      list.push(`Você já eliminou ${weightStats.lost.toFixed(1)} kg no total desde o início.`);
    }

    // Insight 2: Ritmo de perda de peso (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const weightsLast30D = weights
      .filter((w) => new Date(w.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (weightsLast30D.length >= 2) {
      const lost30 = weightsLast30D[0].weight - weightsLast30D[weightsLast30D.length - 1].weight;
      if (lost30 > 0) {
        list.push(`Você perdeu ${lost30.toFixed(1)} kg nos últimos 30 dias. Bom ritmo!`);
      }
    }

    // Insight 3: Quantidade de treinos na semana
    if (trainingStats.weeklyCount > 0) {
      list.push(`Você treinou ${trainingStats.weeklyCount} ${trainingStats.weeklyCount === 1 ? 'vez' : 'vezes'} esta semana.`);
    }

    // Insight 4: Faltando para a meta ativa
    if (goalProgress) {
      const rem = weightStats.current - goalProgress.activeMilestone;
      if (rem > 0) {
        list.push(`Faltam apenas ${rem.toFixed(1)} kg para alcançar sua meta de ${goalProgress.activeMilestone} kg.`);
      }
    }

    // Insight 5: Dias sem registrar peso
    if (weights.length > 0) {
      const lastWeightDate = new Date(weights[0].date);
      const diffTime = Math.abs(new Date().getTime() - lastWeightDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
      if (diffDays >= 3) {
        list.push(`Você está há ${diffDays} dias sem registrar seu peso. Vamos voltar à rotina?`);
      }
    }

    // Insight 6: Comparação de Z2 (Ciclismo)
    const cyclingZ2Trainings = trainings.filter(
      (t) => t.modality === 'Ciclismo' && t.cycling_type === 'Z2'
    );
    if (cyclingZ2Trainings.length >= 2) {
      const totalMinutesZ2 = cyclingZ2Trainings.reduce((acc, t) => acc + t.duration, 0);
      list.push(`Você acumulou ${totalMinutesZ2} minutos de treino em Z2 (cárdio regenerativo).`);
    }

    // Garantir que sempre existam insights
    if (list.length === 0) {
      list.push('Continue registrando peso e treinos diariamente para gerar insights de ritmo e consistência.');
    }

    return list.slice(0, 3); // Retorna os 3 mais relevantes
  }, [weightStats, trainingStats, goalProgress, weights, trainings]);

  // Histórico de pesos para o gráfico simplificado do dashboard (últimos 10 registros)
  const chartData = useMemo(() => {
    return [...weights]
      .slice(0, 10)
      .reverse()
      .map((w) => ({
        date: new Date(w.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
        peso: w.weight,
      }));
  }, [weights]);

  return (
    <div className="space-y-6">
      {/* 1. SEÇÃO DE INSIGHTS INTELIGENTES */}
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

      {/* 2. GRID DE MÉTRICAS PRINCIPAIS */}
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

        {/* Card 3: Dias Treinados */}
        <div className="rounded-2xl border border-[#1f293d]/50 bg-[#131929]/50 p-4">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span className="text-xs font-bold uppercase tracking-wider">Dias Ativos</span>
            <Calendar className="h-4 w-4 text-[#3b82f6]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#f3f4f6]">
            {trainingStats.daysTrained}
          </p>
          <span className="text-[10px] text-[#6b7280] font-semibold">
            Esta semana: {trainingStats.weeklyCount}x
          </span>
        </div>

        {/* Card 4: Sequência (Streak) */}
        <div className="rounded-2xl border border-[#1f293d]/50 bg-[#131929]/50 p-4">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span className="text-xs font-bold uppercase tracking-wider">Streak Treino</span>
            <Zap className="h-4 w-4 text-orange-400 animate-pulse" />
          </div>
          <p className="mt-2 text-2xl font-black text-orange-400">
            {trainingStats.streak} {trainingStats.streak === 1 ? 'Dia' : 'Dias'}
          </p>
          <span className="text-[10px] text-[#6b7280] font-semibold">
            Sequência peso: {weightStats.streak} dias
          </span>
        </div>
      </section>

      {/* 3. METAS E METAS INTERMEDIÁRIAS */}
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

          {/* Barra de Progresso */}
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-[#090d16] border border-[#1f293d]/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress.percent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
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

      {/* 4. GRÁFICO E DETALHES ADICIONAIS */}
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
                    activeDot={{ r: 6 }}
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

        {/* Resumo de Saúde & Sono Rápido */}
        <div className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5 space-y-4">
          <h3 className="text-sm font-black text-[#f3f4f6]">Volume de Treino Total</h3>
          
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#6b7280] font-bold uppercase">Tempo Acumulado</span>
                <span className="text-sm font-bold text-[#f3f4f6]">
                  {trainingStats.totalHours.toFixed(1)} Horas
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <Flame className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#6b7280] font-bold uppercase">Calorias Queimadas</span>
                <span className="text-sm font-bold text-[#f3f4f6]">
                  {trainingStats.totalCalories.toLocaleString('pt-BR')} kcal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Award className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#6b7280] font-bold uppercase">Meta Principal</span>
                <span className="text-sm font-bold text-[#f3f4f6]">
                  {weightStats.target} kg
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
