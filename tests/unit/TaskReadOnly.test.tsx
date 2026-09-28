import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Task } from '../../src/components/Task';
import { TaskModel } from '../../src/types/kanban';

/**
 * P1 — Somente leitura por perfil (guest): nenhuma edição "fantasma".
 * Os handlers reais são passados, mas o cartão não deve oferecer escrita quando
 * `isReadOnly` é verdadeiro (FR-016 da feature 027; Princípio VIII).
 */
describe('Task — read-only (guest) não oferece escrita', () => {
  const task: TaskModel = {
    id: 'task-ro',
    title: 'Cartão somente leitura',
    column: 'todo',
    createdAt: '2026-09-28T10:00:00.000Z',
    tags: ['frontend'],
    subtasks: [{ id: 's1', title: 'Passo', completed: false }],
  };

  const noop = () => {};
  const baseProps = {
    onUpdateTitle: noop,
    onDelete: noop,
    onDiscardIfEmpty: noop,
  };

  it('disables the title editor', () => {
    render(<Task task={task} isReadOnly {...baseProps} />);
    const textarea = screen.getByDisplayValue('Cartão somente leitura');
    expect(textarea).toBeDisabled();
  });

  it('hides the delete action and move buttons even when enabled by props', () => {
    render(
      <Task
        task={task}
        isReadOnly
        canMoveLeft
        canMoveRight
        onMoveLeft={vi.fn()}
        onMoveRight={vi.fn()}
        {...baseProps}
      />
    );
    expect(screen.queryByLabelText('Excluir tarefa')).toBeNull();
    expect(screen.queryByLabelText('Mover para coluna anterior')).toBeNull();
    expect(screen.queryByLabelText('Mover para próxima coluna')).toBeNull();
  });

  it('cancels drag start and marks the card as non-draggable', () => {
    render(<Task task={task} isReadOnly {...baseProps} />);
    const card = screen.getByRole('article');
    expect(card.getAttribute('draggable')).toBe('false');

    const dragEvent = new Event('dragstart', { bubbles: true, cancelable: true });
    fireEvent(card, dragEvent);
    expect(dragEvent.defaultPrevented).toBe(true);
  });

  it('does not offer the subtask composer or subtask toggle writes', () => {
    render(
      <Task task={task} isReadOnly onUpdateTask={vi.fn()} onAddComment={vi.fn()} {...baseProps} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Detalhes/i }));

    expect(screen.queryByLabelText('Nova subtarefa')).toBeNull();
    expect(screen.queryByLabelText('Adicionar subtarefa')).toBeNull();
    // O composer de comentário do cartão também não aparece.
    expect(screen.queryByTestId('card-comment-input')).toBeNull();
  });

  it('makes the blocked badge non-interactive', () => {
    const onToggleBlocked = vi.fn();
    const onUpdateTask = vi.fn();
    const blocked: TaskModel = { ...task, blocked: true, blockedReason: 'espera' };

    render(
      <Task
        task={blocked}
        isReadOnly
        onToggleBlocked={onToggleBlocked}
        onUpdateTask={onUpdateTask}
        {...baseProps}
      />
    );

    const badge = screen.getByTestId('task-blocked-badge');
    expect(badge.getAttribute('role')).toBeNull();
    fireEvent.click(badge);
    expect(onToggleBlocked).not.toHaveBeenCalled();
    expect(onUpdateTask).not.toHaveBeenCalled();
  });
});
