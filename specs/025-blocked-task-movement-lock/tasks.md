# Tasks: Feature 025 - Trava Estrita de Movimentação para Cartões Blopeados (Blocked Card Movement Lock)

**Branch**: `025-blocked-task-movement-lock`  
**Status**: Pronto para Implementação (0/20 tarefas)  
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
- **Phase 1: Data Model & Pure Predicate (T001-T003)**:
  - Constantes de bloqueio, mensagens padrão e predicado puro `isTaskBlocked` (sem efeitos colaterais).
- **Phase 2: Domain Movement Guards & Pure Reorder (T004-T007)**:
  - Travas na função pura `reorderBoard` e no hook `useTaskCollection` (`moveTask`, `reorderOrMoveTask`, sincronização de tags).
- **Phase 3: UI Layer Guards & Quick Unlock (T008-T012)**:
  - `Task.tsx`, trava estrita no DOM (`draggable="false"`), cursor `not-allowed`, desativação de botões `←`/`→` e desbloqueio rápido no badge.
- **Phase 4: Drop Handlers & Contextual Toast Feedback (T013-T016)**:
  - `Column.tsx`, `App.tsx` e componente leve de Toast/Banner contextual avisando a trava de movimento.
- **Phase 5: Automated Verification & Regression Suite (T017-T020)**:
  - Testes unitários cobrindo as 4 camadas de defesa, validação dos 315 testes anteriores e compilação limpa de produção.

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

## Phase 1: Data Model & Pure Predicate

**Purpose**: Definir as constantes de bloqueio, mensagens padronizadas e a função utilitária pura `isTaskBlocked`

- [ ] T001 [P] Declare `BLOCKED_TAG_KEYWORDS` and update `BLOCKED_TASK_MOVE_WARNING_MESSAGE` in `src/types/kanban.ts`
- [ ] T002 [P] Implement pure predicate function `isTaskBlocked(task: TaskModel | undefined | null): boolean` in `src/utils/taskReorder.ts` recognizing `task.blocked` and keyword tags (`bloqueado`, `bloqueada`, `blocked`, `impedimento`)
- [ ] T003 [P] Write unit tests for `isTaskBlocked` covering boolean state, tag variations (case-insensitive, trimmed), null/undefined safety in `tests/unit/taskReorder.test.ts`

---

## Phase 2: Domain Movement Guards & Pure Reorder

**Purpose**: Garantir que o motor de dados e o hook `useTaskCollection` rejeitem incondicionalmente qualquer transição de coluna para itens bloqueados

- [ ] T004 [P] Update pure function `reorderBoard` in `src/utils/taskReorder.ts` to strictly validate `isTaskBlocked(activeTask)`: if blocked and `sourceColumn !== targetColumn`, abort immediately and return unmodified `board`
- [ ] T005 Update `moveTask` in `src/hooks/useTaskCollection.ts` to use `isTaskBlocked` and enforce inter-column movement prohibition
- [ ] T006 Update `reorderOrMoveTask` in `src/hooks/useTaskCollection.ts` to use `isTaskBlocked`, permitting same-column vertical reorder but strictly blocking inter-column movement
- [ ] T007 Implement automatic synchronization between `task.tags` and `task.blocked` in `addTaskTag`, `removeTaskTag`, and `toggleTaskBlocked` in `src/hooks/useTaskCollection.ts`

---

## Phase 3: UI Layer Guards & Quick Unlock in Task Component

**Purpose**: Impor travas físicas no DOM (`draggable="false"`, `cursor: not-allowed`), desativar botões laterais e habilitar desbloqueio com 1 clique no badge

- [ ] T008 [P] Update `src/components/Task.tsx` to enforce `draggable={!isTaskBlocked(task)}` on the root `<article>` element with `aria-disabled={isTaskBlocked(task)}`
- [ ] T009 Update `handleDragStart` in `src/components/Task.tsx` to immediately cancel the drag event (`e.preventDefault()`, `e.stopPropagation()`) whenever `isTaskBlocked(task)` is true
- [ ] T010 Disable or hide lateral navigation step buttons (`onMoveLeft`, `onMoveRight`, `canMoveLeft`, `canMoveRight`) whenever `isTaskBlocked(task)` is true in `src/components/Task.tsx` and `src/App.tsx`
- [ ] T011 Enhance badge `⛔ Bloqueado` in `src/components/Task.tsx` with 1-click quick unlock action: clicking the badge directly toggles the blocked status and clears the lock
- [ ] T012 Add CSS classes `.task-card-blocked-locked`, `cursor: not-allowed`, `user-select: none`, and interactive styling for the quick-unlock badge in `src/App.css`

---

## Phase 4: Drop Handlers & Contextual Toast Feedback

**Purpose**: Interceptar drops em colunas e cartões e fornecer feedback visual suave sem travar o navegador

- [ ] T013 Update `handleDrop` in `src/components/Column.tsx` to verify if the dragged task is blocked and suppress drop when crossing columns
- [ ] T014 Update `handleDrop` in `src/components/Task.tsx` to verify if the dragged task is blocked and suppress drop onto tasks in different columns
- [ ] T015 Create a lightweight, accessible contextual Toast notification component (`src/components/ToastNotification.tsx` and CSS) in `src/App.tsx` displaying `"Cartão bloqueado: retire a etiqueta de bloqueado para mover entre colunas"`
- [ ] T016 Integrate contextual Toast notification trigger inside `handleGuardedDropTask` and `handleGuardedMoveTask` in `src/App.tsx` replacing blocking alerts

---

## Phase 5: Automated Verification & Regression Suite

**Purpose**: Verificação exaustiva com testes unitários, validação da suíte legada e garantia de build limpo

- [ ] T017 [P] Expand `tests/unit/blockedTaskMoveGuard.test.tsx` covering all 4 defense layers: drag cancellation, drop rejection on column, drop rejection on task, lateral buttons lock, same-column reorder permission, tag synchronization, and quick unlock
- [ ] T018 Expand `tests/unit/taskReorder.test.ts` verifying that `reorderBoard` rejects column changes for blocked tasks while permitting same-column vertical reorder
- [ ] T019 Run full test suite (`npm run test`) and verify that all tests pass cleanly with 100% green bar
- [ ] T020 Run production build (`npm run build`) to verify clean TypeScript compilation and Vite packaging without warnings
