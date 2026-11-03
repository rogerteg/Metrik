import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnPolicyPopover } from '../../src/components/ColumnPolicy/ColumnPolicyPopover';
import { ColumnPolicyModal } from '../../src/components/ColumnPolicy/ColumnPolicyModal';
import { ColumnPolicy } from '../../src/types/columnPolicy';

describe('ColumnPolicyPopover Component', () => {
  const dummyPolicy: ColumnPolicy = {
    columnId: 'col-1',
    entryCriteria: 'Critérios de entrada bem definidos',
    exitCriteria: 'Testes de unidade passando e code review aprovado',
    updatedAt: '2026-11-01T12:00:00Z',
  };

  it('deve renderizar os critérios de entrada e saída corretamente', () => {
    render(
      <ColumnPolicyPopover
        isOpen={true}
        columnTitle="Em Progresso"
        policy={dummyPolicy}
        onClose={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText(/políticas da coluna/i)).toBeInTheDocument();
    expect(screen.getByText('Critérios de entrada bem definidos')).toBeInTheDocument();
    expect(
      screen.getByText('Testes de unidade passando e code review aprovado'),
    ).toBeInTheDocument();
  });

  it('deve chamar onEdit quando o botão de edição for clicado', () => {
    const onEdit = vi.fn();
    render(
      <ColumnPolicyPopover
        isOpen={true}
        columnTitle="Em Progresso"
        policy={dummyPolicy}
        onClose={vi.fn()}
        onEdit={onEdit}
      />,
    );

    const editBtn = screen.getByRole('button', { name: /editar políticas/i });
    fireEvent.click(editBtn);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('deve exibir mensagem de estado vazio caso não haja políticas cadastradas', () => {
    const emptyPolicy: ColumnPolicy = {
      columnId: 'col-2',
      entryCriteria: '',
      exitCriteria: '',
      updatedAt: '',
    };

    render(
      <ColumnPolicyPopover
        isOpen={true}
        columnTitle="To Do"
        policy={emptyPolicy}
        onClose={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText(/nenhuma política explícita configurada/i)).toBeInTheDocument();
  });
});

describe('ColumnPolicyModal Component', () => {
  it('renderiza o formulário com os valores iniciais de critérios', () => {
    render(
      <ColumnPolicyModal
        isOpen={true}
        columnId="col-1"
        columnTitle="Em Desenvolvimento"
        initialEntryCriteria="Critério DoR inicial"
        initialExitCriteria="Critério DoD inicial"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/etapa: em desenvolvimento/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Critério DoR inicial')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Critério DoD inicial')).toBeInTheDocument();
  });

  it('salva as políticas com valores atualizados ao submeter o formulário', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <ColumnPolicyModal
        isOpen={true}
        columnId="col-1"
        columnTitle="Em Desenvolvimento"
        initialEntryCriteria=""
        initialExitCriteria=""
        onSave={onSave}
        onClose={onClose}
      />,
    );

    const entryInput = screen.getByPlaceholderText(/ex: escopo refinado/i);
    const exitInput = screen.getByPlaceholderText(/ex: testes unitários/i);

    fireEvent.change(entryInput, { target: { value: '  DoR refinado  ' } });
    fireEvent.change(exitInput, { target: { value: '  DoD coberto  ' } });

    const submitBtn = screen.getByRole('button', { name: /salvar políticas/i });
    fireEvent.click(submitBtn);

    expect(onSave).toHaveBeenCalledWith('col-1', {
      entryCriteria: 'DoR refinado',
      exitCriteria: 'DoD coberto',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('fecha diretamente quando não há alterações pendentes', () => {
    const onClose = vi.fn();
    render(
      <ColumnPolicyModal
        isOpen={true}
        columnId="col-1"
        columnTitle="Em Desenvolvimento"
        initialEntryCriteria="Critério"
        initialExitCriteria="Critério"
        onSave={vi.fn()}
        onClose={onClose}
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('solicita confirmação de descarte de rascunho ao fechar com alterações (Princípio IX)', () => {
    const onClose = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm');

    render(
      <ColumnPolicyModal
        isOpen={true}
        columnId="col-1"
        columnTitle="Em Desenvolvimento"
        initialEntryCriteria="Original DoR"
        initialExitCriteria="Original DoD"
        onSave={vi.fn()}
        onClose={onClose}
      />,
    );

    const entryInput = screen.getByDisplayValue('Original DoR');
    fireEvent.change(entryInput, { target: { value: 'Modificado Não Salvo' } });

    // Usuário rejeita o descarte
    confirmSpy.mockReturnValueOnce(false);
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelBtn);
    expect(confirmSpy).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    // Usuário confirma o descarte
    confirmSpy.mockReturnValueOnce(true);
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });

  it('suporta atalhos de teclado Escape para fechar e Ctrl+S para salvar', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <ColumnPolicyModal
        isOpen={true}
        columnId="col-1"
        columnTitle="Em Desenvolvimento"
        initialEntryCriteria="Original DoR"
        initialExitCriteria="Original DoD"
        onSave={onSave}
        onClose={onClose}
      />,
    );

    // Ctrl+S salva
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(onSave).toHaveBeenCalledWith('col-1', {
      entryCriteria: 'Original DoR',
      exitCriteria: 'Original DoD',
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    // Escape fecha
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
