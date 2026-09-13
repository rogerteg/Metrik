import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskTypeBadge } from '../../src/components/TaskTypeBadge';

describe('Feature 024 - User Story 1: TaskTypeBadge Component', () => {
  it('renders initiative badge with icon and label', () => {
    render(<TaskTypeBadge type="initiative" />);
    const badge = screen.getByLabelText(/Tipo de Tarefa: Iniciativa/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('🎯');
    expect(badge).toHaveTextContent('Iniciativa');
    expect(badge).toHaveClass('task-type-badge--initiative');
  });

  it('renders card badge with icon and label', () => {
    render(<TaskTypeBadge type="card" />);
    const badge = screen.getByLabelText(/Tipo de Tarefa: Card/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('📋');
    expect(badge).toHaveTextContent('Card');
    expect(badge).toHaveClass('task-type-badge--card');
  });

  it('renders subtask badge with icon and label', () => {
    render(<TaskTypeBadge type="subtask" />);
    const badge = screen.getByLabelText(/Tipo de Tarefa: Subtarefa/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('🔹');
    expect(badge).toHaveTextContent('Subtarefa');
    expect(badge).toHaveClass('task-type-badge--subtask');
  });

  it('falls back to card type when type is undefined or null', () => {
    render(<TaskTypeBadge type={undefined} />);
    const badge = screen.getByLabelText(/Tipo de Tarefa: Card/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('📋');
  });

  it('supports compact rendering (icon only or minimal text)', () => {
    render(<TaskTypeBadge type="initiative" compact />);
    const badge = screen.getByLabelText(/Tipo de Tarefa: Iniciativa/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('task-type-badge--compact');
  });
});
