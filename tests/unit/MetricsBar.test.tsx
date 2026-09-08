import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsBar } from '../../src/components/MetricsBar';
import { FlowMetricsSummary } from '../../src/types/kanban';

describe('MetricsBar Component (T017)', () => {
  it('renders default placeholder dashes when throughput is 0', () => {
    const emptyMetrics: FlowMetricsSummary = {
      throughput: 0,
      avgLeadTimeMs: null,
      avgCycleTimeMs: null,
      formattedAvgLeadTime: '-',
      formattedAvgCycleTime: '-',
    };

    render(<MetricsBar metrics={emptyMetrics} />);

    expect(screen.getByText('Throughput')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Lead Time Médio')).toBeInTheDocument();
    expect(screen.getByText('Cycle Time Médio')).toBeInTheDocument();

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBe(2);
  });

  it('renders formatted averages and throughput correctly when metrics are present', () => {
    const activeMetrics: FlowMetricsSummary = {
      throughput: 5,
      avgLeadTimeMs: 7200000, // 2h
      avgCycleTimeMs: 2700000, // 45m
      formattedAvgLeadTime: '2h 00m',
      formattedAvgCycleTime: '45m',
    };

    render(<MetricsBar metrics={activeMetrics} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2h 00m')).toBeInTheDocument();
    expect(screen.getByText('45m')).toBeInTheDocument();
  });
});
