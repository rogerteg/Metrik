# Tasks: Column Management

**Feature**: `005-column-management`
**Date**: 2026-09-09
**Spec**: [specs/005-column-management/spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/005-column-management/spec.md)
**Plan**: [specs/005-column-management/plan.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/005-column-management/plan.md)

---

## Modelos de Raciocínio Analítico (Constituição Artigo VI)

### 1. Princípios Fundamentais (First-Principles Thinking)
- O estado de um quadro Kanban dinâmico é irremediavelmente composto por duas entidades ortogonais: uma sequência ordenada de Colunas (Fases) e um conjunto de Tarefas pertencentes a essas colunas.
- `ColumnType` estático não escala para workflows personalizados.
- As métricas de fluxo (Lead/Cycle Time) dependem exclusivamente de marcações semânticas de categoria da coluna (`todo`, `in_progress`, `done`) para saber quando o cronômetro inicia e para.

### 2. Inversão & Análise Premortem (Failure Modes)
- *Modo de falha 1*: Usuários antigos perdem dados ao carregar a página porque o `localStorage` possui formato antigo (`Record<ColumnType, Task[]>`).
  *Mitigação*: Lógica de migração `on-the-fly` no `getInitialState` para converter o state antigo pro novo schema, preservando dados imutáveis.
- *Modo de falha 2*: Deleção acidental de uma coluna com dezenas de tarefas.
  *Mitigação*: Bloquear a UI de deleção (botão disabled) caso a coluna contenha `tasks.length > 0`.
- *Modo de falha 3*: Loop de re-renderização por mutação incorreta no Drag and Drop.
  *Mitigação*: Atualizar as funções de `taskReorder.ts` para lidar corretamente com `board.tasks[colId]`.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- Os componentes `Board`, `Column` e o hook `useTaskCollection` serão modificados sem sobreposição de estado.
- `seedData.ts` cobrirá o estado inicial.
- As histórias de usuário (Add, Edit, Delete, Reorder) cobrem todas as exigências do spec.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- *Ramo 1*: Migrar toda a estrutura para Redux/Zustand. *Poda*: YAGNI, o contexto atual atende bem se a imutabilidade for respeitada.
- *Ramo 2*: Usar `ColumnType` dinâmico apenas nas chaves. *Poda*: Perde a ordenação das colunas, necessitando um `columnsOrder: string[]`. Foi decidido usar `columns: ColumnModel[]` e `tasks: Record<string, Task[]>` para agrupar tudo numa única interface `BoardState`.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- Testes unitários para `useTaskCollection` falharão até que a migração de tipo e as novas funções (`addColumn`, etc.) estejam implementadas.
- O build do TypeScript (Vite) falhará até que todas as referências estáticas a `ColumnType` sejam eliminadas.

---

## Phase 1: Data Model & Seed Refactoring
- [ ] T001 [P] Modificar `src/types/kanban.ts` para introduzir `ColumnCategory`, `ColumnModel`, e atualizar `BoardState`. Deletar `ColumnType`.
- [ ] T002 [P] Atualizar `src/utils/seedData.ts` para a nova estrutura de `BoardState`.

## Phase 2: State Management & Migration
- [ ] T003 Atualizar `src/hooks/useTaskCollection.ts` para suportar `board.columns` e `board.tasks`, incluindo lógica de migração no `getInitialState`.
- [ ] T004 Adicionar métodos ao `useTaskCollection.ts`: `addColumn`, `updateColumn`, `deleteColumn`, e `reorderColumn`.
- [ ] T005 Ajustar os testes unitários em `tests/unit/useTaskCollection.test.ts`.

## Phase 3: Drag and Drop & Reordering (Core Logic)
- [ ] T006 Atualizar `src/utils/taskReorder.ts` para trabalhar com `tasks: Record<string, TaskModel[]>` e lidar com a reordenação de colunas.
- [ ] T007 Atualizar `src/types/dnd.ts` se necessário.

## Phase 4: UI Updates (Board & Columns)
- [ ] T008 Modificar `src/components/Board.tsx` para renderizar colunas iterando por `board.columns` e introduzir `Droppable` horizontal para colunas.
- [ ] T009 Modificar `src/components/Column.tsx` para aceitar `ColumnModel` e adicionar UI de Editar/Excluir.
- [ ] T010 Refatorar `useWipLimits.ts` e `WipLimitBadge.tsx` para obter o limite diretamente de `column.wipLimit`.

## Phase 5: Metrics & Polish
- [ ] T011 Atualizar `src/components/MetricsBar.tsx` para recalcular Lead/Cycle time baseado em `ColumnCategory.done`.
- [ ] T012 Atualizar `src/hooks/useBoardFilters.ts` para filtrar sobre a nova estrutura de board.
- [ ] T013 Corrigir todos os erros restantes do TypeScript (testes, imports órfãos).
- [ ] T014 Validar a aplicação `npm run build` e `npm test`.
