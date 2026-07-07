'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Dumbbell, LogOut } from 'lucide-react';

export default function Home() {
  const { user, profile, loading, signOut } = useAuth();

  // 1. Tela de Carregamento Premium (Estilo Whoop/Apple Fitness)
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] text-[#f3f4f6]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-blue-500 text-[#090d16] shadow-lg shadow-emerald-400/25">
            <Dumbbell className="h-8 w-8 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Carregando evolução...
            </h2>
            <p className="text-xs text-[#6b7280] mt-1">Conectando ao Supabase de forma segura</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Redirecionar para login caso não esteja autenticado
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Área Logada - Dashboard Provisório (Será expandido na Fase 5)
  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-[#f3f4f6]">
      {/* Header Simples de Teste */}
      <header className="flex items-center justify-between border-b border-[#1f293d]/50 bg-[#131929]/50 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-blue-500 text-[#090d16]">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Projeto 100KG
          </span>
        </div>
        
        <button
          onClick={signOut}
          className="flex items-center gap-2 rounded-xl border border-[#1f293d] bg-[#090d16] px-4 py-2 text-sm font-semibold text-[#f3f4f6] transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </header>

      {/* Conteúdo de Boas-Vindas Provisório */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 rounded-3xl border border-[#1f293d]/50 bg-[#131929]/60 p-8 shadow-xl">
          <h2 className="text-2xl font-black text-emerald-400">Autenticação Concluída com Sucesso!</h2>
          <p className="text-sm text-[#9ca3af]">
            Olá, <strong className="text-[#f3f4f6]">{profile?.display_name || user.email}</strong>! 
            Sua conta está integrada de forma segura com o Supabase. 
          </p>
          <div className="rounded-xl bg-[#090d16]/80 p-4 text-xs text-[#6b7280] space-y-1.5 text-left border border-[#1f293d]/30">
            <p>• <strong>ID de Usuário:</strong> {user.id}</p>
            <p>• <strong>E-mail:</strong> {user.email}</p>
            <p>• <strong>Meta Salva:</strong> {profile?.target_weight || '100'} kg</p>
          </div>
          <p className="text-xs text-[#6b7280] pt-2">
            Aguardando a liberação da Fase 5 pelo Wagner para construirmos o Dashboard completo com gráficos e metas!
          </p>
        </div>
      </main>
    </div>
  );
}
