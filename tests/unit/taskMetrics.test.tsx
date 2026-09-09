import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Task } from '../../src/components/Task';
import { TaskModel } from '../../src/types/kanban';

describe('Task Metrics Rendering (T013)', () => {
  it('renders Lead Time and Cycle Time badges for completed task', () => {
    const task: TaskModel = {
      id: 'task-done',
      title: 'Tarefa Concluída com Sucesso',
      column: 'completed',
      createdAt: '2026-09-08T10:00:00.000Z',
      startedAt: '2026-09-08T10:15:00.000Z',
      completedAt: '2026-09-08T10:45:00.000Z',
    };

    render(
      <Task
        task={task}
        isCompleted={true}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    // Lead time: 45m, Cycle time: 30m
    expect(screen.getByText('Lead: 45m')).toBeInTheDocument();
    expect(screen.getByText('Cycle: 30m')).toBeInTheDocument();
  });

  it('does NOT render Lead Time and Cycle Time badges for non-completed task', () => {
    const task: TaskModel = {
      id: 'task-prog',
      title: 'Tarefa em Execução',
      column: 'in-progress',
      createdAt: '2026-09-08T10:00:00.000Z',
      startedAt: '2026-09-08T10:15:00.000Z',
    };

    render(
      <Task
        task={task}
        isCompleted={false}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    expect(screen.queryByText(/Lead:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cycle:/)).not.toBeInTheDocument();
  });
});
