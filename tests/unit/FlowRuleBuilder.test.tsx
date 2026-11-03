import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlowRuleBuilder } from '../../src/components/FlowRules/FlowRuleBuilder';
import { ColumnModel } from '../../src/types/kanban';

describe('FlowRuleBuilder Component', () => {
  const dummyColumns: ColumnModel[] = [
    { id: 'col-todo', title: 'To Do', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    {
      id: 'col-dev',
      title: 'Desenvolvimento',
      category: 'in_progress',
      wipLimit: 5,
      colorScheme: 'progress',
    },
    {
      id: 'col-review',
      title: 'Revisão',
      category: 'in_progress',
      wipLimit: 3,
      colorScheme: 'progress',
    },
    {
      id: 'col-done',
      title: 'Concluído',
      category: 'done',
      wipLimit: null,
      colorScheme: 'completed',
    },
  ];

  it('deve renderizar campos obrigatórios do construtor', () => {
    render(<FlowRuleBuilder columns={dummyColumns} onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/nome da regra/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gatilho/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar regra/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('deve permitir adicionar ação e invocar onSave com os dados preenchidos', () => {
    const onSave = vi.fn();
    render(<FlowRuleBuilder columns={dummyColumns} onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/nome da regra/i), {
      target: { value: 'Auto Tagging' },
    });

    // Clica em Adicionar Ação
    const addActionBtn = screen.getByRole('button', { name: /adicionar ação/i });
    fireEvent.click(addActionBtn);

    // Preenche a tag na ação adicionada
    const tagInput = screen.getByPlaceholderText(/nome da tag/i);
    fireEvent.change(tagInput, { target: { value: 'auto-qa' } });

    // Salva a regra
    const saveBtn = screen.getByRole('button', { name: /salvar regra/i });
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Auto Tagging',
        actions: expect.arrayContaining([
          expect.objectContaining({
            type: 'add_tag',
            payload: { tag: 'auto-qa' },
          }),
        ]),
      }),
    );
  });

  it('deve solicitar confirmação ao cancelar com alterações não salvas (Princípio IX)', () => {
    const onCancel = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm');

    render(<FlowRuleBuilder columns={dummyColumns} onSave={vi.fn()} onCancel={onCancel} />);

    // Modifica o campo nome
    fireEvent.change(screen.getByLabelText(/nome da regra/i), {
      target: { value: 'Regra Rascunho' },
    });

    // Rejeita o descarte
    confirmSpy.mockReturnValueOnce(false);
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelBtn);
    expect(confirmSpy).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();

    // Confirma o descarte
    confirmSpy.mockReturnValueOnce(true);
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });

  it('deve disparar cancelamento com confirmação ao pressionar a tecla Escape', () => {
    const onCancel = vi.fn();

    render(<FlowRuleBuilder columns={dummyColumns} onSave={vi.fn()} onCancel={onCancel} />);

    // Sem alterações, fecha diretamente
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
