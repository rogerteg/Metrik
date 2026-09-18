import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskDetailsModal } from '../../src/components/TaskDetailsModal';
import { TaskModel } from '../../src/types/kanban';

const mockTask: TaskModel = {
  id: 'task-100',
  title: 'Tarefa no Modal',
  column: 'doing',
  description: 'Descrição original no modal',
  acceptanceCriteria: 'Critérios originais',
  testScenarios: 'Cenários originais',
  createdAt: '2026-09-18T10:00:00Z',
  updatedAt: '2026-09-18T10:00:00Z',
};

describe('TaskDetailsModal Autosave & Close Guard (US1 - Feature 032)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('permite salvar e descartar alterações na descrição pelo botão da toolbar no modo manual', () => {
    const onUpdateTask = vi.fn();
    const onClose = vi.fn();

    render(
      <TaskDetailsModal
        isOpen={true}
        task={mockTask}
        onClose={onClose}
        onUpdateTask={onUpdateTask}
        autoSaveComments={false}
      />
    );

    const descTextarea = screen.getByPlaceholderText(/adicione uma descrição detalhada/i);
    expect(descTextarea).toHaveValue('Descrição original no modal');

    // Altera a descrição
    fireEvent.change(descTextarea, { target: { value: 'Nova descrição detalhada' } });

    // Toolbar contextual surge
    const saveBtn = screen.getByRole('button', { name: /salvar alterações da descrição/i });
    const discardBtn = screen.getByRole('button', { name: /descartar alterações da descrição/i });

    expect(saveBtn).toBeInTheDocument();
    expect(discardBtn).toBeInTheDocument();

    // Clica em descartar
    fireEvent.click(discardBtn);
    expect(descTextarea).toHaveValue('Descrição original no modal');
    expect(onUpdateTask).not.toHaveBeenCalled();

    // Altera novamente e salva
    fireEvent.change(descTextarea, { target: { value: 'Descrição final confirmada' } });
    const newSaveBtn = screen.getByRole('button', { name: /salvar alterações da descrição/i });
    fireEvent.click(newSaveBtn);

    expect(onUpdateTask).toHaveBeenCalledWith('task-100', {
      description: 'Descrição final confirmada',
    });
  });

  it('aciona guarda de fechamento quando o usuário tenta fechar o modal com alterações pendentes não salvas', () => {
    const onUpdateTask = vi.fn();
    const onClose = vi.fn();

    render(
      <TaskDetailsModal
        isOpen={true}
        task={mockTask}
        onClose={onClose}
        onUpdateTask={onUpdateTask}
        autoSaveComments={false}
      />
    );

    const descTextarea = screen.getByPlaceholderText(/adicione uma descrição detalhada/i);
    fireEvent.change(descTextarea, { target: { value: 'Rascunho não salvo' } });

    // Tenta fechar o modal clicando no botão ×
    const closeBtn = screen.getByLabelText(/fechar/i);
    fireEvent.click(closeBtn);

    // O modal NÃO deve fechar diretamente
    expect(onClose).not.toHaveBeenCalled();

    // Deve exibir o diálogo de confirmação protetor
    expect(screen.getByText(/existem alterações não salvas/i)).toBeInTheDocument();

    // Clica em "Continuar Editando"
    const continueBtn = screen.getByRole('button', { name: /continuar editando/i });
    fireEvent.click(continueBtn);
    expect(screen.queryByText(/existem alterações não salvas/i)).toBeNull();
    expect(onClose).not.toHaveBeenCalled();

    // Tenta fechar de novo e clica em "Salvar e Fechar"
    fireEvent.click(closeBtn);
    const saveAndCloseBtn = screen.getByRole('button', { name: /salvar e fechar/i });
    fireEvent.click(saveAndCloseBtn);

    expect(onUpdateTask).toHaveBeenCalledWith('task-100', {
      description: 'Rascunho não salvo',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('salva alterações pendentes com o atalho Ctrl+S no modal', () => {
    const onUpdateTask = vi.fn();
    const onClose = vi.fn();

    render(
      <TaskDetailsModal
        isOpen={true}
        task={mockTask}
        onClose={onClose}
        onUpdateTask={onUpdateTask}
        autoSaveComments={false}
      />
    );

    const descTextarea = screen.getByPlaceholderText(/adicione uma descrição detalhada/i);
    fireEvent.change(descTextarea, { target: { value: 'Salvo com atalho' } });

    fireEvent.keyDown(descTextarea, {
      key: 's',
      ctrlKey: true,
    });

    expect(onUpdateTask).toHaveBeenCalledWith('task-100', {
      description: 'Salvo com atalho',
    });
  });
});
