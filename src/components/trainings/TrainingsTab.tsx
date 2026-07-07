'use client';

import React, { useState } from 'react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { parseFitnessSmartInput } from '@/utils/fitnessSmartParser';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trainingSchema, TrainingInput } from '@/lib/zodSchemas';
import {
  Dumbbell,
  Plus,
  Mic,
  Calendar,
  Clock,
  Flame,
  Milestone,
  Heart,
  TrendingUp,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TrainingsTab() {
  const { useTrainings, createTraining, deleteTraining } = useFitnessData();
  const { data: trainings = [], isLoading } = useTrainings();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TrainingInput>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      modality: 'Ciclismo',
      duration: 45,
    },
  });

  const selectedModality = watch('modality');

  // Lógica de Reconhecimento de Voz
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz por API. Tente no Chrome ou no Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceText('Ouvindo... Fale seu treino (Ex: "Ciclismo Z2 de 1 hora ontem")');
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setIsListening(false);
      setVoiceText('Erro ao reconhecer voz. Tente novamente.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setVoiceText(`Você falou: "${speechToText}"`);

      // Parsear texto com NLP e autopreencher formulário
      try {
        const parsed = parseFitnessSmartInput(speechToText);
        
        if (parsed.modality) setValue('modality', parsed.modality);
        if (parsed.cycling_type) setValue('cycling_type', parsed.cycling_type);
        if (parsed.duration) setValue('duration', parsed.duration);
        if (parsed.distance) setValue('distance', parsed.distance);
        if (parsed.calories) setValue('calories', parsed.calories);
        if (parsed.date) setValue('date', parsed.date);
        if (parsed.notes) setValue('notes', parsed.notes);
      } catch (err) {
        console.error('Erro ao processar áudio:', err);
      }
    };

    recognition.start();
  };

  const onSubmit = async (data: TrainingInput) => {
    try {
      const parsed = trainingSchema.parse(data);
      await createTraining({
        date: parsed.date,
        modality: parsed.modality,
        cycling_type: parsed.modality === 'Ciclismo' ? parsed.cycling_type || 'Livre' : null,
        duration: parsed.duration,
        calories: parsed.calories || null,
        distance: parsed.distance || null,
        avg_hr: parsed.avg_hr || null,
        max_hr: parsed.max_hr || null,
        avg_cadence: parsed.avg_cadence || null,
        max_cadence: null, // Mapeado como nulo
        avg_speed: parsed.avg_speed || null,
        elevation: parsed.elevation || null,
        notes: parsed.notes || null,
      });
      setIsOpen(false);
      reset();
      setVoiceText('');
    } catch (err) {
      console.error('Erro ao salvar treino:', err);
    }
  };

  const getIntensityColor = (training: typeof trainings[0]) => {
    if (training.modality === 'Futebol') return 'border-blue-500 bg-blue-500/5 text-blue-400';
    if (training.modality === 'Ciclismo') {
      if (training.cycling_type === 'Z5') return 'border-red-500 bg-red-500/5 text-red-400';
      if (training.cycling_type === 'Z4') return 'border-orange-500 bg-orange-500/5 text-orange-400';
      if (training.cycling_type === 'Z2') return 'border-emerald-500 bg-emerald-500/5 text-emerald-400';
    }
    return 'border-[#1f293d] bg-[#131929]/40 text-[#9ca3af]';
  };

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO DA ABA COM METAS DE VOLUME */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs text-[#6b7280] font-bold uppercase tracking-wider">Histórico de Atividades</p>
          <h3 className="text-lg font-black text-[#f3f4f6]">Registros de Treino</h3>
        </div>
        
        <button
          onClick={() => {
            setIsOpen(true);
            setVoiceText('');
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#10b981] px-5 py-3 font-bold text-[#090d16] shadow-lg shadow-[#10b981]/15 hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4.5 w-4.5" />
          Registrar Treino
        </button>
      </section>

      {/* 2. LISTAGEM DE TREINOS */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-[#6b7280]">
          Carregando histórico de treinos...
        </div>
      ) : trainings.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center text-sm text-[#4b5563]">
          <Dumbbell className="h-12 w-12 mb-3 opacity-30" />
          Nenhum treino registrado ainda.
          <button
            onClick={() => setIsOpen(true)}
            className="mt-2 text-xs font-bold text-emerald-400 hover:underline"
          >
            Começar primeiro registro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {trainings.map((training) => (
            <div
              key={training.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-sm ${getIntensityColor(
                training
              )}`}
            >
              {/* Topo do Card */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-[#f3f4f6]">{training.modality}</span>
                    {training.cycling_type && (
                      <span className="rounded-lg bg-[#090d16]/60 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        {training.cycling_type}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#6b7280] font-bold">
                    {new Date(training.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                
                <button
                  onClick={() => deleteTraining(training.id)}
                  className="rounded-xl p-2 text-[#4b5563] hover:bg-red-500/10 hover:text-red-400 transition-all"
                  title="Excluir Registro"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Métricas do Card */}
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#1f293d]/30 pt-3 text-xs text-[#9ca3af]">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#4b5563]" />
                  <div>
                    <p className="text-[9px] text-[#6b7280] uppercase font-bold">Duração</p>
                    <p className="font-bold text-[#f3f4f6]">{training.duration} min</p>
                  </div>
                </div>

                {training.distance && (
                  <div className="flex items-center gap-1.5">
                    <Milestone className="h-4 w-4 text-[#4b5563]" />
                    <div>
                      <p className="text-[9px] text-[#6b7280] uppercase font-bold">Distância</p>
                      <p className="font-bold text-[#f3f4f6]">{training.distance.toFixed(1)} km</p>
                    </div>
                  </div>
                )}

                {training.calories && (
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-[#4b5563]" />
                    <div>
                      <p className="text-[9px] text-[#6b7280] uppercase font-bold">Calorias</p>
                      <p className="font-bold text-[#f3f4f6]">{training.calories} kcal</p>
                    </div>
                  </div>
                )}

                {training.avg_hr && (
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-[#4b5563]" />
                    <div>
                      <p className="text-[9px] text-[#6b7280] uppercase font-bold">FC Média</p>
                      <p className="font-bold text-[#f3f4f6]">{training.avg_hr} bpm</p>
                    </div>
                  </div>
                )}

                {training.avg_speed && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-[#4b5563]" />
                    <div>
                      <p className="text-[9px] text-[#6b7280] uppercase font-bold">Velo Média</p>
                      <p className="font-bold text-[#f3f4f6]">{training.avg_speed.toFixed(1)} km/h</p>
                    </div>
                  </div>
                )}
              </div>

              {training.notes && (
                <p className="mt-3 rounded-lg bg-[#090d16]/30 p-2.5 text-[11px] text-[#6b7280] italic leading-normal border border-[#1f293d]/20">
                  {training.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. DIALOG MODAL: CADASTRO DE TREINO */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-[#1f293d]/50 bg-[#131929] p-6 shadow-2xl text-[#f3f4f6] overflow-y-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1f293d]/30 mb-4">
                <h3 className="text-base font-black flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-emerald-400" />
                  Registrar Atividade Física
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-1.5 text-xs hover:bg-[#131929] transition-all"
                >
                  Fechar
                </button>
              </div>

              {/* Controle por Voz Integrado */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Mic className="h-4 w-4" />
                    Entrada Fácil por Voz
                  </span>
                  <button
                    type="button"
                    onClick={startVoiceInput}
                    disabled={isListening}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10b981] text-[#090d16] shadow-md shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
                  >
                    <Mic className={`h-4.5 w-4.5 ${isListening ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                {voiceText && (
                  <p className="text-[11px] text-[#9ca3af] italic leading-relaxed bg-[#090d16]/80 p-2.5 rounded-xl border border-[#1f293d]/30">
                    {voiceText}
                  </p>
                )}
              </div>

              {/* Form de Inputs */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Data e Modalidade */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Data</label>
                    <input
                      type="date"
                      {...register('date')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Modalidade</label>
                    <select
                      {...register('modality')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                    >
                      <option value="Ciclismo">Ciclismo</option>
                      <option value="Futebol">Futebol</option>
                      <option value="Caminhada">Caminhada</option>
                      <option value="Corrida">Corrida</option>
                      <option value="Academia">Academia</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                {/* Sub-Zonas Exclusivas de Ciclismo */}
                {selectedModality === 'Ciclismo' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Zona / Tipo de Treino</label>
                    <select
                      {...register('cycling_type')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                    >
                      <option value="Livre">Livre / Passeio</option>
                      <option value="Recuperação">Recuperação (Leve)</option>
                      <option value="Z2">Z2 (Aeróbico Base)</option>
                      <option value="Z3">Z3 (Ritmo / Tempo)</option>
                      <option value="Z4">Z4 (Limiar LTHR)</option>
                      <option value="Z5">Z5 (Capacidade Anaeróbica)</option>
                      <option value="Longão">Longão / Endurance</option>
                    </select>
                    {errors.cycling_type && <span className="text-[10px] text-red-400">{errors.cycling_type.message}</span>}
                  </div>
                )}

                {/* Duração, Distância e Calorias */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Tempo (min)</label>
                    <input
                      type="number"
                      placeholder="Ex: 45"
                      {...register('duration')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                    />
                    {errors.duration && <span className="text-[10px] text-red-400">{errors.duration.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Distância (km)</label>
                    <input
                      type="text"
                      placeholder="Ex: 25.5"
                      {...register('distance')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Calorias (kcal)</label>
                    <input
                      type="number"
                      placeholder="Ex: 350"
                      {...register('calories')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                    />
                  </div>
                </div>

                {/* Métricas Avançadas de Ciclismo / Frequência */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">FC Média (bpm)</label>
                    <input
                      type="number"
                      placeholder="Ex: 145"
                      {...register('avg_hr')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">FC Máxima</label>
                    <input
                      type="number"
                      placeholder="Ex: 180"
                      {...register('max_hr')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Cadência Média</label>
                    <input
                      type="number"
                      placeholder="Ex: 85"
                      {...register('avg_cadence')}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                    />
                  </div>
                </div>

                {/* Métricas Extras Ciclismo */}
                {selectedModality === 'Ciclismo' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Velo Média (km/h)</label>
                      <input
                        type="text"
                        placeholder="Ex: 27.5"
                        {...register('avg_speed')}
                        className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Elevação (m)</label>
                      <input
                        type="text"
                        placeholder="Ex: 350"
                        {...register('elevation')}
                        className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Observações */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Observações</label>
                  <textarea
                    placeholder="Como foi o treino? Algum desconforto?"
                    rows={2}
                    {...register('notes')}
                    className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none resize-none"
                  />
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      reset();
                      setVoiceText('');
                    }}
                    className="flex-1 rounded-xl border border-[#1f293d] py-3 text-xs font-bold text-[#9ca3af] hover:bg-[#090d16] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#10b981] py-3 text-xs font-bold text-[#090d16] hover:brightness-105 transition-all shadow-lg shadow-emerald-500/10"
                  >
                    Salvar Treino
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
