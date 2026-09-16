import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Column } from '../../src/components/Column';
import { ColumnModel } from '../../src/types/kanban';
import {
  DEFAULT_COLUMN_WIDTH,
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
} from '../../src/utils/columnGeometry';

describe('Column Component (US1)', () => {
  const todoCol: ColumnModel = { id: 'todo', title: 'Todo', category: 'todo', wipLimit: null, colorScheme: 'todo' };
  const inProgressCol: ColumnModel = { id: 'in_progress', title: 'In Progress', category: 'in_progress', wipLimit: null, colorScheme: 'progress' };
  const blockedCol: ColumnModel = { id: 'blocked', title: 'Blocked', category: 'in_progress', wipLimit: null, colorScheme: 'blocked' };

  it('renders column title and badge correctly for Todo', () => {
    render(
      <Column column={todoCol} count={3} />
    );

    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders blocked column with alert styling badge', () => {
    const { container } = render(
      <Column column={blockedCol} count={1} />
    );

    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(container.querySelector('.badge-blocked')).toBeInTheDocument();
  });

  it('triggers onAddTask when the + button is clicked', () => {
    const mockOnAddTask = vi.fn();
    render(
      <Column column={inProgressCol} count={0} onAddTask={mockOnAddTask} />
    );

    const addButton = screen.getByRole('button', { name: /Adicionar tarefa em/i });
    fireEvent.click(addButton);

    expect(mockOnAddTask).toHaveBeenCalledTimes(1);
  });

  it('renders an empty drop zone when count is 0', () => {
    render(
      <Column column={todoCol} count={0} />
    );

    expect(screen.getByText('Arraste um cartão aqui')).toBeInTheDocument();
  });

  it('renders children tasks when count > 0', () => {
    render(
      <Column column={todoCol} count={1}>
        <div data-testid="mock-task">Mock Task</div>
      </Column>
    );

    expect(screen.getByTestId('mock-task')).toBeInTheDocument();
    expect(screen.queryByText('Arraste um cartão aqui')).not.toBeInTheDocument();
  });

  it('allows changing column color via color palette button', () => {
    const handleUpdateColumn = vi.fn();
    render(
      <Column
        column={{ ...inProgressCol, color: '#38bdf8' }}
        count={2}
        onUpdateColumn={handleUpdateColumn}
      />
    );

    const colorButton = screen.getByRole('button', { name: /Alterar cor da coluna/i });
    expect(colorButton).toBeInTheDocument();
    expect(colorButton).toHaveStyle({ backgroundColor: 'rgb(56, 189, 248)' });

    // Open popover
    fireEvent.click(colorButton);
    expect(screen.getByText('Cor da Coluna')).toBeInTheDocument();

    // Select Emerald swatch
    const emeraldSwatch = screen.getByRole('button', { name: 'Cor Emerald' });
    fireEvent.click(emeraldSwatch);

    expect(handleUpdateColumn).toHaveBeenCalledWith('in_progress', { color: '#10b981' });
  });
});

describe('Column — geometria explícita e interações de largura (US1/US2)', () => {
  const column: ColumnModel = {
    id: 'doing',
    title: 'Em Progresso',
    category: 'in_progress',
    wipLimit: null,
    colorScheme: 'progress',
  };

  const getColumnElement = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('.kanban-column') as HTMLElement;

  it('renders with the default width when no preference is provided (GC-01, GC-02)', () => {
    const { container } = render(<Column column={column} count={0} />);
    const element = getColumnElement(container);

    expect(element.style.width).toBe(`${DEFAULT_COLUMN_WIDTH}px`);
    expect(element.style.minWidth).toBe(`${DEFAULT_COLUMN_WIDTH}px`);
    expect(element.style.maxWidth).toBe(`${DEFAULT_COLUMN_WIDTH}px`);
  });

  it('honours a valid preference exactly (GC-04)', () => {
    const { container } = render(<Column column={column} count={0} width={375} />);

    expect(getColumnElement(container).style.width).toBe('375px');
  });

  it('falls back to the default when the preference is outside the allowed range (GC-09)', () => {
    const { container } = render(<Column column={column} count={0} width={MAX_COLUMN_WIDTH + 1} />);

    expect(getColumnElement(container).style.width).toBe(`${DEFAULT_COLUMN_WIDTH}px`);
  });

  it('starts the drag from the rendered width, without jumping (GC-06)', () => {
    const onResizeWidth = vi.fn();
    render(<Column column={column} count={0} onResizeWidth={onResizeWidth} />);

    const handle = screen.getByRole('separator');
    fireEvent.mouseDown(handle, { clientX: 500 });
    fireEvent.mouseMove(window, { clientX: 510 });

    expect(onResizeWidth).toHaveBeenCalledWith('doing', DEFAULT_COLUMN_WIDTH + 10);

    fireEvent.mouseUp(window);
  });

  it('starts the drag from a persisted width, without jumping (GC-06)', () => {
    const onResizeWidth = vi.fn();
    render(<Column column={column} count={0} width={400} onResizeWidth={onResizeWidth} />);

    const handle = screen.getByRole('separator');
    fireEvent.mouseDown(handle, { clientX: 500 });
    fireEvent.mouseMove(window, { clientX: 501 });

    expect(onResizeWidth).toHaveBeenCalledWith('doing', 401);

    fireEvent.mouseUp(window);
  });

  it('keeps the drag inside the allowed range (GC-03)', () => {
    const onResizeWidth = vi.fn();
    render(<Column column={column} count={0} onResizeWidth={onResizeWidth} />);

    const handle = screen.getByRole('separator');
    fireEvent.mouseDown(handle, { clientX: 500 });
    fireEvent.mouseMove(window, { clientX: 0 });

    expect(onResizeWidth).toHaveBeenCalledWith('doing', MIN_COLUMN_WIDTH);

    fireEvent.mouseUp(window);
  });

  it('restore asks the owner to clear the preference instead of writing a fixed width (GC-05)', () => {
    const onResetWidth = vi.fn();
    const onResizeWidth = vi.fn();
    render(
      <Column
        column={column}
        count={0}
        onResetWidth={onResetWidth}
        onResizeWidth={onResizeWidth}
      />
    );

    fireEvent.doubleClick(screen.getByRole('separator'));

    expect(onResetWidth).toHaveBeenCalledWith('doing');
    expect(onResizeWidth).not.toHaveBeenCalled();
  });
});
