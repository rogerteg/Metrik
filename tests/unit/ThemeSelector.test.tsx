import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSelector } from '../../src/components/ThemeSelector';

describe('ThemeSelector Component (Feature 022)', () => {
  it('renders all three theme options: Claro, Escuro, and Neutro', () => {
    const handleSelect = vi.fn();
    render(<ThemeSelector currentTheme="dark" onSelectTheme={handleSelect} />);

    expect(screen.getByRole('button', { name: /claro/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /escuro/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /neutro/i })).toBeDefined();
  });

  it('marks the current active theme with aria-pressed="true" and active class', () => {
    const handleSelect = vi.fn();
    const { rerender } = render(<ThemeSelector currentTheme="dark" onSelectTheme={handleSelect} />);

    const darkBtn = screen.getByRole('button', { name: /escuro/i });
    const lightBtn = screen.getByRole('button', { name: /claro/i });
    const neutralBtn = screen.getByRole('button', { name: /neutro/i });

    expect(darkBtn.getAttribute('aria-pressed')).toBe('true');
    expect(darkBtn.classList.contains('active')).toBe(true);
    expect(lightBtn.getAttribute('aria-pressed')).toBe('false');
    expect(neutralBtn.getAttribute('aria-pressed')).toBe('false');

    // Re-render with 'light'
    rerender(<ThemeSelector currentTheme="light" onSelectTheme={handleSelect} />);
    expect(lightBtn.getAttribute('aria-pressed')).toBe('true');
    expect(lightBtn.classList.contains('active')).toBe(true);
    expect(darkBtn.getAttribute('aria-pressed')).toBe('false');

    // Re-render with 'neutral'
    rerender(<ThemeSelector currentTheme="neutral" onSelectTheme={handleSelect} />);
    expect(neutralBtn.getAttribute('aria-pressed')).toBe('true');
    expect(neutralBtn.classList.contains('active')).toBe(true);
    expect(darkBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('calls onSelectTheme with the respective theme mode when clicked', () => {
    const handleSelect = vi.fn();
    render(<ThemeSelector currentTheme="dark" onSelectTheme={handleSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /claro/i }));
    expect(handleSelect).toHaveBeenCalledWith('light');

    fireEvent.click(screen.getByRole('button', { name: /neutro/i }));
    expect(handleSelect).toHaveBeenCalledWith('neutral');

    fireEvent.click(screen.getByRole('button', { name: /escuro/i }));
    expect(handleSelect).toHaveBeenCalledWith('dark');
  });

  it('has accessible container with role="group" and aria-label', () => {
    const handleSelect = vi.fn();
    render(<ThemeSelector currentTheme="dark" onSelectTheme={handleSelect} />);

    const group = screen.getByRole('group', { name: /selecionar tema/i });
    expect(group).toBeDefined();
  });
});
