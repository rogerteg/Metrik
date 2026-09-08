import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Column } from '../../src/components/Column';
import { ColumnType } from '../../src/types/kanban';

describe('Column Component (US1)', () => {
  it('renders column title and badge correctly for Todo', () => {
    render(
      <Column
        type={ColumnType.TO_DO}
        title="Todo"
        count={3}
        onAddTask={vi.fn()}
      >
        <div>Task 1</div>
      </Column>
    );

    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('renders blocked column with alert styling badge', () => {
    const { container } = render(
      <Column
        type={ColumnType.BLOCKED}
        title="Blocked"
        count={1}
        onAddTask={vi.fn()}
      >
        <div>Blocked Task</div>
      </Column>
    );

    const badge = screen.getByText('Blocked');
    expect(badge).toHaveClass('badge-blocked');
    expect(container.querySelector('.kanban-column-blocked')).toBeInTheDocument();
  });

  it('triggers onAddTask when the + button is clicked', () => {
    const handleAddTask = vi.fn();
    render(
      <Column
        type={ColumnType.IN_PROGRESS}
        title="In Progress"
        count={0}
        onAddTask={handleAddTask}
      />
    );

    const addBtn = screen.getByRole('button', { name: /adicionar tarefa em In Progress/i });
    fireEvent.click(addBtn);

    expect(handleAddTask).toHaveBeenCalledTimes(1);
    expect(handleAddTask).toHaveBeenCalledWith(ColumnType.IN_PROGRESS);
  });
});
