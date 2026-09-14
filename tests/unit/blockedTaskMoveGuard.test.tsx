import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';
import { reorderBoard } from '../../src/utils/taskReorder';
import { BLOCKED_TASK_MOVE_WARNING_MESSAGE, BoardState, ColumnModel, TaskModel } from '../../src/types/kanban';
import { Task } from '../../src/components/Task';

describe('Blocked Task Movement Guard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const columns: ColumnModel[] = [
    { id: 'todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    { id: 'in_progress', title: 'Em Progresso', category: 'in_progress', wipLimit: null, colorScheme: 'progress' },
    { id: 'done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  describe('reorderBoard pure function', () => {
    it('allows reordering within the SAME column even if the task is blocked', () => {
      const state: BoardState = {
        columns,
        tasks: {
          todo: [
            {
              id: 'task-1',
              title: 'Task 1',
              column: 'todo',
              createdAt: '2026-09-08T10:00:00Z',
            },
            {
              id: 'task-blocked',
              title: 'Blocked Task',
              column: 'todo',
              createdAt: '2026-09-08T10:00:00Z',
              blocked: true,
            },
          ],
          in_progress: [],
          done: [],
        },
      };

      const result = reorderBoard(state, {
        activeTaskId: 'task-blocked',
        targetColumn: 'todo',
        targetTaskId: 'task-1',
        position: 'before',
      });

      expect(result.tasks.todo[0].id).toBe('task-blocked');
      expect(result.tasks.todo[1].id).toBe('task-1');
    });

    it('allows moving the task across columns after it is unblocked (blocked: false)', () => {
      const state: BoardState = {
        columns,
        tasks: {
          todo: [
            {
              id: 'task-unblocked',
              title: 'Unblocked Task',
              column: 'todo',
              createdAt: '2026-09-08T10:00:00Z',
              blocked: false,
            },
          ],
          in_progress: [],
          done: [],
        },
      };

      const result = reorderBoard(state, {
        activeTaskId: 'task-unblocked',
        targetColumn: 'in_progress',
      });

      expect(result.tasks.todo.length).toBe(0);
      expect(result.tasks.in_progress.length).toBe(1);
      expect(result.tasks.in_progress[0].id).toBe('task-unblocked');
      expect(result.tasks.in_progress[0].column).toBe('in_progress');
    });
  });

  describe('useTaskCollection hook guards', () => {
    it('moveTask triggers alert and does NOT move card when task is blocked', () => {
      const alertMock = vi.fn();
      vi.stubGlobal('alert', alertMock);

      const { result } = renderHook(() => useTaskCollection('test-blocked-move-hook'));

      let createdTask: TaskModel;
      act(() => {
        result.current.clearTasks();
        createdTask = result.current.addTask('todo', 'Blocked Card');
      });

      // Mark task as blocked
      act(() => {
        result.current.toggleTaskBlocked(createdTask.id, 'Falta de acesso');
      });

      const taskInState = result.current.board.tasks['todo'].find((t) => t.id === createdTask.id);
      expect(taskInState?.blocked).toBe(true);

      // Attempt to move to in-progress
      act(() => {
        result.current.moveTask(createdTask.id, 'in-progress');
      });

      expect(alertMock).toHaveBeenCalledWith(BLOCKED_TASK_MOVE_WARNING_MESSAGE);
      expect(result.current.board.tasks['todo'].some((t) => t.id === createdTask.id)).toBe(true);
      expect(result.current.board.tasks['in-progress'].some((t) => t.id === createdTask.id)).toBe(false);

      // Now unblock the task
      act(() => {
        result.current.toggleTaskBlocked(createdTask.id);
      });

      const unblockedTask = result.current.board.tasks['todo'].find((t) => t.id === createdTask.id);
      expect(unblockedTask?.blocked).toBe(false);

      // Now moving should succeed
      act(() => {
        result.current.moveTask(createdTask.id, 'in-progress');
      });

      expect(result.current.board.tasks['todo'].some((t) => t.id === createdTask.id)).toBe(false);
      expect(result.current.board.tasks['in-progress'].some((t) => t.id === createdTask.id)).toBe(true);
    });

    it('reorderOrMoveTask triggers alert and does NOT move card when dragging across columns while blocked', () => {
      const alertMock = vi.fn();
      vi.stubGlobal('alert', alertMock);

      const { result } = renderHook(() => useTaskCollection('test-blocked-dnd-hook'));

      let createdTask: TaskModel;
      act(() => {
        result.current.clearTasks();
        createdTask = result.current.addTask('todo', 'Blocked Drag Card');
      });

      act(() => {
        result.current.toggleTaskBlocked(createdTask.id, 'API instável');
      });

      // Attempt drop on in-progress column
      act(() => {
        result.current.reorderOrMoveTask({
          activeTaskId: createdTask.id,
          targetColumn: 'in-progress',
        });
      });

      expect(alertMock).toHaveBeenCalledWith(BLOCKED_TASK_MOVE_WARNING_MESSAGE);
      expect(result.current.board.tasks['todo'].some((t) => t.id === createdTask.id)).toBe(true);
      expect(result.current.board.tasks['in-progress'].some((t) => t.id === createdTask.id)).toBe(false);
    });
  });

  describe('Task component UI interaction when blocked', () => {
    const baseTask: TaskModel = {
      id: 'task-blocked-ui',
      title: 'UI Blocked Task',
      column: 'todo',
      createdAt: '2026-09-08T10:00:00Z',
      blocked: true,
      blockedReason: 'Bloqueado por dependência',
    };

    it('renders with draggable={false} and prevents drag start when blocked', () => {
      render(
        <Task
          task={baseTask}
          onUpdateTitle={vi.fn()}
          onDelete={vi.fn()}
          onDiscardIfEmpty={vi.fn()}
        />
      );

      const card = screen.getByRole('article');
      expect(card.getAttribute('draggable')).toBe('false');

      const dragEvent = new Event('dragstart', { bubbles: true, cancelable: true });
      fireEvent(card, dragEvent);

      expect(dragEvent.defaultPrevented).toBe(true);
    });

    it('renders with draggable={true} when task is unblocked', () => {
      const unblockedTask = { ...baseTask, blocked: false };
      render(
        <Task
          task={unblockedTask}
          onUpdateTitle={vi.fn()}
          onDelete={vi.fn()}
          onDiscardIfEmpty={vi.fn()}
        />
      );

      const card = screen.getByRole('article');
      expect(card.getAttribute('draggable')).toBe('true');
    });

    it('does not render move buttons when canMoveLeft and canMoveRight are false', () => {
      render(
        <Task
          task={baseTask}
          canMoveLeft={false}
          canMoveRight={false}
          onMoveLeft={vi.fn()}
          onMoveRight={vi.fn()}
          onUpdateTitle={vi.fn()}
          onDelete={vi.fn()}
          onDiscardIfEmpty={vi.fn()}
        />
      );

      expect(screen.queryByLabelText('Mover para coluna anterior')).toBeNull();
      expect(screen.queryByLabelText('Mover para próxima coluna')).toBeNull();
    });

    it('hides lateral move buttons even when canMoveLeft and canMoveRight are passed as true if task is blocked', () => {
      render(
        <Task
          task={baseTask}
          canMoveLeft={true}
          canMoveRight={true}
          onMoveLeft={vi.fn()}
          onMoveRight={vi.fn()}
          onUpdateTitle={vi.fn()}
          onDelete={vi.fn()}
          onDiscardIfEmpty={vi.fn()}
        />
      );

      expect(screen.queryByLabelText('Mover para coluna anterior')).toBeNull();
      expect(screen.queryByLabelText('Mover para próxima coluna')).toBeNull();
    });

    it('renders with aria-disabled="true" and task-card-blocked-locked class when blocked', () => {
      render(
        <Task
          task={baseTask}
          onUpdateTitle={vi.fn()}
          onDelete={vi.fn()}
          onDiscardIfEmpty={vi.fn()}
        />
      );

      const card = screen.getByRole('article');
      expect(card.getAttribute('aria-disabled')).toBe('true');
      expect(card.classList.contains('task-card-blocked-locked')).toBe(true);
    });

    it('triggers 1-click quick unlock when clicking on ⛔ Bloqueado badge', () => {
      const toggleBlockedMock = vi.fn();
      render(
        <Task
          task={baseTask}
          onToggleBlocked={toggleBlockedMock}
          onUpdateTitle={vi.fn()}
          onDelete={vi.fn()}
          onDiscardIfEmpty={vi.fn()}
        />
      );

      const badge = screen.getByTestId('task-blocked-badge');
      fireEvent.click(badge);

      expect(toggleBlockedMock).toHaveBeenCalledWith(baseTask.id);
    });

    it('cancels dragStart and sets draggable=false when task is blocked by tag keyword', () => {
      const taskWithTag: TaskModel = {
        id: 'task-tag-blocked',
        title: 'Tag Blocked Task',
        column: 'todo',
        createdAt: '2026-09-14T10:00:00Z',
        tags: ['bloqueado'],
      };

      render(
        <Task
          task={taskWithTag}
          onUpdateTitle={vi.fn()}
          onDelete={vi.fn()}
          onDiscardIfEmpty={vi.fn()}
        />
      );

      const card = screen.getByRole('article');
      expect(card.getAttribute('draggable')).toBe('false');

      const dragEvent = new Event('dragstart', { bubbles: true, cancelable: true });
      fireEvent(card, dragEvent);

      expect(dragEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Tag and Blocked state bidirectional synchronization', () => {
    it('synchronizes task.blocked to true when tag "bloqueado" is added, and clears it when tag is removed', () => {
      const { result } = renderHook(() => useTaskCollection('test-tag-sync-hook'));

      let createdTask: TaskModel;
      act(() => {
        result.current.clearTasks();
        createdTask = result.current.addTask('todo', 'Tag Sync Task');
      });

      // Add blocking tag
      act(() => {
        result.current.addTaskTag(createdTask.id, 'bloqueado');
      });

      let taskInState = result.current.board.tasks['todo'].find((t) => t.id === createdTask.id);
      expect(taskInState?.blocked).toBe(true);
      expect(taskInState?.tags).toContain('bloqueado');

      // Remove blocking tag
      act(() => {
        result.current.removeTaskTag(createdTask.id, 'bloqueado');
      });

      taskInState = result.current.board.tasks['todo'].find((t) => t.id === createdTask.id);
      expect(taskInState?.blocked).toBe(false);
      expect(taskInState?.tags).not.toContain('bloqueado');
    });

    it('synchronizes tags when toggleTaskBlocked is called', () => {
      const { result } = renderHook(() => useTaskCollection('test-toggle-tag-sync-hook'));

      let createdTask: TaskModel;
      act(() => {
        result.current.clearTasks();
        createdTask = result.current.addTask('todo', 'Toggle Tag Sync Task');
      });

      // Toggle to blocked
      act(() => {
        result.current.toggleTaskBlocked(createdTask.id, 'Dependência externa');
      });

      let taskInState = result.current.board.tasks['todo'].find((t) => t.id === createdTask.id);
      expect(taskInState?.blocked).toBe(true);
      expect(taskInState?.tags).toContain('bloqueado');

      // Toggle to unblocked
      act(() => {
        result.current.toggleTaskBlocked(createdTask.id);
      });

      taskInState = result.current.board.tasks['todo'].find((t) => t.id === createdTask.id);
      expect(taskInState?.blocked).toBe(false);
      expect(taskInState?.tags).not.toContain('bloqueado');
    });
  });
});
