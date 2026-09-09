import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsBar } from '../../src/components/MetricsBar';
import { FlowMetricsSummary } from '../../src/types/kanban';

describe('MetricsBar Component (T017 & Feature 013)', () => {
  it('renders default placeholder dashes and zero blocked count when throughput is 0', () => {
    const emptyMetrics: FlowMetricsSummary = {
      throughput: 0,
      avgLeadTimeMs: null,
      avgCycleTimeMs: null,
      formattedAvgLeadTime: '-',
      formattedAvgCycleTime: '-',
      flowEfficiency: null,
      formattedFlowEfficiency: '-',
      blockedCount: 0,
    };

    render(<MetricsBar metrics={emptyMetrics} />);

    expect(screen.getByText('Throughput')).toBeInTheDocument();
    expect(screen.getByLabelText('0 tarefas concluídas')).toBeInTheDocument();
    expect(screen.getByText('Lead Time Médio')).toBeInTheDocument();
    expect(screen.getByText('Cycle Time Médio')).toBeInTheDocument();
    expect(screen.getByText('Eficiência de Fluxo')).toBeInTheDocument();
    expect(screen.getByText('Bloqueios Ativos')).toBeInTheDocument();
    expect(screen.getByLabelText('Bloqueios Ativos: 0')).toBeInTheDocument();

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBe(3);
  });

  it('renders formatted averages, throughput, efficiency, and active blocks correctly when metrics are present', () => {
    const activeMetrics: FlowMetricsSummary = {
      throughput: 5,
      avgLeadTimeMs: 7200000, // 2h
      avgCycleTimeMs: 2700000, // 45m
      formattedAvgLeadTime: '2h 00m',
      formattedAvgCycleTime: '45m',
      flowEfficiency: 80.0,
      formattedFlowEfficiency: '80.0%',
      blockedCount: 2,
    };

    render(<MetricsBar metrics={activeMetrics} />);

    expect(screen.getByLabelText('5 tarefas concluídas')).toBeInTheDocument();
    expect(screen.getByText('2h 00m')).toBeInTheDocument();
    expect(screen.getByText('45m')).toBeInTheDocument();
    expect(screen.getByText('80.0%')).toBeInTheDocument();
    expect(screen.getByLabelText('Bloqueios Ativos: 2')).toBeInTheDocument();
  });
});
