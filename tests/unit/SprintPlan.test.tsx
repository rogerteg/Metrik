import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SprintBar } from '../../src/components/SprintBar';
import { SprintManagerModal } from '../../src/components/SprintManagerModal';
import { Task } from '../../src/components/Task';
import { SprintModel, TaskModel } from '../../src/types/kanban';

/**
 * Feature 038 — UI de sprints: barra (progresso/velocity), gerenciador (CRUD/ativar/concluir)
 * e chip no cartão.
 */
const sprint = (over: Partial<SprintModel> = {}): SprintModel => ({
  id: 'sp1',
  name: 'Sprint 1',
  status: 'planned',
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

describe('SprintBar (Feature 038)', () => {
  it('shows an empty state without an active sprint', () => {
    render(<SprintBar sprints={[sprint()]} activeSprintId={null} tasks={[]} />);
    expect(screen.getByTestId('sprint-none')).toBeInTheDocument();
    expect(screen.queryByTestId('sprint-progress')).toBeNull();
  });

  it('renders progress and velocity for the active sprint', () => {
    const active = sprint({ status: 'active' });
    const tasks = [
      task({ id: 'a', sprintId: 'sp1', completedAt: '2026-09-05T00:00:00.000Z' }),
      task({ id: 'b', sprintId: 'sp1' }),
      task({ id: 'c' }), // fora da sprint
    ];
    render(<SprintBar sprints={[active]} activeSprintId="sp1" tasks={tasks} />);

    expect(screen.getByTestId('sprint-active-name')).toHaveTextContent('Sprint 1');
    expect(screen.getByTestId('sprint-numbers')).toHaveTextContent('1/2 · 50%');
    expect(screen.getByTestId('sprint-velocity')).toHaveTextContent('Velocity: 1');
  });
});

describe('SprintManagerModal (Feature 038)', () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  const noop = () => {};

  it('creates a sprint from the form', () => {
    const onAdd = vi.fn();
    render(
      <SprintManagerModal
        isOpen
        onClose={noop}
        sprints={[]}
        tasks={[]}
        onAdd={onAdd}
        onUpdate={noop}
        onDelete={noop}
        onStart={noop}
        onComplete={noop}
      />,
    );

    fireEvent.change(screen.getByTestId('sprint-create-name'), {
      target: { value: 'Nova Sprint' },
    });
    fireEvent.click(screen.getByTestId('sprint-create-submit'));

    expect(onAdd).toHaveBeenCalledWith({
      name: 'Nova Sprint',
      goal: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('activates a planned sprint and completes an active one', () => {
    const onStart = vi.fn();
    const onComplete = vi.fn();
    const { rerender } = render(
      <SprintManagerModal
        isOpen
        onClose={noop}
        sprints={[sprint({ id: 'sp1', status: 'planned' })]}
        tasks={[]}
        onAdd={noop}
        onUpdate={noop}
        onDelete={noop}
        onStart={onStart}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByTestId('sprint-activate-sp1'));
    expect(onStart).toHaveBeenCalledWith('sp1');

    rerender(
      <SprintManagerModal
        isOpen
        onClose={noop}
        sprints={[sprint({ id: 'sp1', status: 'active' })]}
        activeSprintId="sp1"
        tasks={[]}
        onAdd={noop}
        onUpdate={noop}
        onDelete={noop}
        onStart={onStart}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByTestId('sprint-complete-sp1'));
    expect(onComplete).toHaveBeenCalledWith('sp1');
  });

  it('deletes a sprint after confirmation', () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <SprintManagerModal
        isOpen
        onClose={noop}
        sprints={[sprint({ id: 'sp1' })]}
        tasks={[]}
        onAdd={noop}
        onUpdate={noop}
        onDelete={onDelete}
        onStart={noop}
        onComplete={noop}
      />,
    );

    fireEvent.click(screen.getByTestId('sprint-delete-sp1'));
    expect(onDelete).toHaveBeenCalledWith('sp1');
  });

  it('offers no write actions in read-only mode', () => {
    render(
      <SprintManagerModal
        isOpen
        onClose={noop}
        sprints={[sprint({ id: 'sp1', status: 'active' })]}
        activeSprintId="sp1"
        tasks={[]}
        isReadOnly
        onAdd={noop}
        onUpdate={noop}
        onDelete={noop}
        onStart={noop}
        onComplete={noop}
      />,
    );

    expect(screen.queryByTestId('sprint-create-name')).toBeNull();
    expect(screen.queryByTestId('sprint-activate-sp1')).toBeNull();
    expect(screen.queryByTestId('sprint-complete-sp1')).toBeNull();
    expect(screen.getByTestId('sprint-status-sp1')).toHaveTextContent('Ativa');
  });

  it('shows per-sprint progress', () => {
    const tasks = [
      task({ id: 'a', sprintId: 'sp1', completedAt: '2026-09-05T00:00:00.000Z' }),
      task({ id: 'b', sprintId: 'sp1' }),
    ];
    render(
      <SprintManagerModal
        isOpen
        onClose={noop}
        sprints={[sprint({ id: 'sp1', status: 'active' })]}
        activeSprintId="sp1"
        tasks={tasks}
        onAdd={noop}
        onUpdate={noop}
        onDelete={noop}
        onStart={noop}
        onComplete={noop}
      />,
    );

    expect(screen.getByTestId('sprint-progress-sp1')).toHaveTextContent('1/2 · 50%');
  });
});

describe('Task sprint chip (Feature 038)', () => {
  it('shows the sprint chip when the task belongs to a sprint', () => {
    render(
      <Task
        task={task()}
        sprintName="Sprint 1"
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />,
    );
    expect(screen.getByTestId('task-sprint-chip')).toHaveTextContent('Sprint 1');
  });

  it('does not show the chip without a sprint', () => {
    render(
      <Task task={task()} onUpdateTitle={vi.fn()} onDelete={vi.fn()} onDiscardIfEmpty={vi.fn()} />,
    );
    expect(screen.queryByTestId('task-sprint-chip')).toBeNull();
  });
});
