import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskSlePopover } from '../../src/components/Task/TaskSlePopover';
import { CardSlePrediction } from '../../src/types/sle';

describe('TaskSlePopover Component (Feature 054)', () => {
  const mockPrediction: CardSlePrediction = {
    taskId: 'task-101',
    agingDays: 5.2,
    thresholds: {
      p50Days: 2.0,
      p85Days: 4.5,
      p95Days: 7.0,
      sampleSize: 20,
      isStatisticallySignificant: true,
    },
    effectiveTargetDays: 4.5,
    riskLevel: 'risk_p85',
    daysToBreach: -0.7,
    percentageOfTarget: 116,
    label: 'Risco SLE (P85)',
  };

  it('renders popover with tooltip role and accessible title', () => {
    render(<TaskSlePopover prediction={mockPrediction} onClose={vi.fn()} />);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(screen.getByText(/Diagnóstico de Previsibilidade \(SLE\)/i)).toBeInTheDocument();
  });

  it('displays current aging days, target, and breach delta', () => {
    render(<TaskSlePopover prediction={mockPrediction} onClose={vi.fn()} />);

    expect(screen.getByText(/5,2/)).toBeInTheDocument(); // 5.2 dias formatado
    expect(screen.getAllByText(/4,5/).length).toBeGreaterThanOrEqual(1); // SLE P85 e legenda
    expect(screen.getByText(/\+0,7 dias além do SLE/i)).toBeInTheDocument();
  });

  it('displays graduated percentile ruler with markers for P50, P85, and P95', () => {
    render(<TaskSlePopover prediction={mockPrediction} onClose={vi.fn()} />);

    expect(screen.getByText(/P50: 2,0d/i)).toBeInTheDocument();
    expect(screen.getByText(/P85: 4,5d/i)).toBeInTheDocument();
    expect(screen.getByText(/P95: 7,0d/i)).toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<TaskSlePopover prediction={mockPrediction} onClose={handleClose} />);

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
