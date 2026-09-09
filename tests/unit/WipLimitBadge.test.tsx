import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WipLimitBadge } from '../../src/components/WipLimitBadge';

describe('WipLimitBadge Component (T008)', () => {
  it('renders count/limit when limit is configured', () => {
    render(
      <WipLimitBadge
        columnId="in-progress"
        currentCount={2}
        limit={3}
        onUpdateLimit={vi.fn()}
      />
    );

    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('renders count only when limit is null', () => {
    render(
      <WipLimitBadge
        columnId="todo"
        currentCount={5}
        limit={null}
        onUpdateLimit={vi.fn()}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders overload style when currentCount exceeds limit', () => {
    const { container } = render(
      <WipLimitBadge
        columnId="in-progress"
        currentCount={4}
        limit={3}
        onUpdateLimit={vi.fn()}
      />
    );

    expect(screen.getByText('4/3 ⚠️')).toBeInTheDocument();
    expect(container.querySelector('.badge-wip-overload')).toBeInTheDocument();
  });

  it('enters edit mode on click and saves new limit on Enter', () => {
    const handleUpdate = vi.fn();
    render(
      <WipLimitBadge
        columnId="in-progress"
        currentCount={2}
        limit={3}
        onUpdateLimit={handleUpdate}
      />
    );

    const badge = screen.getByText('2/3');
    fireEvent.click(badge);

    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleUpdate).toHaveBeenCalledWith('in-progress', 5);
  });

  it('clears limit when input is submitted empty', () => {
    const handleUpdate = vi.fn();
    render(
      <WipLimitBadge
        columnId="in-progress"
        currentCount={2}
        limit={3}
        onUpdateLimit={handleUpdate}
      />
    );

    const badge = screen.getByText('2/3');
    fireEvent.click(badge);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(handleUpdate).toHaveBeenCalledWith('in-progress', null);
  });
});
