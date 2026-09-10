import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';
import { isBackwardColumnMove, reorderBoard } from '../../src/utils/taskReorder';
import { MAX_COLUMNS, FLOW_REGRESSION_WARNING_MESSAGE, BoardState } from '../../src/types/kanban';

describe('Feature 014: Column Limit & Unidirectional Flow Guard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Column Limit (MAX_COLUMNS = 12)', () => {
    it('allows creating columns up to 12 and strictly rejects the 13th column', () => {
      const { result } = renderHook(() => useTaskCollection('test-board-col-limit'));

      // Clean board tasks and columns first
      act(() => {
        result.current.clearTasks();
      });

      // Initial seed has 4 columns: 'todo', 'in_progress', 'review', 'done'
      expect(result.current.board.columns.length).toBe(4);

      // Add 8 more columns to reach 12
      for (let i = 5; i <= 12; i++) {
        act(() => {
          result.current.addColumn(`Fase ${i}`, 'in_progress', null);
        });
      }

      expect(result.current.board.columns.length).toBe(MAX_COLUMNS);
      expect(result.current.board.columns.length).toBe(12);

      // Attempt to add a 13th column
      act(() => {
        result.current.addColumn('Fase Proibida 13', 'in_progress', null);
      });

      // Should still be strictly 12
      expect(result.current.board.columns.length).toBe(12);
      expect(result.current.board.columns.some((c) => c.title === 'Fase Proibida 13')).toBe(false);
    });
  });

  describe('isBackwardColumnMove Helper', () => {
    const columns = [
      { id: 'col-0', title: 'Backlog' },
      { id: 'col-1', title: 'Em Progresso' },
      { id: 'col-2', title: 'Revisão' },
      { id: 'col-3', title: 'Concluído' },
    ];

    it('returns false for forward movement (left to right)', () => {
      expect(isBackwardColumnMove(columns, 'col-0', 'col-1')).toBe(false);
      expect(isBackwardColumnMove(columns, 'col-1', 'col-3')).toBe(false);
    });

    it('returns false for intra-column movement', () => {
      expect(isBackwardColumnMove(columns, 'col-1', 'col-1')).toBe(false);
    });

    it('returns true for backward movement (right to left)', () => {
      expect(isBackwardColumnMove(columns, 'col-2', 'col-1')).toBe(true);
      expect(isBackwardColumnMove(columns, 'col-3', 'col-0')).toBe(true);
      expect(isBackwardColumnMove(columns, 'col-1', 'col-0')).toBe(true);
    });
  });

  describe('reorderBoard Flow Metrics Reset on Backward Move', () => {
    const testBoard: BoardState = {
      columns: [
        { id: 'todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
        { id: 'in_progress', title: 'Em Progresso', category: 'in_progress', wipLimit: 3, colorScheme: 'progress' },
        { id: 'done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
      ],
      tasks: {
        todo: [],
        in_progress: [],
        done: [
          {
            id: 'task-1',
            title: 'Tarefa Completa',
            column: 'done',
            createdAt: '2026-09-09T10:00:00.000Z',
            startedAt: '2026-09-09T11:00:00.000Z',
            completedAt: '2026-09-09T12:00:00.000Z',
            totalBlockedMs: 1800000,
            blocked: true,
            blockedReason: 'Aguardando validação',
          },
        ],
      },
    };

    it('resets completedAt, totalBlockedMs, and blocked status when moved backward to todo', () => {
      const updated = reorderBoard(testBoard, {
        activeTaskId: 'task-1',
        targetColumn: 'todo',
      });

      const movedTask = updated.tasks.todo.find((t) => t.id === 'task-1');
      expect(movedTask).toBeDefined();
      expect(movedTask?.column).toBe('todo');
      expect(movedTask?.startedAt).toBeUndefined();
      expect(movedTask?.completedAt).toBeUndefined();
      expect(movedTask?.totalBlockedMs).toBeUndefined();
      expect(movedTask?.blocked).toBe(false);
      expect(movedTask?.blockedReason).toBeUndefined();
    });
  });

  describe('useTaskCollection Unidirectional Flow Guard Dialog', () => {
    it('blocks backward move, alerts Cuidado warning, and maintains card in current column', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const { result } = renderHook(() => useTaskCollection('test-board-guard'));
      const inProgressColId = result.current.board.columns[1].id;
      const todoColId = result.current.board.columns[0].id;

      // Create task in 'in-progress' column
      let createdTaskId = '';
      act(() => {
        const task = result.current.addTask(inProgressColId, 'Tarefa Em Andamento');
        createdTaskId = task.id;
      });

      // Try moving backward to 'todo'
      act(() => {
        result.current.moveTask(createdTaskId, todoColId);
      });

      expect(alertSpy).toHaveBeenCalledWith(FLOW_REGRESSION_WARNING_MESSAGE);

      // Task must remain in current column ('in-progress') and NOT move to 'todo'
      expect(result.current.board.tasks[inProgressColId].some((t) => t.id === createdTaskId)).toBe(true);
      expect(result.current.board.tasks[todoColId].some((t) => t.id === createdTaskId)).toBe(false);
    });

    it('blocks backward move via reorderOrMoveTask (drag and drop) and maintains card in current column', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const { result } = renderHook(() => useTaskCollection('test-board-guard-2'));
      const completedColId = result.current.board.columns[3].id;
      const todoColId = result.current.board.columns[0].id;

      // Create task in 'completed'
      let createdTaskId = '';
      act(() => {
        const task = result.current.addTask(completedColId, 'Tarefa Finalizada');
        createdTaskId = task.id;
      });

      // Move backward to 'todo' via reorderOrMoveTask
      act(() => {
        result.current.reorderOrMoveTask({
          activeTaskId: createdTaskId,
          targetColumn: todoColId,
        });
      });

      expect(alertSpy).toHaveBeenCalledWith(FLOW_REGRESSION_WARNING_MESSAGE);

      // Task must strictly remain in completedColId
      expect(result.current.board.tasks[completedColId].some((t) => t.id === createdTaskId)).toBe(true);
      expect(result.current.board.tasks[todoColId].some((t) => t.id === createdTaskId)).toBe(false);
    });

    it('does not prompt confirmation dialog for forward move', () => {
      const confirmSpy = vi.spyOn(window, 'confirm');

      const { result } = renderHook(() => useTaskCollection('test-board-guard-3'));
      const todoColId = result.current.board.columns[0].id;
      const inProgressColId = result.current.board.columns[1].id;

      let createdTaskId = '';
      act(() => {
        const task = result.current.addTask(todoColId, 'Tarefa Inicial');
        createdTaskId = task.id;
      });

      // Forward move to 'in-progress'
      act(() => {
        result.current.moveTask(createdTaskId, inProgressColId);
      });

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(result.current.board.tasks[inProgressColId].some((t) => t.id === createdTaskId)).toBe(true);
    });
  });

  describe('UI Warning Banner in Board Component', () => {
    it('renders "Excesso de colunas, cuidado." when columns reach 12', async () => {
      const { render, screen } = await import('@testing-library/react');
      const { Board } = await import('../../src/components/Board');

      // Create a board with 12 columns
      const twelveColsBoard: BoardState = {
        columns: Array.from({ length: 12 }, (_, i) => ({
          id: `col-${i}`,
          title: `Coluna ${i + 1}`,
          category: 'in_progress',
          wipLimit: null,
          colorScheme: 'progress',
        })),
        tasks: {},
      };

      render(
        <Board
          board={twelveColsBoard}
          onAddTask={vi.fn()}
          onOpenNewColumnModal={vi.fn()}
        />
      );

      expect(screen.getByText('Excesso de colunas, cuidado.')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Button should be disabled at limit
      const addColBtn = screen.getByRole('button', { name: /adicionar nova coluna/i });
      expect(addColBtn).toBeDisabled();
    });

    it('does not render warning banner when columns are below 12', async () => {
      const { render, screen } = await import('@testing-library/react');
      const { Board } = await import('../../src/components/Board');

      const fourColsBoard: BoardState = {
        columns: [
          { id: 'c1', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
          { id: 'c2', title: 'Em Progresso', category: 'in_progress', wipLimit: 3, colorScheme: 'progress' },
        ],
        tasks: {},
      };

      render(
        <Board
          board={fourColsBoard}
          onAddTask={vi.fn()}
          onOpenNewColumnModal={vi.fn()}
        />
      );

      expect(screen.queryByText(/excesso de colunas, cuidado/i)).toBeNull();
      const addColBtn = screen.getByRole('button', { name: /adicionar nova coluna/i });
      expect(addColBtn).toBeEnabled();
    });
  });

  describe('NewColumnModal Component', () => {
    it('calls onAddColumn with entered title, category and parsed wip', async () => {
      const { render, screen, fireEvent } = await import('@testing-library/react');
      const { NewColumnModal } = await import('../../src/components/NewColumnModal');

      const handleAddColumn = vi.fn();
      const handleClose = vi.fn();

      render(
        <NewColumnModal
          isOpen={true}
          onClose={handleClose}
          onAddColumn={handleAddColumn}
          currentColumnCount={4}
        />
      );

      const titleInput = screen.getByLabelText(/título da coluna/i);
      const wipInput = screen.getByLabelText(/limite de wip/i);
      const submitBtn = screen.getByRole('button', { name: /criar coluna/i });

      fireEvent.change(titleInput, { target: { value: 'Code Review' } });
      fireEvent.change(wipInput, { target: { value: '4' } });
      fireEvent.click(submitBtn);

      expect(handleAddColumn).toHaveBeenCalledWith('Code Review', 'in_progress', 4);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('shows warning and disables creation when currentColumnCount >= 12', async () => {
      const { render, screen } = await import('@testing-library/react');
      const { NewColumnModal } = await import('../../src/components/NewColumnModal');

      render(
        <NewColumnModal
          isOpen={true}
          onClose={vi.fn()}
          onAddColumn={vi.fn()}
          currentColumnCount={12}
        />
      );

      expect(screen.getByText('Excesso de colunas, cuidado.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar coluna/i })).toBeDisabled();
    });
  });
});
