# Task List: Comentários e Trilha de Auditoria de Ações da Tarefa (Feature 033)

**Branch**: `033-task-comments-activity-log` | **Date**: 2026-09-21 | **Spec**: [`spec.md`](spec.md) | **Plan**: [`plan.md`](plan.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Invariante irredutível de dados:** Todo evento de auditoria (`TaskActivityLog`) é imutável e gerado atomicamente pelo sistema. Todo comentário (`TaskComment`) é gravado em texto simples (`white-space: pre-wrap`) e associado a um autor e timestamp ISO.
- **Invariante de soberania local (Princípio VIII):** O histórico de comentários e auditoria é gravado atomicamente no `localStorage` sob a chave do quadro (`metrik_tasks_<boardId>`), funcionando 100% offline.
- **Isolamento de privilégios (Guest confinement):** Usuários com papel `guest` possuem acesso restrito à leitura da linha do tempo. O formulário de envio de comentários e botões de exclusão são desativados no nível de componente e hook.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Risco 1 - Mutação de tarefa sem evento de auditoria:** Movimentações efetuadas via drag-and-drop, botões de ação ou atalhos poderiam esquecer de registrar o log.
  - *Mitigação:* Encapsular a criação de logs diretamente dentro das funções de mutação do gancho central `useTaskCollection` (`moveTask`, `toggleTaskBlocked`, `setTaskPriority`, `addTaskTag`, `removeTaskTag`), garantindo 100% de cobertura auditada.
- **Risco 2 - Perda de rascunho de comentário ao fechar modal:** O usuário digita um comentário e fecha o modal por engano.
  - *Mitigação:* Integrar o formulário com o guard de rascunho (Princípio IX), solicitando confirmação de descarte se houver texto pendente não enviado.
- **Risco 3 - Vulnerabilidade de Injeção/XSS:** Inserção de scripts maliciosos nos comentários.
  - *Mitigação:* Renderizar texto estritamente via elementos `<span>` / `<p>` com estilo CSS `white-space: pre-wrap` sem interpretação de HTML / `dangerouslySetInnerHTML`.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Exclusividade Mútua (MECE):**
  - T001–T003: Tipos e utilitários base de dados (camada de modelo).
  - T004–T005: Gancho central de auditoria e infraestrutura de teste (camada de dados/hook).
  - T006–T010: US1 (Comentários e interface de envio/exibição).
  - T011–T014: US2 (Auditoria automática e renderização de eventos).
  - T015–T017: US3 (Filtros visuais da linha do tempo e ordenação unificada).
  - T018–T021: Polimento, integração com Autosave/Supabase e validação final.
- **Exaustividade Coletiva (100% dos requisitos de spec.md):**
  - FR-001, FR-002, FR-008, FR-012 (Comentários texto simples imutáveis) → Cobertos por US1 (T006–T010).
  - FR-003, FR-004, FR-005, FR-009 (Trilha de auditoria automática e imutável) → Cobertos por US2 (T011–T014).
  - FR-006, FR-007 (Linha do tempo unificada com filtros "Todos", "Comentários", "Auditoria") → Cobertos por US3 (T015–T017).
  - FR-010 (Persistência Local-First e Supabase Sync) → Coberto por Foundational & Polish (T004, T019).
  - FR-011 (Restrição de Guest) → Coberto por US1 & US2 (T007, T009).

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts*)
- **Ramo A (Descartado):** Eventos de auditoria gerados manualmente nos manipuladores de clique dos componentes visuais.
  - *Razão de poda:* Risco altíssimo de regressão e lacunas na auditoria ao adicionar novas formas de movimentar tarefas no Kanban.
- **Ramo B (Descartado):** Renderizador Markdown para comentários.
  - *Razão de poda:* Decisão da sessão de esclarecimento (2026-09-18). Aumentaria bundle e superfície de ataque XSS sem necessidade.
- **Ramo C (Escolhido):** Auto-log encapsulado em `useTaskCollection` + comentários em texto simples com preservação de quebra de linha.

### 5. Critério de Falsificabilidade & TDD (*Red-Bar First*)
- **Falha demonstrável (Red Bar):** A suíte de testes unitários `tests/unit/TaskCommentsActivityLog.test.tsx` deve ser criada e falhar para inserção de comentários, filtro de linha do tempo e geração automática de auditoria antes da implementação das alterações nos componentes.
- **Critério determinístico de aceite (Green Bar):** `npm test -- --run` executando 100% verde sem erros e `npm run build` compilando sem alertas de tipos.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Constitution Check:**
  - Princípio I: Spec, Plan, Research, Contracts e Tasks gerados previamente.
  - Princípio III: Testes automatizados Vitest para todos os cenários de comentários e auditoria.
  - Princípio VII: Zero vazamento de marcas de terceiros no UI ou código.
  - Princípio VIII: Gravação 100% offline em `localStorage` e bloqueio de criação para `guest`.
  - Princípio IX: Proteção de rascunhos de comentários pendentes.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de tipos TypeScript, contratos de dados e utilitários de fábrica.

- [x] T001 Define TypeScript interfaces `TaskComment`, `TaskActivityLog`, `TaskActivityEventType`, and `TimelineItem` in `src/types/taskActivity.ts`
- [x] T002 Extend `TaskModel` interface with optional `comments` and `activityLog` arrays in `src/types/kanban.ts`
- [x] T003 [P] Create activity log event factory helper `createTaskActivityEvent` in `src/utils/taskActivityLogger.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura de dados no gancho `useTaskCollection` e suíte base de testes.

- [x] T004 Implement auto-logging mutation wrappers (`addTaskComment`, `deleteTaskComment`, `moveTask`, `toggleTaskBlocked`, `setTaskPriority`, `addTaskTag`, `removeTaskTag`) in `src/hooks/useTaskCollection.ts`
- [x] T005 Create unit test suite file and initial test assertions in `tests/unit/TaskCommentsActivityLog.test.tsx`

---

## Phase 3: User Story 1 - Registro e Consulta de Comentários na Tarefa (Priority: P1) 🎯 MVP

**Goal**: Permitir que membros do time adicionem e consultem comentários estruturados em texto simples em cada cartão de tarefa.

**Independent Test**: Abrir modal da tarefa, digitar comentário de atualização, enviar e verificar que é listado com autor e timestamp exatos, permanecendo salvo no `localStorage` após F5.

### Tests for User Story 1 🧪
- [x] T006 [P] [US1] Create unit tests for comment creation, empty text validation, and Local-First persistence in `tests/unit/TaskCommentsActivityLog.test.tsx`

### Implementation for User Story 1
- [x] T007 [P] [US1] Create `CommentInputForm` component with plain text textarea, whitespace preservation, trim validation, and `Ctrl+Enter` submit shortcut in `src/components/CommentInputForm.tsx`
- [x] T008 [P] [US1] Create `CommentItem` component rendering author name, ISO date format (`DD/MM/AAAA HH:mm`), text (`white-space: pre-wrap`), and delete button in `src/components/CommentItem.tsx`
- [x] T009 [US1] Integrate comment creation, comment list display, and `guest` read-only disabled state into `TaskTimeline` component in `src/components/TaskTimeline.tsx`
- [x] T010 [US1] Embed `TaskTimeline` component section into `TaskDetailsModal` in `src/components/TaskDetailsModal.tsx`

**Checkpoint**: User Story 1 fully functional and testable independently (MVP ready).

---

## Phase 4: User Story 2 - Trilha de Auditoria Automática de Ações nos Cartões (Priority: P2)

**Goal**: Registrar automaticamente todas as ações efetuadas nos cartões (movimentação de coluna, bloqueio, prioridade, tags, datas) em um log imutável.

**Independent Test**: Mover tarefa entre colunas e alterar bloqueio, abrir detalhes da tarefa e verificar a presença das entradas de auditoria com autor, data, horário e valores anterior/novo.

### Tests for User Story 2 🧪
- [x] T011 [P] [US2] Create unit tests for automatic audit log generation during task moves, block toggles, and priority changes in `tests/unit/TaskCommentsActivityLog.test.tsx`

### Implementation for User Story 2
- [x] T012 [P] [US2] Create `ActivityLogItem` component rendering action badges (movement arrows, shield, tag icons), human-readable description, actor name, and timestamp in `src/components/ActivityLogItem.tsx`
- [x] T013 [US2] Wire automated activity log items rendering into `TaskTimeline` component in `src/components/TaskTimeline.tsx`
- [x] T014 [US2] Ensure board drag-and-drop moves and action toolbar handlers in `src/App.tsx` correctly trigger audit log generation via `useTaskCollection`

**Checkpoint**: User Story 1 and User Story 2 both work independently and seamlessly together.

---

## Phase 5: User Story 3 - Painel Unificado de Histórico e Filtro de Linha do Tempo (Priority: P3)

**Goal**: Oferecer uma linha do tempo cronológica unificada com botões de filtro visual ("Todos", "Apenas Comentários", "Apenas Auditoria").

**Independent Test**: Alternar entre os botões de filtro na linha do tempo da tarefa e verificar a filtragem reativa e precisa dos eventos.

### Tests for User Story 3 🧪
- [x] T015 [P] [US3] Create unit tests for timeline filter switching ("all", "comments", "activity") and chronological sorting in `tests/unit/TaskCommentsActivityLog.test.tsx`

### Implementation for User Story 3
- [x] T016 [P] [US3] Create `TimelineFilterBar` component with filter buttons and accessibility attributes (`data-testid="timeline-filter-*"` ) in `src/components/TimelineFilterBar.tsx`
- [x] T017 [US3] Connect `TimelineFilterBar` selection state with combined `TimelineItem[]` filtering and sorting in `src/components/TaskTimeline.tsx`

**Checkpoint**: All three user stories fully functional and integrated.

---

## Phase 6: Polish, Autosave Integration & Verification

**Purpose**: Validações cruzadas, proteção de rascunhos de comentários, sync Supabase e suíte final.

- [x] T018 [P] Integrate comment submission draft protection with `autoSaveComments` setting from `GeneralSettingsContext` in `src/components/CommentInputForm.tsx`
- [x] T019 [P] Verify Supabase cloud sync payload handling for `comments` and `activityLog` arrays in `src/lib/supabaseSync.ts`
- [x] T020 Run full Vitest test suite (`npm test -- --run`) and TypeScript build (`npm run build`) to ensure zero errors and zero regressions
- [x] T021 Execute runnable verification scenarios from `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3–5)**: All depend on Foundational phase completion
  - US1 (P1) → US2 (P2) → US3 (P3)
- **Polish (Phase 6)**: Depends on completion of user stories

### Parallel Opportunities
- T003 (activity logger helper) can run in parallel with T001/T002.
- T006, T007, T008 (US1 components and tests) can run in parallel.
- T011, T012 (US2 components and tests) can run in parallel.
- T015, T016 (US3 components and tests) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 - Comentários).
3. **STOP and VALIDATE**: Run unit tests and manual check for User Story 1.

### Full Incremental Delivery
1. Add Phase 4 (User Story 2 - Trilha de Auditoria Automática).
2. Add Phase 5 (User Story 3 - Painel Unificado e Filtros).
3. Run Phase 6 (Polish & Full Verification Suite).
