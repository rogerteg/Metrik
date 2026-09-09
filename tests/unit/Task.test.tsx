import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Task } from '../../src/components/Task';
import { TaskModel } from '../../src/types/kanban';

const mockTask: TaskModel = {
  id: 'task-test-01',
  title: 'Implementar Persistência Local',
  column: 'in-progress',
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
      column: 'todo',
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

  it('renders PriorityBadge and triggers onUpdatePriority on change', () => {
    const handleUpdatePriority = vi.fn();
    const taskWithPriority: TaskModel = {
      ...mockTask,
      priority: 'high',
    };

    render(
      <Task
        task={taskWithPriority}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onUpdatePriority={handleUpdatePriority}
      />
    );

    const badge = screen.getByRole('button', { name: /prioridade: alta/i });
    expect(badge).toBeInTheDocument();

    fireEvent.click(badge);
    fireEvent.click(screen.getByText('Urgente'));

    expect(handleUpdatePriority).toHaveBeenCalledWith('task-test-01', 'urgent');
  });

  it('renders TagList and triggers onAddTag and onRemoveTag', () => {
    const handleAddTag = vi.fn();
    const handleRemoveTag = vi.fn();
    const taskWithTags: TaskModel = {
      ...mockTask,
      tags: ['Bug', 'UI'],
    };

    render(
      <Task
        task={taskWithTags}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
    );

    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('UI')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /remover tag bug/i });
    fireEvent.click(removeBtn);

    expect(handleRemoveTag).toHaveBeenCalledWith('task-test-01', 'Bug');

    const addBtn = screen.getByRole('button', { name: /adicionar tag/i });
    fireEvent.click(addBtn);

    const input = screen.getByPlaceholderText(/nova tag/i);
    fireEvent.change(input, { target: { value: 'Docs' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleAddTag).toHaveBeenCalledWith('task-test-01', 'Docs');
  });

  it('renders visual indicators for description and subtasks', () => {
    const taskWithIndicators: TaskModel = {
      ...mockTask,
      description: 'Test description',
      subtasks: [
        { id: '1', title: 'Sub 1', completed: true },
        { id: '2', title: 'Sub 2', completed: false }
      ]
    };

    render(
      <Task
        task={taskWithIndicators}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    const badges = screen.getAllByRole('generic').filter(el => el.classList.contains('task-indicator-badge'));
    expect(badges.length).toBe(2);
    
    // Check if the subtasks text is present
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('renders visual indicator for due date', () => {
    // 2030 is safely in the future so it gets "normal" status
    const taskWithDueDate: TaskModel = {
      ...mockTask,
      dueDate: '2030-10-15',
    };

    render(
      <Task
        task={taskWithDueDate}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    const badges = screen.getAllByRole('generic').filter(el => el.classList.contains('task-indicator-badge'));
    expect(badges.length).toBe(1);
    
    // Using formatDateShort('2030-10-15') gives '15 Out' or '15/10' depending on locale
    // We just check if it contains '15' which is the day
    expect(screen.getByText(/15/)).toBeInTheDocument();
    
    // Check if it has the correct color class
    expect(badges[0].classList.contains('due-date-normal')).toBe(true);
  });

  it('calls onClick when clicking on the card body', () => {
    const handleClick = vi.fn();
    render(
      <Task
        task={mockTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onClick={handleClick}
      />
    );

    const article = screen.getByRole('article');
    fireEvent.click(article);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});


