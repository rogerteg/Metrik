# Data Model & State Schema: Task Details Activity & Objective Fields Redesign

## 1. Entities & Types

### TaskComment

```typescript
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  text: string;            // Markdown simples
  isDecision?: boolean;
  pinned?: boolean;
  createdAt: string;       // ISO 8601
}
```

---

### TaskActivityLog & event types

```typescript
export type TaskActivityEventType =
  | 'created' | 'moved' | 'blocked' | 'unblocked'
  | 'priority_changed' | 'dates_changed' | 'tags_changed'
  | 'comment_added' | 'comment_deleted'
  | 'assignment' | 'unassignment'
  | 'edited';

export interface TaskActivityLog {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  eventType: TaskActivityEventType;
  description: string;
  fromValue?: string;
  toValue?: string;
  timestamp: string;       // ISO 8601
}
```

---

### TimelineItem & feed preferences

```typescript
export type TimelineItem =
  | ({ type: 'comment' } & TaskComment & { timestamp: string })
  | ({ type: 'activity' } & TaskActivityLog);

export type TimelineFilter = 'all' | 'decisions' | 'comments' | 'activity';
export type DensityMode = 'detailed' | 'compact';

export interface UserTimelinePreferences {
  version: number;
  densityMode: DensityMode;
  activeFilter: TimelineFilter;
  searchQuery: string;
}
```

> **Nota (2026-09-25, T032):** os tipos legados `ActivityLogEntry`, `ActivityFilterOptions`,
> `ActivityCategoryFilter` e `TaskActivityViewState` — usados apenas pelo painel de atividade
> removido — foram excluídos do código.

---

## 2. Activity Event Formatting Rules

Descrições objetivas geradas por `AuditDescriptions` (`src/utils/taskActivityLogger.ts`):

| Event Type | Descrição (template) | Exemplo |
|:---|:---|:---|
| `created` | `Tarefa criada por {actor}` | `Tarefa criada por Rogerio Teixeira` |
| `moved` | `Movido da coluna "{from}" para "{to}" por {actor}` | `Movido da coluna "A Fazer" para "Em Progresso" por Rogerio Teixeira` |
| `blocked` | `Marcado como bloqueado por {actor}[: reason]` | `Marcado como bloqueado por Rogerio Teixeira: aguardando API` |
| `unblocked` | `Impedimento removido por {actor}` | `Impedimento removido por Rogerio Teixeira` |
| `priority_changed` | `Prioridade alterada de "{from}" para "{to}" por {actor}` | `Prioridade alterada de "Média" para "Alta" por Rogerio Teixeira` |
| `tags_changed` | `Tag "{tag}" adicionada/removida por {actor}` | `Tag "backend" adicionada por Rogerio Teixeira` |
| `assignment` | `Responsável definido: {assignee} por {actor}` | `Responsável definido: Ana Silva por Rogerio Teixeira` |
| `unassignment` | `Responsável removido[: previous] por {actor}` | `Responsável removido: Ana Silva por Rogerio Teixeira` |
| `comment_added` | `Comentário adicionado por {actor}` | `Comentário adicionado por Rogerio Teixeira` |
| `comment_deleted` | `Comentário removido por {actor}` | `Comentário removido por Rogerio Teixeira` |

---

## 3. Timestamp Formatting (canonical)

```typescript
// src/components/CommentItem.tsx — única fonte de verdade para timestamps do feed
export const formatDate = (isoString: string): string => {
  // Input: "2026-06-26T10:26:00Z"
  // Output: "26/06/2026 às 10:26"
};
```

> **Nota de reconciliação (2026-09-25, T031/T032):** o utilitário duplicado `activityFormatter`
> (e seu `formatActivityTimestamp` no estilo "jun 26 às 10:26 am") foi **removido** junto com o
> componente legado `TaskActivityLogItem`. O formato canônico do feed é `CommentItem.formatDate`
> (`dd/mm/aaaa às hh:mm`), hoje a única fonte de verdade para timestamps de atividade.

---

## 4. Task Fields Relevant to This Feature

### Assignee

The user responsible for a task, stored directly on the task model as a display name. Changes produce objective audit entries.

```typescript
// Added to TaskModel (src/types/kanban.ts)
assignee?: string; // Nome do usuário responsável; ausente = não atribuído

// Audit events emitted by useTaskCollection.updateTask when assignee changes
eventType: 'assignment' | 'unassignment';
fromValue?: string; // responsável anterior
toValue?: string;   // novo responsável (undefined quando removido)
```

**Rules:**
- Setting a responsible with a non-empty value emits `assignment` with `toValue`.
- Clearing the responsible emits `unassignment` with `fromValue` (previous).
- When users are registered, the sidebar offers a selector; otherwise it degrades to free text.
- No change in value emits no event.

---

## 5. Flow Metrics Entity

Derived (not persisted) transparency values rendered by `TaskFlowMetricsPanel`.

```typescript
export interface TaskFlowMetrics {
  leadTimeMs: number | null;      // criação → conclusão (ou idade, em andamento)
  cycleTimeMs: number | null;     // início → conclusão (ou em execução)
  blockedTimeMs: number;          // tempo acumulado de bloqueio
  ageMs: number;                  // idade do cartão desde a criação
  isOverdue: boolean;             // data de entrega vencida e não concluída
  counts: {
    comments: number;
    decisions: number;
    events: number;
    links: number;
    blockers: number;
  };
}
```

**Derivation sources:** `createdAt`, `startedAt`, `completedAt`, `dueDate`, `totalBlockedMs`/`blocked`/`blockedAt`, `comments`, `activityLog`, `links`, `subtasks`. No new persisted fields are introduced (YAGNI).
