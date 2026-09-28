import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Task } from '../../src/components/Task';
import { TaskModel } from '../../src/types/kanban';

/**
 * Feature 027 · US1 (T005) — gestão de subtarefas diretamente no cartão:
 * criação inline, alternância de conclusão, remoção e contador de progresso.
 */
describe('Task — subtarefas inline (US1 / T005)', () => {
  const baseTask: TaskModel = {
    id: 't1',
    title: 'Cartão com subtarefas',
    column: 'todo',
    createdAt: '2026-09-28T10:00:00.000Z',
    subtasks: [
      { id: 's1', title: 'Passo 1', completed: false },
      { id: 's2', title: 'Passo 2', completed: true },
    ],
  };

  const renderTask = (onUpdateTask = vi.fn()) => {
    const utils = render(
      <Task
        task={baseTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onUpdateTask={onUpdateTask}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Detalhes/i }));
    return { ...utils, onUpdateTask };
  };

  it('shows the derived progress counter', () => {
    renderTask();
    expect(screen.getByText('1/2 · 50%')).toBeInTheDocument();
  });

  it('creates a subtask from the card (non-empty title)', () => {
    const { onUpdateTask } = renderTask();

    fireEvent.change(screen.getByLabelText('Nova subtarefa'), { target: { value: 'Passo 3' } });
    fireEvent.click(screen.getByLabelText('Adicionar subtarefa'));

    expect(onUpdateTask).toHaveBeenCalledTimes(1);
    const [id, patch] = onUpdateTask.mock.calls[0];
    expect(id).toBe('t1');
    expect(patch.subtasks).toHaveLength(3);
    expect(patch.subtasks[2]).toMatchObject({ title: 'Passo 3', completed: false });
  });

  it('does not create a subtask from a blank title', () => {
    const { onUpdateTask } = renderTask();

    fireEvent.change(screen.getByLabelText('Nova subtarefa'), { target: { value: '   ' } });
    fireEvent.submit(screen.getByLabelText('Nova subtarefa').closest('form')!);

    expect(onUpdateTask).not.toHaveBeenCalled();
  });

  it('toggles a subtask completion', () => {
    const { onUpdateTask } = renderTask();

    fireEvent.click(screen.getByLabelText('Alternar subtarefa: Passo 1'));

    expect(onUpdateTask).toHaveBeenCalledTimes(1);
    const patch = onUpdateTask.mock.calls[0][1];
    expect(patch.subtasks[0]).toMatchObject({ id: 's1', completed: true });
    expect(patch.subtasks[1]).toMatchObject({ id: 's2', completed: true });
  });

  it('removes a subtask without comments (no confirmation)', () => {
    const { onUpdateTask } = renderTask();

    fireEvent.click(screen.getByLabelText('Excluir subtarefa: Passo 1'));

    expect(onUpdateTask).toHaveBeenCalledTimes(1);
    const patch = onUpdateTask.mock.calls[0][1];
    expect(patch.subtasks.map((s: { id: string }) => s.id)).toEqual(['s2']);
  });
});
