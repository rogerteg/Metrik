# Implementation Tasks: Task Details Activity & Objective Fields Redesign

**Feature**: Task Details Activity & Objective Fields Redesign  
**Branch**: `037-task-details-activity-redesign` | **Spec**: [spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/037-task-details-activity-redesign/spec.md) | **Plan**: [plan.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/037-task-details-activity-redesign/plan.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Invariantes Irredutíveis:** 
  1. Qualquer alteração em um campo da tarefa (criação, responsável, status, prioridade, data de entrega, comentários, subtarefas) DEVE gerar um registro imutável de log de atividade.
  2. O feed de atividades deve permitir navegação, busca em tempo real e colapso de histórico antigo sem alterar o estado de persistência da tarefa.
  3. O visual do log deve ancorar a data/hora no canto direito sem sofrer estouro de layout (*overflow*) quando o nome do usuário for longo.
- **Premissas Eliminadas:** Eliminada a necessidade de requisições de servidores externos; todo o histórico de logs é mantido na arquitetura Local-First.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Modos de Falha Identificados:**
  1. *Estouro Visual de Timestamps:* Nomes de usuários extensos empurrando o timestamp para fora da tela em dispositivos móveis/janelas estreitas.
     - *Mitigação:* Usar `truncate min-w-0` na área de texto e `ml-4 whitespace-nowrap text-right` no timestamp.
  2. *Perda acidental de rascunhos de comentário:* Usuário digita um comentário no card "Escreva um comentário..." e fecha a modal sem querer.
     - *Mitigação:* Integrar o card com a guarda de rascunhos (*Draft Guard*) do Metrik (Princípio IX).
  3. *Acúmulo de dezenas de itens de log poluindo a tela:*
     - *Mitigação:* Agrupar itens antigos após os 5 mais recentes sob o botão sanfona `> Mostrar mais`.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Exclusividade Mútua (ME):** Cada componente (`TaskActivityHeader`, `TaskActivityLogList`, `TaskActivityLogItem`, `TaskActivityCommentForm`) possui responsabilidade única sem sobreposição de estado.
- **Exaustividade Coletiva (CE):** A soma das tarefas cobre 100% dos requisitos funcionais (FR-001 a FR-008) e cenários de aceitação de todas as 4 Histórias de Usuário da `spec.md`.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Alternativa A:** Renderizar a lista inteira de histórico de uma vez com barra de rolagem infinita. *(Descartada: polui a interface e torna a navegação nos campos da tarefa cansativa).*
- **Alternativa B (Escolhida):** Mostrar os 5 itens mais recentes e recolher os anteriores sob um botão sanfona `> Mostrar mais`. *(Vencedora: preserva compacidade visual e rápida visualização do estado atual).*

### 5. Critério de Falsificabilidade & TDD (*Red-Bar First*)
- **Falha Demonstrável (Red Bar):** Criar testes unitários para `TaskActivityHeader`, `TaskActivityLogItem`, `TaskActivityLogList` e `TaskActivityPanel` especificando a renderização dos 5 itens, o botão `> Mostrar mais`, os seletores de busca/filtro e o campo de comentário. Os testes DEVEM falhar antes da criação dos componentes.
- **Green Bar:** Todos os testes passam deterministicamente via `npm test -- --run` e o bundle compila sem erros com `npm run build`.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Validado com a Constitution (v1.6.2):** Cumprimento rigoroso da Soberania Local-First (Princípio VIII), Independência de Marca (Princípio VII: zero vazamento de nomes externos e uso de termos concisos em Português) e Proteção de Dados/Rascunhos (Princípio IX).

---

## Phase 1: Setup & Data Models

**Purpose**: Shared interfaces and date formatting utility infrastructure

- [X] T001 [P] Create activity data models and filter types in `src/types/taskActivity.ts`
- [X] T002 [P] Implement Portuguese date timestamp formatter and action text diff generators in `src/utils/activityFormatter.ts`

---

## Phase 2: Foundational Infrastructure

**Purpose**: Core state hook and utility tests blocking UI components

- [X] T003 [P] Implement unit tests for activity formatter utilities in `tests/unit/activityFormatter.test.ts`
- [X] T004 Implement custom state hook `useTaskActivity.ts` for search query, category filtering, unread counter, and 5-item collapsible accordion state in `src/hooks/useTaskActivity.ts`

---

## Phase 3: User Story 1 - Objective Activity Header & Interactive Controls (Priority: P1)

**Goal**: Header with title "Activity", search toggle, notification counter badge `3`, and filter options menu

**Independent Test**: Can be verified by opening the Activity header, clicking search to open input, checking badge counter `3`, and selecting category filter choices.

- [X] T005 [P] [US1] Write unit test for Activity Header component in `tests/unit/TaskActivityHeader.test.tsx`
- [X] T006 [US1] Implement Activity Header component (`TaskActivityHeader.tsx`) with search toggle, notification count badge, and filter dropdown menu in `src/components/TaskActivityHeader.tsx`

---

## Phase 4: User Story 2 - Bulleted Objective Activity Logs & Diff Stream (Priority: P1)

**Goal**: Bulleted log items with actor name, Portuguese action diff text, and right-aligned timestamp layout

**Independent Test**: Can be verified by rendering log items and checking bullet layout (`disc`), Portuguese action text, and right-aligned timestamp anchoring without text overlap.

- [X] T007 [P] [US2] Write unit test for Bulleted Log Item component in `tests/unit/TaskActivityLogItem.test.tsx`
- [X] T008 [US2] Implement Bulleted Log Item component (`TaskActivityLogItem.tsx`) with text truncation and right-aligned timestamp positioning in `src/components/TaskActivityLogItem.tsx`

---

## Phase 5: User Story 3 - Collapsible Activity Log Grouping & Comment Input Card (Priority: P2)

**Goal**: Collapsible accordion (`> Mostrar mais`) for entries older than 5 items and bottom comment input card

**Independent Test**: Can be verified on tasks with >5 activity entries by checking that 5 items render initially with a `> Mostrar mais` expand button, and that submitting a comment adds a new entry.

- [X] T009 [P] [US3] Write unit test for Collapsible Activity Log List component in `tests/unit/TaskActivityLogList.test.tsx`
- [X] T010 [US3] Implement Activity Log List component (`TaskActivityLogList.tsx`) with 5-item accordion collapse and empty state message in `src/components/TaskActivityLogList.tsx`
- [X] T011 [P] [US3] Write unit test for Comment Input Card component in `tests/unit/TaskActivityCommentForm.test.tsx`
- [X] T012 [US3] Implement bottom Comment Input Card component (`TaskActivityCommentForm.tsx`) with placeholder "Escreva um comentário...", `Ctrl+Enter` shortcut, and submit handling in `src/components/TaskActivityCommentForm.tsx`
- [X] T013 [US3] Implement main Activity Panel sidebar wrapper (`TaskActivityPanel.tsx`) combining header, log list, and comment card in `src/components/TaskActivityPanel.tsx`

---

## Phase 6: User Story 4 - Organized Objective Task Detail Fields Layout (Priority: P2)

**Goal**: Redesigned task detail modal layout organizing objective metadata fields (Status, Assignee, Priority, Tags, Due Date, Flow Metrics, Subtasks, Activity)

**Independent Test**: Can be verified by opening task detail view and confirming primary fields are organized in distinct sections on left and Activity Panel is docked on right.

- [X] T014 [P] [US4] Write unit tests for redesigned Task Details Modal layout in `tests/unit/TaskDetailsModalRedesign.test.tsx`
- [X] T015 [US4] Refactor `TaskDetailsModal.tsx` into an organized 2-column layout with primary metadata fields on left and `TaskActivityPanel` on right in `src/components/TaskDetailsModal.tsx`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Styling polish, test execution, and production build verification

- [X] T016 [P] Add CSS styling tokens for glassmorphism, bullet log spacing, and accordion animations in `src/components/TaskActivityPanel.css`
- [X] T017 Execute complete Vitest suite to verify 100% test pass rate (`npm test -- --run`)
- [X] T018 Execute TypeScript and Vite production build check (`npm run build`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Independent — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 setup completion.
- **User Story 1 (Phase 3)**: Depends on Phase 2 foundation completion.
- **User Story 2 (Phase 4)**: Depends on Phase 2 foundation completion.
- **User Story 3 (Phase 5)**: Depends on Phase 3 & 4 completion.
- **User Story 4 (Phase 6)**: Depends on Phase 5 completion.
- **Polish (Phase 7)**: Depends on all user stories completion.

### Parallel Opportunities

- `T001` and `T002` can be implemented in parallel.
- `T005` (Header test) and `T007` (Item test) can be written in parallel.
- `T009` (Log List test) and `T011` (Comment Form test) can be written in parallel.
- `T016` (CSS styling) can be developed in parallel with component integration.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)
1. Complete Phase 1 & 2 setup and foundational hooks.
2. Complete Phase 3 & 4 (Activity Header + Bulleted Log Stream).
3. **Validate MVP**: Test bulleted log rendering, search, filtering, and timestamp alignment.

### Full Delivery
1. Complete Phase 5 (5-item Accordion Collapse `> Mostrar mais` + Comment Card).
2. Complete Phase 6 (Organized Objective Task Detail Fields Layout).
3. Run Phase 7 automated tests (`npm test -- --run`) and build validation (`npm run build`).

---

## Phase 8: Convergence

- [x] T019 Remover vazamento de marca de terceiro no comentário de código de `src/utils/taskActivityLogger.ts:38` (helper de diff pill), revisando também o arquivo de teste correspondente e os artefatos da Feature 035 per Constitution VII (contradicts) — CRITICAL
- [x] T020 Definir e implementar atribuição de responsável (campo `assignee` no `TaskModel`/data-model + eventos `assignment`/`unassignment` com descrição em PT) OU remover o requisito do escopo per FR-006, US2/AS2 (missing)
- [x] T021 Reconciliar o layout do detalhe: atualizar `plan.md`/`spec.md` para as abas implementadas (Visão Geral / Atividade / Métricas) OU reintroduzir o `TaskActivityPanel` em 2 colunas conforme o plano per FR-007, plan:TaskDetailsModal (contradicts)
- [x] T022 Reconciliar o feed de atividade do modal com FR-001/FR-002/FR-004 (cabeçalho "Activity", itens em bullet `disc`, accordion `> Mostrar mais` com corte em 5) OU atualizar esses requisitos para o comportamento de timeline implementado per FR-001, FR-002, FR-004 (contradicts)
- [x] T023 Alinhar o placeholder do compositor de comentário a "Escreva um comentário..." OU atualizar FR-005 para o texto com Markdown per FR-005 (partial)
- [x] T024 Registrar e justificar nos artefatos (spec/plan) as abas do modal, o `TaskFlowMetricsPanel` e a reescrita visual do feed de atividade per plan ausente (unrequested)
- [x] T025 Cobrir no detalhe os campos objetivos "Status badge" e "Assignee selector" OU ajustar FR-007 per FR-007 (missing)
- [x] T026 Adicionar verificação automatizada de performance (<200ms) para busca/filtro do histórico per SC-002 (missing)
- [x] T027 Adicionar verificação responsiva (ausência de sobreposição entre texto e timestamp) per SC-004 (missing)
- [x] T028 Criar `tests/unit/TaskActivityPanel.test.tsx` OU corrigir o `plan.md` que o referencia per plan:Project Structure (missing)
- [x] T029 Ajustar o `plan.md`: remover a dependência "Lucide React" (inexistente no projeto) e atualizar versões de stack (TS/React) e a versão da Constitution per plan:Technical Context (contradicts)
- [x] T030 Ajustar o caso de borda de estado vazio/"retry if network fails" da `spec.md` para o modelo Local-First (sem dependência de rede) per spec:Edge Cases (partial)
- [x] T031 Padronizar o formato de timestamp do feed de atividade (FR-003) entre `activityFormatter` e o render efetivo do detalhe per FR-003 (partial)
- [x] T032 Revisar/remover os componentes não utilizados após o redesenho (`TaskActivityPanel` e filhos) ou justificar sua permanência per code:dead-code (unrequested)
