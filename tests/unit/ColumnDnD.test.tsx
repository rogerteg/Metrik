import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Column } from '../../src/components/Column';
import { ColumnModel } from '../../src/types/kanban';

describe('Column Drop Target (US1 & US2)', () => {
  const inProgressCol: ColumnModel = { id: 'in_progress', title: 'In Progress', category: 'in_progress', wipLimit: null, colorScheme: 'progress' };
  const completedCol: ColumnModel = { id: 'completed', title: 'Completed', category: 'done', wipLimit: null, colorScheme: 'completed' };

  it('applies drop target highlight class on dragenter and prevents default on dragover', () => {
    const handleDrop = vi.fn();
    render(
      <Column
        column={inProgressCol}
        count={0}
        onDropTask={handleDrop}
      />
    );

    const column = screen.getByRole('region', { name: /Coluna In Progress/i });

    fireEvent.dragEnter(column);
    expect(column.className).toContain('kanban-column-drop-target');

    // Dragover must call preventDefault (fireEvent returns false when preventDefault is called)
    const isDefaultPrevented = !fireEvent.dragOver(column);
    expect(isDefaultPrevented).toBe(true);

    // Dragleave removes highlight
    fireEvent.dragLeave(column);
    expect(column.className).not.toContain('kanban-column-drop-target');
  });

  it('handles drop event by extracting taskId and calling onDropTask', () => {
    const handleDrop = vi.fn();
    render(
      <Column
        column={completedCol}
        count={0}
        onDropTask={handleDrop}
      />
    );

    const column = screen.getByRole('region', { name: /Coluna Completed/i });

    fireEvent.drop(column, {
      dataTransfer: {
        getData: (format: string) => (format === 'text/plain' ? 'task-dropped-1' : ''),
      },
    });

    expect(handleDrop).toHaveBeenCalledWith({
      activeTaskId: 'task-dropped-1',
      targetColumn: 'completed',
    });
    expect(column.className).not.toContain('kanban-column-drop-target');
  });

  it('rejects a cross-column drop when the dragged task is blocked (Feature 025, Layer 3)', () => {
    const handleDrop = vi.fn();
    render(
      <Column
        column={completedCol}
        count={0}
        onDropTask={handleDrop}
        getTaskById={(id) =>
          id === 'blocked-task'
            ? { id, title: 'Blocked', column: 'in_progress', createdAt: '2026-09-14', blocked: true }
            : undefined
        }
      />
    );

    const column = screen.getByRole('region', { name: /Coluna Completed/i });

    fireEvent.drop(column, {
      dataTransfer: {
        getData: (format: string) => (format === 'text/plain' ? 'blocked-task' : ''),
      },
    });

    expect(handleDrop).not.toHaveBeenCalled();
  });

  it('allows a same-column drop for a blocked task (intra-column reorder)', () => {
    const handleDrop = vi.fn();
    render(
      <Column
        column={completedCol}
        count={0}
        onDropTask={handleDrop}
        getTaskById={(id) => ({ id, title: 'Blocked', column: 'completed', createdAt: '2026-09-14', blocked: true })}
      />
    );

    const column = screen.getByRole('region', { name: /Coluna Completed/i });

    fireEvent.drop(column, {
      dataTransfer: {
        getData: (format: string) => (format === 'text/plain' ? 'blocked-task' : ''),
      },
    });

    expect(handleDrop).toHaveBeenCalledWith({
      activeTaskId: 'blocked-task',
      targetColumn: 'completed',
    });
  });
});
