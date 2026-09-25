import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskDetailsModal } from '../../src/components/TaskDetailsModal';
import { TaskModel } from '../../src/types/kanban';

describe('TaskDetailsModal Redesign', () => {
  const sampleTask: TaskModel = {
    id: 'task-100',
    title: 'Implementar Redesign da Modal',
    description: 'Descrição objetiva da tarefa.',
    column: 'in_progress',
    createdAt: '2026-06-26T10:26:00.000Z',
    priority: 'high',
    tags: ['UI', 'Redesign'],
    comments: [
      {
        id: 'cmt-1',
        taskId: 'task-100',
        userId: 'usr-1',
        userName: 'Luis Eduardo Ferreira Santos',
        text: 'Criou esta tarefa',
        createdAt: '2026-06-26T10:26:00.000Z',
      },
    ],
    activityLog: [
      {
        id: 'act-1',
        taskId: 'task-100',
        userId: 'usr-1',
        userName: 'Luis Eduardo Ferreira Santos',
        eventType: 'created',
        description: 'Luis Eduardo Ferreira Santos criou esta tarefa',
        timestamp: '2026-06-26T10:26:00.000Z',
      },
    ],
  };

  const defaultProps = {
    task: sampleTask,
    isOpen: true,
    onClose: vi.fn(),
    onUpdateTask: vi.fn(),
    onAddComment: vi.fn(),
    onDeleteComment: vi.fn(),
  };

  it('renders title input, metadata sidebar, and section tabs', () => {
    render(<TaskDetailsModal {...defaultProps} />);

    expect(screen.getByDisplayValue('Implementar Redesign da Modal')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Visão Geral/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Atividade/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Métricas/i })).toBeInTheDocument();
  });

  it('allows adding a new comment through the Activity tab', () => {
    const onAddComment = vi.fn();
    render(<TaskDetailsModal {...defaultProps} onAddComment={onAddComment} />);

    fireEvent.click(screen.getByRole('tab', { name: /Atividade/i }));

    const commentInput = screen.getByPlaceholderText(/Escreva um comentário/i);
    fireEvent.change(commentInput, { target: { value: 'Novo comentário enviado' } });

    const submitBtn = screen.getByTestId('comment-submit-button');
    fireEvent.click(submitBtn);

    expect(onAddComment).toHaveBeenCalledWith('task-100', 'Novo comentário enviado', false);
  });
});
