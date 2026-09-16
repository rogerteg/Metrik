import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateWorkspaceModal } from '../../src/components/WorkspaceHub/CreateWorkspaceModal';

describe('CreateWorkspaceModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <CreateWorkspaceModal
        isOpen={false}
        onClose={vi.fn()}
        onCreateWorkspace={vi.fn()}
      />
    );

    expect(screen.queryByText('Novo Espaço de Trabalho')).toBeNull();
  });

  it('renders modal and submits new workspace details', () => {
    const onCreateWorkspace = vi.fn();
    const onClose = vi.fn();

    render(
      <CreateWorkspaceModal
        isOpen={true}
        onClose={onClose}
        onCreateWorkspace={onCreateWorkspace}
      />
    );

    expect(screen.getByText('Novo Espaço de Trabalho')).toBeDefined();

    const nameInput = screen.getByLabelText(/nome do espaço/i);
    const descInput = screen.getByLabelText(/descrição/i);

    fireEvent.change(nameInput, { target: { value: 'Inovação & Labs' } });
    fireEvent.change(descInput, { target: { value: 'Squad de inovação aberta' } });

    const submitBtn = screen.getByRole('button', { name: /criar espaço/i });
    fireEvent.click(submitBtn);

    expect(onCreateWorkspace).toHaveBeenCalledWith(
      'Inovação & Labs',
      expect.any(String),
      'Squad de inovação aberta'
    );
    expect(onClose).toHaveBeenCalled();
  });
});
