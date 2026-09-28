# Tasks: Feature 040 - Estimativa em Pontos e Velocity por Pontos

**Branch**: `040-story-points`
**Status**: Ready for Implementation (0/8)
**Spec**: [spec.md](spec.md) | **Data Model/Plan**: [data-model.md](data-model.md)

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI)

1. **Primeiros princípios**: story points são uma estimativa **relativa** opcional por tarefa; velocity em pontos é a soma das estimativas das tarefas concluídas da sprint. Nada disso é persistido por sprint — é derivado.
2. **Pré-mortem**: (F1) valor inválido corrompendo totais → `normalizeEstimation` rejeita 0/negativo/NaN/fração/>100; (F2) divisão por zero → `percentage = committed === 0 ? 0 : …`; (F3) alterar estimativa mexendo no fluxo → só grava `estimation`; (F4) exibir "0 pts" poluindo a UI → seção omitida quando `committed === 0`.
3. **MECE**: `kanban.ts` (tipo) · `sprintMetrics.ts` (domínio) · `TaskMetadataSidebar.tsx` (entrada) · `SprintBar.tsx`/`SprintManagerModal.tsx` (exibição) · `Task.tsx`/`BoardTask.tsx` (chip) · testes. Sem sobreposição.
4. **Tree of Thoughts**: (A, podada) capacidade planejada por pessoa — fora de escopo; (B, escolhida) soma derivada das estimativas — menor estado, consistente com 039; (C, podada) biblioteca de gráfico/poker — YAGNI.
5. **TDD**: `sprintMetrics.test.ts` (pontos) e testes de UI falham antes da implementação.
6. **Triangulação**: sem dependências novas; não persiste por sprint; guest somente leitura; terminologia neutra.

## Phase 1: Domínio
- [X] T001 Add `estimation?: number` to `TaskModel` in `src/types/kanban.ts`
- [X] T002 [P] Extend `tests/unit/sprintMetrics.test.ts` with `normalizeEstimation` and `calculateSprintPoints` cases
- [X] T003 Add `MAX_ESTIMATION_POINTS`, `normalizeEstimation`, `calculateSprintPoints` to `src/utils/sprintMetrics.ts`

## Phase 2: Entrada
- [X] T004 Add an "Estimativa (pts)" field to `src/components/TaskMetadataSidebar.tsx` (number, gated by isReadOnly)

## Phase 3: Exibição
- [X] T005 Show points in `src/components/SprintBar.tsx` when available
- [X] T006 Show points in `src/components/SprintManagerModal.tsx` when available
- [X] T007 Show an "N pts" chip on the card (`src/components/Task.tsx` + `BoardTask.tsx`)

## Phase 4: Gate
- [X] T008 [P] UI tests (`tests/unit/StoryPoints.test.tsx`) + a11y; run full suite, lint, format:check and build
