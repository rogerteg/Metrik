import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Board } from '../../src/components/Board';
import { BoardState } from '../../src/types/kanban';

describe('Team Invitations & Guest Read-Only (US4)', () => {
  const mockBoard: BoardState = {
    columns: [
      { id: 'col-1', title: 'A Fazer', category: 'todo', colorScheme: 'todo', wipLimit: null },
      { id: 'col-2', title: 'Em Progresso', category: 'in_progress', colorScheme: 'progress', wipLimit: 3 },
      { id: 'col-3', title: 'Concluído', category: 'done', colorScheme: 'completed', wipLimit: null },
    ],
    tasks: {
      'col-1': [
        {
          id: 'task-1',
          title: 'Tarefa de Exemplo',
          column: 'col-1',
          priority: 'medium',
          tags: ['frontend'],
          blocked: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      'col-2': [],
      'col-3': [],
    },
  };

  it('renders standard active board controls when not in read-only mode', () => {
    render(
      <Board
        board={mockBoard}
        onAddTask={vi.fn()}
        onOpenNewColumnModal={vi.fn()}
        isReadOnly={false}
      />
    );

    // Should have add task buttons
    const addButtons = screen.getAllByRole('button', { name: /adicionar tarefa/i });
    expect(addButtons.length).toBeGreaterThan(0);

    // Should have add column button
    expect(screen.getByRole('button', { name: /adicionar nova coluna/i })).toBeDefined();
  });

  it('hides add task and add column controls when isReadOnly is true (guest role)', () => {
    render(
      <Board
        board={mockBoard}
        onAddTask={vi.fn()}
        onOpenNewColumnModal={vi.fn()}
        isReadOnly={true}
      />
    );

    // Should NOT have add task buttons
    expect(screen.queryAllByRole('button', { name: /adicionar tarefa/i }).length).toBe(0);

    // Should NOT have add column button
    expect(screen.queryByRole('button', { name: /adicionar nova coluna/i })).toBeNull();

    // Should render guest read-only banner
    expect(screen.getByText(/somente leitura/i)).toBeDefined();
  });
});
