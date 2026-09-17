import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardSummaryCards } from '../../src/components/DashboardSummaryCards';
import { ServiceLevelExpectation } from '../../src/types/analytics';

describe('DashboardSummaryCards component (Feature 030)', () => {
  const mockSle: ServiceLevelExpectation = {
    targetPercentile: 85,
    observedDays: 8.5,
    targetDays: 10,
    complianceRate: 92,
    sampleSize: 25,
    calculatedAt: '2026-09-17T12:00:00Z',
  };

  it('renders all 4 executive summary metric cards', () => {
    render(
      <DashboardSummaryCards
        sle={mockSle}
        totalWip={12}
        recentThroughput={7}
        blockedRatePercentage={15}
      />
    );

    // SLE Card
    expect(screen.getByTestId('card-sle')).toBeInTheDocument();
    expect(screen.getByText('8.5d')).toBeInTheDocument();
    expect(screen.getByText(/85% em até 8.5 dias/i)).toBeInTheDocument();

    // WIP Card
    expect(screen.getByTestId('card-wip')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    // Throughput Card
    expect(screen.getByTestId('card-throughput')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();

    // Blocker Rate Card
    expect(screen.getByTestId('card-blockers')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('triggers navigation callbacks when cards are clicked', () => {
    const handleNavigateToSle = vi.fn();
    const handleNavigateToWip = vi.fn();
    const handleNavigateToThroughput = vi.fn();
    const handleNavigateToBlockers = vi.fn();

    render(
      <DashboardSummaryCards
        sle={mockSle}
        totalWip={12}
        recentThroughput={7}
        blockedRatePercentage={15}
        onNavigateToSle={handleNavigateToSle}
        onNavigateToWip={handleNavigateToWip}
        onNavigateToThroughput={handleNavigateToThroughput}
        onNavigateToBlockers={handleNavigateToBlockers}
      />
    );

    fireEvent.click(screen.getByTestId('card-sle'));
    expect(handleNavigateToSle).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('card-wip'));
    expect(handleNavigateToWip).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('card-throughput'));
    expect(handleNavigateToThroughput).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('card-blockers'));
    expect(handleNavigateToBlockers).toHaveBeenCalledTimes(1);
  });
});
