import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskFlowMetricsPanel } from '../../src/components/TaskFlowMetricsPanel';
import { TaskModel } from '../../src/types/kanban';

describe('TaskFlowMetricsPanel Component', () => {
  const baseTask: TaskModel = {
    id: 't-1',
    title: 'Migrate DB to Cloud',
    column: 'in_progress',
    createdAt: '2026-10-01T10:00:00Z',
    startedAt: '2026-10-02T10:00:00Z',
    dueDate: '2026-10-30',
    type: 'card',
    subtasks: [
      { id: 'st-1', title: 'Write SQL script', completed: true },
      { id: 'st-2', title: 'Run migrations', completed: false },
    ],
    comments: [
      {
        id: 'c-1',
        taskId: 't-1',
        userId: 'u-1',
        userName: 'Roger',
        text: 'Decided on Supabase auth',
        createdAt: '2026-10-02T11:00:00Z',
        isDecision: true,
      },
      {
        id: 'c-2',
        taskId: 't-1',
        userId: 'u-2',
        userName: 'Mika',
        text: 'Looking good',
        createdAt: '2026-10-02T12:00:00Z',
        isDecision: false,
      },
    ],
    activityLog: [
      {
        id: 'a-1',
        taskId: 't-1',
        eventType: 'moved',
        userId: 'u-1',
        userName: 'Roger',
        fromValue: 'todo',
        toValue: 'in_progress',
        timestamp: '2026-10-02T10:00:00Z',
        description: 'Moved to in_progress',
      },
    ],
    links: [
      {
        id: 'link-1',
        targetTaskId: 't-0',
        targetBoardId: 'board-1',
        targetTeamId: 'team-1',
        relationType: 'relates_to',
        createdAt: '2026-10-01T10:00:00Z',
      },
    ],
  };

  it('renders lead time, cycle time, blocked time and age metrics cards for running task', () => {
    render(<TaskFlowMetricsPanel task={baseTask} currentColumnTitle="In Progress" />);

    expect(screen.getByText('Lead Time')).toBeInTheDocument();
    expect(screen.getByText('Cycle Time')).toBeInTheDocument();
    expect(screen.getByText('Tempo Bloqueado')).toBeInTheDocument();
    expect(screen.getByText('Idade do Cartão')).toBeInTheDocument();
    expect(screen.getByText('na coluna "In Progress"')).toBeInTheDocument();
    expect(screen.getByText('sem impedimentos ativos')).toBeInTheDocument();
  });

  it('renders completed metrics and completed dates when task is finished', () => {
    const completedTask: TaskModel = {
      ...baseTask,
      column: 'done',
      completedAt: '2026-10-05T15:00:00Z',
    };

    render(<TaskFlowMetricsPanel task={completedTask} />);

    expect(screen.getByText('criação → conclusão')).toBeInTheDocument();
    expect(screen.getByText('início → conclusão')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('renders overdue badge when dueDate is in the past and task is not completed', () => {
    const overdueTask: TaskModel = {
      ...baseTask,
      dueDate: '2020-01-01',
      completedAt: undefined,
    };

    render(<TaskFlowMetricsPanel task={overdueTask} />);

    expect(screen.getByText('atrasada')).toBeInTheDocument();
  });

  it('renders active blocker indicator when task.blocked is true with blocked time', () => {
    const blockedTask: TaskModel = {
      ...baseTask,
      blocked: true,
      blockedReason: 'Waiting for credentials',
      blockedAt: '2026-10-02T11:00:00Z',
    };

    render(<TaskFlowMetricsPanel task={blockedTask} pendingBlockersCount={2} />);

    expect(screen.getByText('impedida no momento')).toBeInTheDocument();
  });

  it('renders checklist progress counters and summary metrics', () => {
    render(<TaskFlowMetricsPanel task={baseTask} />);

    expect(screen.getByText('Checklist')).toBeInTheDocument();
    expect(screen.getByText('1/2 · 50%')).toBeInTheDocument();
    expect(screen.getByText('Composição da Tarefa')).toBeInTheDocument();
    expect(screen.getByText('Decisões')).toBeInTheDocument();
    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByText('Vínculos')).toBeInTheDocument();
  });

  it('handles empty dates, invalid dates and missing subtasks gracefully', () => {
    const emptyTask: TaskModel = {
      id: 't-empty',
      title: 'Empty Task',
      column: 'todo',
      createdAt: 'invalid-date',
    };

    render(<TaskFlowMetricsPanel task={emptyTask} />);

    expect(screen.getByText('Lead Time')).toBeInTheDocument();
    expect(screen.getByText('ainda não iniciado')).toBeInTheDocument();
    expect(screen.queryByText('Checklist')).not.toBeInTheDocument();
  });
});
