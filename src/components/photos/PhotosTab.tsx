'use client';

import React, { useState } from 'react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { supabase } from '@/lib/supabase';
import { photoService } from '@/services/api';
import { Camera, Calendar, Plus, Trash2, ArrowLeftRight, Image as ImageIcon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PhotosTab() {
  const { usePhotos, createPhoto, deletePhoto } = useFitnessData();
  const { data: photos = [], isLoading } = usePhotos();

  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // States do Form
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  // URLs alternativas coladas (caso o storage não esteja configurado ainda)
  const [frontUrl, setFrontUrl] = useState('');
  const [sideUrl, setSideUrl] = useState('');
  const [backUrl, setBackUrl] = useState('');

  // Comparador de Datas
  const [compareDateA, setCompareDateA] = useState('');
  const [compareDateB, setCompareDateB] = useState('');
  const [compareView, setCompareView] = useState<'front' | 'side' | 'back'>('front');

  const photoA = photos.find((p) => p.date === compareDateA);
  const photoB = photos.find((p) => p.date === compareDateB);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'front') setFrontFile(file);
      if (type === 'side') setSideFile(file);
      if (type === 'back') setBackFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let finalFront = frontUrl;
      let finalSide = sideUrl;
      let finalBack = backUrl;

      // Executar uploads para o Supabase Storage se existirem arquivos selecionados
      if (frontFile) {
        finalFront = await photoService.uploadImage(user.id, frontFile, 'front');
      }
      if (sideFile) {
        finalSide = await photoService.uploadImage(user.id, sideFile, 'side');
      }
      if (backFile) {
        finalBack = await photoService.uploadImage(user.id, backFile, 'back');
      }

      await createPhoto({
        date,
        weight: weight ? parseFloat(weight.replace(',', '.')) : null,
        front_url: finalFront || null,
        side_url: finalSide || null,
        back_url: finalBack || null,
        notes: notes || null,
      });

      // Reset states
      setIsOpen(false);
      setFrontFile(null);
      setSideFile(null);
      setBackFile(null);
      setFrontUrl('');
      setSideUrl('');
      setBackUrl('');
      setWeight('');
      setNotes('');
    } catch (err) {
      console.error(err);
      alert(
        'Erro ao carregar imagens. Verifique se criou o bucket público "evolution-photos" no seu Supabase Storage, ' +
        'ou utilize os campos de URL de imagem diretamente.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs text-[#6b7280] font-bold uppercase tracking-wider">Evolução Visual</p>
          <h3 className="text-lg font-black text-[#f3f4f6]">Registros Fotográficos</h3>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#10b981] px-5 py-3 font-bold text-[#090d16] shadow-lg shadow-[#10b981]/15 hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4.5 w-4.5" />
          Adicionar Fotos
        </button>
      </section>

      {/* Alerta informativo sobre Supabase Storage */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3 text-xs text-[#9ca3af]">
        <Info className="h-5 w-5 text-blue-400 shrink-0" />
        <div>
          <p className="font-bold text-[#f3f4f6] mb-0.5">Nota sobre o Upload de Fotos:</p>
          <p className="leading-normal">
            Para subir fotos direto do celular, lembre-se de ir no seu painel do <strong>Supabase &gt; Storage</strong>,
            criar um bucket chamado <strong>`evolution-photos`</strong> e marcar a opção <strong>"Public bucket"</strong>. 
            Se preferir, você também pode apenas colar links da internet.
          </p>
        </div>
      </div>

      {/* 2. COMPARADOR DE EVOLUÇÃO */}
      {photos.length >= 2 && (
        <section className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/30 p-5 space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-black text-[#f3f4f6]">
            <ArrowLeftRight className="h-4.5 w-4.5 text-emerald-400" />
            Comparador de Evolução Física
          </h4>

          {/* Selectors de datas e ângulos */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-[#6b7280] uppercase">Data A (Antes)</label>
              <select
                value={compareDateA}
                onChange={(e) => setCompareDateA(e.target.value)}
                className="rounded-xl border border-[#1f293d] bg-[#090d16] p-2.5 text-xs outline-none focus:border-emerald-500/50"
              >
                <option value="">Selecione...</option>
                {photos.map((p) => (
                  <option key={p.id} value={p.date}>
                    {new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')} {p.weight ? `(${p.weight}kg)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-[#6b7280] uppercase">Data B (Depois)</label>
              <select
                value={compareDateB}
                onChange={(e) => setCompareDateB(e.target.value)}
                className="rounded-xl border border-[#1f293d] bg-[#090d16] p-2.5 text-xs outline-none focus:border-emerald-500/50"
              >
                <option value="">Selecione...</option>
                {photos.map((p) => (
                  <option key={p.id} value={p.date}>
                    {new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')} {p.weight ? `(${p.weight}kg)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-[#6b7280] uppercase">Ângulo</label>
              <select
                value={compareView}
                onChange={(e) => setCompareView(e.target.value as any)}
                className="rounded-xl border border-[#1f293d] bg-[#090d16] p-2.5 text-xs outline-none focus:border-emerald-500/50"
              >
                <option value="front">Frente</option>
                <option value="side">Lado</option>
                <option value="back">Costas</option>
              </select>
            </div>
          </div>

          {/* Área de Imagens Comparativas */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="relative overflow-hidden rounded-2xl bg-[#090d16] aspect-[3/4] flex items-center justify-center border border-[#1f293d]/50">
              {photoA && photoA[`${compareView}_url`] ? (
                <img
                  src={photoA[`${compareView}_url`]!}
                  alt="Antes"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-[#4b5563] text-center px-4">Selecione a Data A e o Ângulo</span>
              )}
              <span className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold">Antes</span>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-[#090d16] aspect-[3/4] flex items-center justify-center border border-[#1f293d]/50">
              {photoB && photoB[`${compareView}_url`] ? (
                <img
                  src={photoB[`${compareView}_url`]!}
                  alt="Depois"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-[#4b5563] text-center px-4">Selecione a Data B e o Ângulo</span>
              )}
              <span className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-emerald-400">Depois</span>
            </div>
          </div>
        </section>
      )}

      {/* 3. GALERIA GERAL */}
      <section className="space-y-4">
        <h4 className="text-sm font-black text-[#f3f4f6]">Registros Fotográficos Salvos</h4>
        {isLoading ? (
          <p className="text-sm text-[#6b7280]">Carregando fotos...</p>
        ) : photos.length === 0 ? (
          <p className="text-sm text-[#4b5563]">Nenhum registro fotográfico lançado.</p>
        ) : (
          <div className="space-y-5">
            {photos.map((item) => (
              <div key={item.id} className="rounded-3xl border border-[#1f293d]/50 bg-[#131929]/20 p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-emerald-400" />
                    <span className="text-xs font-black">
                      {new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {item.weight && (
                      <span className="rounded-lg bg-[#090d16] px-2 py-0.5 text-[10px] font-bold text-[#f3f4f6]">
                        {item.weight} kg
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deletePhoto(item.id)}
                    className="text-[#4b5563] hover:text-red-400 p-2"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="overflow-hidden rounded-xl bg-[#090d16] aspect-[3/4] flex items-center justify-center border border-[#1f293d]/30">
                    {item.front_url ? (
                      <img src={item.front_url} alt="Frente" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[8px] text-[#4b5563]">Sem Frente</span>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-xl bg-[#090d16] aspect-[3/4] flex items-center justify-center border border-[#1f293d]/30">
                    {item.side_url ? (
                      <img src={item.side_url} alt="Lado" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[8px] text-[#4b5563]">Sem Lado</span>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-xl bg-[#090d16] aspect-[3/4] flex items-center justify-center border border-[#1f293d]/30">
                    {item.back_url ? (
                      <img src={item.back_url} alt="Costas" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[8px] text-[#4b5563]">Sem Costas</span>
                    )}
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-[#6b7280] italic leading-relaxed border-t border-[#1f293d]/30 pt-2.5">
                    Obs: {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DIALOG MODAL: CADASTRO DE FOTOS */}
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
                <Camera className="h-5 w-5 text-emerald-400" />
                Registrar Evolução Corporal
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Data</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Peso (kg)</label>
                    <input
                      type="text"
                      placeholder="Ex: 104.2"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Uploads por Foto (Frente, Lado, Costas) */}
                <div className="space-y-3 border-y border-[#1f293d]/30 py-3 my-2">
                  {/* Foto de Frente */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] block">Foto de Frente</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'front')}
                      className="text-xs text-[#9ca3af]"
                    />
                    <input
                      type="text"
                      placeholder="Ou cole a URL da imagem de frente"
                      value={frontUrl}
                      onChange={(e) => setFrontUrl(e.target.value)}
                      className="w-full rounded-lg border border-[#1f293d] bg-[#090d16] p-2 text-[10px] outline-none mt-1"
                    />
                  </div>

                  {/* Foto de Lado */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] block">Foto de Lado</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'side')}
                      className="text-xs text-[#9ca3af]"
                    />
                    <input
                      type="text"
                      placeholder="Ou cole a URL da imagem de lado"
                      value={sideUrl}
                      onChange={(e) => setSideUrl(e.target.value)}
                      className="w-full rounded-lg border border-[#1f293d] bg-[#090d16] p-2 text-[10px] outline-none mt-1"
                    />
                  </div>

                  {/* Foto de Costas */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] block">Foto de Costas</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'back')}
                      className="text-xs text-[#9ca3af]"
                    />
                    <input
                      type="text"
                      placeholder="Ou cole a URL da imagem de costas"
                      value={backUrl}
                      onChange={(e) => setBackUrl(e.target.value)}
                      className="w-full rounded-lg border border-[#1f293d] bg-[#090d16] p-2 text-[10px] outline-none mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">Observações</label>
                  <textarea
                    placeholder="Notas extras (ex: Pós-treino de perna)..."
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-[#1f293d] bg-[#090d16] px-3 py-2.5 text-xs focus:border-emerald-500/50 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setFrontFile(null);
                      setSideFile(null);
                      setBackFile(null);
                      setFrontUrl('');
                      setSideUrl('');
                      setBackUrl('');
                    }}
                    className="flex-1 rounded-xl border border-[#1f293d] py-3 text-xs font-bold text-[#9ca3af] hover:bg-[#090d16] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 rounded-xl bg-[#10b981] py-3 text-xs font-bold text-[#090d16] hover:brightness-105 transition-all shadow-lg shadow-emerald-500/10"
                  >
                    {isUploading ? 'Enviando...' : 'Salvar Registro'}
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
