import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfileMenu } from '../../src/components/UserProfileMenu';
import { User } from '../../src/types/team';

describe('UserProfileMenu Component (US1)', () => {
  const mockUsers: User[] = [
    {
      id: 'u1',
      name: 'Alice Silva',
      email: 'alice@metrik.local',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'u2',
      name: 'Bob Santos',
      email: 'bob@metrik.local',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  it('renders active user name and avatar initials badge in the trigger button', () => {
    render(
      <UserProfileMenu
        users={mockUsers}
        activeUser={mockUsers[0]}
        onSelectUser={vi.fn()}
        onCreateUser={vi.fn()}
      />
    );

    expect(screen.getByText('Alice Silva')).toBeDefined();
    // Initials badge for Alice Silva should be AS
    expect(screen.getByText('AS')).toBeDefined();
  });

  it('opens dropdown menu on click and lists available users', () => {
    const onSelect = vi.fn();
    render(
      <UserProfileMenu
        users={mockUsers}
        activeUser={mockUsers[0]}
        onSelectUser={onSelect}
        onCreateUser={vi.fn()}
      />
    );

    const trigger = screen.getByRole('button', { name: /perfil de alice silva/i });
    fireEvent.click(trigger);

    expect(screen.getByText('bob@metrik.local')).toBeDefined();

    // Click on Bob Santos to switch
    const bobOption = screen.getByText('Bob Santos');
    fireEvent.click(bobOption);

    expect(onSelect).toHaveBeenCalledWith('u2');
  });

  it('allows opening create user dialog and calling onCreateUser callback', () => {
    const onCreate = vi.fn();
    render(
      <UserProfileMenu
        users={mockUsers}
        activeUser={mockUsers[0]}
        onSelectUser={vi.fn()}
        onCreateUser={onCreate}
      />
    );

    // Open dropdown
    const trigger = screen.getByRole('button', { name: /perfil de alice silva/i });
    fireEvent.click(trigger);

    // Click on "Cadastrar Novo Usuário"
    const addBtn = screen.getByRole('button', { name: /cadastrar novo usuário/i });
    fireEvent.click(addBtn);

    // Fill form
    const nameInput = screen.getByPlaceholderText(/nome completo/i);
    const emailInput = screen.getByPlaceholderText(/e-mail corporativo/i);
    const submitBtn = screen.getByRole('button', { name: /salvar usuário/i });

    fireEvent.change(nameInput, { target: { value: 'Carlos Lima' } });
    fireEvent.change(emailInput, { target: { value: 'carlos@metrik.local' } });
    fireEvent.click(submitBtn);

    expect(onCreate).toHaveBeenCalledWith('Carlos Lima', 'carlos@metrik.local');
  });
});
