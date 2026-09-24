import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskActivityLogList } from '../../src/components/TaskActivityLogList.tsx';
import { ActivityLogEntry } from '../../src/types/taskActivity';

describe('TaskActivityLogList', () => {
  const createLogs = (count: number): ActivityLogEntry[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `log-${i + 1}`,
      taskId: 'task-100',
      actorName: `User ${i + 1}`,
      type: 'creation',
      actionText: `User ${i + 1} realizou a ação ${i + 1}`,
      timestamp: `2026-06-26T10:${10 + i}:00.000Z`,
    }));
  };

  it('renders empty state message when entries list is empty', () => {
    render(
      <TaskActivityLogList
        entries={[]}
        isExpanded={false}
        onToggleExpand={vi.fn()}
      />
    );
    expect(screen.getByText('Nenhuma atividade registrada ainda')).toBeInTheDocument();
  });

  it('renders up to 5 items initially without showing collapse toggle when entries <= 5', () => {
    const logs = createLogs(3);
    render(
      <TaskActivityLogList
        entries={logs}
        isExpanded={false}
        onToggleExpand={vi.fn()}
      />
    );

    expect(screen.getByText(/User 1 criou esta tarefa/)).toBeInTheDocument();
    expect(screen.getByText(/User 3 criou esta tarefa/)).toBeInTheDocument();
    expect(screen.queryByText(/Mostrar mais/)).not.toBeInTheDocument();
  });

  it('shows "> Mostrar mais" accordion button when entries count > 5 and isExpanded is false', () => {
    const logs = createLogs(8);
    const onToggleExpand = vi.fn();
    render(
      <TaskActivityLogList
        entries={logs}
        isExpanded={false}
        onToggleExpand={onToggleExpand}
      />
    );

    expect(screen.getByText(/Mostrar mais/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Mostrar mais/));
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
  });

  it('shows "Mostrar menos" accordion button when isExpanded is true', () => {
    const logs = createLogs(8);
    render(
      <TaskActivityLogList
        entries={logs}
        isExpanded={true}
        onToggleExpand={vi.fn()}
      />
    );

    expect(screen.getByText(/Mostrar menos/)).toBeInTheDocument();
  });
});
