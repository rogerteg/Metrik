# Implementation Plan: Planejamento de Sprints (038)

**Feature**: `038-sprint-planning`
**Spec**: [spec.md](spec.md) | **Data Model**: [data-model.md](data-model.md) | **Tasks**: [tasks.md](tasks.md)

---

## 1. Abordagem

Extensão **local-first** do quadro: sprints vivem no próprio `BoardState` (mesma chave de armazenamento e export/import), sem novas dependências. Lógica de domínio em módulo puro, persistência em hook dedicado composto ao estado do quadro, UI em componentes pequenos.

**Camadas:**

1. **Tipos** (`src/types/kanban.ts`): `SprintStatus`, `SprintModel`, `BoardState.sprints/activeSprintId`, `TaskModel.sprintId`.
2. **Domínio puro** (`src/utils/sprintMetrics.ts`): progresso, velocity, sprint ativa, atraso, normalização/validação de nome e datas.
3. **Persistência** (`src/hooks/useSprints.ts`): `useSprints(setBoard)` com create/update/delete/start/complete/assign; compõe `useTaskCollection` (padrão já usado por `useTaskComments`).
4. **UI**:
   - `src/components/SprintBar.tsx` — indicador compacto da sprint ativa (nome, progresso) + ação de abrir gerenciador.
   - `src/components/SprintManagerModal.tsx` — CRUD + ativar/concluir sprints.
   - `src/components/TaskDetailsModal.tsx` — seletor "Sprint" por tarefa.
   - `src/components/BoardTask.tsx`/`Task.tsx` — chip da sprint no cartão (somente leitura visual).
5. **Integração** (`src/App.tsx`): instanciar sprints, renderizar `SprintBar`, passar o seletor ao modal, respeitar `isReadOnly`.
6. **Estilo** (`src/styles/11-sprint.css` + `@import` em `App.css`).

## 2. Decisões (Tree of Thoughts)

- **Escolhido**: sprints no `BoardState` (coerente com multi-board, export/import e Local-First). **Podado**: chave de `localStorage` separada (duplicaria persistência e quebraria import/export).
- **Escolhido**: hook `useSprints(setBoard)` composto. **Podado**: inchar `useTaskCollection` (já grande) ou criar store global (YAGNI).
- **Escolhido**: concluída = `completedAt` no util puro. **Podado**: depender da categoria da coluna (acoplaria o util a `columns`).
- **Escolhido**: velocity por contagem de tarefas. **Podado**: story points (fora de escopo; exigiria estimativa).
- **Escolhido**: sem burndown no MVP. **Podado**: snapshots diários (complexidade/armazenamento sem requisito).

## 3. Fases

1. **Fundação**: tipos + domínio puro + testes (Red-Bar antes da UI).
2. **Persistência**: `useSprints` + testes de hook (invariantes 1–6).
3. **US1**: `SprintManagerModal` + `SprintBar` (CRUD, ativar/concluir).
4. **US2**: atribuição de tarefa (modal) + chip no cartão + confinamento guest.
5. **US3**: progresso/velocity no `SprintBar`.
6. **Polish**: CSS, acessibilidade (jest-axe), export/import, gate final.

## 4. Riscos (Pre-mortem)

| Risco | Mitigação |
|---|---|
| Duas sprints ativas por corrida de estado | `startSprint` rebaixa todas as demais no mesmo `setBoard` |
| Referência órfã (`activeSprintId` inválido) | Reconciliar no load/ao excluir; teste dedicado |
| Cascata acidental apagando tarefas | Exclusão só limpa `sprintId`; teste explícito (invariante 4) |
| Alterar estado de fluxo do cartão | Nunca tocar `column/timestamps/blocked*`; teste de invariante 5 |
| Export/import perder sprints | Campos no `BoardState`; validado por `isValidBoardState` opcional |

## 5. Conformidade Constitucional

- **I (SDD)**: spec/plan/data-model/tasks antes do código.
- **II (Modularidade)**: domínio puro + hook composto + componentes pequenos.
- **III (Verificação)**: `npm run test`, `npm run build`, `npm run lint`, `format:check` verdes.
- **IV (Observabilidade)**: falhas de validação com mensagem contextual; sem supressão silenciosa.
- **V (YAGNI)**: sem burndown/points/novas dependências.
- **VI (Raciocínio)**: modelos em `tasks.md`.
- **VII (Marca)**: termos canônicos (*Sprint*, *Velocity*).
- **VIII (Local-First/TBAC)**: `localStorage`; guest somente leitura.
- **IX (Dados)**: sem perda de tarefas ao excluir sprint.

## 6. Verificação

- Domínio puro: normalização, datas, progresso (0/0, parcial, total), velocity, sprint ativa/atraso.
- Hook: CRUD, única ativa, concluir sem auto-concluir tarefas, excluir desassocia, `activeSprintId` limpo.
- UI: criar/ativar/concluir, atribuir/remover tarefa, progresso, guest somente leitura, a11y (jest-axe).
- Integração: export→import preserva sprints/`sprintId`.
- Gate: suíte completa + build + lint + format.
