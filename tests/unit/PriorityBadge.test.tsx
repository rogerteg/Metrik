import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { PriorityBadge } from '../../src/components/PriorityBadge';

describe('PriorityBadge Component (US1)', () => {
  it('renders "+ Prioridade" button when no priority is set', () => {
    const handleChange = vi.fn();
    render(<PriorityBadge onChange={handleChange} />);

    const button = screen.getByRole('button', { name: /definir prioridade/i });
    expect(button).toBeDefined();
    expect(button.textContent).toContain('Prioridade');
  });

  it('renders badge with correct label and colors when priority is provided', () => {
    const handleChange = vi.fn();
    render(<PriorityBadge priority="urgent" onChange={handleChange} />);

    const badge = screen.getByRole('button', { name: /prioridade: urgente/i });
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain('Urgente');
  });

  it('opens menu with all 4 priority levels and clear option on click', () => {
    const handleChange = vi.fn();
    render(<PriorityBadge priority="medium" onChange={handleChange} />);

    const badge = screen.getByRole('button', { name: /prioridade: média/i });
    fireEvent.click(badge);

    const menu = screen.getByRole('menu');
    expect(menu).toBeDefined();
    expect(within(menu).getByText('Urgente')).toBeDefined();
    expect(within(menu).getByText('Alta')).toBeDefined();
    expect(within(menu).getByText('Média')).toBeDefined();
    expect(within(menu).getByText('Baixa')).toBeDefined();
    expect(within(menu).getByText(/sem prioridade|nenhuma/i)).toBeDefined();
  });

  it('calls onChange with selected priority when an option is clicked and closes menu', () => {
    const handleChange = vi.fn();
    render(<PriorityBadge priority="low" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /prioridade: baixa/i }));
    fireEvent.click(screen.getByText('Alta'));

    expect(handleChange).toHaveBeenCalledWith('high');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('calls onChange(undefined) when clearing priority', () => {
    const handleChange = vi.fn();
    render(<PriorityBadge priority="urgent" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /prioridade: urgente/i }));
    fireEvent.click(screen.getByText(/sem prioridade|nenhuma/i));

    expect(handleChange).toHaveBeenCalledWith(undefined);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
