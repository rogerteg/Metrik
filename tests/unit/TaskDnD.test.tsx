import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { Task } from '../../src/components/Task';
import { TaskModel } from '../../src/types/kanban';

describe('Task Drag and Drop (US1 & US2)', () => {
  const sampleTask: TaskModel = {
    id: 'task-test-1',
    title: 'Testar Drag and Drop',
    column: 'todo',
    createdAt: '2026-09-08T10:00:00Z',
  };

  it('renders task card as draggable by default', () => {
    render(
      <Task
        task={sampleTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    const card = screen.getByRole('article', { name: /Testar Drag and Drop/i });
    expect(card.getAttribute('draggable')).toBe('true');
  });

  it('sets dataTransfer with task ID and adds dragging class on dragstart', () => {
    render(
      <Task
        task={sampleTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    const card = screen.getByRole('article', { name: /Testar Drag and Drop/i });
    const setDataMock = vi.fn();

    fireEvent.dragStart(card, {
      dataTransfer: {
        setData: setDataMock,
        effectAllowed: 'uninitialized',
      },
    });

    expect(setDataMock).toHaveBeenCalledWith('text/plain', 'task-test-1');
    expect(card.className).toContain('task-card-dragging');
  });

  it('removes dragging class on dragend', () => {
    render(
      <Task
        task={sampleTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
      />
    );

    const card = screen.getByRole('article', { name: /Testar Drag and Drop/i });

    fireEvent.dragStart(card, {
      dataTransfer: {
        setData: vi.fn(),
      },
    });
    expect(card.className).toContain('task-card-dragging');

    fireEvent.dragEnd(card);
    expect(card.className).not.toContain('task-card-dragging');
  });

  it('triggers onDropTask with targetTaskId and position when dropped on task card', () => {
    const handleDrop = vi.fn();
    render(
      <Task
        task={sampleTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onDropTask={handleDrop}
      />
    );

    const card = screen.getByRole('article', { name: /Testar Drag and Drop/i });

    vi.spyOn(window.Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      height: 60,
      bottom: 160,
      left: 0,
      right: 200,
      width: 200,
      x: 0,
      y: 100,
      toJSON: () => {},
    });

    // Dragover top half (clientY = 110, mid = 130) -> position 'before'
    const dragOverEvent = createEvent.dragOver(card);
    Object.defineProperty(dragOverEvent, 'clientY', { value: 110 });
    fireEvent(card, dragOverEvent);
    expect(card.className).toContain('task-card-drop-before');

    // Drop
    fireEvent.drop(card, {
      dataTransfer: {
        getData: (format: string) => (format === 'text/plain' ? 'incoming-task' : ''),
      },
    });

    expect(handleDrop).toHaveBeenCalledWith({
      activeTaskId: 'incoming-task',
      targetColumn: 'todo',
      targetTaskId: 'task-test-1',
      position: 'before',
    });
  });
});
