# Data Model & Plan: Burndown da Sprint (039)

**Feature**: `039-sprint-burndown`
**Depends on**: Feature 038 (`SprintModel`, `TaskModel.sprintId`)

## 1. Modelo derivado (não persistido)

```typescript
export interface BurndownPoint {
  /** Dia (ISO date, 00:00 local) do eixo X. */
  day: string;
  /** Linha ideal: total comprometido → 0 (linear). */
  ideal: number;
  /** Linha real: criadas até o dia − concluídas até o dia. */
  remaining: number;
}

export interface SprintBurndown {
  available: boolean;      // false quando faltam datas
  committed: number;       // escopo atual (tarefas da sprint)
  points: BurndownPoint[];
}
```

Nenhum campo novo em `BoardState`/`TaskModel`; tudo derivado de `createdAt`/`completedAt` e da janela da sprint.

## 2. Algoritmo (`buildSprintBurndown`)

1. Se `!startDate || !endDate` → `{ available: false, committed, points: [] }`.
2. `committed = sprintTasks.length`.
3. Dias = cada dia de `startDate` a `endDate` (inclusive), clampado a hoje quando o fim é futuro.
4. `ideal(d) = committed × (1 − elapsedDays/totalDays)` (totalDays = nº de intervalos).
5. `remaining(d) = |{t : t.createdAt ≤ fim(d)}| − |{t : t.completedAt ≤ fim(d)}|`.
6. Retorna pontos `{ day, ideal, remaining }` (ideal arredondado a 2 casas).

## 3. Plano

- `src/utils/sprintBurndown.ts` (puro) + `tests/unit/sprintBurndown.test.ts`.
- `src/components/SprintBurndownChart.tsx` (SVG inline, ideal tracejado + real sólido, rótulo acessível).
- Integração: exibir o gráfico no `SprintManagerModal` para a sprint ativa/concluída com datas.
- CSS em `src/styles/11-sprint.css` (mesmo módulo da 038).
- Testes de UI + a11y; gate completo (`test`/`lint`/`format:check`/`build`).

## 4. Conformidade

- **III** testes/build/lint; **V** sem dependências novas; **VIII** local-first (derivado, não persiste); **I/VI** artefatos e modelos antes do código (ver `tasks.md`).
