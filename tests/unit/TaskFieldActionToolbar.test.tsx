import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskFieldActionToolbar } from '../../src/components/TaskFieldActionToolbar';

describe('TaskFieldActionToolbar Component (TDD - Feature 032)', () => {
  it('não renderiza nada ou permanece oculto quando status é idle e não há dirty', () => {
    const { container } = render(
      <TaskFieldActionToolbar
        status="idle"
        isDirty={false}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />
    );

    expect(container.querySelector('.task-field-action-toolbar')).toBeNull();
  });

  it('renderiza indicador "Alterações não salvas" e botões Salvar/Descartar quando isDirty é verdadeiro', () => {
    const onSave = vi.fn();
    const onDiscard = vi.fn();

    render(
      <TaskFieldActionToolbar
        status="dirty"
        isDirty={true}
        onSave={onSave}
        onDiscard={onDiscard}
        ariaLabelPrefix="da descrição"
      />
    );

    const toolbar = screen.getByRole('toolbar', { name: /ações de edição da descrição/i });
    expect(toolbar).toBeInTheDocument();

    expect(screen.getByText(/alterações não salvas/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /salvar alterações da descrição/i });
    expect(saveBtn).toBeInTheDocument();
    expect(saveBtn).toBeEnabled();

    const discardBtn = screen.getByRole('button', { name: /descartar alterações da descrição/i });
    expect(discardBtn).toBeInTheDocument();
    expect(discardBtn).toBeEnabled();

    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(discardBtn);
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('exibe indicador "Salvando..." e desabilita botões durante o status saving', () => {
    const onSave = vi.fn();
    const onDiscard = vi.fn();

    render(
      <TaskFieldActionToolbar
        status="saving"
        isDirty={true}
        onSave={onSave}
        onDiscard={onDiscard}
      />
    );

    expect(screen.getByText(/salvando\.\.\./i)).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /salvar alterações/i });
    expect(saveBtn).toBeDisabled();

    const discardBtn = screen.getByRole('button', { name: /descartar alterações/i });
    expect(discardBtn).toBeDisabled();
  });

  it('exibe indicador "✓ Salvo" com classe de sucesso quando status é saved', () => {
    render(
      <TaskFieldActionToolbar
        status="saved"
        isDirty={false}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />
    );

    const savedBadge = screen.getByText(/✓ salvo/i);
    expect(savedBadge).toBeInTheDocument();
    expect(savedBadge).toHaveClass('status-saved');
  });

  it('não renderiza botões de ação quando isReadOnly é verdadeiro', () => {
    render(
      <TaskFieldActionToolbar
        status="dirty"
        isDirty={true}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        isReadOnly={true}
      />
    );

    expect(screen.queryByRole('button', { name: /salvar/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /descartar/i })).toBeNull();
  });

  it('renderiza em modo compacto quando prop compact é verdadeira', () => {
    render(
      <TaskFieldActionToolbar
        status="dirty"
        isDirty={true}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        compact={true}
      />
    );

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveClass('toolbar-compact');
  });
});
