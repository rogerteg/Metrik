import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { TaskDetailsModal } from '../../src/components/TaskDetailsModal';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';
import { TaskModel, ColumnModel } from '../../src/types/kanban';
import { User } from '../../src/types/team';

const users: User[] = [
  { id: 'u1', name: 'Ana Silva', email: 'ana@metrik.dev', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u2', name: 'Carlos Souza', email: 'carlos@metrik.dev', createdAt: '2026-01-01T00:00:00Z' },
];

const columns: ColumnModel[] = [
  { id: 'col-progress', title: 'Em Progresso', category: 'in_progress', wipLimit: null, colorScheme: 'progress', color: '#38bdf8' },
];

const task: TaskModel = {
  id: 'task-assignee-1',
  title: 'Tarefa com responsável',
  column: 'col-progress',
  createdAt: '2026-09-01T10:00:00Z',
};

describe('Task assignee & status (Feature 037 - Phase 8 / T020, T025)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders status badge and assignee selector, updating the assignee', () => {
    const onUpdateTask = vi.fn();
    render(
      <TaskDetailsModal
        task={task}
        isOpen={true}
        onClose={vi.fn()}
        onUpdateTask={onUpdateTask}
        columns={columns}
        users={users}
      />
    );

    // Status badge (FR-007)
    expect(screen.getByTitle('Status atual: Em Progresso')).toBeInTheDocument();

    // Assignee selector (FR-007)
    const select = screen.getByLabelText('Responsável');
    fireEvent.change(select, { target: { value: 'Ana Silva' } });

    expect(onUpdateTask).toHaveBeenCalledWith('task-assignee-1', { assignee: 'Ana Silva' });
  });

  it('records assignment and unassignment audit events in useTaskCollection (FR-006)', () => {
    const { result } = renderHook(() => useTaskCollection('board-assignee'));

    let created!: TaskModel;
    act(() => {
      created = result.current.addTask('col-todo', 'Tarefa auditoria responsável');
    });

    act(() => {
      result.current.updateTask(created.id, { assignee: 'Ana Silva' });
    });

    let updated = Object.values(result.current.board.tasks).flat().find((t) => t.id === created.id);
    expect(updated?.assignee).toBe('Ana Silva');
    const assignmentEvent = updated?.activityLog?.find((e) => e.eventType === 'assignment');
    expect(assignmentEvent).toBeDefined();
    expect(assignmentEvent?.toValue).toBe('Ana Silva');

    act(() => {
      result.current.updateTask(created.id, { assignee: undefined });
    });

    updated = Object.values(result.current.board.tasks).flat().find((t) => t.id === created.id);
    expect(updated?.assignee).toBeUndefined();
    const unassignmentEvent = updated?.activityLog?.find((e) => e.eventType === 'unassignment');
    expect(unassignmentEvent).toBeDefined();
    expect(unassignmentEvent?.fromValue).toBe('Ana Silva');
  });
});
