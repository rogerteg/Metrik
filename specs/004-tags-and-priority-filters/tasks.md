# Tasks: Etiquetas (Tags), Níveis de Prioridade e Barra de Filtros

**Feature**: `004-tags-and-priority-filters`  
**Date**: 2026-09-09  
**Spec**: [specs/004-tags-and-priority-filters/spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/004-tags-and-priority-filters/spec.md)  
**Plan**: [specs/004-tags-and-priority-filters/plan.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/004-tags-and-priority-filters/plan.md)  

---

## Modelos de Raciocínio Analítico (Constituição Artigo VI - OBRIGATÓRIO)

### 1. Princípios Fundamentais (First-Principles Thinking)
- **Verdades Irredutíveis:**
  1. Filtros são apenas projeções temporárias da interface (Lens Pattern). O estado base das tarefas em `localStorage` e os cálculos da `MetricsBar` (Throughput, Lead Time, Cycle Time) e limites de WIP nunca devem ser alterados ou reduzidos pela presença de filtros na tela.
  2. A adição de prioridades e tags ao `TaskModel` deve ser estritamente aditiva (`priority?: PriorityLevel`, `tags?: string[]`). Tarefas já persistidas sem esses campos são tratadas de forma idempotente e segura sem necessidade de migrações arriscadas.
  3. A atribuição de cores a tags deve ser puramente determinística: a mesma string sempre gera o mesmo hash de cor, eliminando estados complexos de gerenciamento de paletas no cliente.

### 2. Inversão & Análise Premortem (Failure Modes)
- **Modos de Falha Catastróficos Mapeados:**
  1. *Vazamento de filtro nas métricas:* O usuário filtra por uma tag e a `MetricsBar` recalcula o throughput apenas para os itens visíveis, distorcendo o histórico real do fluxo da equipe.
     *Mitigação:* `MetricsBar` e contadores de WIP recebem a coleção original não filtrada (`board`), enquanto `<Board>` recebe `filteredBoard`.
  2. *Conflito de drag-and-drop sob filtro ativo:* Arrastar um item visível solta na coluna errada ou quebra o índice de reordenação.
     *Mitigação:* A ação `reorderOrMoveTask` opera sobre o `board` original via `taskId` imutável, e o `useBoardFilters` recalcula a projeção automaticamente.
  3. *Poluição por tags inválidas:* Tags vazias, contendo apenas espaços ou duplicadas no mesmo cartão.
     *Mitigação:* Sanitização com `.trim()`, deduplicação por `Set` e validação defensiva antes de mutações de estado.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua:**
  - `priorityConfig.ts` e `tagColors.ts` contêm puramente regras de apresentação e hashing de cores.
  - `useBoardFilters.ts` contém puramente a lógica memoizada de filtro.
  - `PriorityBadge`, `TagList` e `FilterBar` encapsulam responsabilidades visuais desacopladas.
- **Exaustividade Coletiva:**
  - 100% dos requisitos funcionais (FR-001 a FR-011) e critérios de aceite (US1 a US4) mapeados em tarefas executáveis com testes automatizados.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Ramo 1: Adotar biblioteca de fuzzy search (`fuse.js`)** -> *Podado.* Adicionaria peso desnecessário; a busca pura com `.toLowerCase().includes()` atende instantaneamente (< 5ms) com zero bytes adicionais.
- **Ramo 2: Gerenciador global de paleta de cores para tags com picker RGB** -> *Podado.* YAGNI: introduziria atrito de configuração; hashing determinístico oferece harmonia visual imediata.
- **Ramo 3: Filtragem direta dentro do hook `useTaskCollection`** -> *Podado.* Misturaria persistência com estado efêmero de UI; o hook separado `useBoardFilters` preserva a Clean Architecture.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha demonstrável (Red Bar):**
  - Os testes `priorityAndTags.test.ts`, `useBoardFilters.test.ts`, `PriorityBadge.test.tsx`, `TagList.test.tsx` e `FilterBar.test.tsx` devem falhar antes da implementação dos respectivos módulos.
- **Critério determinístico de aceite (Green Bar):**
  - Todos os novos testes passam e a suíte completa com os 62 testes anteriores permanece 100% verde (totalizando mais de 75 testes automatizados).

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Simplicidade (YAGNI):** Estrutura de tags como array simples de strings em vez de tabelas normalizadas.
- **Modularidade:** Tipos em `src/types/filter.ts` e hook puro em `src/hooks/useBoardFilters.ts`.
- **Integridade Lean:** Preservação da fidelidade dos dados de fluxo.

---

## Phase 1: Setup (Tipos e Estruturas de Dados)

**Purpose**: Definições de tipos TypeScript para prioridades, tags e filtros.

- [X] T001 [P] Estender `src/types/kanban.ts` com `PriorityLevel` e criar `src/types/filter.ts` com `FilterState` e `UseBoardFiltersReturn`

---

## Phase 2: Foundational (Utilitários e Hook de Filtros)

**Purpose**: Utilitários puros e hook memoizado de filtragem do quadro.

**CRITICAL**: Nenhuma alteração visual pode iniciar antes de a fundação de filtragem ser validada.

### Tests for Foundation (TDD / Red-Bar First)
- [X] T002 [P] Criar testes unitários para configurações de prioridade e função determinística de cores de tags em `tests/unit/priorityAndTags.test.ts`
- [X] T003 [P] Criar testes unitários para o pipeline de filtragem do hook `useBoardFilters` em `tests/unit/useBoardFilters.test.ts`

### Implementation for Foundation
- [X] T004 Implementar configurações de prioridade em `src/utils/priorityConfig.ts` e hashing de cores em `src/utils/tagColors.ts`
- [X] T005 Implementar hook memoizado `useBoardFilters` em `src/hooks/useBoardFilters.ts`
- [X] T006 Estender `useTaskCollection` com ações `setTaskPriority`, `addTaskTag` e `removeTaskTag` em `src/hooks/useTaskCollection.ts`

**Checkpoint**: Fundação de dados e lógica de filtragem 100% testada e aprovada.

---

## Phase 3: User Story 1 — Níveis de Prioridade no Cartão (Priority: P1)

**Goal**: Exibir badge e permitir alternar o nível de prioridade (`urgent`, `high`, `medium`, `low`) no cartão.

**Independent Test**: Modificar a prioridade de um cartão para "Alta" exibe badge estilizado com persistência no `localStorage`.

### Tests for User Story 1
- [X] T007 [P] [US1] Criar testes unitários para o componente `PriorityBadge` em `tests/unit/PriorityBadge.test.tsx`

### Implementation for User Story 1
- [X] T008 [US1] Implementar componente visual e seletor `PriorityBadge` em `src/components/PriorityBadge.tsx`
- [X] T009 [US1] Integrar `PriorityBadge` no cartão de tarefa em `src/components/Task.tsx`

**Checkpoint**: Níveis de prioridade funcionais e testados nos cartões.

---

## Phase 4: User Story 2 — Sistema de Etiquetas (Tags) no Cartão (Priority: P1)

**Goal**: Permitir adicionar e remover etiquetas coloridas personalizadas nos cartões de tarefa.

**Independent Test**: Digitar uma nova tag em um cartão adiciona um chip colorido com botão para exclusão individual.

### Tests for User Story 2
- [X] T010 [P] [US2] Criar testes unitários para o componente `TagList` em `tests/unit/TagList.test.tsx`

### Implementation for User Story 2
- [X] T011 [US2] Implementar componente `TagList` com chips coloridos e input inline em `src/components/TagList.tsx`
- [X] T012 [US2] Integrar `TagList` no cartão de tarefa em `src/components/Task.tsx`

**Checkpoint**: Tags coloridas com adição e remoção inline operacionais.

---

## Phase 5: User Story 3 & 4 — Barra de Filtros e Busca Instantânea (Priority: P1 - MVP)

**Goal**: Fornecer barra de busca e filtragem dinâmica por prioridade e tags, preservando a integridade das métricas de fluxo.

**Independent Test**: Digitar um termo na busca ou selecionar uma prioridade/tag filtra instantaneamente as colunas e exibe contagem de visíveis vs total.

### Tests for User Story 3 & 4
- [X] T013 [P] [US3] Criar testes unitários para o componente `FilterBar` em `tests/unit/FilterBar.test.tsx`

### Implementation for User Story 3 & 4
- [X] T014 [US3] Implementar componente `FilterBar` com busca textual, pílulas de tags e seletor de prioridade em `src/components/FilterBar.tsx`
- [X] T015 [US3] Integrar `FilterBar` e `useBoardFilters` na página principal em `src/App.tsx`
- [X] T016 [P] [US3] Adicionar estilos CSS para `FilterBar`, `PriorityBadge`, `TagChips` e estado vazio de coluna em `src/App.css`

**Checkpoint**: Todas as histórias de usuário integradas e funcionais.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação final de roteiro, responsividade e auditoria de código limpo.

- [X] T017 [P] Validar roteiro completo de testes manuais conforme `specs/004-tags-and-priority-filters/quickstart.md`
- [X] T018 [P] Ajustar responsividade da barra de filtros para mobile e tablets em `src/App.css`
- [X] T019 Executar suíte completa de testes (`npm test`), build limpo (`npm run build`) e auditoria de código limpo

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende do Setup — **BLOQUEIA** todas as histórias de usuário.
- **User Stories (Phase 3 a 5)**: Dependem da Fundação (Phase 2). Executadas em ordem de prioridade.
- **Polish (Phase 6)**: Depende da conclusão de todas as histórias.

### Within Each User Story
- Testes unitários escritos e falhando antes da implementação (TDD / Red-Bar First).
- Componentes modulares reutilizáveis com estilos pré-definidos.
- Validação individual da story antes de avançar para a próxima.
