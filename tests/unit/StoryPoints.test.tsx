import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SprintBar } from '../../src/components/SprintBar';
import { SprintManagerModal } from '../../src/components/SprintManagerModal';
import { TaskMetadataSidebar } from '../../src/components/TaskMetadataSidebar';
import { Task } from '../../src/components/Task';
import { SprintModel, TaskModel } from '../../src/types/kanban';

/** Feature 040 — estimativa em pontos e velocity por pontos. */
const sprint = (over: Partial<SprintModel> = {}): SprintModel => ({
  id: 'sp1',
  name: 'Sprint 1',
  status: 'active',
  createdAt: '2026-09-01T00:00:00.000Z',
  ...over,
});

const task = (over: Partial<TaskModel> = {}): TaskModel => ({
  id: 't1',
  title: 'Tarefa',
  column: 'todo',
  createdAt: '2026-09-01T00:00:00.000Z',
  ...over,
});

describe('SprintBar points (Feature 040)', () => {
  it('shows points and points-velocity when estimations exist', () => {
    const tasks = [
      task({ id: 'a', sprintId: 'sp1', estimation: 3, completedAt: '2026-09-05T00:00:00.000Z' }),
      task({ id: 'b', sprintId: 'sp1', estimation: 5 }),
    ];
    render(<SprintBar sprints={[sprint()]} activeSprintId="sp1" tasks={tasks} />);

    expect(screen.getByTestId('sprint-points')).toHaveTextContent('3/8 pts');
    expect(screen.getByTestId('sprint-velocity-points')).toHaveTextContent('Velocity: 3 pts');
  });

  it('omits points when no estimation exists', () => {
    render(
      <SprintBar
        sprints={[sprint()]}
        activeSprintId="sp1"
        tasks={[task({ id: 'a', sprintId: 'sp1' })]}
      />,
    );
    expect(screen.queryByTestId('sprint-points')).toBeNull();
  });
});

describe('SprintManagerModal points (Feature 040)', () => {
  it('includes points in the sprint progress when available', () => {
    const tasks = [
      task({ id: 'a', sprintId: 'sp1', estimation: 3, completedAt: '2026-09-05T00:00:00.000Z' }),
      task({ id: 'b', sprintId: 'sp1', estimation: 5 }),
    ];
    render(
      <SprintManagerModal
        isOpen
        onClose={() => {}}
        sprints={[sprint()]}
        activeSprintId="sp1"
        tasks={tasks}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        onStart={() => {}}
        onComplete={() => {}}
      />,
    );
    expect(screen.getByTestId('sprint-progress-sp1')).toHaveTextContent('1/2');
    expect(screen.getByTestId('sprint-progress-sp1')).toHaveTextContent('3/8 pts');
  });
});

describe('Task estimation chip (Feature 040)', () => {
  it('shows the points chip when the task has an estimation', () => {
    render(
      <Task
        task={task({ estimation: 8 })}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />,
    );
    expect(screen.getByTestId('task-estimation-chip')).toHaveTextContent('8 pts');
  });
});

describe('TaskMetadataSidebar estimation (Feature 040)', () => {
  const renderSidebar = (over: Partial<TaskModel> = {}, isReadOnly = false) => {
    const onUpdateTask = vi.fn();
    render(
      <TaskMetadataSidebar
        task={task(over)}
        isReadOnly={isReadOnly}
        onUpdateTask={onUpdateTask}
        localStartDate=""
        setLocalStartDate={() => {}}
        handleStartDateBlur={() => {}}
        localEndDate=""
        setLocalEndDate={() => {}}
        handleEndDateBlur={() => {}}
        localDueDate=""
        setLocalDueDate={() => {}}
        handleDueDateBlur={() => {}}
      />,
    );
    return onUpdateTask;
  };

  it('writes a valid estimation and clears on empty/invalid input', () => {
    const onUpdateTask = renderSidebar();
    const input = screen.getByTestId('td-estimation');

    fireEvent.change(input, { target: { value: '5' } });
    expect(onUpdateTask).toHaveBeenCalledWith('t1', { estimation: 5 });

    fireEvent.change(input, { target: { value: '0' } });
    expect(onUpdateTask).toHaveBeenCalledWith('t1', { estimation: undefined });
  });

  it('shows a read-only estimate without an input', () => {
    renderSidebar({ estimation: 13 }, true);
    expect(screen.getByTestId('td-estimation-readonly')).toHaveTextContent('13 pts');
    expect(screen.queryByTestId('td-estimation')).toBeNull();
  });
});
