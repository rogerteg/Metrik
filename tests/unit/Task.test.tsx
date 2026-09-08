import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Task } from '../../src/components/Task';
import { ColumnType, TaskModel } from '../../src/types/kanban';

const mockTask: TaskModel = {
  id: 'task-test-01',
  title: 'Implementar Persistência Local',
  column: ColumnType.IN_PROGRESS,
  createdAt: '2026-09-08T12:00:00.000Z',
};

describe('Task Component (US2 & US4)', () => {
  it('renders task content and inline textarea', () => {
    render(
      <Task
        task={mockTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    const textarea = screen.getByDisplayValue('Implementar Persistência Local');
    expect(textarea).toBeInTheDocument();
  });

  it('calls onUpdateTitle when user edits text', () => {
    const handleUpdate = vi.fn();
    render(
      <Task
        task={mockTask}
        onUpdateTitle={handleUpdate}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    const textarea = screen.getByDisplayValue('Implementar Persistência Local');
    fireEvent.change(textarea, { target: { value: 'Novo título editado' } });

    expect(handleUpdate).toHaveBeenCalledWith('task-test-01', 'Novo título editado');
  });

  it('calls onDiscardIfEmpty when blurred with empty content (FR-013)', () => {
    const handleDiscard = vi.fn();
    const emptyTask: TaskModel = {
      id: 'task-empty',
      title: '   ',
      column: ColumnType.TO_DO,
      createdAt: '2026-09-08T12:00:00.000Z',
    };

    render(
      <Task
        task={emptyTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={handleDiscard}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.blur(textarea);

    expect(handleDiscard).toHaveBeenCalledWith('task-empty');
  });

  it('calls onDelete when delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(
      <Task
        task={mockTask}
        onUpdateTitle={vi.fn()}
        onDelete={handleDelete}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /excluir tarefa/i });
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith('task-test-01');
  });

  it('renders directional step navigation buttons when navigation callbacks are provided', () => {
    const handleMoveLeft = vi.fn();
    const handleMoveRight = vi.fn();

    render(
      <Task
        task={mockTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onMoveLeft={handleMoveLeft}
        onMoveRight={handleMoveRight}
        canMoveLeft={true}
        canMoveRight={true}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /mover para coluna anterior/i });
    const nextBtn = screen.getByRole('button', { name: /mover para próxima coluna/i });

    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();

    fireEvent.click(prevBtn);
    expect(handleMoveLeft).toHaveBeenCalledWith('task-test-01');

    fireEvent.click(nextBtn);
    expect(handleMoveRight).toHaveBeenCalledWith('task-test-01');
  });
});
