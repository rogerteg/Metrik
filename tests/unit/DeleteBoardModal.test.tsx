import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteBoardModal } from '../../src/components/ManageBoards/DeleteBoardModal';

describe('DeleteBoardModal Component (Feature 031 - T011)', () => {
  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <DeleteBoardModal
        isOpen={false}
        boardName="Quadro Teste"
        tasksCount={5}
        isSoleBoard={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders board name and warns about impacted tasks when tasksCount > 0', () => {
    render(
      <DeleteBoardModal
        isOpen={true}
        boardName="Quadro de Produção"
        tasksCount={12}
        isSoleBoard={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText(/excluir quadro/i)).toBeInTheDocument();
    expect(screen.getByText(/Quadro de Produção/i)).toBeInTheDocument();
    expect(screen.getByText(/12 tarefa\(s\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar exclusão/i })).toBeInTheDocument();
  });

  it('blocks deletion and informs user when isSoleBoard is true', () => {
    render(
      <DeleteBoardModal
        isOpen={true}
        boardName="Único Quadro"
        tasksCount={3}
        isSoleBoard={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText(/operação bloqueada/i)).toBeInTheDocument();
    expect(screen.getByText(/este é o único quadro disponível no momento/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirmar exclusão/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
  });

  it('calls onClose when clicking cancel or close button', () => {
    const onClose = vi.fn();
    render(
      <DeleteBoardModal
        isOpen={true}
        boardName="Quadro Teste"
        tasksCount={0}
        isSoleBoard={false}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText(/fechar modal/i));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('calls onConfirm when confirming deletion', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteBoardModal
        isOpen={true}
        boardName="Quadro Teste"
        tasksCount={0}
        isSoleBoard={false}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /confirmar exclusão/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
