'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Dumbbell, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Validador do Formulário
const authSchema = z.object({
  email: z.string().email('Por favor, insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres'),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthScreen() {
  const { signInWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const handleAuthSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isRegister) {
        // Fluxo de Cadastro
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          setErrorMsg(error.message === 'User already registered' 
            ? 'Este e-mail já está cadastrado.' 
            : error.message
          );
        } else {
          setSuccessMsg('Cadastro realizado! Se o e-mail exigir confirmação, verifique sua caixa de entrada.');
          reset();
        }
      } else {
        // Fluxo de Login
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          setErrorMsg(error.message === 'Invalid login credentials' 
            ? 'E-mail ou senha incorretos.' 
            : error.message
          );
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090d16] px-4 py-12 text-[#f3f4f6]">
      {/* Detalhe de fundo em degradê neon desfocado */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-[32px] border border-[#1f293d]/50 bg-[#131929]/90 p-8 shadow-2xl backdrop-blur-md"
      >
        {/* Logo / Header */}
        <div className="flex flex-col items-center justify-center space-y-3 pb-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-blue-500 text-[#090d16] shadow-lg shadow-emerald-400/20">
            <Dumbbell className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Projeto 100KG
            </h1>
            <p className="mt-1 text-sm text-[#9ca3af]">
              Sua evolução física sob controle
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-[#090d16] p-1 mb-6">
          <button
            onClick={() => {
              setIsRegister(false);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              !isRegister ? 'bg-[#131929] text-emerald-400 shadow-sm' : 'text-[#6b7280]'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setIsRegister(true);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              isRegister ? 'bg-[#131929] text-emerald-400 shadow-sm' : 'text-[#6b7280]'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Alertas de Mensagem */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {errorMsg}
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit(handleAuthSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">E-mail</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-5 w-5 text-[#4b5563]" />
              <input
                type="email"
                placeholder="nome@exemplo.com"
                {...register('email')}
                className="w-full rounded-2xl border border-[#1f293d] bg-[#090d16] py-3.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-[#4b5563] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">Senha</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-5 w-5 text-[#4b5563]" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full rounded-2xl border border-[#1f293d] bg-[#090d16] py-3.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-[#4b5563] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 font-bold text-[#090d16] shadow-lg shadow-emerald-500/10 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#090d16] border-t-transparent" />
            ) : (
              <>
                {isRegister ? 'Criar Conta' : 'Acessar Conta'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute w-full border-t border-[#1f293d]" />
          <span className="relative bg-[#131929] px-3 text-xs text-[#4b5563] uppercase tracking-widest">
            Ou continue com
          </span>
        </div>

        {/* Login com o Google */}
        <button
          onClick={signInWithGoogle}
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[#1f293d] bg-[#090d16] py-3.5 font-semibold text-[#f3f4f6] transition-all hover:bg-[#131929] active:scale-[0.99]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.437 0-3.555 2.882-6.437 6.437-6.437 1.543 0 2.95.549 4.053 1.458l3.11-3.11C19.24 2.148 15.918 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.84 0 10.932-4.181 10.932-11.24 0-.756-.073-1.485-.207-2.185H12.24z"
            />
          </svg>
          Google
        </button>
      </motion.div>
    </div>
  );
}
