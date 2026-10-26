import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SprintManagerModal } from '../../src/components/SprintManagerModal';
import { SprintModel, TaskModel } from '../../src/types/kanban';

describe('SprintManagerModal Component', () => {
  const mockSprints: SprintModel[] = [
    {
      id: 'sp-1',
      name: 'Sprint 1',
      goal: 'Deliver MVP',
      status: 'planned',
      startDate: '2026-10-01',
      endDate: '2026-10-15',
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'sp-2',
      name: 'Sprint 2',
      goal: 'Scale infrastructure',
      status: 'active',
      startDate: '2026-10-16',
      endDate: '2026-10-30',
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'sp-3',
      name: 'Sprint 3',
      goal: 'Archived sprint',
      status: 'completed',
      startDate: '2026-09-01',
      endDate: '2026-09-15',
      createdAt: '2026-09-01T00:00:00Z',
    },
  ];

  const mockTasks: TaskModel[] = [
    {
      id: 't-1',
      title: 'Setup DB',
      column: 'done',
      createdAt: '2026-10-01T00:00:00Z',
      sprintId: 'sp-2',
      estimation: 5,
    },
    {
      id: 't-2',
      title: 'Setup Auth',
      column: 'in_progress',
      createdAt: '2026-10-02T00:00:00Z',
      sprintId: 'sp-2',
      estimation: 3,
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    sprints: mockSprints,
    activeSprintId: 'sp-2',
    tasks: mockTasks,
    isReadOnly: false,
    onAdd: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onStart: vi.fn(),
    onComplete: vi.fn(),
  };

  it('renders modal header, sprint creation form and sprint cards', () => {
    render(<SprintManagerModal {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Sprints' })).toBeInTheDocument();
    expect(screen.getByTestId('sprint-create-name')).toBeInTheDocument();
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('Sprint 2')).toBeInTheDocument();
    expect(screen.getByText('Sprint 3')).toBeInTheDocument();
  });

  it('handles sprint creation form submit', () => {
    render(<SprintManagerModal {...defaultProps} />);

    const nameInput = screen.getByTestId('sprint-create-name');
    const submitBtn = screen.getByTestId('sprint-create-submit');

    fireEvent.change(nameInput, { target: { value: 'Sprint 4' } });
    fireEvent.click(submitBtn);

    expect(defaultProps.onAdd).toHaveBeenCalledWith({
      name: 'Sprint 4',
      goal: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('allows starting a planned sprint and completing an active sprint', () => {
    render(<SprintManagerModal {...defaultProps} />);

    const activateBtn = screen.getByTestId('sprint-activate-sp-1');
    fireEvent.click(activateBtn);
    expect(defaultProps.onStart).toHaveBeenCalledWith('sp-1');

    const completeBtn = screen.getByTestId('sprint-complete-sp-2');
    fireEvent.click(completeBtn);
    expect(defaultProps.onComplete).toHaveBeenCalledWith('sp-2');
  });

  it('allows editing, updating and cancelling sprint edit', () => {
    render(<SprintManagerModal {...defaultProps} />);

    const editBtn = screen.getByTestId('sprint-edit-sp-1');
    fireEvent.click(editBtn);

    const editInput = screen.getByTestId('sprint-edit-name');
    fireEvent.change(editInput, { target: { value: 'Sprint 1 Updated' } });

    const saveBtn = screen.getByTestId('sprint-edit-save');
    fireEvent.click(saveBtn);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith(
      'sp-1',
      expect.objectContaining({
        name: 'Sprint 1 Updated',
      }),
    );

    // Test cancel
    fireEvent.click(screen.getByTestId('sprint-edit-sp-1'));
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByTestId('sprint-edit-name')).not.toBeInTheDocument();
  });

  it('allows toggling between burndown and burnup chart modes', () => {
    render(<SprintManagerModal {...defaultProps} />);

    const burnupBtn = screen.getByTestId('chart-mode-burnup');
    fireEvent.click(burnupBtn);

    const burndownBtn = screen.getByTestId('chart-mode-burndown');
    fireEvent.click(burndownBtn);
  });

  it('deletes a sprint on delete button click', () => {
    render(<SprintManagerModal {...defaultProps} />);

    const deleteBtn = screen.getByTestId('sprint-delete-sp-1');
    fireEvent.click(deleteBtn);

    expect(defaultProps.onDelete).toHaveBeenCalledWith('sp-1');
  });

  it('renders cleanly in read-only mode without write action buttons', () => {
    render(<SprintManagerModal {...defaultProps} isReadOnly={true} />);

    expect(screen.queryByTestId('sprint-create-name')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sprint-activate-sp-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sprint-delete-sp-1')).not.toBeInTheDocument();
  });
});
