# Tasks: Feature 024 - Tipos de Tarefas (Cards, Subtarefas, Iniciativas), Vinculação Hierárquica e Vínculos Cross-Squad

**Branch**: `024-task-types-and-linking`  
**Status**: Planejado (25 tarefas)  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data Model**: [data-model.md](data-model.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Natureza dos Itens de Trabalho em Fluxos Lean/Kanban:**
  - Nem todo item de trabalho possui a mesma granularidade. Um fluxo maduro requer segregação ontológica entre escopos estratégicos (*Iniciativas / Épicos*), unidades de entrega de fluxo (*Cards / Histórias*) e desdobramentos técnicos (*Subtarefas*).
  - A relação de dependência entre tarefas é um grafo direcionado $G = (V, E)$, onde $V$ são as tarefas e $E$ são os relacionamentos tipados.
  - Para garantir integridade semântica bidirecional, para toda aresta $(u, v)$ com tipo $R$, deve existir a aresta recíproca $(v, u)$ com tipo $\text{reciprocal}(R)$.
- **Invariante de Preservação Retrocompatível:**
  - Toda tarefa existente sem o campo `type` deve ser tratada como `type: 'card'`.
  - Nenhuma estrutura legada de checklist (`subtasks?: SubtaskModel[]`) pode ser quebrada. Ambas coexistem sem ambiguidade.
- **Invariante de Soberania Local-First e Isolamento (TBAC):**
  - A vinculação cross-squad permite registrar dependências inter-equipes sem exigir que o usuário tenha privilégios de edição na squad remota. A leitura expõe apenas metadados seguros (título, squad e status da coluna), garantindo visibilidade sem conceder privilégios de escrita indevidos.

---

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Referências Órfãs na Exclusão de Tarefas):**
  - *Cenário:* A Tarefa A vincula a Tarefa B. A Tarefa B é excluída. A Tarefa A tenta renderizar o link para uma tarefa inexistente, gerando `TypeError: undefined is not an object`.
  - *Mitigação:* Utilitário defensivo `cleanupOrphanedLinks` executado durante `deleteTask` no `useBoards`, além de renderização resiliente em `TaskLinksSection` com fallback `[Tarefa Não Encontrada / Removida]`.
- **Modo de Falha 2 (Dependência Bloqueadora Invisível em Movimentação Rápida):**
  - *Cenário:* O operador arrasta rapidamente um cartão bloqueado para `done` sem notar a dependência pendente.
  - *Mitigação:* Interceptador no handler de drag-and-drop de `Board.tsx`: se a tarefa tiver `is_blocked_by` apontando para item fora de `done`, aciona imediatamente o `DependencySoftBlockModal` solicitando confirmação explícita.
- **Modo de Falha 3 (Vínculos Cíclicos ou Auto-Vínculo):**
  - *Cenário:* Tarefa A é vinculada a si mesma, gerando loop infinito em árvores de renderização.
  - *Mitigação:* Filtro estrito no seletor de tarefas: `allTasks.filter(t => t.id !== currentTask.id)`.
- **Modo de Falha 4 (Quebra de Testes Legados por Ausência de `type` ou `links`):**
  - *Cenário:* 287 testes existentes criam tarefas sem `type` nem `links`.
  - *Mitigação:* Tratamento defensivo: `task.type ?? 'card'` e `task.links ?? []` em todos os pontos de consumo.

---

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Phase 1: Setup & Data Modeling (T001-T002)**:
  - Tipagem TypeScript e extensão de interfaces sem lógica de estado ou UI.
- **Phase 2: Foundational Relational State & Utilities (T003-T005)**:
  - Utilitários matemáticos/relacionais puros e atualização do hook `useBoards` (totalmente desacoplado de componentes React).
- **Phase 3: User Story 1 - Tipos de Tarefas e Badges nos Cards (T006-T010)**:
  - Visualização de tipos, badges nos cartões, seletor de tipo no modal e CSS.
- **Phase 4: User Story 2 - Vinculação Intra-Quadro (T011-T014)**:
  - Criação e remoção de links entre tarefas do mesmo quadro com reciprocidade.
- **Phase 5: User Story 3 - Vínculos Cross-Squad (T015-T018) — MVP Core**:
  - Seleção em cascata (Squad $\to$ Board $\to$ Task), chips de squad externa e navegação.
- **Phase 6: User Story 4 - Progresso de Iniciativas e Soft Block (T019-T022)**:
  - Barra de progresso reativa e confirmação ao mover tarefas bloqueadas para `done`.
- **Phase 7: Verification, Quality Gate & Polish (T023-T025)**:
  - Testes unitários dedicados, regressão completa (287+ testes) e compilação limpa de produção.

---

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Descartada (Hard Block Rígido na Movimentação):** Poda por inflexibilidade operacional. O Kanban empodera o time; o Soft Block com diálogo de confirmação atende à governança sem travar o fluxo em situações excepcionais.
- **Alternativa Descartada (Grafo Externo com Banco de Dados em Grafo):** Poda por violação da Simplicidade (Princípio V). Arrays normalizados de `TaskLinkModel` em `localStorage` resolvem 100% dos requisitos em tempo constante sem adicionar nenhuma dependência externa.
- **Alternativa Descartada (Restringir Vínculos apenas a Squads do Usuário):** Poda após `/speckit-clarify`. A transparência organizacional exige que times possam declarar dependência de serviços externos mesmo sem pertencerem àquela squad.

---

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha Demonstrável (Red Bar):**
  - Os testes em `tests/unit/taskTypesAndLinking.test.ts`, `tests/unit/TaskTypeBadge.test.tsx`, `tests/unit/TaskLinksSection.test.tsx` e `tests/unit/boardMovementSoftBlock.test.tsx` falham inicialmente pois os componentes, hooks e propriedades ainda não foram implementados.
- **Critério Determinístico de Aceite (Green Bar):**
  - Todos os novos testes unitários passam com 100% de sucesso.
  - A suíte completa existente (287 testes legados) continua 100% verde sem nenhuma regressão.
  - `npm run build` compila sem advertências ou erros de tipagem TypeScript.

---

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Princípio I (SDD):** `spec.md`, `checklists/`, `research.md`, `data-model.md`, `quickstart.md`, `plan.md` e `tasks.md` formalizados rigorosamente antes do código de produção.
- **Princípio II (Modularidade):** Componentes pequenos, atômicos e reutilizáveis (`TaskTypeBadge`, `TaskLinksSection`, `DependencySoftBlockModal`).
- **Princípio III (Verificação Automatizada):** Cobertura de testes unitários para todas as 4 User Stories.
- **Princípio V (Simplicidade & YAGNI):** Zero bibliotecas de terceiros adicionadas ao `package.json`.
- **Princípio VII (Independência de Marca):** Nomenclatura proprietária do *Metrik Design System*.
- **Princípio VIII (Soberania Local-First & Isolamento):** Resumo seguro em cross-squad links e persistência defensiva em `localStorage`.

---

## Phase 1: Setup & Data Modeling

**Purpose**: Definição das estruturas de tipos TypeScript e extensão retrocompatível de `TaskModel`

- [ ] T001 [P] Define TypeScript types `TaskType`, `TaskRelationType`, `TaskLinkModel`, `TaskTypeConfig`, `CrossSquadTaskSummary` and configuration constants `TASK_TYPE_CONFIGS`, `TASK_RELATION_CONFIGS` in `src/types/taskTypes.ts`
- [ ] T002 [P] Extend `TaskModel` interface with optional properties `type?: TaskType` and `links?: TaskLinkModel[]` in `src/types/kanban.ts` and verify default seed tasks compatibility in `src/utils/defaultSeedData.ts`

---

## Phase 2: Foundational Relational State & Utilities

**Purpose**: Utilitários matemáticos puros para manipulação relacional de vínculos, reciprocidade e cálculo de progresso

- [ ] T003 [P] Write unit tests for task relation utilities covering reciprocal links, link removal, orphaned link cleanup, pending blocker detection, and initiative progress in `tests/unit/taskTypesAndLinking.test.ts`
- [ ] T004 Implement pure relational helper functions `getReciprocalRelation`, `addBidirectionalLink`, `removeBidirectionalLink`, `cleanupOrphanedLinks`, `calculateInitiativeProgress`, and `getPendingBlockers` in `src/utils/taskRelations.ts`
- [ ] T005 Update `useBoards` hook in `src/hooks/useBoards.ts` to support atomic task link updates, cross-board link synchronization, and automatic orphaned link cleanup upon task deletion (`deleteTask`)

**Checkpoint**: Camada foundational pronta — lógica relacional, reciprocidade e integridade testáveis de forma 100% desacoplada.

---

## Phase 3: User Story 1 - Tipos de Tarefas e Badges Visuais nos Cards (Priority: P1)

**Goal**: Permitir classificar tarefas entre `Iniciativa`, `Card` e `Subtarefa`, exibindo badges temáticos nos cartões Kanban e seletor no modal de detalhes.

**Independent Test**: Criar 3 tarefas (uma de cada tipo) e verificar que cada cartão exibe seu respectivo badge no cabeçalho (`🎯 Iniciativa`, `📋 Card`, `🔹 Subtarefa`) com harmonia nos 3 temas.

### Tests for User Story 1
- [ ] T006 [P] [US1] Write unit tests for `TaskTypeBadge` component covering rendering of initiative, card, and subtask badges, theme contrast, and accessibility in `tests/unit/TaskTypeBadge.test.tsx`

### Implementation for User Story 1
- [ ] T007 [US1] Implement `TaskTypeBadge` component with semantic icons (`🎯`, `📋`, `🔹`), dynamic color tokens, and accessibility attributes in `src/components/TaskTypeBadge.tsx`
- [ ] T008 [US1] Update `TaskCard` inside `src/components/Board.tsx` to render the `TaskTypeBadge` in the card header, link counter pill, and cross-squad badge
- [ ] T009 [US1] Update `TaskDetailsModal.tsx` to include an accessible segmented/dropdown selector for `TaskType` (`Iniciativa`, `Card`, `Subtarefa`), updating `task.type` reactively
- [ ] T010 [US1] Add CSS styles for `.task-type-badge`, segmented type selector, and theme-aware colors in `src/App.css`

**Checkpoint**: User Story 1 funcional — tipos de tarefas visíveis nos cartões e editáveis no modal.

---

## Phase 4: User Story 2 - Vinculação Relacional Intra-Quadro (Priority: P1)

**Goal**: Permitir vincular tarefas entre si no mesmo quadro Kanban com semântica explícita (`pai`, `filha`, `bloqueia`, `bloqueada por`, `relacionada`) e consistência bidirecional.

**Independent Test**: No modal da Tarefa A, vincular a Tarefa B como "Bloqueia". Abrir os detalhes da Tarefa B e verificar que exibe "É bloqueada por Tarefa A".

### Tests for User Story 2
- [ ] T011 [P] [US2] Write unit tests for `TaskLinksSection` component covering link creation between tasks in the same board, bidirectional reciprocity, and link removal in `tests/unit/TaskLinksSection.test.tsx`

### Implementation for User Story 2
- [ ] T012 [US2] Implement `TaskLinksSection` component with link list, reciprocal relationship badges (`⬆️ Pai`, `⬇️ Filho`, `⛔ Bloqueia`, `🔒 É bloqueado por`, `🔗 Relacionado`), and link deletion buttons in `src/components/TaskLinksSection.tsx`
- [ ] T013 [US2] Integrate `TaskLinksSection` into `src/components/TaskDetailsModal.tsx`, passing board tasks, link mutation callbacks, and read-only mode for guests
- [ ] T014 [US2] Add CSS styles for task links list, relation chips, link action buttons, and hover interactions in `src/App.css`

**Checkpoint**: User Story 2 funcional — vínculos intra-quadro operando bidirecionalmente com visual clean.

---

## Phase 5: User Story 3 - Vínculos e Anexos Cross-Squad (Priority: P1) 🎯 MVP Core

**Goal**: Permitir vincular tarefas pertencentes a outras squads e outros quadros (cross-squad) com busca em cascata e exibição segura de metadados.

**Independent Test**: Na Squad Frontend, abrir tarefa e vincular tarefa da Squad Backend. O cartão da Squad Frontend passa a exibir o chip `🏢 Squad Backend • #T-API`.

### Tests for User Story 3
- [ ] T015 [P] [US3] Write unit tests for cross-squad task discovery, cascaded selectors (Squad $\to$ Board $\to$ Task), and external squad badge rendering in `tests/unit/crossSquadLinking.test.tsx`

### Implementation for User Story 3
- [ ] T016 [US3] Expand `TaskLinksSection.tsx` to add "Vincular de Outro Time / Squad" modal/accordion with cascading dropdowns: Squad Alvo (from `useTeamAccess`), Quadro Alvo (from `useBoards`), and Tarefa Alvo in `src/components/TaskLinksSection.tsx`
- [ ] T017 [US3] Update `Board.tsx` card rendering to display an external squad chip (e.g. `🏢 Squad Backend`) when a task possesses cross-squad links, with safe metadata tooltip
- [ ] T018 [US3] Add styles for cross-squad link chips, squad indicator pills, and external link navigation triggers in `src/App.css`

**Checkpoint**: User Story 3 funcional — vínculos cross-squad com busca em cascata e visualização segura ativas.

---

## Phase 6: User Story 4 - Progresso de Iniciativas e Validação de Soft Block (Priority: P2)

**Goal**: Exibir barra de progresso percentual reativa em iniciativas e interceptar com diálogo de confirmação (**Soft Block**) a movimentação de tarefas com dependências pendentes para a coluna *Concluído*.

**Independent Test**: Mover tarefas filhas de uma Iniciativa e ver a barra de progresso avançar. Tentar mover tarefa com dependência pendente para `done` e validar que o diálogo de confirmação é acionado.

### Tests for User Story 4
- [ ] T019 [P] [US4] Write unit tests for `DependencySoftBlockModal` and drag-and-drop movement interception when blocked tasks attempt entering `done` in `tests/unit/boardMovementSoftBlock.test.tsx`

### Implementation for User Story 4
- [ ] T020 [US4] Implement `DependencySoftBlockModal` component with friendly warning dialog, listing unresolved blocking tasks and explicit "Cancelar" vs "Confirmar Conclusão" actions in `src/components/DependencySoftBlockModal.tsx`
- [ ] T021 [US4] Render reactive progress bar on `initiative` cards in `src/components/Board.tsx` and in `TaskDetailsModal.tsx` showing percentage and count of completed child tasks
- [ ] T022 [US4] Integrate soft block interception into column drag-and-drop and manual column selector in `src/components/Board.tsx`, prompting confirmation when moving cards with pending blockers to `done`

**Checkpoint**: User Story 4 funcional — progresso de iniciativas e validação de dependências pendentes em ação.

---

## Phase 7: Verification, Quality Gate & Polish

**Purpose**: Verificação completa automatizada, garantia de zero regressões e conformidade de build

- [ ] T023 [P] Execute dedicated task types, linking, and soft block test suites (`npx vitest run tests/unit/taskTypesAndLinking.test.ts tests/unit/TaskTypeBadge.test.tsx tests/unit/TaskLinksSection.test.tsx tests/unit/crossSquadLinking.test.tsx tests/unit/boardMovementSoftBlock.test.tsx`)
- [ ] T024 Execute full regression test suite (`npm test`) ensuring 100% pass rate across all 287 existing tests plus all new tests
- [ ] T025 Run strict type checking and production build (`npm run build`) ensuring zero TypeScript and bundle errors

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências — pode iniciar imediatamente.
- **Foundational (Phase 2)**: Depende de Phase 1 — BLOQUEIA a implementação de UI de links.
- **User Story 1 (Phase 3)**: Depende de Phase 1 e Phase 2 — entrega tipos de tarefas e badges.
- **User Story 2 (Phase 4)**: Depende de Phase 2 e Phase 3 — entrega vínculos intra-quadro.
- **User Story 3 (Phase 5 - MVP Core)**: Depende de Phase 4 — entrega busca e anexo cross-squad.
- **User Story 4 (Phase 6)**: Depende de Phase 4 e Phase 5 — entrega progresso de iniciativas e soft block.
- **Verification (Phase 7)**: Depende da conclusão de todas as fases.

---

## Parallel Opportunities

- `T001` (Tipagem `taskTypes.ts`) e `T002` (Extensão `kanban.ts`) podem ser executados em paralelo.
- `T003` (Testes dos utilitários) e `T006` (Testes do badge de tipo) podem ser preparados em paralelo.
- `T011` (Testes de links) e `T015` (Testes de cross-squad) podem ser preparados em paralelo.
- `T019` (Testes do soft block) e `T020` (Componente `DependencySoftBlockModal`) podem ser desenvolvidos em paralelo.

---

## Implementation Strategy (MVP First)

1. **Etapa 1 (Fundação)**: Completar Setup (Phase 1) e Utilitários Relacionais (Phase 2).
2. **Etapa 2 (Classificação & Badges)**: Completar User Story 1 (Phase 3) — neste ponto as tarefas já são visivelmente identificadas como Iniciativa, Card ou Subtarefa.
3. **Etapa 3 (Vínculos Locais)**: Completar User Story 2 (Phase 4) — relacionamentos locais operando com integridade bidirecional.
4. **Etapa 4 (MVP Core - Cross-Squad)**: Completar User Story 3 (Phase 5) — anexo de tarefas entre diferentes squads e quadros.
5. **Etapa 5 (Inteligência de Fluxo)**: Completar User Story 4 (Phase 6) — barras de progresso e confirmação de soft block.
6. **Etapa 6 (Qualidade & Release)**: Executar todas as suítes de teste (287+ testes verdes) e compilação limpa no `npm run build`.
