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

  it('calls onUpdateTask when due date is changed and blurred', () => {
    render(<TaskDetailsModal task={mockTask} isOpen={true} onClose={mockOnClose} onUpdateTask={mockOnUpdateTask} />);
    
    // The input should exist (type=date)
    // We can query it by its label or ID, or placeholder if we added one, but let's just find the date input.
    // In our implementation, we added: <label htmlFor="td-dueDate" className="td-label">Data de Entrega</label>
    const dateInput = screen.getByLabelText('Data de Entrega');
    
    fireEvent.change(dateInput, { target: { value: '2026-10-15' } });
    fireEvent.blur(dateInput);
    
    expect(mockOnUpdateTask).toHaveBeenCalledWith('t1', { dueDate: '2026-10-15' });
  });

  it('calls onUpdateTask with undefined when due date is cleared', () => {
    const taskWithDueDate: TaskModel = {
      ...mockTask,
      dueDate: '2026-10-15'
    };
    
    render(<TaskDetailsModal task={taskWithDueDate} isOpen={true} onClose={mockOnClose} onUpdateTask={mockOnUpdateTask} />);
    
    const dateInput = screen.getByLabelText('Data de Entrega');
    
    fireEvent.change(dateInput, { target: { value: '' } });
    fireEvent.blur(dateInput);

    expect(mockOnUpdateTask).toHaveBeenCalledWith('t1', { dueDate: undefined });
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

  it('toggles blocked status and updates impediment reason (Feature 012)', () => {
    const onToggleBlocked = vi.fn();
    render(
      <TaskDetailsModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onUpdateTask={mockOnUpdateTask}
        onToggleBlocked={onToggleBlocked}
      />
    );

    const blockBtn = screen.getByRole('button', { name: /marcar como bloqueada/i });
    fireEvent.click(blockBtn);

    expect(onToggleBlocked).toHaveBeenCalledWith('t1', '');
  });

  it('renders blocked state, reason input, and saves reason on blur', () => {
    const blockedTask: TaskModel = {
      ...mockTask,
      blocked: true,
      blockedReason: 'Motivo Antigo',
      blockedAt: '2026-09-08T10:00:00.000Z',
    };

    render(
      <TaskDetailsModal
        task={blockedTask}
        isOpen={true}
        onClose={mockOnClose}
        onUpdateTask={mockOnUpdateTask}
      />
    );

    expect(screen.getByText('Tarefa atualmente impedida')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /desbloquear tarefa/i })).toBeInTheDocument();

    const reasonInput = screen.getByPlaceholderText('Descreva o motivo do bloqueio...');
    expect(reasonInput).toHaveValue('Motivo Antigo');

    fireEvent.change(reasonInput, { target: { value: 'Novo Motivo do Impedimento' } });
    fireEvent.blur(reasonInput);

    expect(mockOnUpdateTask).toHaveBeenCalledWith('t1', { blockedReason: 'Novo Motivo do Impedimento' });
  });
});
