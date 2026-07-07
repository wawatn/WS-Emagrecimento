-- =========================================================================
-- PROJETO 100KG - SCHEMA DE BANCO DE DADOS POSTGRESQL (SUPABASE)
-- =========================================================================

-- 1. TABELA DE PERFIS DE USUÁRIOS (público)
-- Esta tabela armazena dados de perfil e configurações de metas.
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    start_weight NUMERIC(5,2),
    target_weight NUMERIC(5,2) DEFAULT 100.00 NOT NULL
);

-- Habilitar RLS para perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);


-- 2. TABELA DE REGISTRO DE PESO DIÁRIO
CREATE TABLE public.weights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    weight NUMERIC(5,2) NOT NULL CHECK (weight > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Garantir que exista apenas um peso registrado por dia para o mesmo usuário
CREATE UNIQUE INDEX idx_user_weight_date ON public.weights(user_id, date);

-- Habilitar RLS para pesos
ALTER TABLE public.weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow CRUD operations for own weights"
    ON public.weights FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 3. TABELA DE REGISTRO DE TREINOS
CREATE TABLE public.trainings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    modality TEXT CHECK (modality IN ('Ciclismo', 'Futebol', 'Caminhada', 'Corrida', 'Academia', 'Outro')) NOT NULL,
    
    -- Campos exclusivos de Ciclismo
    cycling_type TEXT CHECK (cycling_type IN ('Recuperação', 'Z2', 'Z3', 'Z4', 'Z5', 'Longão', 'Livre')),
    
    -- Campos de Métricas Gerais
    duration INTEGER NOT NULL CHECK (duration > 0), -- em minutos
    calories INTEGER CHECK (calories >= 0),
    distance NUMERIC(6,2) CHECK (distance >= 0), -- em km
    avg_hr INTEGER CHECK (avg_hr >= 0),
    max_hr INTEGER CHECK (max_hr >= 0),
    avg_cadence INTEGER CHECK (avg_cadence >= 0),
    max_cadence INTEGER CHECK (max_cadence >= 0),
    avg_speed NUMERIC(4,1) CHECK (avg_speed >= 0), -- em km/h
    elevation NUMERIC(6,2) CHECK (elevation >= 0), -- em metros
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice para busca rápida de treinos por usuário e data
CREATE INDEX idx_user_training_date ON public.trainings(user_id, date);

-- Habilitar RLS para treinos
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow CRUD operations for own trainings"
    ON public.trainings FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 4. TABELA DE MEDIDAS CORPORAIS
CREATE TABLE public.body_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    chest NUMERIC(5,2) CHECK (chest >= 0),
    arm NUMERIC(5,2) CHECK (arm >= 0),
    abdomen NUMERIC(5,2) CHECK (abdomen >= 0),
    waist NUMERIC(5,2) CHECK (waist >= 0),
    hip NUMERIC(5,2) CHECK (hip >= 0),
    thigh NUMERIC(5,2) CHECK (thigh >= 0),
    calf NUMERIC(5,2) CHECK (calf >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Garantir que exista apenas um registro de medidas por dia para o mesmo usuário
CREATE UNIQUE INDEX idx_user_measurements_date ON public.body_measurements(user_id, date);

-- Habilitar RLS para medidas
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow CRUD operations for own measurements"
    ON public.body_measurements FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 5. TABELA DE FOTOS DE EVOLUÇÃO
CREATE TABLE public.photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    weight NUMERIC(5,2) CHECK (weight > 0),
    front_url TEXT,
    side_url TEXT,
    back_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice para busca rápida de fotos por usuário e data
CREATE INDEX idx_user_photos_date ON public.photos(user_id, date);

-- Habilitar RLS para fotos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow CRUD operations for own photos"
    ON public.photos FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 6. TABELA DE METAS INTERMEDIÁRIAS
CREATE TABLE public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_weight NUMERIC(5,2) NOT NULL CHECK (target_weight > 0),
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS para metas
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow CRUD operations for own goals"
    ON public.goals FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 7. TABELA DE SONO E SAÚDE DIÁRIA
CREATE TABLE public.sleep_health (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    sleep_hours NUMERIC(4,2) NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality TEXT CHECK (sleep_quality IN ('Ruim', 'Regular', 'Bom', 'Excelente')) NOT NULL,
    leg_pain INTEGER CHECK (leg_pain >= 0 AND leg_pain <= 10) NOT NULL,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10) NOT NULL, -- Percepção de esforço de treino geral do dia
    mood TEXT CHECK (mood IN ('Irritado', 'Cansado', 'Normal', 'Feliz', 'Energizado')) NOT NULL,
    energy TEXT CHECK (energy IN ('Muito Baixa', 'Baixa', 'Normal', 'Alta', 'Muito Alta')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Garantir que exista apenas um registro de saúde por dia para o mesmo usuário
CREATE UNIQUE INDEX idx_user_health_date ON public.sleep_health(user_id, date);

-- Habilitar RLS para sono e saúde
ALTER TABLE public.sleep_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow CRUD operations for own health stats"
    ON public.sleep_health FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- =========================================================================
-- FUNCTIONS & TRIGGERS
-- =========================================================================

-- Função para criar automaticamente o perfil do usuário no banco público
-- sempre que um novo registro de usuário é criado no Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, start_weight, target_weight)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', 'Usuário 100KG'),
    new.raw_user_meta_data->>'avatar_url',
    NULL,
    100.00
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparada após criação de usuário na tabela auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
