'use client';

// Force clean build to inject new env variables from Vercel dashboard

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Shell, TabId } from '@/components/layout/Shell';
import { DashboardTab } from '@/components/dashboard/DashboardTab';
import { TrainingsTab } from '@/components/trainings/TrainingsTab';
import { WeightsTab } from '@/components/weights/WeightsTab';
import { PhotosTab } from '@/components/photos/PhotosTab';
import { HealthTab } from '@/components/health/HealthTab';
import { CalendarTab } from '@/components/calendar/CalendarTab';
import { Dumbbell } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

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
            <p className="text-xs text-[#6b7280] mt-1 font-semibold">Conectando ao Supabase de forma segura</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Redirecionar para login caso não esteja autenticado
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Renderizar aba selecionada de forma reativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'trainings':
        return <TrainingsTab />;
      case 'weights':
        return <WeightsTab />;
      case 'photos':
        return <PhotosTab />;
      case 'health':
        return <HealthTab />;
      case 'calendar':
        return <CalendarTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </Shell>
  );
}
