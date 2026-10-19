# Data Model & Type Contracts: Qualidade de Código & Arquitetura (Ciclo 3)

**Feature**: `046-code-quality-architecture`  
**Date**: 2026-10-15  
**Status**: Completed  

---

## 1. Visão Geral dos Contratos de Tipagem

Esta especificação de modelo documenta os contratos estritos que substituem todos os tipos `any` identificados nos componentes e serviços do Metrik, em estrita conformidade com o **Princípio I (Model Integrity & Parity)**.

---

## 2. Tipos de Gestão de Equipes (`src/types/teams.ts`)

Reutilização e fortalecimento das estruturas já consolidadas:

```typescript
export type TeamRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
  userId: string;
  role: TeamRole;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}
```

### Contratos de Eventos de Formulário
- Em `TeamManagementModal.tsx` e `BoardManagementModal.tsx`:
  - `(e: React.FormEvent<HTMLFormElement>) => void`
  - `(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => void`
  - Seletores de times: `teamId: string` ou `team: Team`

---

## 3. Contratos de Sincronização Remota (`src/services/supabase/syncService.ts`)

Substituição dos `any` em mapeamento de linhas do PostgreSQL:

```typescript
export interface RemoteWorkspaceRow {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface RemoteBoardRow {
  id: string;
  workspace_id: string;
  title: string;
  team_id?: string | null;
  columns: unknown;
  created_at: string;
  updated_at: string;
}

export interface RemoteTaskRow {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  tags?: string[] | null;
  blocked?: boolean | null;
  blocked_reason?: string | null;
  created_at: string;
  updated_at: string;
  subtasks?: unknown;
  comments?: unknown;
}
```

---

## 4. Invariantes de Dados & Validação

1. **Paridade Schema Local-Remoto**: Nenhum campo persistido em `localStorage` ou enviado ao Supabase deve sofrer coerção indevida ou perda de tipo.
2. **Zero `any` Permitido**: O uso da anotação `: any` é proibido sob `src/**/*.{ts,tsx}`, garantido pelo compilador TypeScript e pelo ESLint com severidade de `"error"`.
