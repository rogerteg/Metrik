import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SprintBurndownChart } from '../../src/components/SprintBurndownChart';
import { SprintBurndown } from '../../src/utils/sprintBurndown';

expect.extend(toHaveNoViolations);

/** Feature 039 — apresentação do burndown. */
const available: SprintBurndown = {
  available: true,
  committed: 4,
  points: [
    { day: '2026-09-01', ideal: 4, remaining: 4 },
    { day: '2026-09-02', ideal: 2, remaining: 3 },
    { day: '2026-09-03', ideal: 0, remaining: 1 },
  ],
};

const unavailable: SprintBurndown = { available: false, committed: 4, points: [] };

describe('SprintBurndownChart (Feature 039)', () => {
  it('renders ideal and real polylines when available', () => {
    render(<SprintBurndownChart burndown={available} />);
    expect(screen.getByTestId('burndown-chart')).toBeInTheDocument();
    expect(screen.getByTestId('burndown-ideal')).toBeInTheDocument();
    expect(screen.getByTestId('burndown-real')).toBeInTheDocument();
    expect(screen.getByTestId('burndown-committed')).toHaveTextContent('Escopo: 4');
  });

  it('shows an guidance message when there is no date window', () => {
    render(<SprintBurndownChart burndown={unavailable} />);
    expect(screen.getByTestId('burndown-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('burndown-chart')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SprintBurndownChart burndown={available} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
