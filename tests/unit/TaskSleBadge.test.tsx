import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskSleBadge } from '../../src/components/Task/TaskSleBadge';
import { CardSlePrediction } from '../../src/types/sle';

describe('TaskSleBadge Component (Feature 054)', () => {
  const mockThresholds = {
    p50Days: 2.0,
    p85Days: 4.5,
    p95Days: 7.0,
    sampleSize: 15,
    isStatisticallySignificant: true,
  };

  const createPrediction = (overrides: Partial<CardSlePrediction>): CardSlePrediction => ({
    taskId: 'task-1',
    agingDays: 1.0,
    thresholds: mockThresholds,
    effectiveTargetDays: 4.5,
    riskLevel: 'normal',
    daysToBreach: 3.5,
    percentageOfTarget: 22,
    label: 'No ritmo histórico',
    ...overrides,
  });

  it('renders nothing when prediction is undefined or riskLevel is normal', () => {
    const { container: emptyContainer } = render(<TaskSleBadge prediction={undefined} />);
    expect(emptyContainer.firstChild).toBeNull();

    const normalPrediction = createPrediction({ riskLevel: 'normal' });
    const { container: normalContainer } = render(<TaskSleBadge prediction={normalPrediction} />);
    expect(normalContainer.firstChild).toBeNull();
  });

  it('renders yellow badge for warning_p50 risk level', () => {
    const prediction = createPrediction({
      riskLevel: 'warning_p50',
      agingDays: 2.8,
      label: 'Atenção (P50)',
      daysToBreach: 1.7,
      percentageOfTarget: 62,
    });

    render(<TaskSleBadge prediction={prediction} />);

    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Atenção (P50)');
    expect(badge).toHaveClass('task-sle-badge', 'sle-warning-p50');
    expect(badge).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Alerta de SLE: Atenção (P50)'),
    );
  });

  it('renders orange badge for risk_p85 risk level', () => {
    const prediction = createPrediction({
      riskLevel: 'risk_p85',
      agingDays: 5.2,
      label: 'Risco SLE (P85)',
      daysToBreach: -0.7,
      percentageOfTarget: 115,
    });

    render(<TaskSleBadge prediction={prediction} />);

    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Risco SLE (P85)');
    expect(badge).toHaveClass('task-sle-badge', 'sle-risk-p85');
  });

  it('renders red badge with critical highlight for critical_p95 risk level', () => {
    const prediction = createPrediction({
      riskLevel: 'critical_p95',
      agingDays: 8.5,
      label: 'Crítico (P95)',
      daysToBreach: -4.0,
      percentageOfTarget: 188,
    });

    render(<TaskSleBadge prediction={prediction} />);

    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Crítico (P95)');
    expect(badge).toHaveClass('task-sle-badge', 'sle-critical-p95');
  });

  it('renders neutral indicator when sample size is insufficient', () => {
    const prediction = createPrediction({
      riskLevel: 'insufficient_data',
      label: 'Amostra insuficiente (< 5 itens)',
    });

    const { container } = render(<TaskSleBadge prediction={prediction} showInsufficientNotice />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText(/Amostra insuficiente/i)).toBeInTheDocument();
  });
});
