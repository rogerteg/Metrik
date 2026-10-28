# Supabase Cloud Sync & Guia de Migrações — Metrik

> **Arquitetura Soberana Local-First:** O Metrik é um aplicativo autônomo. O banco em nuvem Supabase é estritamente **opcional** e opt-in. A indisponibilidade de credenciais ou de rede nunca impede o pleno funcionamento das capacidades locais no navegador.

---

## 1. Esquema Unificado (`supabase/schema.sql`)

O arquivo [schema.sql](./schema.sql) consolida:
1. **Tabelas Principais**: `workspaces`, `boards`, `tasks`, `app_settings`, `teams`, `team_members`.
2. **Políticas RLS**: Acesso anônimo seguro para clientes autorizados via chave `anon`.
3. **Triggers Automáticos**: Atualização determinística de `updated_at`.
4. **Migrações Incrementais (Seção 8)**: Adição idempotente de colunas para Sprints (Feature 038) e Story Points (Feature 040).

---

## 2. Script de Migração Incremental (Features 038 & 040 / OPP-005)

Para instâncias do Supabase criadas com versões anteriores do schema, execute o seguinte comando no **SQL Editor** do painel do Supabase:

```sql
-- 1. Sprints no Quadro (Feature 038)
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS sprints JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS active_sprint_id TEXT;

-- 2. Vínculos de Sprint, Estimativa e Auditoria nas Tarefas (Features 038, 040, 042)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS sprint_id TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimation INTEGER;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignee TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS last_moved_at TIMESTAMPTZ;

-- 3. Recarregamento do Cache de Esquema da API PostgREST
NOTIFY pgrst, 'reload schema';
```

---

## 3. Detecção e Resiliência Automática no Metrik

- **Banner Informativo**: A interface (`src/components/Settings/CloudSyncTab.tsx`) detecta via `checkSprintMigration()` se as colunas estão presentes no schema remoto. Caso estejam ausentes, exibe banner com botão de cópia de um clique.
- **Fallback Seguro**: O serviço `syncService.ts` detecta o código de erro `42703` (coluna inexistente) e remove as colunas ausentes do envio em voo, garantindo que tarefas e quadros continuem sincronizando normalmente sem perda de dados.
