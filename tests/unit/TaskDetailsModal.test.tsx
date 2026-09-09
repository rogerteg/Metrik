import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskDetailsModal } from '../../src/components/TaskDetailsModal';
import { TaskModel } from '../../src/types/kanban';

describe('TaskDetailsModal', () => {
  const mockTask: TaskModel = {
    id: 't1',
    title: 'Initial Title',
    column: 'col1',
    createdAt: '2023-01-01T10:00:00.000Z',
    description: 'Initial description',
    subtasks: [
      { id: 's1', title: 'Subtask 1', completed: false },
      { id: 's2', title: 'Subtask 2', completed: true },
    ]
  };

  const mockOnClose = vi.fn();
  const mockOnUpdateTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<TaskDetailsModal task={mockTask} isOpen={true} onClose={mockOnClose} onUpdateTask={mockOnUpdateTask} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial description')).toBeInTheDocument();
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 2')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<TaskDetailsModal task={mockTask} isOpen={false} onClose={mockOnClose} onUpdateTask={mockOnUpdateTask} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onUpdateTask when title is changed and blurred', () => {
    render(<TaskDetailsModal task={mockTask} isOpen={true} onClose={mockOnClose} onUpdateTask={mockOnUpdateTask} />);
    
    const titleInput = screen.getByDisplayValue('Initial Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.blur(titleInput);
    
    expect(mockOnUpdateTask).toHaveBeenCalledWith('t1', { title: 'New Title' });
  });

  it('calls onUpdateTask when description is changed and blurred', () => {
    render(<TaskDetailsModal task={mockTask} isOpen={true} onClose={mockOnClose} onUpdateTask={mockOnUpdateTask} />);
    
    const descInput = screen.getByDisplayValue('Initial description');
    fireEvent.change(descInput, { target: { value: 'New description' } });
    fireEvent.blur(descInput);
    
    expect(mockOnUpdateTask).toHaveBeenCalledWith('t1', { description: 'New description' });
  });

  it('adds a new subtask', () => {
    render(<TaskDetailsModal task={mockTask} isOpen={true} onClose={mockOnClose} onUpdateTask={mockOnUpdateTask} />);
    
    const addInput = screen.getByPlaceholderText('Adicionar um item...');
    fireEvent.change(addInput, { target: { value: 'Subtask 3' } });
    
    const addButton = screen.getByRole('button', { name: 'Adicionar' });
    fireEvent.click(addButton);
    
    expect(mockOnUpdateTask).toHaveBeenCalledTimes(1);
    const updateArg = mockOnUpdateTask.mock.calls[0][1];
    expect(updateArg.subtasks).toHaveLength(3);
    expect(updateArg.subtasks[2].title).toBe('Subtask 3');
    expect(updateArg.subtasks[2].completed).toBe(false);
  });

  it('toggles a subtask', () => {
    render(<TaskDetailsModal task={mockTask} isOpen={true} onClose={mockOnClose} onUpdateTask={mockOnUpdateTask} />);
    
    // Subtask 1 is unchecked initially
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    
    expect(mockOnUpdateTask).toHaveBeenCalledTimes(1);
    const updateArg = mockOnUpdateTask.mock.calls[0][1];
    expect(updateArg.subtasks[0].completed).toBe(true); // Toggled
  });

  it('deletes a subtask', () => {
    render(<TaskDetailsModal task={mockTask} isOpen={true} onClose={mockOnClose} onUpdateTask={mockOnUpdateTask} />);
    
    const deleteButtons = screen.getAllByLabelText('Excluir subtarefa');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnUpdateTask).toHaveBeenCalledTimes(1);
    const updateArg = mockOnUpdateTask.mock.calls[0][1];
    expect(updateArg.subtasks).toHaveLength(1);
    expect(updateArg.subtasks[0].id).toBe('s2');
  });

  it('calls onClose when close button is clicked', () => {
    render(<TaskDetailsModal task={mockTask} isOpen={true} onClose={mockOnClose} onUpdateTask={mockOnUpdateTask} />);
    
    const closeButton = screen.getByLabelText('Fechar');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
