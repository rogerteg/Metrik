import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Column } from '../../src/components/Column';
import { ColumnType } from '../../src/types/kanban';

describe('Column Drop Target (US1 & US2)', () => {
  it('applies drop target highlight class on dragenter and prevents default on dragover', () => {
    const handleDrop = vi.fn();
    render(
      <Column
        type={ColumnType.IN_PROGRESS}
        title="In Progress"
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
        type={ColumnType.COMPLETED}
        title="Completed"
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
      targetColumn: ColumnType.COMPLETED,
    });
    expect(column.className).not.toContain('kanban-column-drop-target');
  });
});
