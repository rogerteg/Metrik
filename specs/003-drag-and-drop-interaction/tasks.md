# Tasks: Interação Drag-and-Drop de Cartões

**Feature**: `003-drag-and-drop-interaction`  
**Date**: 2026-09-08  
**Spec**: [specs/003-drag-and-drop-interaction/spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/003-drag-and-drop-interaction/spec.md)  
**Plan**: [specs/003-drag-and-drop-interaction/plan.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/003-drag-and-drop-interaction/plan.md)  

---

## Modelos de Raciocínio Analítico (Constituição Artigo VI - OBRIGATÓRIO)

### 1. Princípios Fundamentais (First-Principles Thinking)
- **Verdades Irredutíveis:**
  1. A manipulação do DOM em Drag-and-Drop gera eventos nativos do navegador (`dragstart`, `dragenter`, `dragover`, `dragleave`, `drop`, `dragend`). Sem chamar `e.preventDefault()` em `dragover`, a especificação HTML5 proíbe sumariamente a soltura do item (o navegador considera drop inválido).
  2. O estado persistente no Metrik é uma lista pura de tarefas serializada em `localStorage` sob a chave `metrik_kanban_tasks`. A reordenação nada mais é do que uma projeção indexada de elementos no array.
  3. A integridade dos timestamps de fluxo (`startedAt`, `completedAt`) da Feature 002 é um invariante absoluto: qualquer transição de coluna via DnD deve produzir os exatos mesmos efeitos colaterais de ciclo de vida que os botões direcionais.

### 2. Inversão & Análise Premortem (Failure Modes)
- **Modos de Falha Catastróficos Mapeados:**
  1. *Flickering da Drop Zone:* Quando o cursor passa por cima de elementos filhos da coluna (outros cartões, badges), o navegador dispara `dragleave` no pai e `dragenter` no filho. Se o estado visual for binário ingênuo, a coluna piscará loucamente.
     *Mitigação:* Contador de profundidade de entrada (`dragDepthRef` / tracking de contador).
  2. *Conflito de Seleção de Texto no Card:* O usuário tenta selecionar uma palavra no título editável e o cartão começa a ser arrastado.
     *Mitigação:* `draggable={!isEditing}` no container do cartão e `onPointerDown={(e) => e.stopPropagation()}` no `AutoResizeTextarea`.
  3. *Regressão dos Botões Direcionais:* O clique nos botões `←` ou `→` ser engolido pelo listener de drag do cartão.
     *Mitigação:* `onPointerDown={(e) => e.stopPropagation()}` em todos os botões de ação e testes de regressão dedicados.
  4. *Drop Fantasma fora do Quadro:* Soltar fora de colunas válidas corrompe o array ou lança exceção não tratada.
     *Mitigação:* Operação cancelada de forma limpa em `dragend`, sem mutações no estado.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua:**
  - `taskReorder.ts` cuida exclusivamente da lógica matemática pura de reorganização de array e timestamps.
  - `useTaskCollection.ts` cuida da orquestração de estado e persistência local.
  - `Task.tsx` cuida exclusivamente do elemento arrastável e de seu feedback visual.
  - `Column.tsx` cuida exclusivamente da área receptora (drop target).
  - `App.css` cuida dos seletores de estilo visual.
  - Zero sobreposição de responsabilidades entre tarefas.
- **Exaustividade Coletiva:**
  - 100% dos requisitos funcionais (FR-001 a FR-012) e critérios de aceite (US1 a US4) mapeados em tarefas executáveis com testes automatizados.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Ramo 1: Adotar `@dnd-kit/core` ou `react-beautiful-dnd`** -> *Podado.* Adicionaria dezenas de dependências transitivas, overhead desnecessário e problemas de compatibilidade com React 19.
- **Ramo 2: Adicionar campo numérico `order: number` no `TaskModel`** -> *Podado.* Exigiria migração de dados no `localStorage`, normalização de índices fracionários e riscos de colisão de ordenação.
- **Ramo 3: API Nativa HTML5 DnD com reordenação pura no array existente** -> *Escolhido.* Zero dependências, bundle ultraleve, 60 FPS garantidos e 100% retrocompatível.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha demonstrável (Red Bar):**
  - Os testes `tests/unit/taskReorder.test.ts`, `tests/unit/TaskDnD.test.tsx` e `tests/unit/ColumnDnD.test.tsx` devem falhar antes de qualquer alteração de código nos componentes.
- **Critério determinístico de aceite (Green Bar):**
  - Todos os 18 testes novos passam e a suíte completa de 42 testes existentes permanece 100% verde (total de 60+ testes passando).

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Simplicidade (YAGNI):** Não criamos abstrações de arrastar múltiplos cartões simultaneamente nem física de molas não solicitada.
- **Modularidade:** Tipos em `src/types/dnd.ts` e utilitários puros em `src/utils/taskReorder.ts`.
- **Acessibilidade:** Botões direcionais preservados e mantidos focáveis.

---

## Phase 1: Setup (Tipos e Contratos)

**Purpose**: Estruturação de tipos TypeScript e contratos de DnD.

- [X] T001 [P] Criar definições de tipos e interfaces de Drag and Drop (`DragItemData`, `DropPosition`, `DropTargetLocation`, `ReorderOptions`) em `src/types/dnd.ts`

---

## Phase 2: Foundational (Algoritmo de Reordenação e Hook de Tarefas)

**Purpose**: Lógica pura de reordenação de array e sincronização com timestamps de fluxo.

**CRITICAL**: Nenhuma alteração visual pode iniciar antes de a fundação funcional ser validada.

### Tests for Foundation (TDD / Red-Bar First)
- [X] T002 [P] Criar testes unitários para a função pura `reorderTasks` cobrindo movimentação entre colunas, reordenação interna e timestamps em `tests/unit/taskReorder.test.ts`

### Implementation for Foundation
- [X] T003 Implementar a função pura `reorderTasks` com atualização idempotente de timestamps em `src/utils/taskReorder.ts`
- [X] T004 Estender o hook `useTaskCollection` para incluir a ação `reorderOrMoveTask` em `src/hooks/useTaskCollection.ts`
- [X] T005 Adicionar testes para a ação `reorderOrMoveTask` no hook `useTaskCollection` em `tests/unit/useTaskCollection.test.ts`

**Checkpoint**: Fundação algorítmica e de estado validada e testada com sucesso.

---

## Phase 3: User Story 1 & 2 — Arraste entre Colunas e Feedback Visual (Priority: P1) - MVP

**Goal**: Permitir arrastar cartões entre colunas com feedback visual rico (opacidade, highlight na coluna receptora e área vazia receptora).

**Independent Test**: Arrastar um cartão de `Todo` para `In Progress` atualiza visualmente o quadro, os contadores e os timestamps sem erros no console.

### Tests for User Story 1 & 2
- [X] T006 [P] [US1] Criar testes unitários para renderização de atributos `draggable` e eventos de arraste no cartão em `tests/unit/TaskDnD.test.tsx`
- [X] T007 [P] [US1] Criar testes unitários para eventos de drop target (`dragenter`, `dragover`, `dragleave`, `drop`) na coluna em `tests/unit/ColumnDnD.test.tsx`

### Implementation for User Story 1 & 2
- [X] T008 [US1] Adicionar suporte a `draggable={!isEditing}`, `onDragStart`, `onDragEnd` e isolamento de `onPointerDown` no textarea/botões em `src/components/Task.tsx`
- [X] T009 [US1] Adicionar manipulação de drop target com contador de profundidade (`dragDepthRef`), eventos `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop` e drop zone para colunas vazias em `src/components/Column.tsx`
- [X] T010 [P] [US2] Estilizar classes de feedback visual `.task-card-dragging` (opacidade, cursor grabbing) e `.kanban-column-drop-target` (borda e glow com glassmorphism) em `src/App.css`
- [X] T011 [US1] Conectar a ação `reorderOrMoveTask` entre o quadro e as colunas em `src/components/Board.tsx` e `src/App.tsx`

**Checkpoint**: User Stories 1 e 2 totalmente funcionais (MVP de Drag-and-Drop entregue).

---

## Phase 4: User Story 3 — Reordenação Vertical na Mesma Coluna (Priority: P2)

**Goal**: Permitir que o usuário solte um cartão diretamente sobre outro cartão para posicioná-lo antes ou depois, priorizando itens verticalmente.

**Independent Test**: Arrastar o último cartão de uma coluna e soltar sobre o primeiro posiciona o item no topo da coluna e persiste a alteração no `localStorage`.

### Tests for User Story 3
- [X] T012 [P] [US3] Criar testes unitários para reordenação relativa entre cartões em `tests/unit/taskReorderRelative.test.ts`

### Implementation for User Story 3
- [X] T013 [US3] Adicionar drop target individual nos cartões de tarefa para capturar reordenação vertical antes/depois em `src/components/Task.tsx`

**Checkpoint**: Reordenação vertical precisa operacional.

---

## Phase 5: User Story 4 — Preservação dos Botões Direcionais e Acessibilidade (Priority: P2)

**Goal**: Garantir que botões direcionais permaneçam focáveis, acessíveis e 100% operacionais sem conflito com o drag-and-drop.

**Independent Test**: Clicar no botão `→` de um cartão continua transicionando o item para a coluna adjacente à direita.

### Tests for User Story 4
- [X] T014 [P] [US4] Criar testes de regressão garantindo que os botões direcionais (`←` e `→`) continuam funcionais e acessíveis em `tests/unit/dndAccessibility.test.tsx`

### Implementation for User Story 4
- [X] T015 [US4] Auditar e garantir isolamento de cliques (`stopPropagation`) e acessibilidade nos botões de transição em `src/components/Task.tsx`

**Checkpoint**: Acessibilidade e redundância para touch/mobile garantidas.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação final de roteiro, responsividade e auditoria de código limpo.

- [X] T016 [P] Validar roteiro completo de testes manuais conforme `specs/003-drag-and-drop-interaction/quickstart.md`
- [X] T017 [P] Verificar responsividade e usabilidade mobile/tablet em `src/App.css`
- [X] T018 Executar suíte completa de testes (`npm test`), build limpo (`npm run build`) e auditoria de código limpo

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende do Setup — **BLOQUEIA** todas as histórias de usuário.
- **User Stories (Phase 3 a 5)**: Dependem da Fundação (Phase 2). Executadas em ordem de prioridade (P1 → P2).
- **Polish (Phase 6)**: Depende da conclusão de todas as histórias.

### Within Each User Story
- Testes unitários escritos e falhando antes da implementação (TDD / Red-Bar First).
- Utilitários puros antes de componentes visuais.
- Validação individual da story antes de avançar para a próxima.

---

## Implementation Strategy: MVP First (User Stories 1 e 2)

1. Concluir **Phase 1: Setup** (Tipos em `src/types/dnd.ts`)
2. Concluir **Phase 2: Foundational** (Função pura `reorderTasks` e hook `useTaskCollection`)
3. Concluir **Phase 3: User Story 1 & 2** (Arraste entre colunas e feedback visual)
4. **PARAR e VALIDAR**: Neste ponto, o Metrik possui o MVP completo de Drag-and-Drop funcional.
5. Avançar para **Phase 4: User Story 3** (Reordenação vertical) e **Phase 5: User Story 4** (Acessibilidade e botões).
6. Finalizar com **Phase 6: Polish** e auditoria completa.
