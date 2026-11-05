import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TargetDateRiskBadge } from '../../src/components/MonteCarlo/TargetDateRiskBadge';
import { TargetDateProbabilityResult } from '../../specs/056-monte-carlo-backlog-forecast/contracts/backlog-forecast-contracts';

describe('TargetDateRiskBadge component (Feature 056)', () => {
  it('returns null when result is undefined or null', () => {
    const { container } = render(<TargetDateRiskBadge result={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders low risk badge with green indicator', () => {
    const mockResult: TargetDateProbabilityResult = {
      targetDate: '2026-12-15',
      availableDays: 45,
      probability: 92.5,
      successfulTrials: 9250,
      totalTrials: 10000,
      riskLevel: 'low',
      statusMessage:
        'Excelente probabilidade (92.5%). Compromisso de prazo estatisticamente seguro.',
    };

    render(<TargetDateRiskBadge result={mockResult} />);
    const badge = screen.getByTestId('target-date-risk-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('risk-low');
    expect(screen.getByText(/92.5% — Baixo Risco/i)).toBeInTheDocument();
    expect(badge).toHaveAttribute('title', mockResult.statusMessage);
  });

  it('renders moderate, high, and critical risk badges correctly', () => {
    const riskLevels: Array<{
      level: 'moderate' | 'high' | 'critical';
      label: string;
      prob: number;
    }> = [
      { level: 'moderate', label: 'Risco Moderado', prob: 75 },
      { level: 'high', label: 'Alto Risco', prob: 45 },
      { level: 'critical', label: 'Risco Crítico', prob: 12 },
    ];

    for (const { level, label, prob } of riskLevels) {
      const mockResult: TargetDateProbabilityResult = {
        targetDate: '2026-12-01',
        availableDays: 30,
        probability: prob,
        successfulTrials: prob * 100,
        totalTrials: 10000,
        riskLevel: level,
        statusMessage: `Status ${level}`,
      };

      const { unmount } = render(<TargetDateRiskBadge result={mockResult} />);
      const badge = screen.getByTestId('target-date-risk-badge');
      expect(badge).toHaveClass(`risk-${level}`);
      expect(screen.getByText(new RegExp(`${prob}% — ${label}`, 'i'))).toBeInTheDocument();
      unmount();
    }
  });

  it('renders fallback label when riskLevel is unmapped', () => {
    const mockResult = {
      targetDate: '2026-12-01',
      availableDays: 30,
      probability: 50,
      successfulTrials: 500,
      totalTrials: 1000,
      riskLevel: 'unknown_level' as unknown as 'low',
      statusMessage: 'Status desconhecido',
    };

    render(<TargetDateRiskBadge result={mockResult} />);
    expect(screen.getByText(/50% — Desconhecido/i)).toBeInTheDocument();
  });
});
