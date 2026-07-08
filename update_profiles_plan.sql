-- =========================================================================
-- PROJETO 100KG - PATCH DE ATUALIZAÇÃO DO BANCO DE DADOS (SUPABASE)
-- =========================================================================
-- EXECUTE ESTE SCRIPT NO EDITOR SQL DO SEU PAINEL SUPABASE.
-- ELE ADICIONARÁ OS CAMPOS PARA SALVAR SUA ROTINA PLANEJADA E SUAS METAS SEMANAIS.

-- 1. Adicionar colunas de metas na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weekly_training_target INTEGER DEFAULT 3;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weekly_workout_plan JSONB DEFAULT '[]'::jsonb;
