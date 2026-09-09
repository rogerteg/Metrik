import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardSwitcher } from '../../src/components/BoardSwitcher';
import { BoardModel } from '../../src/types/kanban';

describe('BoardSwitcher Component', () => {
  const mockBoards: BoardModel[] = [
    { id: 'b1', name: 'Quadro 1', createdAt: '2026-01-01', lastAccessed: '2026-01-01' },
    { id: 'b2', name: 'Quadro 2', createdAt: '2026-01-02', lastAccessed: '2026-01-02' }
  ];

  it('renders nothing when boards list is empty', () => {
    const { container } = render(
      <BoardSwitcher
        boards={[]}
        activeBoardId={null}
        onSwitchBoard={vi.fn()}
        onManageBoards={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders select with options and handles change', () => {
    const onSwitch = vi.fn();
    render(
      <BoardSwitcher
        boards={mockBoards}
        activeBoardId="b1"
        onSwitchBoard={onSwitch}
        onManageBoards={vi.fn()}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('b1');
    expect(screen.getByText('Quadro 1')).toBeInTheDocument();
    expect(screen.getByText('Quadro 2')).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'b2' } });
    expect(onSwitch).toHaveBeenCalledWith('b2');
  });

  it('calls onManageBoards when manage button is clicked', () => {
    const onManage = vi.fn();
    render(
      <BoardSwitcher
        boards={mockBoards}
        activeBoardId="b1"
        onSwitchBoard={vi.fn()}
        onManageBoards={onManage}
      />
    );

    const manageBtn = screen.getByRole('button', { name: /gerenciar/i });
    fireEvent.click(manageBtn);
    expect(onManage).toHaveBeenCalledTimes(1);
  });
});
