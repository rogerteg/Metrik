# Tasks: Feature 025 - Trava Estrita de Movimentação para Cartões Bloqueados (Blocked Card Movement Lock)

**Branch**: `025-blocked-task-movement-lock`  
**Status**: Ready for Implementation (0/23 tasks)  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data Model**: [data-model.md](data-model.md) | **Checklists**: [checklists/blocked-task-movement-lock.md](checklists/blocked-task-movement-lock.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Natureza Inegociável da Gestão de Fluxo Kanban:**
  - Um item bloqueado indica paralisia do fluxo em uma etapa específica do processo. Permitir que ele seja transferido para outra etapa gera métricas falsas de Lead Time, Cycle Time e CFD, além de mascarar a localização do gargalo operacional.
  - Portanto, a coluna de um cartão bloqueado é uma invariante de estado:
    $$\forall t \in \text{Tasks}, \text{ se } \text{isTaskBlocked}(t) = \text{true} \implies \text{TargetColumn}(t) = \text{CurrentColumn}(t)$$
- **Definição Canônica da "Etiqueta de Bloqueado":**
  - No modelo mental dos operadores, "etiqueta" abrange tanto o badge visual `⛔ Bloqueado` quanto as tags textuais inseridas no cartão (`"bloqueado"`, `"bloqueada"`, `"blocked"`, `"impedimento"`).
  - O sistema deve operar com sincronização bidirecional: marcar a tarefa como bloqueada adiciona o badge e sincroniza o estado; retirar a etiqueta (seja no badge, no modal ou na lista de tags) desfaz imediatamente a trava e libera o cartão para movimentação.
- **Permissão de Reordenação Intra-Coluna:**
  - A reordenação de posição vertical dentro da *mesma coluna* ($\text{sourceColumn} = \text{targetColumn}$) é permitida, pois não altera o fluxo entre etapas e viabiliza a priorização dos impedimentos pelo time.

---

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Arrasto Indireto de Seleção de Texto ou Elementos Filhos no DOM):**
  - *Cenário:* Mesmo com `draggable={!task.blocked}` no elemento pai, o navegador permite arrastar uma seleção de texto do título do cartão e soltar em outra coluna.
  - *Mitigação:* `handleDragStart` em `Task.tsx` intercepta incondicionalmente o evento com `e.preventDefault()` e `e.stopPropagation()` quando `isTaskBlocked(task)`. Adicionalmente, aplica-se `user-select: none` e `cursor: not-allowed` no CSS.
- **Modo de Falha 2 (Drop de Cartão Bloqueado sobre Outro Cartão em Coluna Alvo):**
  - *Cenário:* O usuário consegue soltar o cartão sobre outro cartão de outra coluna via `handleDrop` de `Task.tsx`.
  - *Mitigação:* `reorderBoard` (em `taskReorder.ts`), `reorderOrMoveTask` e `handleGuardedDropTask` validam `isTaskBlocked(activeTask)`. Se a coluna de destino for diferente, a movimentação é rejeitada sumariamente e a coluna original é preservada.
- **Modo de Falha 3 (Desconexão entre Tags Textuais e Status `blocked`):**
  - *Cenário:* O usuário insere a tag `"bloqueado"` e o cartão continua sendo movido porque a propriedade `task.blocked` não foi acionada.
  - *Mitigação:* `addTaskTag` e `removeTaskTag` em `useTaskCollection.ts` sincronizam instantaneamente `task.blocked = true` e `blockedAt = now` ao detectar palavras-chave de bloqueio.
- **Modo de Falha 4 (Travamento da Thread por `window.alert`):**
  - *Cenário:* Disparo de múltiplos alertas nativos congela o navegador e prejudica testes automatizados.
  - *Mitigação:* Notificação contextual suave (Toast) exibida diretamente na interface, sem popups intrusivos.

---

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Phase 1: Setup (T001)**:
  - Constantes de bloqueio e mensagens padronizadas em `src/types/kanban.ts`.
- **Phase 2: Foundational (T002-T004)**:
  - Predicado puro `isTaskBlocked` e guarda na função pura `reorderBoard`.
- **Phase 3: User Story 1 - Bloqueio Absoluto de Movimento entre Colunas (T005-T011)**:
  - Rejeição de transição de coluna no domínio (`moveTask`, `reorderOrMoveTask`), travas físicas no DOM (`draggable="false"`), desativação de botões laterais (`←`/`→`) e interceptação de drop em colunas/cartões.
- **Phase 4: User Story 2 - Gestão e Sincronização da Etiqueta de Bloqueado (T012-T016)**:
  - Sincronização bidirecional entre tags textuais e `task.blocked`, e desbloqueio rápido com 1 clique no badge `⛔ Bloqueado`.
- **Phase 5: User Story 3 - Feedback Visual e Prevenção de Erros (T017-T020)**:
  - Estilos de cursor `not-allowed`, feedback contextual Toast amigável sem bloqueio de thread.
- **Phase 6: Polish & Cross-Cutting Concerns (T021-T023)**:
  - Bateria completa de testes automatizados (315+ testes existentes mantidos verdes), build limpo de produção e validação final.

---

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Poda 1 (Congelamento 100% sem Reordenação na Mesma Coluna):** Podada após `/speckit-clarify` para permitir ao time priorizar internamente qual card impedido atacar primeiro.
- **Alternativa Poda 2 (Desbloqueio Exclusivo por Modal com Justificativa Obrigatória):** Podada para garantir ergonomia e agilidade operacional através do desbloqueio com 1 clique direto no badge `⛔ Bloqueado`.
- **Alternativa Poda 3 (Alertas Nativos `window.alert`):** Podada para eliminar travamento da thread do navegador e manter fluidez na interface visual.

---

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha Demonstrável Inicial (Red Bar):**
  - Testes em `tests/unit/blockedTaskMoveGuard.test.tsx` e `tests/unit/taskReorder.test.ts` falham ao tentar mover tarefas bloqueadas via tags ou drop em outros cartões.
- **Critério Determinístico de Aceite (Green Bar):**
  - 100% dos novos testes unitários passam.
  - Todos os 315 testes automatizados legados continuam 100% verdes.
  - `npm run build` executa sem erros de tipagem TypeScript ou bundling Vite.

---

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Princípio I (SDD):** Todos os artefatos (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `checklists/`, `tasks.md`) formalizados antes do código.
- **Princípio II (Modularidade):** Função pura `isTaskBlocked` e utilitários isolados sem acoplamento circular.
- **Princípio III (Verificação Automatizada):** Testes unitários para todas as camadas de proteção.
- **Princípio V (Simplicidade & YAGNI):** Zero dependências externas adicionadas.
- **Princípio VII (Independência de Marca):** Nomenclatura neutra e limpa (*Metrik Blocked Task Movement Guard*).
- **Princípio VIII (Soberania Local-First):** Persistência no `localStorage` sem dependências de nuvem.

---

## Phase 1: Setup (Shared Infrastructure & Types)

**Purpose**: Definição de constantes, contratos e mensagens de trava de movimento

- [X] T001 [P] Declare `BLOCKED_TAG_KEYWORDS` and update `BLOCKED_TASK_MOVE_WARNING_MESSAGE` in `src/types/kanban.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Predicado puro de domínio e infraestrutura de validação compartilhada entre todas as histórias de usuário

**⚠️ CRITICAL**: Nenhuma história de usuário pode ser finalizada sem a conclusão desta fase

- [X] T002 [P] Implement pure predicate function `isTaskBlocked(task: TaskModel | undefined | null): boolean` in `src/utils/taskReorder.ts` recognizing `task.blocked` and keyword tags (`bloqueado`, `bloqueada`, `blocked`, `impedimento`)
- [X] T003 [P] Write unit tests for `isTaskBlocked` covering boolean state, tag variations (case-insensitive, trimmed), null/undefined safety in `tests/unit/taskReorder.test.ts`
- [X] T004 Update pure function `reorderBoard` in `src/utils/taskReorder.ts` to strictly validate `isTaskBlocked(activeTask)`: if blocked and `sourceColumn !== targetColumn`, abort immediately and return unmodified `board`

**Checkpoint**: Fundação pronta - a implementação das histórias de usuário pode prosseguir de forma independente

---

## Phase 3: User Story 1 - Bloqueio Absoluto de Movimento entre Colunas (Priority: P1) 🎯 MVP

**Goal**: Impedir categoricamente que qualquer cartão bloqueado seja movido de uma coluna para outra, seja via drag & drop (na coluna ou sobre outros cards), botões de passo lateral (`←`/`→`) ou reordenação. Permitir estritamente reordenação vertical na mesma coluna.

**Independent Test**:
1. Bloquear um cartão na coluna "Em desenvolvimento".
2. Tentar arrastar para a coluna "Em Testes" ou soltá-lo sobre um cartão de outra coluna: o sistema bloqueia o arraste/drop e mantém o cartão na coluna original.
3. Verificar botões de navegação lateral (`←` e `→`): devem permanecer inativos ou ocultos.
4. Tentar reordenar verticalmente dentro da mesma coluna "Em desenvolvimento": reordenação permitida.

### Tests for User Story 1
- [X] T005 [P] [US1] Write unit tests in `tests/unit/taskReorder.test.ts` verifying that `reorderBoard` strictly blocks cross-column moves for blocked tasks while permitting same-column reordering
- [X] T006 [P] [US1] Write component tests in `tests/unit/blockedTaskMoveGuard.test.tsx` asserting `draggable="false"`, lateral buttons disabled/hidden, and `dragStart` event cancelled for blocked tasks

### Implementation for User Story 1
- [X] T007 [US1] Update `moveTask` in `src/hooks/useTaskCollection.ts` to use `isTaskBlocked` and reject any inter-column movement
- [X] T008 [US1] Update `reorderOrMoveTask` in `src/hooks/useTaskCollection.ts` to use `isTaskBlocked`, permitting same-column vertical reorder but strictly blocking cross-column movement
- [X] T009 [US1] Update `src/components/Task.tsx` to enforce `draggable={!isTaskBlocked(task)}`, cancel `onDragStart` (`e.preventDefault()`, `e.stopPropagation()`), and set `aria-disabled={isTaskBlocked(task)}`
- [X] T010 [US1] Update lateral navigation step buttons (`onMoveLeft`, `onMoveRight`, `canMoveLeft`, `canMoveRight`) in `src/components/Task.tsx` and `src/App.tsx` to be disabled or hidden when `isTaskBlocked(task)`
- [X] T011 [US1] Update `handleDrop` in `src/components/Column.tsx` and `src/components/Task.tsx` to reject drops when the dragged task is blocked and crossing columns

**Checkpoint**: User Story 1 (MVP) 100% funcional e testável de forma independente

---

## Phase 4: User Story 2 - Gestão e Sincronização da Etiqueta de Bloqueado (Priority: P1)

**Goal**: Sincronização automática bidirecional entre o estado `task.blocked` e a inclusão/remoção de etiquetas de texto (`"bloqueado"`, `"blocked"`, `"impedimento"`), além de desbloqueio rápido com 1 clique diretamente no badge `⛔ Bloqueado`.

**Independent Test**:
1. Adicionar a tag `"bloqueado"` a um cartão: o cartão é automaticamente marcado como `blocked = true`, exibe o badge `⛔ Bloqueado` e recebe a trava de movimentação.
2. Clicar no badge `⛔ Bloqueado` ou remover a tag: a trava de movimentação é removida imediatamente e o cartão pode ser movido entre colunas sem recarregar a página.

### Tests for User Story 2
- [X] T012 [P] [US2] Write unit tests in `tests/unit/blockedTaskMoveGuard.test.tsx` verifying bidirectional synchronization between tags (`bloqueado`/`blocked`) and `task.blocked` state
- [X] T013 [P] [US2] Write component tests in `tests/unit/blockedTaskMoveGuard.test.tsx` verifying 1-click unlock action on the `⛔ Bloqueado` badge

### Implementation for User Story 2
- [X] T014 [US2] Implement automatic synchronization between `task.tags` and `task.blocked` in `addTaskTag`, `removeTaskTag`, and `toggleTaskBlocked` in `src/hooks/useTaskCollection.ts`
- [X] T015 [US2] Enhance badge `⛔ Bloqueado` in `src/components/Task.tsx` with 1-click quick unlock action directly from the card surface
- [X] T016 [US2] Ensure modal "Desbloquear Tarefa" in `src/components/TaskModal.tsx` removes both `task.blocked` flag and any blocking tags

**Checkpoint**: User Stories 1 e 2 funcionando integradas e testáveis de forma independente

---

## Phase 5: User Story 3 - Feedback Visual e Prevenção de Erros (Priority: P2)

**Goal**: Fornecer feedback visual evidente (cursor `not-allowed`, estilo `.task-card-blocked-locked`, e notificação Toast amigável) sem travar a thread do navegador com `window.alert`.

**Independent Test**:
1. Passar o mouse sobre um cartão bloqueado: o cursor exibe indicação de bloqueio (`not-allowed`).
2. Tentar forçar a movimentação entre colunas: o sistema exibe notificação Toast suave: *"Cartão bloqueado: retire a etiqueta de bloqueado para mover entre colunas"* sem abrir popups intrusivos.

### Tests for User Story 3
- [X] T017 [P] [US3] Write tests in `tests/unit/blockedTaskMoveGuard.test.tsx` verifying cursor style and Toast notification trigger when attempting to move a blocked card

### Implementation for User Story 3
- [X] T018 [P] [US3] Add CSS rules `.task-card-blocked-locked`, `cursor: not-allowed`, `user-select: none`, and badge hover styles in `src/App.css`
- [X] T019 [US3] Create lightweight, accessible Toast notification component in `src/components/ToastNotification.tsx` (or inside `src/App.tsx`) displaying `"Cartão bloqueado: retire a etiqueta de bloqueado para mover entre colunas"`
- [X] T020 [US3] Integrate Toast notification trigger inside `handleGuardedDropTask` and `handleGuardedMoveTask` in `src/App.tsx`, replacing blocking `window.alert` calls

**Checkpoint**: Todas as 3 User Stories concluídas e testadas com excelência visual e funcional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação exaustiva de regressão, conformidade de build e alinhamento de documentação

- [X] T021 [P] Run full automated test suite (`npm run test`) and verify 100% green bar across all 315+ tests without regressions
- [X] T022 [P] Run production build (`npm run build`) to ensure 0 TypeScript compilation errors and clean Vite bundling
- [X] T023 Validate `quickstart.md` scenarios and update `checklists/blocked-task-movement-lock.md` with final compliance status

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências - pode ser executado imediatamente.
- **Foundational (Phase 2)**: Depende do Setup (Phase 1) - **BLOQUEIA todas as histórias de usuário**.
- **User Story 1 (Phase 3)**: Depende da conclusão da Phase 2. Representa o MVP.
- **User Story 2 (Phase 4)**: Depende da Phase 2 e integra com US1, mas é testável independentemente.
- **User Story 3 (Phase 5)**: Depende da Phase 2 e das interações de UI de US1/US2.
- **Polish (Phase 6)**: Depende da conclusão das User Stories 1, 2 e 3.

### User Story Dependencies
- **User Story 1 (P1 - MVP)**: Pode iniciar imediatamente após a Phase 2. Não possui dependências de outras histórias.
- **User Story 2 (P1)**: Pode ser desenvolvida em paralelo após a Phase 2. Sincroniza tags com a trava de US1.
- **User Story 3 (P2)**: Conecta o feedback visual (Toast e CSS) aos disparos de interceptação de US1.

### Within Each User Story
- Testes automatizados (TDD Red-Bar) devem ser executados primeiro e falhar antes da implementação.
- Modelos e tipos antes dos hooks de serviço.
- Hooks de domínio antes dos componentes visuais.
- Cada história é concluída e validada em seu checkpoint antes de passar à próxima.

---

## Parallel Opportunities & Examples

### Parallel Example: Foundational & Setup
```bash
# Executar em paralelo tarefas sem dependência mútua de arquivos:
Task T001: "Declare BLOCKED_TAG_KEYWORDS in src/types/kanban.ts"
Task T002: "Implement pure predicate function isTaskBlocked in src/utils/taskReorder.ts"
Task T003: "Write unit tests for isTaskBlocked in tests/unit/taskReorder.test.ts"
```

### Parallel Example: User Story 1
```bash
# Executar em paralelo testes e componentes de US1:
Task T005: "Write unit tests in tests/unit/taskReorder.test.ts"
Task T006: "Write component tests in tests/unit/blockedTaskMoveGuard.test.tsx"
```

### Parallel Example: User Story 2 & 3
```bash
# Executar em paralelo testes de US2 e CSS de US3:
Task T012: "Write unit tests for tag synchronization in tests/unit/blockedTaskMoveGuard.test.tsx"
Task T018: "Add CSS rules in src/App.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Concluir **Phase 1: Setup** (T001).
2. Concluir **Phase 2: Foundational** (T002 - T004).
3. Concluir **Phase 3: User Story 1** (T005 - T011).
4. **PARAR E VALIDAR**: Executar os testes de US1. O cartão bloqueado agora é estritamente impedido de se mover entre colunas (MVP atingido!).

### Incremental Delivery
1. Setup + Foundational concluídos $\to$ Base sólida estabelecida.
2. User Story 1 entregue $\to$ Trava estrita de movimentação funcional (MVP).
3. User Story 2 entregue $\to$ Sincronização de tags e desbloqueio em 1 clique no badge.
4. User Story 3 entregue $\to$ Feedback visual refinado (Toast contextual e cursor `not-allowed`).
5. Polish entregue $\to$ 100% dos 315+ testes verificados e build de produção validado.

---

## Notes
- `[P]` = Tarefas paralelizadas em arquivos distintos e sem dependência mútua.
- `[US1]`, `[US2]`, `[US3]` = Identificadores diretos de rastreabilidade para as histórias de usuário da `spec.md`.
- Cada User Story possui critérios independentes de teste e checkpoint de validação.
- Nenhum alerta bloqueante `window.alert` deve permanecer no fluxo principal.
- Zero menções a ferramentas de concorrentes ou bibliotecas proprietárias (Princípio VII).

---

## Phase 7: Convergence

**Purpose**: Fechar as lacunas identificadas entre `spec.md`/`plan.md`/`data-model.md` e o estado atual do código (varredura de convergência pós-implementação). Ordenadas por severidade (HIGH → LOW).

- [ ] T024 Guard `removeTaskTag` in `src/hooks/useTaskCollection.ts` so `task.blocked` is only cleared when the removed tag is itself a blocking keyword, preserving the strict movement lock for flag-only blocked cards per FR-006 (contradicts)
- [ ] T025 Replace the blocking `window.alert`/`window.confirm` calls in the blocked-move guards of `moveTask` and `reorderOrMoveTask` in `src/hooks/useTaskCollection.ts` with the non-blocking contextual notification channel, and update the alert-based assertions in `tests/unit/blockedTaskMoveGuard.test.tsx` per plan: research Decisão 5 / Phase 5 (partial)
- [ ] T026 Align the `⛔ Bloqueado` badge fallback unlock in `src/components/Task.tsx` with the modal unlock contract: strip blocking tags and accumulate `totalBlockedMs` when `onToggleBlocked` is absent per data-model Invariante 3 & 4 (partial)
- [ ] T027 Add an explicit `isTaskBlocked` guard to `handleDrop` in `src/components/Column.tsx` before delegating to `onDropTask` per plan: Layer 3 drop handlers (T011) (partial)
- [ ] T028 Implement the prefix-aware predicate documented in `data-model.md` §3 (`clean === kw || clean.startsWith(kw)`) in `isTaskBlocked` (`src/utils/taskReorder.ts`) with matching unit tests per data-model §3 (partial)
