import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityLogItem } from '../../src/components/ActivityLogItem';
import { TaskActivityLog, TaskActivityEventType } from '../../src/types/taskActivity';

describe('ActivityLogItem Component (Feature 034 - Activity Timeline)', () => {
  const createActivity = (
    eventType: TaskActivityEventType,
    overrides?: Partial<TaskActivityLog>,
  ): TaskActivityLog => ({
    id: `act-${eventType}`,
    taskId: 'task-100',
    eventType,
    userId: 'user-1',
    userName: 'Ana Silva',
    timestamp: '2026-10-25T14:30:00Z',
    description: `Evento de teste para ${eventType}`,
    ...overrides,
  });

  const eventTypeLabels: Array<{ type: TaskActivityEventType; label: string }> = [
    { type: 'moved', label: 'Movimentação' },
    { type: 'blocked', label: 'Impedimento' },
    { type: 'unblocked', label: 'Desbloqueio' },
    { type: 'priority_changed', label: 'Prioridade' },
    { type: 'tags_changed', label: 'Etiqueta' },
    { type: 'dates_changed', label: 'Data' },
    { type: 'comment_added', label: 'Comentário' },
    { type: 'comment_deleted', label: 'Comentário' },
    { type: 'assignment', label: 'Responsável' },
    { type: 'unassignment', label: 'Responsável' },
    { type: 'edited', label: 'Sistema' },
  ];

  it.each(eventTypeLabels)(
    'renders correctly with badge and icon for $type event type',
    ({ type, label }) => {
      const activity = createActivity(type);
      render(<ActivityLogItem activity={activity} />);

      expect(screen.getByTestId(`activity-log-item-${activity.id}`)).toBeInTheDocument();
      expect(screen.getByText('Ana Silva')).toBeInTheDocument();
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(activity.description)).toBeInTheDocument();
    },
  );

  it('renders diff details when fromValue and toValue are present', () => {
    const activity = createActivity('moved', {
      fromValue: 'Em Progresso',
      toValue: 'Concluído',
    });
    render(<ActivityLogItem activity={activity} />);

    const diffCard = screen.getByTestId('activity-diff-card');
    expect(diffCard).toBeInTheDocument();
    expect(screen.getByText('Em Progresso')).toBeInTheDocument();
    expect(screen.getByText('➔')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('applies compact styling modifier when compact is true', () => {
    const activity = createActivity('edited');
    render(<ActivityLogItem activity={activity} compact={true} />);

    const item = screen.getByTestId(`activity-log-item-${activity.id}`);
    expect(item).toHaveClass('mrf-log--compact');
  });
});
