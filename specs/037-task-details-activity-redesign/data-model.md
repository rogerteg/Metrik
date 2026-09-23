# Data Model & State Schema: Task Details Activity & Objective Fields Redesign

## 1. Entities & Types

### ActivityLogEntry

Represents an individual historical audit log item in the task activity stream.

```typescript
export type ActivityEventType =
  | 'creation'
  | 'assignment'
  | 'unassignment'
  | 'status_change'
  | 'priority_change'
  | 'due_date_change'
  | 'tag_change'
  | 'subtask_change'
  | 'comment';

export interface ActivityLogEntry {
  id: string;
  taskId: string;
  actorName: string;
  actorAvatar?: string;
  type: ActivityEventType;
  actionText: string;            // e.g. "criou esta tarefa" or "removeu o responsável: Antonio Carlos"
  fieldName?: string;           // e.g. "responsável", "status", "prioridade"
  previousValue?: string;
  newValue?: string;
  timestamp: string;            // ISO date string
  isUnread?: boolean;
}
```

---

### ActivityFilterOptions

Represents active filters applied to the activity feed stream.

```typescript
export type ActivityCategoryFilter = 'all' | 'comments' | 'mutations' | 'assignments' | 'creations';

export interface ActivityFilterOptions {
  searchQuery: string;
  category: ActivityCategoryFilter;
  unreadOnly: boolean;
}
```

---

### TaskActivityViewState

Internal state structure managed by `useTaskActivity.ts`.

```typescript
export interface TaskActivityViewState {
  entries: ActivityLogEntry[];
  isExpanded: boolean;           // Toggles showing entries beyond the 5-item threshold
  filter: ActivityFilterOptions;
  isSearchOpen: boolean;
  unreadCount: number;
}
```

---

## 2. Activity Event Formatting Rules

| Event Type | Action Text Template | Example Output |
|:---|:---|:---|
| `creation` | `{actor} criou esta tarefa` | `Luis Eduardo Ferreira Santos criou esta tarefa` |
| `unassignment` | `{actor} removeu o responsável: {previousValue}` | `Danillo Barbosa removeu o responsável: Antonio Carlos Ferreira Batista` |
| `assignment` | `{actor} atribuiu a tarefa para: {newValue}` | `Danillo Barbosa atribuiu a tarefa para: Maria Silva` |
| `status_change` | `{actor} alterou o status para {newValue}` | `Maria Silva alterou o status para Em Progresso` |
| `priority_change` | `{actor} alterou a prioridade para {newValue}` | `Carlos Souza alterou a prioridade para Alta` |
| `comment` | `{actor} comentou: {newValue}` | `Ana Costa comentou: Reunião agendada` |

---

## 3. Timestamp Formatting Function Signature

```typescript
export function formatActivityTimestamp(isoTimestamp: string): string {
  // Input: "2026-06-26T10:26:00Z"
  // Output: "jun 26 às 10:26 am"
}
```
