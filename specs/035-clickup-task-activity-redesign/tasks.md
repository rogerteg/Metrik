# Task List: ClickUp-Inspired Task Activity & Comments Redesign (Feature 035)

**Branch**: `035-clickup-task-activity-redesign` | **Date**: 2026-09-21 | **Spec**: [`spec.md`](spec.md) | **Plan**: [`plan.md`](plan.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Invariante de renderização SVG:** Sem atributos explícitos `width`/`height` e regras de container scoped (`flex-shrink: 0`, `max-width`), elementos SVG nativos em Vanilla CSS/Flexbox expandem desproporcionalmente ocupando 100% da viewport. A correção exige atributos `width={16} height={16}` e estilos inline/CSS scoped em 100% dos componentes de ícone da linha do tempo.
- **Invariante de soberania local (Princípio VIII):** Toda a estruturação do feed ClickUp, buscas em tempo real e filtros de decisão ocorrem em memória no cliente a partir de `localStorage`, mantendo latência <16ms (60 FPS).
- **Isolamento de perfil (Guest confinement):** Formulários de edição, marcadores de decisão e exclusão são bloqueados para o papel `guest`, enquanto a navegação, busca e leitura permanecem 100% acessíveis.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Risco 1 - Distorção visual de ícones em navegadores sem Tailwind CSS:** Ícones SVGs voltando a estourar em builds de produção sem CSS utilitário global.
  - *Mitigação:* Aplicar obrigatoriamente atributos React explícitos (`width={16} height={16}`) e regras inline `style={{ width: 16, height: 16, flexShrink: 0 }}` em cada SVG nativo.
- **Risco 2 - Injeção de XSS em comentários com formatação rica:** Execução de scripts via elementos de entrada no editor.
  - *Mitigação:* Manter o parser de Markdown nativo por AST/Regex (`simpleMarkdown.tsx`) convertendo marcadores para nós React controlados (`<strong>`, `<em>`, `<code>`, `<ul>`, `<blockquote>`), sem utilizar `dangerouslySetInnerHTML`.
- **Risco 3 - Perda de rascunhos ao fechar o modal da tarefa:** Descarte involuntário de texto digitado no editor.
  - *Mitigação:* Integrar o editor com os guards de autosave e aviso de alterações não salvas (`autoSaveComments` guard / `TaskDetailsModal`).

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Exclusividade Mútua (MECE):**
  - T001–T003: Setup de infraestrutura e correção global de dimensões de SVG.
  - T004–T005: Requisitos base de dados/tipos e testes unitários foundation.
  - T006–T009: US1 (Redesign visual ClickUp, pílulas diff `[De ➔ Para]` e sizing estrito de ícones).
  - T010–T013: US2 (Editor rico ClickUp, toolbar Markdown, marcação de Decisão e atalho `Ctrl+Enter`).
  - T014–T017: US3 (Stream unificado, Spotlight de Decisões, busca em tempo real e header estatístico).
  - T018–T020: Polimento, Supabase Sync e suíte final de testes/build.
- **Exhaustividade Coletiva (100% dos requisitos de spec.md):**
  - FR-001 (Dimensionamento estrito de ícones SVGs 16px-20px) → US1 (T003, T007).
  - FR-002, FR-006 (Layout ClickUp, pílulas diff `[De ➔ Para]`) → US1 (T007, T008, T009).
  - FR-003, FR-004, FR-005 (Toolbar Markdown, toggle "Decisão de Projeto", `Ctrl+Enter`) → US2 (T011, T012, T013).
  - FR-007, FR-008 (Filtros rápidos, busca em tempo real, Spotlight de Decisões) → US3 (T015, T016, T017).
  - FR-009, FR-010 (Segurança XSS e guarda de rascunhos) → Foundational & Polish (T002, T011, T018).

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts*)
- **Ramo A (Descartado):** Depender de bibliotecas externas de ícones (Lucide / FontAwesome).
  - *Razão de poda:* Violaria o Princípio VII (Brand Independence) e Princípio V (Simplicity). SVGs nativos garantem 0kb de overhead e independência de marca.
- **Ramo B (Descartado):** Separar comentários e histórico de auditoria em duas abas distintas.
  - *Razão de poda:* O padrão ClickUp consolida tudo em um único feed cronológico com pílulas discretas para movimentações, melhorando a continuidade de contexto.
- **Ramo C (Escolhido):** Stream unificado estilo ClickUp com pílulas diff `[De ➔ Para]`, banner "Spotlight de Decisões" no topo e sizing estrito de SVGs.

### 5. Critério de Falsificabilidade & TDD (*Red-Bar First*)
- **Falha demonstrável (Red Bar):** A suíte Vitest `tests/unit/TaskTimelineClickUp.test.tsx` deve falhar antes da implementação caso os ícones não tenham dimensões restritas ou os seletores de decisão/filtros falhem.
- **Critério determinístico de aceite (Green Bar):** `npm test -- --run` executando 100% dos 520+ testes com sucesso e `npm run build` gerando bundle sem erros.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Constitution Check:**
  - Princípio I: Spec, Plan, Data Model, Contracts e Quickstart pré-gerados.
  - Princípio III: Verificação automatizada via Vitest e Vite build.
  - Princípio VII: Ícones nativos SVG sem marcas terceiras.
  - Princípio VIII: Soberania local em `localStorage` e confinamento read-only para `guest`.
  - Princípio IX: Proteção de rascunhos de comentários.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de tipos TypeScript e padronização global de dimensões de ícones SVGs.

- [x] T001 Extend TypeScript interfaces `TaskComment` (`isDecision`, `pinned`), `TaskActivityLog` (`fromValue`, `toValue`), and `TimelineFilter` in `src/types/taskActivity.ts`
- [x] T002 [P] Create/verify safe AST/Regex Markdown parser (`parseSimpleMarkdown`) in `src/utils/simpleMarkdown.tsx`
- [x] T003 [P] Standardize strict SVG icon sizing rules (`width={16}`, `height={16}`, `style={{ width: 16, height: 16, flexShrink: 0 }}`) across all timeline icon helpers in `src/components/TaskTimeline.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utilitários de auditoria e infraestrutura de suíte de testes do ClickUp.

- [x] T004 Implement ClickUp diff pill formatters (`[From ➔ To]`) and time-bucket grouping in `src/utils/taskActivityLogger.ts`
- [x] T005 Create unit test suite file `tests/unit/TaskTimelineClickUp.test.tsx` for SVG icon sizing, ClickUp feed layout, Markdown formatting, and decision spotlight assertions

---

## Phase 3: User Story 1 - Correção Estrita de Sizing de Ícones e Layout ClickUp Limpo (Priority: P1) 🎯 MVP

**Goal**: Eliminar definitivamente o bug de SVGs desproporcionais/gigantes e implementar o layout de feed limpo e compacto no padrão ClickUp.

**Independent Test**: Abrir os detalhes de uma tarefa no modal e verificar que nenhum ícone SVG ultrapassa 16px/20px e que as atividades aparecem em um layout moderno e compacto.

### Tests for User Story 1 🧪
- [x] T006 [P] [US1] Create unit tests verifying SVG icon dimensions (<=20px height/width) and ClickUp feed item rendering in `tests/unit/TaskTimelineClickUp.test.tsx`

### Implementation for User Story 1
- [x] T007 [P] [US1] Create/update `ActivityLogItem` component rendering compact ClickUp diff cards (`[From ➔ To]`) with strict SVG props and semantic color pills in `src/components/ActivityLogItem.tsx` and `src/components/ActivityLogItem.css`
- [x] T008 [US1] Implement ClickUp-inspired vertical timeline layout in `src/components/TaskTimeline.tsx` and `src/components/TaskTimeline.css`
- [x] T009 [US1] Update `TaskDetailsModal` component embedding the redesigned `TaskTimeline` layout in `src/components/TaskDetailsModal.tsx`

**Checkpoint**: User Story 1 fully functional, fixing the SVG explosion bug and providing a clean MVP feed.

---

## Phase 4: User Story 2 - Editor de Comentários e Decisões no Padrão ClickUp (Priority: P2)

**Goal**: Disponibilizar editor rico com toolbar Markdown (negrito, itálico, código, listas, citações), toggle "Decisão de Projeto" dourado e submissão via `Ctrl+Enter`.

**Independent Test**: Digitar um comentário formatado, marcar como "Decisão de Projeto", enviar via `Ctrl+Enter` e confirmar a exibição com destaque dourado e Markdown renderizado.

### Tests for User Story 2 🧪
- [x] T010 [P] [US2] Create unit tests for Markdown toolbar injection, "Decisão de Projeto" golden highlight, and `Ctrl+Enter` submit handler in `tests/unit/TaskTimelineClickUp.test.tsx`

### Implementation for User Story 2
- [x] T011 [P] [US2] Update `CommentInputForm` component with ClickUp-style Markdown toolbar, "Decisão de Projeto" toggle, strict SVG sizing, and `Ctrl+Enter` handler in `src/components/CommentInputForm.tsx` and `src/components/CommentInputForm.css`
- [x] T012 [P] [US2] Update `CommentItem` component rendering rich Markdown text, golden decision badge, author avatar, relative timestamp tooltip, and text truncation in `src/components/CommentItem.tsx` and `src/components/CommentItem.css`
- [x] T013 [US2] Connect `addTaskComment` hook method in `src/hooks/useTaskCollection.ts` to accept optional `isDecision` and `pinned` flags and persist to `localStorage`

**Checkpoint**: User Story 1 and User Story 2 working seamlessly together.

---

## Phase 5: User Story 3 - Stream Unificado de Atividades com Pílulas Diff e Spotlight de Decisões (Priority: P3)

**Goal**: Oferecer o banner "Spotlight de Decisões", aba dedicada de filtro "Decisões", busca textual em tempo real e header estatístico compacto.

**Independent Test**: Clicar na aba "Decisões" na barra de filtros ou utilizar a barra de pesquisa textual e verificar a filtragem em tempo real com <16ms de latência.

### Tests for User Story 3 🧪
- [x] T014 [P] [US3] Create unit tests for real-time text search, "Decisões" tab filter switching, and Spotlight banner rendering in `tests/unit/TaskTimelineClickUp.test.tsx`

### Implementation for User Story 3
- [x] T015 [P] [US3] Create `TimelineStatsHeader` component displaying compact summary counters for comments, decisions, moves, and total blocked time with strict SVG sizing in `src/components/TimelineStatsHeader.tsx` and `src/components/TimelineStatsHeader.css`
- [x] T016 [P] [US3] Update `TimelineFilterBar` component adding dedicated "Decisões" filter tab, search text input (`data-testid="timeline-search-input"`), and density mode toggle in `src/components/TimelineFilterBar.tsx` and `src/components/TimelineFilterBar.css`
- [x] T017 [US3] Integrate "Spotlight de Decisões" banner, search filtering, and `TimelineStatsHeader` into `TaskTimeline` component in `src/components/TaskTimeline.tsx`

**Checkpoint**: All three user stories fully functional and integrated.

---

## Phase 6: Polish, Cloud Sync & Full Verification

**Purpose**: Validação de sincronização Supabase, suíte completa de testes Vitest e verificação de build.

- [x] T018 [P] Verify Supabase cloud sync serialization/deserialization for `isDecision` comment property in `src/services/supabase/syncService.ts`
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
- T002 (simpleMarkdown) and T003 (SVG sizing standardization) can run in parallel.
- T006, T007 (US1 tests and ActivityLogItem diff cards) can run in parallel.
- T010, T011, T012 (US2 tests, CommentInputForm, CommentItem) can run in parallel.
- T014, T015, T016 (US3 tests, TimelineStatsHeader, TimelineFilterBar) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 - Sizing Estrito de SVGs e Layout ClickUp Limpo).
3. **STOP and VALIDATE**: Run unit tests and verify the SVG explosion bug is 100% resolved in the browser.

### Full Incremental Delivery
1. Add Phase 4 (User Story 2 - Editor ClickUp com Toolbar Markdown e Decisões).
2. Add Phase 5 (User Story 3 - Spotlight de Decisões, Filtro e Header Estatístico).
3. Run Phase 6 (Polish & Full Verification Suite).
