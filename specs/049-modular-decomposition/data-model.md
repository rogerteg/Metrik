# Component & Hook Architecture Model: Decomposição de Módulos (OPP-002)

**Feature**: `049-modular-decomposition`  
**Status**: Complete  
**Date**: 2026-10-21  
**Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

---

## 1. Modelo de Composição do Cartão Kanban (`Task/`)

```mermaid
classDiagram
    class TaskCard {
        +Task task
        +boolean isSelected
        +onSelect(taskId)
        +onOpenModal(task)
        +onDelete(taskId)
    }
    class TaskCardContainer {
        +DraggableProvided provided
        +DraggableStateSnapshot snapshot
    }
    class TaskHeader {
        +string title
        +string id
        +TaskPriority priority
        +TaskType type
    }
    class TaskBadges {
        +number cycleTimeDays
        +number leadTimeDays
        +SLEStatus sle
        +number storyPoints
        +string dueDate
    }
    class TaskBlockerChips {
        +boolean isBlocked
        +string blockerReason
        +TaskLink[] dependencies
    }
    class TaskChecklistSummary {
        +TaskChecklistItem[] checklist
    }

    TaskCard --> TaskCardContainer
    TaskCardContainer --> TaskHeader
    TaskCardContainer --> TaskBlockerChips
    TaskCardContainer --> TaskBadges
    TaskCardContainer --> TaskChecklistSummary
```

### Contratos de Props

```typescript
// src/components/Task/types.ts
export interface TaskCardProps {
  task: Task;
  index: number;
  columns: Column[];
  allTasks: Task[];
  isSelected?: boolean;
  onSelect?: (taskId: string, e: React.MouseEvent) => void;
  onOpenModal: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMoveTask?: (taskId: string, targetColId: string) => void;
}

export interface TaskHeaderProps {
  task: Task;
  onOpenModal: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export interface TaskBadgesProps {
  task: Task;
  column?: Column;
}

export interface TaskBlockerChipsProps {
  task: Task;
  allTasks: Task[];
  onOpenModal: (task: Task) => void;
}

export interface TaskChecklistSummaryProps {
  checklist?: TaskChecklistItem[];
  onToggleItem?: (itemId: string) => void;
}
```

---

## 2. Modelo de Composição do Modal de Detalhes (`TaskDetailsModal/`)

```mermaid
classDiagram
    class TaskDetailsModal {
        +Task task
        +boolean isOpen
        +onClose()
        +onSave(task)
        -boolean isDirty
        -showDirtyConfirmDialog()
    }
    class TaskModalHeader {
        +string title
        +string taskId
        +boolean isDirty
        +onClose()
    }
    class TaskModalPrimaryFields {
        +Column[] columns
        +string status
        +TaskPriority priority
        +string[] tags
        +number storyPoints
        +string dueDate
    }
    class TaskModalDescription {
        +string description
        +onChange(text)
        +onSave()
        +onDiscard()
    }
    class TaskModalActivityTab {
        +TaskComment[] comments
        +TaskActivityLog[] logs
        +onAddComment(text)
    }

    TaskDetailsModal --> TaskModalHeader
    TaskDetailsModal --> TaskModalPrimaryFields
    TaskDetailsModal --> TaskModalDescription
    TaskDetailsModal --> TaskModalActivityTab
```

### Contratos de Props

```typescript
// src/components/TaskDetailsModal/types.ts
export interface TaskModalHeaderProps {
  task: Task;
  isDirty: boolean;
  onClose: () => void;
}

export interface TaskModalPrimaryFieldsProps {
  task: Task;
  columns: Column[];
  onChangeField: <K extends keyof Task>(field: K, value: Task[K]) => void;
}

export interface TaskModalDescriptionProps {
  description: string;
  isEditing: boolean;
  autoSaveEnabled: boolean;
  onSaveDescription: (desc: string) => void;
  onDiscardDescription: () => void;
}

export interface TaskModalActivityTabProps {
  task: Task;
  activeTab: 'comments' | 'activity';
  onTabChange: (tab: 'comments' | 'activity') => void;
  onAddComment: (comment: string, isDecision?: boolean) => void;
}
```

---

## 3. Modelo de Composição do Hook Fachada (`useTaskCollection`)

```mermaid
classDiagram
    class UseTaskCollectionReturn {
        +Task[] tasks
        +Column[] columns
        +addTask(task)
        +updateTask(taskId, updates)
        +deleteTask(taskId)
        +moveTask(taskId, colId)
        +reorderTaskRelative(taskId, targetId, pos)
        +addTaskComment(taskId, text)
        +toggleSubtask(taskId, subtaskId)
    }

    class useTaskMutations {
        +addTask()
        +updateTask()
        +deleteTask()
        +archiveTask()
    }

    class useTaskReorderManager {
        +moveTask()
        +reorderTaskRelative()
        +reorderColumns()
    }

    class useTaskChecklistManager {
        +addSubtask()
        +toggleSubtask()
        +deleteSubtask()
    }

    class useTaskCommentsManager {
        +addTaskComment()
        +deleteTaskComment()
        +markCommentDecision()
    }

    UseTaskCollectionReturn <.. useTaskMutations : composes
    UseTaskCollectionReturn <.. useTaskReorderManager : composes
    UseTaskCollectionReturn <.. useTaskChecklistManager : composes
    UseTaskCollectionReturn <.. useTaskCommentsManager : composes
```

---

## 4. Modelo de Composição da Casca da Aplicação (`App/`)

```mermaid
classDiagram
    class AppShell {
        +CurrentView currentView
        +onNavigate(view)
    }
    class AppHeaderBar {
        +Board activeBoard
        +Squad activeSquad
        +CurrentView currentView
        +onNavigate(view)
        +onToggleTheme()
        +onOpenMika()
    }
    class AppDialogsContainer {
        +boolean isNewBoardOpen
        +boolean isTeamModalOpen
        +boolean isMikaDrawerOpen
        +boolean isCsvModalOpen
        +Task activeModalTask
        +onCloseModals()
    }

    AppShell --> AppHeaderBar
    AppShell --> AppDialogsContainer
```
