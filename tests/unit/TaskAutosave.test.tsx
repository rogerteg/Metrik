import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Task } from '../../src/components/Task';
import { TaskModel } from '../../src/types/kanban';

const mockTask: TaskModel = {
  id: 'task-1',
  title: 'Tarefa de Teste',
  column: 'todo',
  createdAt: '2026-09-18T10:00:00Z',
  updatedAt: '2026-09-18T10:00:00Z',
  acceptanceCriteria: 'Critérios originais',
  testScenarios: 'Cenários originais',
};

describe('Task Autosave & Save/Discard Buttons (US1 - Feature 032)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renderiza os campos com botão Salvar e Descartar contextuais em modo manual (autoSaveComments: false)', () => {
    const onUpdateTask = vi.fn();

    render(
      <Task
        task={mockTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onUpdateTask={onUpdateTask}
        autoSaveComments={false}
      />
    );

    // Expande a seção de QA
    fireEvent.click(screen.getByTestId('task-qa-section').querySelector('.task-qa-toggle-bar')!);

    // O campo de critérios de aceitação já possui conteúdo e agora está expandido
    const acTextarea = screen.getByLabelText(/critérios de aceitação/i);
    expect(acTextarea).toHaveValue('Critérios originais');

    // Inicialmente, sem foco e sem dirty, a toolbar fica recolhida
    expect(screen.queryByText(/alterações não salvas/i)).toBeNull();

    // Digita nova alteração
    fireEvent.change(acTextarea, { target: { value: 'Critérios modificados' } });

    // Agora a toolbar contextual surge
    expect(screen.getByText(/alterações não salvas/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /salvar alterações dos critérios de aceitação/i });
    const discardBtn = screen.getByRole('button', { name: /descartar alterações dos critérios de aceitação/i });

    expect(saveBtn).toBeInTheDocument();
    expect(discardBtn).toBeInTheDocument();

    // Clica em descartar
    fireEvent.click(discardBtn);
    expect(acTextarea).toHaveValue('Critérios originais');
    expect(onUpdateTask).not.toHaveBeenCalled();
    expect(screen.queryByText(/alterações não salvas/i)).toBeNull();

    // Digita novamente e clica em salvar
    fireEvent.change(acTextarea, { target: { value: 'Critérios aprovados' } });
    const newSaveBtn = screen.getByRole('button', { name: /salvar alterações dos critérios de aceitação/i });
    fireEvent.click(newSaveBtn);

    expect(onUpdateTask).toHaveBeenCalledWith('task-1', {
      acceptanceCriteria: 'Critérios aprovados',
    });
  });

  it('permite salvar via atalho Ctrl+S no campo do cartão', () => {
    const onUpdateTask = vi.fn();

    render(
      <Task
        task={mockTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onUpdateTask={onUpdateTask}
        autoSaveComments={false}
      />
    );

    fireEvent.click(screen.getByTestId('task-qa-section').querySelector('.task-qa-toggle-bar')!);
    const tsTextarea = screen.getByLabelText(/cenários de testes/i);
    fireEvent.change(tsTextarea, { target: { value: 'Novos cenários BDD' } });

    fireEvent.keyDown(tsTextarea, {
      key: 's',
      ctrlKey: true,
    });

    expect(onUpdateTask).toHaveBeenCalledWith('task-1', {
      testScenarios: 'Novos cenários BDD',
    });
  });

  it('salva automaticamente com debounce quando autoSaveComments é true', () => {
    const onUpdateTask = vi.fn();

    render(
      <Task
        task={mockTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        onUpdateTask={onUpdateTask}
        autoSaveComments={true}
        autoSaveDebounceMs={800}
      />
    );

    fireEvent.click(screen.getByTestId('task-qa-section').querySelector('.task-qa-toggle-bar')!);
    const acTextarea = screen.getByLabelText(/critérios de aceitação/i);
    fireEvent.change(acTextarea, { target: { value: 'Texto digitado continuamente' } });

    expect(onUpdateTask).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(onUpdateTask).toHaveBeenCalledWith('task-1', {
      acceptanceCriteria: 'Texto digitado continuamente',
    });
  });
});
