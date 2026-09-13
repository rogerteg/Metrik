# Data Model: Tipos de Tarefas, Vinculação Hierárquica e Vínculos Cross-Squad

**Feature**: `024-task-types-and-linking` | **Date**: 2026-09-13 | **Branch**: `024-task-types-and-linking`

---

## 1. Diagrama Conceitual Entidade-Relacionamento

```text
┌─────────────────┐                               ┌─────────────────┐
│      Team       │ 1:N                           │      Team       │ (Squad Externa)
│  (id, name,...) │                               │  (id, name,...) │
└────────┬────────┘                               └────────┬────────┘
         │                                                 │
         │ 1:N                                             │ 1:N
         ▼                                                 ▼
┌─────────────────┐                               ┌─────────────────┐
│      Board      │ 1:N                           │      Board      │ (Quadro Externo)
│ (id, teamId,...)│                               │ (id, teamId,...)│
└────────┬────────┘                               └────────┬────────┘
         │                                                 │
         │ 1:N                                             │ 1:N
         ▼                                                 ▼
┌─────────────────┐       1:N       ┌─────────────────────┐│
│    TaskModel    ├─────────────────┤    TaskLinkModel    ││ (Tarefa Alvo)
│ (id, title,     │                 │ (id, targetTaskId,  ││
│  type: card |   │                 │  relationType:      ││
│   subtask |     │                 │   parent|child|     ││
│   initiative,   │                 │   blocks|           ││
│  links: [...])  │                 │   is_blocked_by|    ││
└─────────────────┘                 │   relates_to,       ││
                                    │  targetBoardId,     ├┘
                                    │  targetTeamId)      │
                                    └─────────────────────┘
```

---

## 2. Tipos e Interfaces TypeScript

### 2.1. Tipos de Tarefas (`TaskType` & `TaskTypeConfig`)
Representa a classificação e granularidade de um item de trabalho no Metrik.

```typescript
export type TaskType = 'card' | 'subtask' | 'initiative';

export interface TaskTypeConfig {
  type: TaskType;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgVar: string;
  textVar: string;
  borderVar: string;
  description: string;
}

export const TASK_TYPE_CONFIGS: Record<TaskType, TaskTypeConfig> = {
  initiative: {
    type: 'initiative',
    label: 'Iniciativa',
    shortLabel: 'Iniciativa',
    icon: '🎯',
    color: '#8b5cf6',
    bgVar: 'rgba(139, 92, 246, 0.15)',
    textVar: '#a78bfa',
    borderVar: 'rgba(139, 92, 246, 0.35)',
    description: 'Objetivo estratégico ou entrega macro que agrupa múltiplos cartões',
  },
  card: {
    type: 'card',
    label: 'Card',
    shortLabel: 'Card',
    icon: '📋',
    color: '#3b82f6',
    bgVar: 'rgba(59, 130, 246, 0.15)',
    textVar: '#60a5fa',
    borderVar: 'rgba(59, 130, 246, 0.35)',
    description: 'Item padrão de fluxo de trabalho ou história de entrega',
  },
  subtask: {
    type: 'subtask',
    label: 'Subtarefa',
    shortLabel: 'Subtarefa',
    icon: '🔹',
    color: '#06b6d4',
    bgVar: 'rgba(6, 182, 212, 0.15)',
    textVar: '#38bdf8',
    borderVar: 'rgba(6, 182, 212, 0.35)',
    description: 'Item de trabalho granular ou desdobramento de um cartão pai',
  },
};
```

---

### 2.2. Tipos Semânticos de Relacionamento (`TaskRelationType`)
Define a semântica direcionada entre a tarefa fonte e a tarefa alvo.

```typescript
export type TaskRelationType = 
  | 'parent'         // Esta tarefa é filha da tarefa alvo (alvo é pai)
  | 'child'          // Esta tarefa é pai da tarefa alvo (alvo é filha)
  | 'blocks'         // Esta tarefa bloqueia a tarefa alvo
  | 'is_blocked_by'  // Esta tarefa é bloqueada pela tarefa alvo
  | 'relates_to';    // Associação direta / mútua

export interface TaskRelationConfig {
  type: TaskRelationType;
  label: string;
  inverseLabel: string;
  icon: string;
  badgeClass: string;
}

export const TASK_RELATION_CONFIGS: Record<TaskRelationType, TaskRelationConfig> = {
  parent: {
    type: 'parent',
    label: 'Pertence a (Pai / Superior)',
    inverseLabel: 'Possui como filho',
    icon: '⬆️',
    badgeClass: 'relation-parent',
  },
  child: {
    type: 'child',
    label: 'Sub-item (Filho / Decomposição)',
    inverseLabel: 'É superior de',
    icon: '⬇️',
    badgeClass: 'relation-child',
  },
  blocks: {
    type: 'blocks',
    label: 'Bloqueia',
    inverseLabel: 'É bloqueado por',
    icon: '⛔',
    badgeClass: 'relation-blocks',
  },
  is_blocked_by: {
    type: 'is_blocked_by',
    label: 'É bloqueado por',
    inverseLabel: 'Bloqueia',
    icon: '🔒',
    badgeClass: 'relation-blocked-by',
  },
  relates_to: {
    type: 'relates_to',
    label: 'Relacionado com',
    inverseLabel: 'Relacionado com',
    icon: '🔗',
    badgeClass: 'relation-relates',
  },
};

/**
 * Função utilitária pura para obter a relação recíproca inversa.
 */
export function getReciprocalRelation(relation: TaskRelationType): TaskRelationType {
  switch (relation) {
    case 'parent': return 'child';
    case 'child': return 'parent';
    case 'blocks': return 'is_blocked_by';
    case 'is_blocked_by': return 'blocks';
    case 'relates_to': return 'relates_to';
  }
}
```

---

### 2.3. Modelo do Vínculo (`TaskLinkModel`)
Estrutura normalizada persistida dentro do array `links` da tarefa.

```typescript
export interface TaskLinkModel {
  /** Identificador único do link (UUID v4) */
  id: string;

  /** ID da tarefa vinculada */
  targetTaskId: string;

  /** Tipo de relacionamento a partir desta tarefa */
  relationType: TaskRelationType;

  /** ID do quadro onde a tarefa reside */
  targetBoardId: string;

  /** ID da squad/time à qual a tarefa pertence */
  targetTeamId: string;

  /** Timestamp ISO-8601 da criação do vínculo */
  createdAt: string;
}
```

---

### 2.4. Resumo Cross-Squad para Renderização Segura (`CrossSquadTaskSummary`)
Objeto enriquecido em memória para visualização nos modais e cartões sem exigir renderização completa do quadro remoto.

```typescript
export interface CrossSquadTaskSummary {
  taskId: string;
  taskTitle: string;
  taskType: TaskType;
  columnId: string;
  columnTitle: string;
  columnCategory: 'todo' | 'in_progress' | 'done';
  boardId: string;
  boardName: string;
  teamId: string;
  teamName: string;
  isExternalSquad: boolean;
  isDone: boolean;
}
```

---

### 2.5. Extensão de `TaskModel` em `src/types/kanban.ts`

```typescript
export interface TaskModel {
  id: string;
  title: string;
  column: string;
  // ... campos existentes (createdAt, priority, tags, subtasks, blocked, etc.)
  
  /**
   * Tipo da tarefa no fluxo Kanban (Feature 024)
   * Padrão retrocompatível: 'card'
   */
  type?: TaskType;

  /**
   * Lista de vínculos e dependências com outras tarefas intra ou cross-squad (Feature 024)
   * Padrão retrocompatível: []
   */
  links?: TaskLinkModel[];
}
```

---

## 3. Invariantes de Dados & Regras de Negócio

1. **Invariante de Preservação Retrocompatível**:
   - `task.type ?? 'card'`: Nenhuma tarefa legada sem `type` falhará em tempo de execução.
   - `task.links ?? []`: Nenhuma tarefa sem `links` lançará erro ao acessar `links.length` ou `links.map`.
2. **Invariante de Consistência Bidirecional**:
   - Para qualquer vínculo criado entre a Tarefa A e a Tarefa B no mesmo quadro:
     $$\text{A.links.some}(l \to l.\text{targetTaskId} = \text{B.id} \land l.\text{relationType} = R) \iff \text{B.links.some}(l \to l.\text{targetTaskId} = \text{A.id} \land l.\text{relationType} = \text{getReciprocal}(R))$$
3. **Invariante de Auto-Vínculo**:
   - $\forall l \in \text{task.links}: l.\text{targetTaskId} \neq \text{task.id}$.
4. **Invariante de Integridade Referencial**:
   - Ao excluir a Tarefa $T$, todos os links em quaisquer tarefas que possuam $l.\text{targetTaskId} = T.\text{id}$ são purgados automaticamente.
5. **Invariante de Dependência Resolvida**:
   - Uma dependência $l$ com $l.\text{relationType} = \text{'is\_blocked\_by'}$ é considerada pendente enquanto a tarefa alvo residir em coluna com `category !== 'done'`.
