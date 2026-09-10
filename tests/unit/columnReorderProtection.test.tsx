import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { canMoveColumn, reorderColumnList } from '../../src/utils/taskReorder';
import { Column } from '../../src/components/Column';
import { ColumnModel } from '../../src/types/kanban';

describe('Column Reorder Rules (First Column "To Do" Protection Only)', () => {
  const sampleColumns: ColumnModel[] = [
    { id: 'todo', title: 'To Do', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    { id: 'dev', title: 'Development', category: 'in_progress', wipLimit: 3, colorScheme: 'progress' },
    { id: 'review', title: 'Code Review', category: 'in_progress', wipLimit: 2, colorScheme: 'progress' },
    { id: 'qa', title: 'QA Testing', category: 'in_progress', wipLimit: 2, colorScheme: 'blocked' },
    { id: 'completed', title: 'Completed', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  describe('canMoveColumn Validator', () => {
    it('rejects any move if board has 1 or fewer columns', () => {
      expect(canMoveColumn(1, 0, 0)).toBe(false);
      expect(canMoveColumn(0, 0, 0)).toBe(false);
    });

    it('rejects moving when sourceIndex equals targetIndex', () => {
      expect(canMoveColumn(5, 2, 2)).toBe(false);
    });

    it('STRICTLY rejects moving the first column (index 0 / To Do)', () => {
      expect(canMoveColumn(5, 0, 1)).toBe(false);
      expect(canMoveColumn(5, 0, 2)).toBe(false);
      expect(canMoveColumn(5, 0, 4)).toBe(false);
    });

    it('STRICTLY rejects moving any column TO the first column position (targetIndex 0)', () => {
      expect(canMoveColumn(5, 1, 0)).toBe(false);
      expect(canMoveColumn(5, 2, 0)).toBe(false);
      expect(canMoveColumn(5, 4, 0)).toBe(false);
    });

    it('ALLOWS moving the last column (index length - 1 / Completed)', () => {
      expect(canMoveColumn(5, 4, 3)).toBe(true);
      expect(canMoveColumn(5, 4, 2)).toBe(true);
      expect(canMoveColumn(5, 4, 1)).toBe(true);
    });

    it('ALLOWS moving any column TO the last column position (targetIndex length - 1)', () => {
      expect(canMoveColumn(5, 1, 4)).toBe(true);
      expect(canMoveColumn(5, 2, 4)).toBe(true);
      expect(canMoveColumn(5, 3, 4)).toBe(true);
    });

    it('allows moving any columns from index 1 to the end', () => {
      expect(canMoveColumn(5, 1, 2)).toBe(true);
      expect(canMoveColumn(5, 2, 1)).toBe(true);
      expect(canMoveColumn(5, 3, 4)).toBe(true);
      expect(canMoveColumn(5, 4, 3)).toBe(true);
    });
  });

  describe('reorderColumnList Helper', () => {
    it('returns original list if movement violates first column lock', () => {
      const result = reorderColumnList(sampleColumns, 0, 2);
      expect(result).toBe(sampleColumns);
      expect(result[0].id).toBe('todo');
    });

    it('allows moving the last column backwards while keeping To Do untouched', () => {
      // Move 'completed' (index 4) to index 2
      const result = reorderColumnList(sampleColumns, 4, 2);
      expect(result).not.toBe(sampleColumns);
      expect(result[0].id).toBe('todo'); // First stays untouched
      expect(result[2].id).toBe('completed');
    });

    it('successfully swaps columns from index 1 to the end while keeping To Do untouched', () => {
      // Move 'dev' (index 1) to index 4 (last)
      const result = reorderColumnList(sampleColumns, 1, 4);
      expect(result).not.toBe(sampleColumns);
      expect(result[0].id).toBe('todo'); // First stays untouched
      expect(result[4].id).toBe('dev');
    });
  });

  describe('Column Component UI: Locks and Buttons', () => {
    it('renders lock indicator and NO move buttons on the first column (To Do)', () => {
      render(
        <Column
          column={sampleColumns[0]}
          count={2}
          columnIndex={0}
          totalColumns={5}
          onMoveColumn={vi.fn()}
        />
      );

      expect(screen.getByLabelText('Coluna fixa')).toBeInTheDocument();
      expect(screen.queryByLabelText(/Mover coluna To Do/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Reordenar coluna To Do/i)).not.toBeInTheDocument();
    });

    it('does NOT render lock indicator on the last column (Completed) and allows moving it', () => {
      const mockMove = vi.fn();
      render(
        <Column
          column={sampleColumns[4]} // index 4 ('completed'), total 5
          count={5}
          columnIndex={4}
          totalColumns={5}
          onMoveColumn={mockMove}
        />
      );

      // Lock should not be present
      expect(screen.queryByLabelText('Coluna fixa')).not.toBeInTheDocument();

      // Drag handle exists
      expect(screen.getByLabelText(/Reordenar coluna Completed/i)).toBeInTheDocument();

      // Left button enabled (can move to index 3)
      const leftBtn = screen.getByRole('button', { name: /Mover coluna Completed para a esquerda/i });
      expect(leftBtn).toBeEnabled();

      // Right button disabled (already at the end)
      const rightBtn = screen.getByRole('button', { name: /Mover coluna Completed para a direita/i });
      expect(rightBtn).toBeDisabled();

      fireEvent.click(leftBtn);
      expect(mockMove).toHaveBeenCalledWith(4, 3);
    });

    it('renders move buttons and drag handle for intermediate columns with left boundary disablement', () => {
      const mockMove = vi.fn();
      render(
        <Column
          column={sampleColumns[1]} // index 1 ('dev')
          count={1}
          columnIndex={1}
          totalColumns={5}
          onMoveColumn={mockMove}
        />
      );

      // Drag handle exists
      expect(screen.getByLabelText(/Reordenar coluna Development/i)).toBeInTheDocument();

      // Left button should be disabled because moving left would invade index 0 (To Do)
      const leftBtn = screen.getByRole('button', { name: /Mover coluna Development para a esquerda/i });
      expect(leftBtn).toBeDisabled();

      // Right button should be enabled (moving to index 2 is allowed)
      const rightBtn = screen.getByRole('button', { name: /Mover coluna Development para a direita/i });
      expect(rightBtn).toBeEnabled();

      fireEvent.click(rightBtn);
      expect(mockMove).toHaveBeenCalledWith(1, 2);
    });

    it('enables right button for intermediate column adjacent to the last column', () => {
      const mockMove = vi.fn();
      render(
        <Column
          column={sampleColumns[3]} // index 3 ('qa'), total 5. Next index 4 is 'completed'
          count={1}
          columnIndex={3}
          totalColumns={5}
          onMoveColumn={mockMove}
        />
      );

      const leftBtn = screen.getByRole('button', { name: /Mover coluna QA Testing para a esquerda/i });
      const rightBtn = screen.getByRole('button', { name: /Mover coluna QA Testing para a direita/i });

      expect(leftBtn).toBeEnabled();
      expect(rightBtn).toBeEnabled(); // Now can move right into index 4!

      fireEvent.click(rightBtn);
      expect(mockMove).toHaveBeenCalledWith(3, 4);
    });

    it('handles column drag-and-drop between columns', () => {
      const mockMove = vi.fn();
      render(
        <Column
          column={sampleColumns[2]} // index 2 ('review')
          count={0}
          columnIndex={2}
          totalColumns={5}
          onMoveColumn={mockMove}
        />
      );

      const columnRegion = screen.getByRole('region', { name: /Coluna Code Review/i });

      fireEvent.drop(columnRegion, {
        dataTransfer: {
          types: ['application/x-metrik-column'],
          getData: (format: string) => (format === 'application/x-metrik-column' ? '1' : ''),
        },
      });

      expect(mockMove).toHaveBeenCalledWith(1, 2);
    });
  });
});
