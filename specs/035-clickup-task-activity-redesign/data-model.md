# Data Model & Domain Entities: ClickUp-Inspired Task Activity & Comments Redesign

**Feature**: 035-clickup-task-activity-redesign
**Date**: 2026-09-21

## Domain Entities

### 1. TaskComment
Represents a user-submitted comment or project decision on a task.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique UUID identifier (`cmt_...`) |
| `taskId` | `string` | Yes | ID of parent task |
| `userId` | `string` | Yes | ID of author user |
| `userName` | `string` | Yes | Display name of author |
| `text` | `string` | Yes | Comment content (supports Markdown syntax) |
| `isDecision` | `boolean` | Optional | Flag indicating if this comment represents a project decision (golden highlight) |
| `pinned` | `boolean` | Optional | Flag indicating if decision is pinned to the Spotlight banner |
| `createdAt` | `string` | Yes | ISO timestamp of creation |

### 2. TaskActivityLog
Represents an automated system audit log event recorded when a task is mutated.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique UUID identifier (`act_...`) |
| `taskId` | `string` | Yes | ID of parent task |
| `userId` | `string` | Yes | ID of acting user |
| `userName` | `string` | Yes | Display name of acting user |
| `eventType` | `TaskActivityEventType` | Yes | Event category (`moved`, `blocked_toggled`, `priority_changed`, etc.) |
| `description` | `string` | Yes | Human-readable event description |
| `fromValue` | `string` | Optional | State before transition (e.g. "A Fazer", "Média") |
| `toValue` | `string` | Optional | State after transition (e.g. "Em Progresso", "Urgente") |
| `timestamp` | `string` | Yes | ISO timestamp of event |

### 3. TimelineItem (Union)
```ts
export type TimelineItem =
  | ({ type: 'comment' } & TaskComment & { timestamp: string })
  | ({ type: 'activity' } & TaskActivityLog & { timestamp: string });
```

### 4. TimelineFilter
```ts
export type TimelineFilter = 'all' | 'comments' | 'activities' | 'decisions';
```

### 5. DensityMode
```ts
export type DensityMode = 'detailed' | 'compact';
```

### 6. TimelineGroup
```ts
export type GroupKey = 'today' | 'yesterday' | 'this_week' | 'older';

export interface TimelineGroup {
  groupKey: GroupKey;
  label: string;
  items: TimelineItem[];
}
```

---

## State Transition Rules

1. **Comment Creation (`isDecision`)**:
   - When `isDecision: true`, the comment is indexed in the "Spotlight de Decisões" banner and highlighted with `border-amber-500/50 bg-amber-950/20`.
2. **Activity Logging (`fromValue` / `toValue`)**:
   - Column move: `fromValue = "A Fazer"`, `toValue = "Em Progresso"`.
   - Priority change: `fromValue = "Média"`, `toValue = "Urgente"`.
   - Block status: `fromValue = "Normal"`, `toValue = "Impedido (Aguardando API)"`.
