# Data Model & State Invariants: Planejamento de Sprints (038)

**Date**: 2026-09-28
**Feature**: `038-sprint-planning`
**Status**: Draft
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## 1. Entidades

### 1.1 Sprint (nova)

```typescript
export type SprintStatus = 'planned' | 'active' | 'completed';

export interface SprintModel {
  id: string;
  /** Nome da sprint (normalizado, não vazio). */
  name: string;
  /** Objetivo/meta da iteração (opcional). */
  goal?: string;
  status: SprintStatus;
  /** Janela opcional, ISO 8601 (data). */
  startDate?: string;
  endDate?: string;
  createdAt: string;
  completedAt?: string;
}
```

### 1.2 Quadro (estendido)

`BoardState` passa a ter (ambos opcionais → sem migração):

```typescript
export interface BoardState {
  columns: ColumnModel[];
  tasks: Record<string, TaskModel[]>;
  /** Sprints do quadro (Feature 038). */
  sprints?: SprintModel[];
  /** Sprint ativa (no máximo uma) ou null. */
  activeSprintId?: string | null;
}
```

### 1.3 Tarefa (estendida)

```typescript
export interface TaskModel {
  // ...
  /** Sprint à qual a tarefa pertence (Feature 038). */
  sprintId?: string | null;
}
```

---

## 2. Invariantes

1. **Uma sprint ativa por quadro**: `activeSprintId` referencia, no máximo, uma sprint com `status = 'active'`.

   $$\#\{s \in \text{sprints} : s.status = active\} \le 1$$

2. **Consistência de referência**: se `activeSprintId` está definido, existe sprint correspondente; caso contrário, é limpo.

3. **Associação única**: uma tarefa pertence a zero ou uma sprint (`task.sprintId`).

4. **Sem cascata de tarefas**: excluir sprint remove o `sprintId` das tarefas; **nunca** exclui tarefas.

5. **Sem efeito de fluxo**: criar/editar/ativar/concluir/excluir/atribuir não altera `column`, `startedAt`, `completedAt`, `blocked`, `blockedAt`, `totalBlockedMs`.

6. **Conclusão explícita**: concluir sprint muda apenas o status da sprint; tarefas não são concluídas automaticamente.

7. **Compatibilidade**: quadro sem `sprints`/`sprintId` carrega normalmente; export→import preserva os campos quando presentes.

---

## 3. Regras de validação

| Regra | Origem |
|---|---|
| Nome normalizado (trim) e não vazio | FR-012 |
| Fim ≥ Início quando ambos presentes | FR-012 |
| No máximo uma sprint ativa | FR-003 |
| Excluir sprint desassocia tarefas | FR-005 |
| Somente leitura bloqueia escrita | FR-010 |

---

## 4. Métricas derivadas (puras)

```typescript
export interface SprintProgress {
  total: number;
  completed: number;
  percentage: number; // 0..100, inteiro; 0 quando total = 0
  velocity: number; // == completed
}

export function getSprintTasks(sprintId, tasks): TaskModel[];
export function calculateSprintProgress(tasks): SprintProgress;
export function getActiveSprint(sprints, activeSprintId): SprintModel | undefined;
export function isSprintOverdue(sprint, nowMs): boolean;
```

- Concluída = `completedAt` definido (não depende da coluna, que não é conhecida no util puro).
- `total = 0` ⇒ `percentage = 0` (sem divisão por zero).

---

## 5. Persistência

- `metrik-tasks-${boardId}` (chave existente) passa a incluir `sprints` e `activeSprintId`.
- Nenhuma chave nova; export/import usa o mesmo `BoardState`.
