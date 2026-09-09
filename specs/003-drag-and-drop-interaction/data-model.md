# Data Model: Interação Drag-and-Drop de Cartões

**Feature**: `003-drag-and-drop-interaction`  
**Date**: 2026-09-08  
**Status**: Completed  

---

## 1. Modelo de Entidades e Tipos

O modelo de dados persistido de cada tarefa (`TaskModel`) permanece 100% estável e retrocompatível com a Feature 001 e Feature 002. A ordem das tarefas em cada coluna é governada pela própria sequência dos elementos no array de tarefas persistido em `localStorage` sob a chave `metrik_kanban_tasks`.

```typescript
// src/types/kanban.ts

export type ColumnId = 'todo' | 'in_progress' | 'blocked' | 'completed';

export interface TaskModel {
  id: string;
  title: string;
  columnId: ColumnId;
  createdAt: string;       // ISO 8601 UTC
  startedAt: string | null;// ISO 8601 UTC (primeiro movimento para in_progress ou blocked)
  completedAt: string | null;// ISO 8601 UTC (ao ingressar em completed)
}
```

---

## 2. Tipos e Contratos de Drag and Drop

Definição de tipos TypeScript dedicados para orquestrar o estado transitório de drag-and-drop na interface:

```typescript
// src/types/dnd.ts

export interface DragItemData {
  taskId: string;
  sourceColumnId: ColumnId;
}

export type DropPosition = 'before' | 'after';

export interface DropTargetLocation {
  columnId: ColumnId;
  targetTaskId?: string;
  position?: DropPosition;
}
```

---

## 3. Função Pura de Transição e Reordenação (`reorderTasks`)

Para garantir determinismo, testabilidade e pureza funcional (TDD), as mutações do array de tarefas são centralizadas em uma função pura `reorderTasks`:

```typescript
// src/utils/taskReorder.ts

export interface ReorderOptions {
  activeTaskId: string;
  targetColumnId: ColumnId;
  targetTaskId?: string;
  position?: DropPosition;
}

/**
 * Reorganiza o array de tarefas movendo a tarefa ativa para a nova coluna e posição.
 * Atualiza automaticamente os timestamps de fluxo de forma idempotente.
 */
export function reorderTasks(
  tasks: TaskModel[],
  options: ReorderOptions,
  nowIso: string = new Date().toISOString()
): TaskModel[];
```

### Regras de Transição de Timestamps na Reordenação:
1. Se `targetColumnId === 'completed'` e o cartão estava em outra coluna:
   - `completedAt = nowIso`
   - Se `startedAt === null`, `startedAt = nowIso` (fallback para salto direto de `Todo` para `Completed`).
2. Se `targetColumnId !== 'completed'` e o cartão estava em `completed`:
   - `completedAt = null` (reabertura de tarefa).
3. Se `(targetColumnId === 'in_progress' || targetColumnId === 'blocked')` e `startedAt === null`:
   - `startedAt = nowIso` (início de trabalho).
4. Se o cartão for reordenado dentro da mesma coluna (`sourceColumnId === targetColumnId`):
   - Todos os timestamps existentes são preservados sem alterações.

---

## 4. Contrato de Estado no Hook `useTaskCollection`

A interface pública do hook `useTaskCollection` recebe uma nova ação:

```typescript
export interface UseTaskCollectionReturn {
  tasks: TaskModel[];
  addTask: (columnId: ColumnId, title?: string) => TaskModel;
  updateTaskTitle: (taskId: string, title: string) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, direction: 'left' | 'right') => void;
  // Nova ação adicionada na Feature 003:
  reorderOrMoveTask: (options: ReorderOptions) => void;
  clearAllTasks: () => void;
  restoreSeedTasks: () => void;
}
```
