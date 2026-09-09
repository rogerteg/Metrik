import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardManagementModal } from '../../src/components/BoardManagementModal';
import { BoardModel } from '../../src/types/kanban';

describe('BoardManagementModal Component', () => {
  const mockBoards: BoardModel[] = [
    { id: 'b1', name: 'Quadro Alfa', createdAt: '2026-01-01', lastAccessed: '2026-01-01' },
    { id: 'b2', name: 'Quadro Beta', createdAt: '2026-01-02', lastAccessed: '2026-01-02' }
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <BoardManagementModal
        isOpen={false}
        onClose={vi.fn()}
        boards={mockBoards}
        activeBoardId="b1"
        onCreateBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
        onSwitchBoard={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders boards list and active indicator when open', () => {
    render(
      <BoardManagementModal
        isOpen={true}
        onClose={vi.fn()}
        boards={mockBoards}
        activeBoardId="b1"
        onCreateBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
        onSwitchBoard={vi.fn()}
      />
    );

    expect(screen.getByText('Gerenciar Quadros')).toBeInTheDocument();
    expect(screen.getByText('Quadro Alfa')).toBeInTheDocument();
    expect(screen.getByText('(Ativo)')).toBeInTheDocument();
    expect(screen.getByText('Quadro Beta')).toBeInTheDocument();
  });

  it('handles creating a new board', () => {
    const onCreate = vi.fn();
    render(
      <BoardManagementModal
        isOpen={true}
        onClose={vi.fn()}
        boards={mockBoards}
        activeBoardId="b1"
        onCreateBoard={onCreate}
        onRenameBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
        onSwitchBoard={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Nome do novo quadro...');
    const submitBtn = screen.getByRole('button', { name: /criar quadro/i });

    fireEvent.change(input, { target: { value: 'Novo Projeto' } });
    fireEvent.click(submitBtn);

    expect(onCreate).toHaveBeenCalledWith('Novo Projeto');
  });

  it('switches board when clicking on board name', () => {
    const onSwitch = vi.fn();
    render(
      <BoardManagementModal
        isOpen={true}
        onClose={vi.fn()}
        boards={mockBoards}
        activeBoardId="b1"
        onCreateBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
        onSwitchBoard={onSwitch}
      />
    );

    const betaBoard = screen.getByText('Quadro Beta');
    fireEvent.click(betaBoard);

    expect(onSwitch).toHaveBeenCalledWith('b2');
  });

  it('handles renaming a board', () => {
    const onRename = vi.fn();
    render(
      <BoardManagementModal
        isOpen={true}
        onClose={vi.fn()}
        boards={mockBoards}
        activeBoardId="b1"
        onCreateBoard={vi.fn()}
        onRenameBoard={onRename}
        onDeleteBoard={vi.fn()}
        onSwitchBoard={vi.fn()}
      />
    );

    const renameButtons = screen.getAllByRole('button', { name: /renomear/i });
    fireEvent.click(renameButtons[0]);

    const editInput = screen.getByDisplayValue('Quadro Alfa');
    fireEvent.change(editInput, { target: { value: 'Quadro Alfa Atualizado' } });
    fireEvent.keyDown(editInput, { key: 'Enter' });

    expect(onRename).toHaveBeenCalledWith('b1', 'Quadro Alfa Atualizado');
  });

  it('confirms and deletes a board', () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <BoardManagementModal
        isOpen={true}
        onClose={vi.fn()}
        boards={mockBoards}
        activeBoardId="b1"
        onCreateBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onDeleteBoard={onDelete}
        onSwitchBoard={vi.fn()}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
    fireEvent.click(deleteButtons[1]); // Delete Quadro Beta

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('b2');
  });

  it('disables delete button when only 1 board exists', () => {
    render(
      <BoardManagementModal
        isOpen={true}
        onClose={vi.fn()}
        boards={[mockBoards[0]]}
        activeBoardId="b1"
        onCreateBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
        onSwitchBoard={vi.fn()}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /excluir/i });
    expect(deleteBtn).toBeDisabled();
  });
});
