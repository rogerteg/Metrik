# Tasks: Feature 038 - Planejamento de Sprints

**Branch**: `038-sprint-planning`
**Status**: Ready for Implementation (0/15 tasks)
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data Model**: [data-model.md](data-model.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI — Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)

- **Invariantes irredutíveis**:
  1. Uma sprint é uma partição de escopo do quadro; uma tarefa pertence a **zero ou uma** sprint.
  2. No máximo **uma** sprint ativa por quadro (estado único `activeSprintId`).
  3. Excluir sprint **desassocia**, nunca apaga tarefas.
  4. Gerenciar sprints **não** altera estado de fluxo (coluna/timestamps/bloqueio).
  5. Progresso é **derivado**: `concluídas/total`; velocity = concluídas.
- **Premissas descartadas**: burndown/snapshots (não são verdade irredutível do pedido); story points (exigem estimativa não solicitada); sprint global à squad (o quadro é a unidade de persistência).

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem)

- **F1 — Duas sprints ativas**: ativar sem rebaixar a anterior. *Mitigação*: `startSprint` rebaixa todas as demais no mesmo update atômico (invariante 1) + teste.
- **F2 — Referência órfã**: `activeSprintId` aponta para sprint excluída. *Mitigação*: limpar ao excluir; reconciliar no load.
- **F3 — Perda de dados**: excluir sprint apagando tarefas. *Mitigação*: somente `sprintId → undefined`; teste de invariante 4.
- **F4 — Regressão de fluxo**: gerenciar sprint mexendo em coluna/datas. *Mitigação*: hook não toca esses campos; teste de invariante 5.
- **F5 — Perda no import**: export/import descartando sprints. *Mitigação*: campos no `BoardState`; validação opcional; teste de round-trip.
- **F6 — Divisão por zero**: sprint vazia. *Mitigação*: `percentage = total === 0 ? 0 : …`.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)

| Arquivo | Dono da tarefa |
|---|---|
| `src/types/kanban.ts` | T001 |
| `tests/unit/sprintMetrics.test.ts` | T002 |
| `src/utils/sprintMetrics.ts` | T003 |
| `src/hooks/useSprints.ts` (+ `useTaskCollection.ts`) | T004 |
| `tests/unit/useSprints.test.ts` | T005 |
| `src/components/SprintManagerModal.tsx` | T006 |
| `src/components/SprintBar.tsx` | T007 |
| `src/App.tsx` | T008 |
| `src/components/TaskDetailsModal.tsx` | T009 |
| `src/components/Task.tsx` + `BoardTask.tsx` | T010 |
| `src/styles/11-sprint.css` + `src/App.css` | T011 |
| `tests/unit/SprintPlan.test.tsx` / `accessibility.test.tsx` | T012 |
| `src/utils/seedData.ts` | T013 |

Cobertura: FR-001…FR-013, NFR-001…NFR-005 e SC-001…SC-005 mapeados a T001–T015 — sem lacunas nem sobreposição de arquivo.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)

- **A (podada)** — chave `metrik-sprints-*` separada: duplica persistência e quebra export/import.
- **B (podada)** — store global (Context/Redux): YAGNI (Constituição V); o padrão do projeto é hook sobre `localStorage`.
- **C (escolhida)** — sprints no `BoardState` + `useSprints(setBoard)` + domínio puro. Menor acoplamento, reuso do padrão de `useTaskComments`.
- **D (podada)** — progresso pela categoria da coluna: acopla o util puro a `columns`; usar `completedAt`.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)

- `tests/unit/sprintMetrics.test.ts` falha antes de T003 (módulo inexistente).
- `tests/unit/useSprints.test.ts` falha antes de T004 (única ativa, cascata ausente de tarefas, `activeSprintId` limpo).
- `tests/unit/SprintPlan.test.tsx` falha antes da UI (criar/ativar/concluir/atribuir/progresso/guest).
- **Green-Bar**: suíte completa + build + lint + format verdes; gate T015.

### 6. Triangulação Adversarial & Verificação da Constituição

- **I** artefatos antes do código; **II** módulo puro + hook + componentes pequenos; **III** testes/build/lint; **IV** validações com mensagem contextual; **V** sem burndown/points/dependências; **VI** este documento; **VII** termos neutros; **VIII** `localStorage` + guest somente leitura; **IX** sem perda de tarefas.

---

## Phase 1: Fundação (Domínio & Tipos)

- [X] T001 [P] Add `SprintStatus`, `SprintModel`, `BoardState.sprints/activeSprintId` and `TaskModel.sprintId` in `src/types/kanban.ts`
- [X] T002 [P] Write failing tests for sprint domain in `tests/unit/sprintMetrics.test.ts` (normalize/validate, progress 0/0 & partial, velocity, active sprint, overdue)
- [X] T003 Create `src/utils/sprintMetrics.ts` (`normalizeSprintName`, `isValidSprintRange`, `getSprintTasks`, `calculateSprintProgress`, `getActiveSprint`, `isSprintOverdue`)

## Phase 2: Persistência

- [X] T004 Create `src/hooks/useSprints.ts` (`addSprint`, `updateSprint`, `deleteSprint`, `startSprint`, `completeSprint`, `setTaskSprint`) and compose it in `src/hooks/useTaskCollection.ts`
- [X] T005 [P] Write hook tests in `tests/unit/useSprints.test.ts` (single active, complete doesn't auto-complete tasks, delete unassigns, activeSprintId cleared, flow untouched)

## Phase 3: US1 — Gerenciar sprints (MVP)

- [X] T006 Create `src/components/SprintManagerModal.tsx` (list/create/edit/activate/complete/delete; validation; accessible)
- [X] T007 Create `src/components/SprintBar.tsx` (active sprint name + progress + open manager; read-only aware)
- [X] T008 Wire sprints in `src/App.tsx` (instantiate `useSprints`, render `SprintBar`, pass handlers; respect `isReadOnly`)

## Phase 4: US2 — Ativar e atribuir

- [X] T009 Add a "Sprint" selector to `src/components/TaskDetailsModal.tsx`
- [X] T010 Show the sprint chip on the card (`src/components/Task.tsx` + prop in `src/components/BoardTask.tsx`)

## Phase 5: US3 — Progresso & velocity

- [X] T011 Render sprint progress (completed/total · %) and velocity in `SprintBar`

## Phase 6: Polish & Gate

- [X] T012 [P] UI + accessibility tests in `tests/unit/SprintPlan.test.tsx` (create/activate/complete/assign/progress/guest/a11y)
- [X] T013 Ensure `src/utils/seedData.ts` validation accepts optional `sprints`/`activeSprintId`/`sprintId` (no migration)
- [X] T014 Add `src/styles/11-sprint.css` and import it in `src/App.css`
- [X] T015 Run full suite, coverage, lint, format:check and build (zero regressions)
