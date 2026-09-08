import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';
import { STORAGE_KEY } from '../../src/hooks/useTaskCollection';

describe('Global Board Actions (US5)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('cancels clear tasks when user declines confirmation dialog', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<App />);

    const clearBtn = screen.getByRole('button', { name: /limpar quadro/i });
    fireEvent.click(clearBtn);

    expect(window.confirm).toHaveBeenCalledWith(
      'Tem certeza de que deseja limpar todas as tarefas do quadro? Esta ação não pode ser desfeita.'
    );

    // Initial seed tasks should still be present
    expect(screen.getByText('Definir métricas essenciais do ciclo ágil (Lead Time e Cycle Time)')).toBeInTheDocument();
  });

  it('clears all tasks when user confirms dialog', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<App />);

    const clearBtn = screen.getByRole('button', { name: /limpar quadro/i });
    fireEvent.click(clearBtn);

    expect(window.confirm).toHaveBeenCalled();

    // Check that board counts are now 0 (Todo/Completed show 0, In Progress shows 0/3, Blocked shows 0/2)
    expect(screen.getByText('0/3')).toBeInTheDocument();
    expect(screen.getByText('0/2')).toBeInTheDocument();

    // Verify localStorage was updated with empty columns
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.Todo).toEqual([]);
    expect(saved['In Progress']).toEqual([]);
    expect(saved.Blocked).toEqual([]);
    expect(saved.Completed).toEqual([]);
  });

  it('allows restoring seed data via Reset Demo button', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<App />);

    const clearBtn = screen.getByRole('button', { name: /limpar quadro/i });
    fireEvent.click(clearBtn);

    const resetBtn = screen.getByRole('button', { name: /restaurar demo/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('Definir métricas essenciais do ciclo ágil (Lead Time e Cycle Time)')).toBeInTheDocument();
  });
});
