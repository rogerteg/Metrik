import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Task } from '../../src/components/Task';
import { TaskModel } from '../../src/types/kanban';

describe('DnD Accessibility & Directional Buttons (US4)', () => {
  const sampleTask: TaskModel = {
    id: 'task-nav-1',
    title: 'Tarefa com Navegação Acessível',
    column: 'in-progress',
    createdAt: '2026-09-08T10:00:00Z',
  };

  it('renders accessible directional buttons with proper aria-labels and titles', () => {
    render(
      <Task
        task={sampleTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        canMoveLeft={true}
        canMoveRight={true}
        onMoveLeft={vi.fn()}
        onMoveRight={vi.fn()}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /Mover para coluna anterior/i });
    const nextBtn = screen.getByRole('button', { name: /Mover para próxima coluna/i });

    expect(prevBtn).toBeDefined();
    expect(nextBtn).toBeDefined();
    expect(prevBtn.getAttribute('title')).toBe('Mover para coluna anterior');
    expect(nextBtn.getAttribute('title')).toBe('Mover para próxima coluna');
  });

  it('triggers onMoveLeft and onMoveRight callbacks upon click without initiating drag', () => {
    const handleMoveLeft = vi.fn();
    const handleMoveRight = vi.fn();

    render(
      <Task
        task={sampleTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        canMoveLeft={true}
        canMoveRight={true}
        onMoveLeft={handleMoveLeft}
        onMoveRight={handleMoveRight}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /Mover para coluna anterior/i });
    const nextBtn = screen.getByRole('button', { name: /Mover para próxima coluna/i });

    fireEvent.click(prevBtn);
    expect(handleMoveLeft).toHaveBeenCalledWith('task-nav-1');

    fireEvent.click(nextBtn);
    expect(handleMoveRight).toHaveBeenCalledWith('task-nav-1');
  });

  it('preserves button focusability and accessibility for keyboard navigation', () => {
    render(
      <Task
        task={sampleTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        canMoveLeft={true}
        canMoveRight={true}
        onMoveLeft={vi.fn()}
        onMoveRight={vi.fn()}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /Mover para coluna anterior/i });
    prevBtn.focus();
    expect(document.activeElement).toBe(prevBtn);
  });
});
