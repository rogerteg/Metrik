import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskDetailsModal } from '../../src/components/TaskDetailsModal';
import { TaskModel } from '../../src/types/kanban';

const mockTask: TaskModel = {
  id: 'task-guard-1',
  title: 'Tarefa Guard Rascunhos',
  description: 'Descrição original',
  column: 'col-todo',
  createdAt: '2026-09-22T10:00:00.000Z',
};

describe('TaskDetailsModal Close Guard & Preference Persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('triggers dirty state confirm dialog when modal close is requested with unsaved manual changes', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();

    render(
      <TaskDetailsModal
        task={mockTask}
        isOpen={true}
        onClose={handleClose}
        onUpdateTask={handleUpdate}
        autoSaveComments={false}
      />
    );

    const titleInput = screen.getByDisplayValue('Tarefa Guard Rascunhos');
    fireEvent.change(titleInput, { target: { value: 'Título Modificado Não Salvo' } });

    const closeBtn = screen.getByRole('button', { name: /fechar/i });
    fireEvent.click(closeBtn);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Existem alterações não salvas')).toBeInTheDocument();
    expect(handleClose).not.toHaveBeenCalled();
  });
});
