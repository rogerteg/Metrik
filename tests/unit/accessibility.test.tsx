import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import type { AxeResults } from 'axe-core';
import { Task } from '../../src/components/Task';
import { CommentThread } from '../../src/components/CommentThread';
import { Column } from '../../src/components/Column';
import { SprintBar } from '../../src/components/SprintBar';
import { SprintManagerModal } from '../../src/components/SprintManagerModal';
import { TaskModel, ColumnModel } from '../../src/types/kanban';
import { TaskComment } from '../../src/types/taskActivity';

expect.extend(toHaveNoViolations);

/**
 * P3 — Auditoria de acessibilidade WCAG 2.1 AA das superfícies novas/centrais.
 * Regras de página (title/lang/landmarks) são desativadas: testamos componentes
 * isolados, não um documento completo.
 */
const runAxe = async (container: HTMLElement): Promise<AxeResults> =>
  axe(container, {
    rules: {
      region: { enabled: false },
      'landmark-one-main': { enabled: false },
      'page-has-heading-one': { enabled: false },
      'document-title': { enabled: false },
      'html-has-lang': { enabled: false },
    },
  });

const comment: TaskComment = {
  id: 'c1',
  taskId: 't1',
  userId: 'usr_default',
  userName: 'Rogerio Teixeira',
  text: 'comentário de teste',
  createdAt: '2026-09-28T10:00:00.000Z',
};

const task: TaskModel = {
  id: 't1',
  title: 'Cartão acessível',
  column: 'todo',
  createdAt: '2026-09-28T10:00:00.000Z',
  tags: ['frontend'],
  subtasks: [{ id: 's1', title: 'Passo 1', completed: false, comments: [comment] }],
  comments: [comment],
};

const column: ColumnModel = {
  id: 'todo',
  title: 'A Fazer',
  category: 'todo',
  wipLimit: null,
  colorScheme: 'todo',
};

describe('Acessibilidade (WCAG 2.1 AA) — Feature 027 / núcleo', () => {
  it('CommentThread has no violations', async () => {
    const { container } = render(
      <CommentThread
        comments={[comment]}
        currentUser={{ id: 'usr_default', name: 'Rogerio Teixeira' }}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('Task card (read-only) has no violations', async () => {
    const { container } = render(
      <Task
        task={task}
        isReadOnly
        onUpdateTitle={() => {}}
        onDelete={() => {}}
        onDiscardIfEmpty={() => {}}
      />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('Column surface has no violations', async () => {
    const { container } = render(
      <Column column={column} count={1}>
        <div />
      </Column>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('Task card (editable, drawer open) has no violations', async () => {
    const { container } = render(
      <Task
        task={task}
        onUpdateTitle={() => {}}
        onDelete={() => {}}
        onDiscardIfEmpty={() => {}}
        onUpdateTask={() => {}}
        onAddComment={() => {}}
        onEditComment={() => {}}
        onDeleteComment={() => {}}
        onAddSubtaskComment={() => {}}
        onEditSubtaskComment={() => {}}
        onDeleteSubtaskComment={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Detalhes/i }));
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('SprintBar has no violations', async () => {
    const { container } = render(
      <SprintBar
        sprints={[
          { id: 'sp1', name: 'Sprint 1', status: 'active', createdAt: '2026-09-01T00:00:00.000Z' },
        ]}
        activeSprintId="sp1"
        tasks={[]}
        onOpenManager={() => {}}
      />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('SprintManagerModal has no violations', async () => {
    const { container } = render(
      <SprintManagerModal
        isOpen
        onClose={() => {}}
        sprints={[
          { id: 'sp1', name: 'Sprint 1', status: 'active', createdAt: '2026-09-01T00:00:00.000Z' },
        ]}
        activeSprintId="sp1"
        tasks={[]}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        onStart={() => {}}
        onComplete={() => {}}
      />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
