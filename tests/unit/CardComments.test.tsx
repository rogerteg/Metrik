import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Task } from '../../src/components/Task';
import { TaskModel } from '../../src/types/kanban';

/**
 * Feature 027 (delta Modo 2) — UI de comentários no cartão pai e na subtarefa.
 */
describe('Task card comments (Feature 027 delta)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseTask: TaskModel = {
    id: 'task-comments',
    title: 'Cartão com comentários',
    column: 'todo',
    createdAt: '2026-09-28T10:00:00.000Z',
    comments: [
      {
        id: 'c1',
        taskId: 'task-comments',
        userId: 'usr_default',
        userName: 'Rogerio Teixeira',
        text: 'primeiro comentário',
        createdAt: '2026-09-28T10:05:00.000Z',
      },
    ],
  };

  const openDetails = () => {
    fireEvent.click(screen.getByRole('button', { name: /Detalhes/i }));
  };

  it('shows the comment count chip and renders the parent thread when expanded', () => {
    render(
      <Task task={baseTask} onUpdateTitle={vi.fn()} onDelete={vi.fn()} onDiscardIfEmpty={vi.fn()} />
    );

    expect(screen.getByTestId('task-comments-chip')).toHaveTextContent('1');

    openDetails();

    expect(screen.getByTestId('card-comment-thread')).toBeInTheDocument();
    expect(screen.getByTestId('card-comment-text')).toHaveTextContent('primeiro comentário');
    expect(screen.getByTestId('card-comment-author')).toHaveTextContent('Rogerio Teixeira');
  });

  it('calls onAddComment when submitting a new parent comment', () => {
    const onAddComment = vi.fn();
    render(
      <Task
        task={baseTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onAddComment={onAddComment}
      />
    );
    openDetails();

    fireEvent.change(screen.getByTestId('card-comment-input'), {
      target: { value: 'novo comentário' },
    });
    fireEvent.click(screen.getByTestId('card-comment-submit'));

    expect(onAddComment).toHaveBeenCalledWith('task-comments', 'novo comentário');
  });

  it('edits a parent comment through the thread', () => {
    const onEditComment = vi.fn();
    render(
      <Task
        task={baseTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onAddComment={vi.fn()}
        onEditComment={onEditComment}
      />
    );
    openDetails();

    fireEvent.click(screen.getByTestId('card-comment-edit-button-c1'));
    fireEvent.change(screen.getByTestId('card-comment-edit-input-c1'), {
      target: { value: 'revisado' },
    });
    fireEvent.click(screen.getByTestId('card-comment-edit-save-c1'));

    expect(onEditComment).toHaveBeenCalledWith('task-comments', 'c1', 'revisado');
  });

  it('deletes a parent comment after confirmation', () => {
    const onDeleteComment = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <Task
        task={baseTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onAddComment={vi.fn()}
        onEditComment={vi.fn()}
        onDeleteComment={onDeleteComment}
      />
    );
    openDetails();

    fireEvent.click(screen.getByTestId('card-comment-delete-button-c1'));

    expect(window.confirm).toHaveBeenCalled();
    expect(onDeleteComment).toHaveBeenCalledWith('task-comments', 'c1');
  });

  it('hides the composer in read-only mode but still lists comments', () => {
    render(
      <Task task={baseTask} onUpdateTitle={vi.fn()} onDelete={vi.fn()} onDiscardIfEmpty={vi.fn()} />
    );
    openDetails();

    expect(screen.getByTestId('card-comment-text')).toBeInTheDocument();
    expect(screen.queryByTestId('card-comment-input')).toBeNull();
  });

  it('adds a comment to a subtask from its own thread (isolated from the parent)', () => {
    const onAddSubtaskComment = vi.fn();
    const taskWithSubtask: TaskModel = {
      ...baseTask,
      subtasks: [{ id: 's1', title: 'Passo 1', completed: false }],
    };

    render(
      <Task
        task={taskWithSubtask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onUpdateTask={vi.fn()}
        onAddComment={vi.fn()}
        onAddSubtaskComment={onAddSubtaskComment}
      />
    );
    openDetails();

    fireEvent.click(screen.getByTestId('subtask-comments-toggle-s1'));
    fireEvent.change(screen.getByTestId('subtask-comment-s1-input'), {
      target: { value: 'nota do passo' },
    });
    fireEvent.click(screen.getByTestId('subtask-comment-s1-submit'));

    expect(onAddSubtaskComment).toHaveBeenCalledWith('task-comments', 's1', 'nota do passo');
  });

  it('asks for confirmation before removing a subtask that has comments (cascade)', () => {
    const onUpdateTask = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const taskWithComment: TaskModel = {
      ...baseTask,
      subtasks: [
        {
          id: 's1',
          title: 'Passo com comentário',
          completed: false,
          comments: [
            {
              id: 'child',
              taskId: 'task-comments',
              userId: 'usr_default',
              userName: 'Rogerio Teixeira',
              text: 'contexto',
              createdAt: '2026-09-28T10:10:00.000Z',
            },
          ],
        },
      ],
    };

    render(
      <Task
        task={taskWithComment}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onUpdateTask={onUpdateTask}
      />
    );
    openDetails();

    fireEvent.click(screen.getByRole('button', { name: /Excluir subtarefa: Passo com comentário/i }));
    expect(confirmSpy).toHaveBeenCalled();
    expect(onUpdateTask).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: /Excluir subtarefa: Passo com comentário/i }));
    expect(onUpdateTask).toHaveBeenCalledWith('task-comments', { subtasks: [] });
  });
});
