# Data Model & Schema Specification: Enterprise Task Timeline Redesign

**Feature Branch**: `034-enhanced-task-timeline` | **Date**: 2026-09-21 | **Spec**: [`spec.md`](spec.md)

---

## Data Model Extensions

### 1. Entity `TaskComment` (Extended)

Representa um comentário humano estruturado registrado em uma tarefa.

| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Identificador único UUID v4 do comentário. |
| `taskId` | `string` | Yes | ID da tarefa à qual o comentário pertence. |
| `userId` | `string` | Yes | ID do autor do comentário. |
| `userName` | `string` | Yes | Nome de exibição do autor. |
| `text` | `string` | Yes | Texto simples com marcação Markdown limpa. |
| `isDecision` | `boolean` | No | Flag indicando se o comentário representa uma Decisão de Projeto (`isDecision: true`). |
| `createdAt` | `string` | Yes | Timestamp ISO 8601 da criação do comentário. |

---

### 2. Entity `TaskActivityLog` (Standardized)

Representa uma entrada imutável no log de auditoria de ações da tarefa.

| Attribute | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Identificador único UUID v4 da entrada de auditoria. |
| `taskId` | `string` | Yes | ID da tarefa alvo. |
| `userId` | `string` | Yes | ID do usuário ou ator que executou a ação. |
| `userName` | `string` | Yes | Nome do usuário responsável pela ação. |
| `eventType` | `TaskActivityEventType` | Yes | Categoria do evento (`created`, `moved`, `blocked`, `unblocked`, `priority_changed`, `dates_changed`, `tags_changed`, `comment_added`, `comment_deleted`, `edited`). |
| `description` | `string` | Yes | Descrição legível em português do evento. |
| `fromValue` | `string` | No | Valor do atributo antes da alteração (para diff visual). |
| `toValue` | `string` | No | Valor do atributo após a alteração (para diff visual). |
| `timestamp` | `string` | Yes | Timestamp ISO 8601 de quando o evento ocorreu. |

---

### 3. Type `TimelineItem` (Discriminated Union)

Unão discriminada utilizada para unificar e ordenar cronologicamente comentários e logs de auditoria.

```typescript
export type TimelineItem =
  | ({ type: 'comment' } & TaskComment & { timestamp: string })
  | ({ type: 'activity' } & TaskActivityLog);
```

---

### 4. Type `TimelineGroup` (Time Bucket Grouping)

Estrutura de dados para renderização dos seções temporais.

```typescript
export type GroupKey = 'today' | 'yesterday' | 'this_week' | 'older';

export interface TimelineGroup {
  groupKey: GroupKey;
  label: string; // "Hoje", "Ontem", "Esta Semana", "Anteriores"
  items: TimelineItem[];
}
```

---

### 5. Type `TimelineFilter` & `DensityMode`

Filtros interativos e densidades visuais da linha do tempo.

```typescript
export type TimelineFilter = 'all' | 'decisions' | 'comments' | 'activity';
export type DensityMode = 'detailed' | 'compact';
```

---

## Validation & State Transition Rules

1. **Validação de Comentário**:
   - Texto não pode ser vazio nem conter apenas espaços (`text.trim().length > 0`).
   - Se `isDecision === true`, o comentário recebe badge visual de decisão e borda destacada.
2. **Imutabilidade de Auditoria**:
   - Entradas de `TaskActivityLog` são geradas atomicamente pelas funções de mutação em `useTaskCollection` e não podem ter seus campos editados diretamente.
3. **Agrupamento Temporal**:
   - Um item é classificado como `today` se sua data (sem hora) for igual à data de hoje.
   - Um item é classificado como `yesterday` se for exatamente a data de ontem.
   - Um item é classificado como `this_week` se for dentro dos últimos 7 dias (excluindo hoje e ontem).
   - Todos os demais itens são agrupados como `older`.
