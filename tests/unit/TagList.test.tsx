import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagList } from '../../src/components/TagList';

describe('TagList Component (US2)', () => {
  it('renders existing tags with correct names and remove buttons', () => {
    const handleRemove = vi.fn();
    render(<TagList tags={['Frontend', 'API']} onRemoveTag={handleRemove} />);

    expect(screen.getByText('Frontend')).toBeDefined();
    expect(screen.getByText('API')).toBeDefined();

    const removeBtns = screen.getAllByRole('button', { name: /remover tag/i });
    expect(removeBtns.length).toBe(2);

    fireEvent.click(removeBtns[0]);
    expect(handleRemove).toHaveBeenCalledWith('Frontend');
  });

  it('renders "+ Tag" button when not in input mode', () => {
    render(<TagList tags={[]} onAddTag={vi.fn()} onRemoveTag={vi.fn()} />);

    const addBtn = screen.getByRole('button', { name: /adicionar tag/i });
    expect(addBtn).toBeDefined();
    expect(addBtn.textContent).toContain('+ Tag');
  });

  it('opens input on "+ Tag" click and allows adding tag on Enter', () => {
    const handleAdd = vi.fn();
    render(<TagList tags={['Bug']} onAddTag={handleAdd} onRemoveTag={vi.fn()} />);

    const addBtn = screen.getByRole('button', { name: /adicionar tag/i });
    fireEvent.click(addBtn);

    const input = screen.getByPlaceholderText(/nova tag/i);
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: 'Release' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleAdd).toHaveBeenCalledWith('Release');
  });

  it('allows adding tag on comma key press', () => {
    const handleAdd = vi.fn();
    render(<TagList tags={[]} onAddTag={handleAdd} onRemoveTag={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /adicionar tag/i }));
    const input = screen.getByPlaceholderText(/nova tag/i);

    fireEvent.change(input, { target: { value: 'Backend,' } });
    fireEvent.keyDown(input, { key: ',' });

    expect(handleAdd).toHaveBeenCalledWith('Backend');
  });

  it('closes input without calling onAddTag when Escape is pressed', () => {
    const handleAdd = vi.fn();
    render(<TagList tags={[]} onAddTag={handleAdd} onRemoveTag={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /adicionar tag/i }));
    const input = screen.getByPlaceholderText(/nova tag/i);

    fireEvent.change(input, { target: { value: 'Draft' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(handleAdd).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText(/nova tag/i)).toBeNull();
  });
});
