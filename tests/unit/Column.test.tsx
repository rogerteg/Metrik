import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Column } from '../../src/components/Column';
import { ColumnModel } from '../../src/types/kanban';

describe('Column Component (US1)', () => {
  const todoCol: ColumnModel = { id: 'todo', title: 'Todo', category: 'todo', wipLimit: null, colorScheme: 'todo' };
  const inProgressCol: ColumnModel = { id: 'in_progress', title: 'In Progress', category: 'in_progress', wipLimit: null, colorScheme: 'progress' };
  const blockedCol: ColumnModel = { id: 'blocked', title: 'Blocked', category: 'in_progress', wipLimit: null, colorScheme: 'blocked' };

  it('renders column title and badge correctly for Todo', () => {
    render(
      <Column column={todoCol} count={3} />
    );

    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders blocked column with alert styling badge', () => {
    const { container } = render(
      <Column column={blockedCol} count={1} />
    );

    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(container.querySelector('.badge-blocked')).toBeInTheDocument();
  });

  it('triggers onAddTask when the + button is clicked', () => {
    const mockOnAddTask = vi.fn();
    render(
      <Column column={inProgressCol} count={0} onAddTask={mockOnAddTask} />
    );

    const addButton = screen.getByRole('button', { name: /Adicionar tarefa em/i });
    fireEvent.click(addButton);

    expect(mockOnAddTask).toHaveBeenCalledTimes(1);
  });

  it('renders an empty drop zone when count is 0', () => {
    render(
      <Column column={todoCol} count={0} />
    );

    expect(screen.getByText('Arraste um cartão aqui')).toBeInTheDocument();
  });

  it('renders children tasks when count > 0', () => {
    render(
      <Column column={todoCol} count={1}>
        <div data-testid="mock-task">Mock Task</div>
      </Column>
    );

    expect(screen.getByTestId('mock-task')).toBeInTheDocument();
    expect(screen.queryByText('Arraste um cartão aqui')).not.toBeInTheDocument();
  });

  it('allows changing column color via color palette button', () => {
    const handleUpdateColumn = vi.fn();
    render(
      <Column
        column={{ ...inProgressCol, color: '#38bdf8' }}
        count={2}
        onUpdateColumn={handleUpdateColumn}
      />
    );

    const colorButton = screen.getByRole('button', { name: /Alterar cor da coluna/i });
    expect(colorButton).toBeInTheDocument();
    expect(colorButton).toHaveStyle({ backgroundColor: 'rgb(56, 189, 248)' });

    // Open popover
    fireEvent.click(colorButton);
    expect(screen.getByText('Cor da Coluna')).toBeInTheDocument();

    // Select Emerald swatch
    const emeraldSwatch = screen.getByRole('button', { name: 'Cor Emerald' });
    fireEvent.click(emeraldSwatch);

    expect(handleUpdateColumn).toHaveBeenCalledWith('in_progress', { color: '#10b981' });
  });
});
