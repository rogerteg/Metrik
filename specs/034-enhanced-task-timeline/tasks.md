# Task List: Redesign do Histórico, Auditoria e Comentários da Tarefa (Feature 034)

**Branch**: `034-enhanced-task-timeline` | **Date**: 2026-09-21 | **Spec**: [`spec.md`](spec.md) | **Plan**: [`plan.md`](plan.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Invariante irredutível de dados:** Todo comentário (`TaskComment`) e evento de auditoria (`TaskActivityLog`) é imutável e serializável no modelo da tarefa. O atributo `isDecision?: boolean` estende `TaskComment` de forma retrocompatível.
- **Invariante de soberania local (Princípio VIII):** O agrupamento temporal, busca textual e filtros visuais ocorrem 100% em memória no cliente a partir dos dados do `localStorage` (`metrik-tasks-<boardId>`).
- **Isolamento de privilégios (Guest confinement):** Usuários com papel `guest` visualizam buscas, filtros e estatísticas, mas o formulário de envio, marcadores de decisão e exclusão são bloqueados.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Risco 1 - Vulnerabilidade de XSS ao renderizar Markdown:** Inserção de scripts via tags HTML em comentários ricos.
  - *Mitigação:* Desenvolver formatador por AST/Regex nativo seguro (`simpleMarkdown.ts`) que mapeia apenas tokens específicos (`**`, `*`, `-`, `` ` ``) para elementos React estritos, eliminando o uso de `dangerouslySetInnerHTML`.
- **Risco 2 - Perda de performance em tarefas com 100+ eventos:** Lentidão no scroll do modal ao re-filtrar e re-agrupar a linha do tempo.
  - *Mitigação:* Encapsular o agrupamento por time-buckets e filtragem textual em `useMemo` com dependências estritas, mantendo tempo de execução <30ms a 60 FPS.
- **Risco 3 - Perda de rascunho ao fechar o modal:** Texto parcialmente digitado descartado sem aviso.
  - *Mitigação:* Integrar o formulário com o contexto de autosave (`autoSaveComments`) da Feature 032.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Exclusividade Mútua (MECE):**
  - T001–T003: Tipagem e utilitários puros (parser markdown, fábrica de diffs).
  - T004–T005: Agrupamento por baldes temporais e infraestrutura de testes.
  - T006–T009: US1 (Redesign visual da timeline, diff cards e agrupamento temporal).
  - T010–T013: US2 (Comentários Markdown, flag `isDecision`, atalhos `Ctrl+Enter`).
  - T015–T017: US3 (Filtro exclusivo "Decisões", busca em tempo real, densidade e header estatístico).
  - T018–T020: Polimento, Supabase Sync e suíte de testes finais.
- **Exhaustividade Coletiva (100% dos requisitos de spec.md):**
  - FR-001, FR-002 (Redesign visual dark enterprise e diff cards) → US1 (T006–T009).
  - FR-003, FR-004, FR-012 (Markdown limpo, marcação `isDecision` e `Ctrl+Enter`) → US2 (T010–T013).
  - FR-005, FR-006, FR-007, FR-008, FR-009 (Busca textual, filtro "Decisões", header estatístico, modo compacto, ver mais/menos) → US3 (T014–T017).
  - FR-010, FR-011 (Persistência Local-First / Supabase Sync e restrição Guest) → Foundational & Polish (T001, T011, T018).

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts*)
- **Ramo A (Descartado):** Instalar bibliotecas externas de Markdown (`marked`, `react-markdown`).
  - *Razão de poda:* Aumentaria o tamanho do bundle e traria riscos de XSS. O parser regex nativo atende com simplicidade (Princípio V).
- **Ramo B (Descartado):** Checkbox secundário escondido para decisões.
  - *Razão de poda:* Decisão da sessão de esclarecimento (2026-09-21). A aba exclusiva "Decisões" na `TimelineFilterBar` oferece acesso em 1 clique.
- **Ramo C (Escolhido):** Agrupamento por time buckets ("Hoje", "Ontem", "Esta Semana", "Anteriores") com formato diff `[De ➔ Para]`.

### 5. Critério de Falsificabilidade & TDD (*Red-Bar First*)
- **Falha demonstrável (Red Bar):** A suíte Vitest `tests/unit/TaskTimelineEnhanced.test.tsx` falhará antes da implementação das abas de decisão, agrupamentos temporais e cartões diff.
- **Critério determinístico de aceite (Green Bar):** `npm test -- --run` com 100% dos 500+ testes verdes e `npm run build` compilando sem avisos de tipo.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Constitution Check:**
  - Princípio I: Spec, Clarifications, Research, Plan, Data Model e Contracts gerados previamente.
  - Princípio III: Testes automatizados Vitest para todos os cenários de timeline e markdown.
  - Princípio VII: Ícones nativos inline sem dependência de lucide-react ou nomes proprietários.
  - Princípio VIII: Soberania local e confinamento read-only para `guest`.
  - Princípio IX: Proteção de rascunhos de comentários.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de tipos TypeScript estendidos e utilitários puros de parseamento.

- [x] T001 Define extended TypeScript interfaces `TaskComment` (`isDecision`), `TaskActivityLog` (`fromValue`, `toValue`), `TimelineGroup`, `GroupKey`, `TimelineFilter`, and `DensityMode` in `src/types/taskActivity.ts`
- [x] T002 [P] Create safe, lightweight Markdown regex/AST parser helper (`parseSimpleMarkdown`) in `src/utils/simpleMarkdown.ts`
- [x] T003 [P] Extend activity logger helper `createTaskActivityEvent` and `AuditDescriptions` with diff formatting (`[From ➔ To]`) in `src/utils/taskActivityLogger.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Lógica de agrupamento por baldes temporais e infraestrutura de suíte de teste.

- [x] T004 Implement time-bucket grouping logic (`groupTimelineItems`) for "Hoje", "Ontem", "Esta Semana", "Anteriores" in `src/utils/taskActivityLogger.ts`
- [x] T005 Create unit test suite file `tests/unit/TaskTimelineEnhanced.test.tsx` for Markdown parsing, diff formatting, time buckets, and decision filtering assertions

---

## Phase 3: User Story 1 - Timeline Visual Redesenhada e Diff Cards de Auditoria (Priority: P1) 🎯 MVP

**Goal**: Exibir a linha do tempo da tarefa com cartões visuais de alteração (diffs `[De ➔ Para]`) e seções temporais agrupadas.

**Independent Test**: Abrir modal da tarefa, verificar o agrupamento por "Hoje", "Ontem" e os cartões diff coloridos para movimentações de coluna.

### Tests for User Story 1 🧪
- [x] T006 [P] [US1] Create unit tests for chronological timeline grouping, diff cards rendering, and date tooltips in `tests/unit/TaskTimelineEnhanced.test.tsx`

### Implementation for User Story 1
- [x] T007 [P] [US1] Create `ActivityLogItem` component rendering diff cards (`[From ➔ To]`) with semantic color badges (Blue/Amber/Purple/Green) and relative timestamp tooltips in `src/components/ActivityLogItem.tsx`
- [x] T008 [US1] Implement time-bucket grouped layout rendering in `TaskTimeline` component in `src/components/TaskTimeline.tsx`
- [x] T009 [US1] Update `TaskDetailsModal` component to embed the redesigned `TaskTimeline` layout in `src/components/TaskDetailsModal.tsx`

**Checkpoint**: User Story 1 fully functional and testable independently.

---

## Phase 4: User Story 2 - Comentários Estruturados com Markdown, Destaques e Reações (Priority: P2)

**Goal**: Permitir comentários com sintaxe Markdown simples, marcação de "Decisão de Projeto" e atalho `Ctrl+Enter`.

**Independent Test**: Escrever um comentário com negrito e lista, marcar como "Decisão de Projeto" e pressionar `Ctrl+Enter`. Verificar o badge dourado e a renderização Markdown na linha do tempo.

### Tests for User Story 2 🧪
- [x] T010 [P] [US2] Create unit tests for Markdown comment rendering, "Decisão de Projeto" golden highlight border, and `Ctrl+Enter` submit shortcut in `tests/unit/TaskTimelineEnhanced.test.tsx`

### Implementation for User Story 2
- [x] T011 [P] [US2] Update `CommentInputForm` component with Markdown helper toolbar, "Marcar como Decisão de Projeto" checkbox, and `Ctrl+Enter` shortcut handler in `src/components/CommentInputForm.tsx`
- [x] T012 [P] [US2] Update `CommentItem` component rendering rich Markdown formatted text, golden decision badge, author avatar, and "Ver mais / Ver menos" text truncation toggle in `src/components/CommentItem.tsx`
- [x] T013 [US2] Connect `addTaskComment` method in `src/hooks/useTaskCollection.ts` to accept optional `isDecision` flag and persist to `TaskModel` and `localStorage`

**Checkpoint**: User Story 1 and User Story 2 both work seamlessly together.

---

## Phase 5: User Story 3 - Busca Textual, Filtros Multi-critério e Header Estatístico (Priority: P3)

**Goal**: Oferecer aba exclusiva de filtro "Decisões", barra de pesquisa textual em tempo real, alternador de densidade e header com contadores estatísticos.

**Independent Test**: Clicar na aba "Decisões" na barra de filtros da linha do tempo e verificar que unicamente itens de decisão são listados. Digitar na barra de busca e verificar a filtragem reativa.

### Tests for User Story 3 🧪
- [x] T014 [P] [US3] Create unit tests for real-time text search, "Decisões" dedicated filter tab switching, and density mode toggling in `tests/unit/TaskTimelineEnhanced.test.tsx`

### Implementation for User Story 3
- [x] T015 [P] [US3] Create `TimelineStatsHeader` component displaying summary counters for total comments, decisions, moves, and total blocked time in `src/components/TimelineStatsHeader.tsx`
- [x] T016 [P] [US3] Update `TimelineFilterBar` component adding dedicated "Decisões" filter tab, search text input, and density mode toggle button (`data-testid="timeline-filter-decisions"`) in `src/components/TimelineFilterBar.tsx`
- [x] T017 [US3] Integrate search filtering, density mode styling, and `TimelineStatsHeader` component in `src/components/TaskTimeline.tsx`

**Checkpoint**: All three user stories fully functional and integrated.

---

## Phase 6: Polish, Autosave Integration & Verification

**Purpose**: Verificação de sync Supabase, suíte completa de testes e validação final.

- [x] T018 [P] Verify Supabase cloud sync serialization/deserialization for `isDecision` comment field in `src/services/supabase/syncService.ts`
- [x] T019 Run full Vitest test suite (`npm test -- --run`) and TypeScript build (`npm run build`) to ensure zero errors and zero regressions
- [x] T020 Execute runnable verification scenarios from `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3–5)**: All depend on Foundational phase completion
  - US1 (P1) → US2 (P2) → US3 (P3)
- **Polish (Phase 6)**: Depends on completion of user stories

### Parallel Opportunities
- T002 (simpleMarkdown) and T003 (taskActivityLogger diffs) can run in parallel.
- T006, T007 (US1 tests and diff card component) can run in parallel.
- T010, T011, T012 (US2 tests, CommentInputForm, CommentItem) can run in parallel.
- T014, T015, T016 (US3 tests, TimelineStatsHeader, TimelineFilterBar) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 - Timeline Visual Redesenhada e Diff Cards).
3. **STOP and VALIDATE**: Run unit tests and manual check for User Story 1.

### Full Incremental Delivery
1. Add Phase 4 (User Story 2 - Comentários Markdown e Decisões).
2. Add Phase 5 (User Story 3 - Filtro "Decisões", Busca e Header Estatístico).
3. Run Phase 6 (Polish & Full Verification Suite).
