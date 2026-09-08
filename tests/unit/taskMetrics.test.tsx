import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Task } from '../../src/components/Task';
import { ColumnType, TaskModel } from '../../src/types/kanban';

describe('Task Metrics Rendering (T013)', () => {
  it('renders Lead Time and Cycle Time badges for completed task', () => {
    const completedTask: TaskModel = {
      id: 'task-done',
      title: 'Tarefa Concluída com Sucesso',
      column: ColumnType.COMPLETED,
      createdAt: '2026-09-08T10:00:00.000Z',
      startedAt: '2026-09-08T10:15:00.000Z',
      completedAt: '2026-09-08T11:00:00.000Z',
    };

    render(
      <Task
        task={completedTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    // 10:00 to 11:00 = 1h 00m
    expect(screen.getByText(/Lead: 1h 00m/i)).toBeInTheDocument();
    // 10:15 to 11:00 = 45m
    expect(screen.getByText(/Cycle: 45m/i)).toBeInTheDocument();
  });

  it('does NOT render Lead Time and Cycle Time badges for non-completed task', () => {
    const inProgressTask: TaskModel = {
      id: 'task-prog',
      title: 'Tarefa em Execução',
      column: ColumnType.IN_PROGRESS,
      createdAt: '2026-09-08T10:00:00.000Z',
      startedAt: '2026-09-08T10:15:00.000Z',
    };

    render(
      <Task
        task={inProgressTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    expect(screen.queryByText(/Lead:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cycle:/i)).not.toBeInTheDocument();
  });
});
