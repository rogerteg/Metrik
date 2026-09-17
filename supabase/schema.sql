-- ==============================================================================
-- Metrik — Esquema de Banco de Dados PostgreSQL para Supabase
-- Arquitetura: Local-First Cloud Sync com Suporte a Espaços, Quadros e Cartões
-- ==============================================================================

-- Habilita extensão para geração de UUID caso necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Tabela: workspaces (Espaços de Trabalho)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#38bdf8',
  icon TEXT,
  board_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  team_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Tabela: boards (Quadros Kanban)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  team_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. Tabela: tasks (Cartões / Tarefas do Fluxo)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT,
  priority TEXT CHECK (priority IN ('urgent', 'high', 'medium', 'low') OR priority IS NULL),
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  blocked BOOLEAN NOT NULL DEFAULT false,
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ,
  total_blocked_ms BIGINT NOT NULL DEFAULT 0,
  type TEXT DEFAULT 'card',
  due_date TEXT,
  start_date TEXT,
  end_date TEXT,
  acceptance_criteria TEXT,
  test_scenarios TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de performance para tarefas
CREATE INDEX IF NOT EXISTS idx_tasks_board_id ON public.tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON public.tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON public.tasks(updated_at);

-- ------------------------------------------------------------------------------
-- 4. Tabela: app_settings (Configurações da Aplicação)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_settings',
  theme TEXT NOT NULL DEFAULT 'dark',
  density TEXT NOT NULL DEFAULT 'comfortable',
  default_wip_limit INTEGER NOT NULL DEFAULT 5,
  enable_animations BOOLEAN NOT NULL DEFAULT true,
  default_board_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Tabelas: teams & team_members (Equipes e Acesso TBAC)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'guest')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) & Políticas de Acesso
-- ------------------------------------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Permissivas para Chave Anônima (Anon Key)
-- Permite leitura, inserção, atualização e exclusão sincronizada pelo frontend
CREATE POLICY "Permitir acesso completo para anon key em workspaces" 
  ON public.workspaces FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso completo para anon key em boards" 
  ON public.boards FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso completo para anon key em tasks" 
  ON public.tasks FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso completo para anon key em app_settings" 
  ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso completo para anon key em teams" 
  ON public.teams FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso completo para anon key em team_members" 
  ON public.team_members FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. Função & Triggers para Atualização Automática de updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER trigger_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_boards_updated_at ON public.boards;
CREATE TRIGGER trigger_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON public.tasks;
CREATE TRIGGER trigger_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER trigger_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
