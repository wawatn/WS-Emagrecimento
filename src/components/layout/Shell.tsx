'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Dumbbell,
  Scale,
  Camera,
  Heart,
  CalendarDays,
  LogOut,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type TabId = 'dashboard' | 'trainings' | 'weights' | 'photos' | 'health' | 'calendar';

interface ShellProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  children: React.ReactNode;
}

export function Shell({ activeTab, setActiveTab, children }: ShellProps) {
  const { user, profile, signOut } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'trainings', label: 'Treinos', icon: Dumbbell },
    { id: 'weights', label: 'Métricas', icon: Scale },
    { id: 'photos', label: 'Evolução', icon: Camera },
    { id: 'health', label: 'Saúde', icon: Heart },
    { id: 'calendar', label: 'Calendário', icon: CalendarDays },
  ] as const;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-[#f3f4f6] font-sans">
      
      {/* 1. SIDEBAR (DESKTOP - Telas Médias e Grandes) */}
      <aside className="hidden md:flex h-full w-64 flex-col border-r border-[#1f293d]/50 bg-[#131929]/50 backdrop-blur-md">
        {/* Header da Sidebar */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[#1f293d]/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-blue-500 text-[#090d16] shadow-lg shadow-emerald-400/20">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tight bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Projeto 100KG
            </span>
            <span className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">
              Evolução Física
            </span>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-emerald-400 bg-[#090d16]'
                    : 'text-[#9ca3af] hover:bg-[#131929] hover:text-[#f3f4f6]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-emerald-400"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-[#4b5563]'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar (Usuário e Logout) */}
        <div className="border-t border-[#1f293d]/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#090d16] border border-[#1f293d]/50 text-emerald-400 font-black text-sm uppercase">
              {profile?.display_name?.substring(0, 2) || user?.email?.substring(0, 2) || '10'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-bold text-[#f3f4f6]">
                {profile?.display_name || 'Usuário 100KG'}
              </span>
              <span className="truncate text-[11px] text-[#6b7280]">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl border border-[#1f293d] bg-[#090d16] px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* 2. CONTEÚDO PRINCIPAL COM HEADER RESPONSIVO */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Header Mobile & Topo Desktop */}
        <header className="flex h-16 w-full items-center justify-between border-b border-[#1f293d]/30 bg-[#131929]/30 px-6 backdrop-blur-md md:border-b-0 md:bg-transparent">
          {/* Título Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-400 to-blue-500 text-[#090d16]">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight">
              Projeto 100KG
            </span>
          </div>

          {/* Título Desktop (Diz qual aba está selecionada) */}
          <h2 className="hidden md:block text-xl font-extrabold tracking-tight capitalize">
            {navigationItems.find((item) => item.id === activeTab)?.label || 'Painel'}
          </h2>

          {/* Avatar / Configurações Rápidas (Mobile) */}
          <div className="flex items-center gap-3">
            <div className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-[#090d16] border border-[#1f293d]/50 text-emerald-400 text-xs font-bold uppercase">
              {profile?.display_name?.substring(0, 2) || user?.email?.substring(0, 2) || '10'}
            </div>
            <button
              onClick={signOut}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Viewport do Conteúdo da Aba */}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 pb-24 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="h-full w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. BARRA DE NAVEGAÇÃO INFERIOR (MOBILE - Apenas Telas Pequenas) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[#1f293d]/50 bg-[#131929]/95 px-2 pb-safe shadow-lg backdrop-blur-lg">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center w-12 py-1 space-y-0.5"
            >
              <Icon className={`h-5.5 w-5.5 transition-all ${isActive ? 'text-emerald-400 scale-110' : 'text-[#4b5563]'}`} />
              <span className={`text-[9px] font-bold tracking-tight transition-all ${isActive ? 'text-emerald-400' : 'text-[#6b7280]'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active-dot"
                  className="absolute bottom-0 h-1 w-4 rounded-full bg-emerald-400"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </nav>

    </div>
  );
}
