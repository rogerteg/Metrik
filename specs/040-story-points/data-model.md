# Data Model & Plan: Estimativa em Pontos e Velocity por Pontos (040)

**Feature**: `040-story-points`
**Depends on**: Feature 038 (sprints) e 039 (burndown)

## 1. Modelo

### 1.1 Tarefa (estendida)

```typescript
export interface TaskModel {
  // ...
  /** Estimativa em story points (inteiro 1..100). Opcional (Feature 040). */
  estimation?: number;
}
```

Nenhum campo novo em `BoardState`; nenhum campo persistido em sprint. Tudo derivado.

### 1.2 Derivado

```typescript
export interface SprintPoints {
  /** Soma das estimativas das tarefas da sprint. */
  committed: number;
  /** Soma das estimativas das tarefas concluídas. */
  completed: number;
  /** 0..100 (inteiro); 0 quando não há pontos comprometidos. */
  percentage: number;
}

export const MAX_ESTIMATION_POINTS = 100;
export function normalizeEstimation(value: unknown): number | undefined;
export function calculateSprintPoints(tasks: TaskModel[]): SprintPoints;
```

## 2. Invariantes

1. Estimativa válida é inteiro em `1..MAX_ESTIMATION_POINTS`; `undefined` = sem estimativa.
2. Pontos comprometidos/concluídos são **derivados** (nunca persistidos).
3. Definir/limpar estimativa não altera coluna/timestamps/bloqueio (FR-007).
4. Sprint sem estimativas → `committed = 0` → UI omite pontos (FR-005).

## 3. Plano

- `src/types/kanban.ts`: `estimation?` no `TaskModel`.
- `src/utils/sprintMetrics.ts`: `MAX_ESTIMATION_POINTS`, `normalizeEstimation`, `calculateSprintPoints`.
- `src/components/TaskMetadataSidebar.tsx`: campo "Estimativa (pts)" (number, gated por readOnly) via `onUpdateTask`.
- `src/components/SprintBar.tsx` e `SprintManagerModal.tsx`: exibir pontos quando houver.
- `src/components/Task.tsx`/`BoardTask.tsx`: chip "N pts" quando houver estimativa.
- Testes: domínio (`sprintMetrics`), UI (`SprintPlan`/novo `StoryPoints`), a11y.
- Gate: `test` + `lint` + `format:check` + `build`.

## 4. Conformidade

- **III** testes/build/lint; **V** sem dependências; **VIII** local-first (derivado); **IX** dados preservados; **VII** terminologia neutra (*Story Points*, *Velocity*).
