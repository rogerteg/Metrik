import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Board } from '../../src/components/Board';
import { BoardState } from '../../src/types/kanban';
import { DEFAULT_COLUMN_WIDTH } from '../../src/utils/columnGeometry';

/**
 * Feature 026 (US1) — toda coluna deve ser renderizada com largura explícita.
 * O defeito original era a coluna herdar a largura de folhas de estilo ou ficar indefinida,
 * o que produzia geometria diferente conforme o estado local de cada navegador.
 */
describe('Board — largura explícita por coluna (US1, GC-01)', () => {
  const board: BoardState = {
    columns: [
      { id: 'todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
      { id: 'doing', title: 'Em Progresso', category: 'in_progress', wipLimit: 3, colorScheme: 'progress' },
      { id: 'done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
    ],
    tasks: {
      todo: [
        { id: 't1', title: 'Cartão 1', column: 'todo', createdAt: '2026-09-08T10:00:00Z' },
      ],
      doing: [],
      done: [],
    },
  };

  const renderBoard = (columnWidths?: Record<string, number>) =>
    render(
      <Board
        board={board}
        columnWidths={columnWidths}
        onAddTask={() => {}}
        renderTask={(task) => <div key={task.id}>{task.title}</div>}
      />
    );

  it('renders every column with an explicit width even without persisted preferences', () => {
    const { container } = renderBoard();
    const columns = Array.from(container.querySelectorAll<HTMLElement>('.kanban-column'));

    expect(columns).toHaveLength(3);

    for (const column of columns) {
      expect(column.style.width).toBe(`${DEFAULT_COLUMN_WIDTH}px`);
      expect(column.style.minWidth).toBe(`${DEFAULT_COLUMN_WIDTH}px`);
      expect(column.style.maxWidth).toBe(`${DEFAULT_COLUMN_WIDTH}px`);
    }
  });

  it('applies a persisted preference to the matching column only (GC-04)', () => {
    const { container } = renderBoard({ doing: 440 });
    const columns = Array.from(container.querySelectorAll<HTMLElement>('.kanban-column'));

    const widths = columns.map((column) => column.style.width);

    expect(widths).toEqual([
      `${DEFAULT_COLUMN_WIDTH}px`,
      '440px',
      `${DEFAULT_COLUMN_WIDTH}px`,
    ]);
  });

  it('falls back to the default when a persisted preference is not usable (GC-09)', () => {
    const { container } = renderBoard({ todo: Number.NaN, doing: 9999 });
    const columns = Array.from(container.querySelectorAll<HTMLElement>('.kanban-column'));

    for (const column of columns) {
      expect(column.style.width).toBe(`${DEFAULT_COLUMN_WIDTH}px`);
    }
  });

  it('keeps all columns inside the board scroll container (GC-10)', () => {
    const { container } = renderBoard();
    const grid = container.querySelector('.kanban-board-grid');

    expect(grid).toBeInTheDocument();
    expect(container.querySelectorAll('.kanban-column')).toHaveLength(
      board.columns.length
    );
  });
});
