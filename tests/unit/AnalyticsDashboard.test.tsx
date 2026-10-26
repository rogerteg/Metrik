import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalyticsDashboard } from '../../src/components/AnalyticsDashboard';
import { TaskModel } from '../../src/types/kanban';

describe('AnalyticsDashboard Component (Feature 011 & 030 Integration)', () => {
  const sampleTasks: TaskModel[] = [
    {
      id: 't1',
      title: 'Task Alpha',
      column: 'done',
      createdAt: '2026-09-01T09:00:00Z',
      startedAt: '2026-09-02T09:00:00Z',
      completedAt: '2026-09-03T09:00:00Z',
    },
    {
      id: 't2',
      title: 'Task Beta',
      column: 'in_progress',
      createdAt: '2026-09-02T09:00:00Z',
      startedAt: '2026-09-03T09:00:00Z',
    },
    {
      id: 't3',
      title: 'Task Gamma',
      column: 'todo',
      createdAt: '2026-09-03T09:00:00Z',
    },
  ];

  it('renders summary metrics bar and all three analytics charts on default dashboard', () => {
    render(<AnalyticsDashboard tasks={sampleTasks} />);

    // Metrics Bar & Charts
    expect(screen.getAllByText(/Throughput/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Lead Time Médio/i)).toBeInTheDocument();
    expect(screen.getByText(/Cycle Time Médio/i)).toBeInTheDocument();

    // Cumulative Flow Diagram
    expect(screen.getByText('Diagrama de Fluxo Cumulativo (CFD)')).toBeInTheDocument();
    expect(screen.getByTestId('cfd-svg')).toBeInTheDocument();

    // Throughput Chart
    expect(screen.getByText('Throughput (Últimos 14 dias)')).toBeInTheDocument();

    // Cycle Time Scatter Plot with Percentiles
    expect(screen.getByText(/Cycle Time \(Percentis\)/i)).toBeInTheDocument();
  });

  it('navigates seamlessly across categorized flow views', () => {
    render(<AnalyticsDashboard tasks={sampleTasks} />);

    // Navigate to Flow / CFD tab
    const flowTab = screen.getByTestId('tab-flow');
    fireEvent.click(flowTab);
    expect(screen.getByTestId('focused-cfd-view')).toBeInTheDocument();

    // Navigate to WIP Aging tab
    const wipTab = screen.getByTestId('tab-wip');
    fireEvent.click(wipTab);
    expect(screen.getByTestId('focused-wip-view')).toBeInTheDocument();

    // Navigate to Throughput tab
    const throughputTab = screen.getByTestId('tab-throughput');
    fireEvent.click(throughputTab);
    expect(screen.getByTestId('focused-throughput-view')).toBeInTheDocument();

    // Navigate back to Dashboard
    const dashboardTab = screen.getByTestId('tab-dashboard');
    fireEvent.click(dashboardTab);
    expect(screen.getByText('Diagrama de Fluxo Cumulativo (CFD)')).toBeInTheDocument();
  });

  it('opens and closes expanded modal for charts', () => {
    render(<AnalyticsDashboard tasks={sampleTasks} />);

    // Click expand on CFD chart
    const expandCfdBtn = screen.getByRole('button', { name: /Expandir gráfico CFD/i });
    expect(expandCfdBtn).toBeInTheDocument();
    fireEvent.click(expandCfdBtn);

    // Modal opens
    const modal = screen.getByRole('dialog', { name: /Visualização ampliada do gráfico/i });
    expect(modal).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByRole('button', { name: /Restaurar gráfico CFD/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates to cycle-time, blockers, sles and forecasting views', () => {
    render(<AnalyticsDashboard tasks={sampleTasks} />);

    // Cycle time tab
    const cycleTab = screen.getByTestId('tab-cycle-time');
    fireEvent.click(cycleTab);
    expect(screen.getByTestId('focused-cycle-time-view')).toBeInTheDocument();

    // Blockers tab
    const blockersTab = screen.getByTestId('tab-blockers');
    fireEvent.click(blockersTab);
    expect(screen.getByTestId('focused-blockers-view')).toBeInTheDocument();

    // SLEs tab
    const slesTab = screen.getByTestId('tab-sles');
    fireEvent.click(slesTab);
    expect(screen.getByTestId('focused-sles-view')).toBeInTheDocument();

    // Forecasting tab
    const forecastTab = screen.getByTestId('tab-forecasting');
    fireEvent.click(forecastTab);
    expect(screen.getByTestId('focused-forecasting-view')).toBeInTheDocument();
  });

  it('navigates through summary cards click handlers on dashboard', () => {
    render(<AnalyticsDashboard tasks={sampleTasks} />);

    // Ensure we are on dashboard
    fireEvent.click(screen.getByTestId('tab-dashboard'));

    // Click on WIP card
    const wipCard = screen.getByTestId('card-wip');
    fireEvent.click(wipCard);
    expect(screen.getByTestId('focused-wip-view')).toBeInTheDocument();

    // Return to dashboard and click SLE card
    fireEvent.click(screen.getByTestId('tab-dashboard'));
    const sleCard = screen.getByTestId('card-sle');
    fireEvent.click(sleCard);
    expect(screen.getByTestId('focused-sles-view')).toBeInTheDocument();

    // Return to dashboard and click Throughput card
    fireEvent.click(screen.getByTestId('tab-dashboard'));
    const tpCard = screen.getByTestId('card-throughput');
    fireEvent.click(tpCard);
    expect(screen.getByTestId('focused-throughput-view')).toBeInTheDocument();

    // Return to dashboard and click Blockers card
    fireEvent.click(screen.getByTestId('tab-dashboard'));
    const blCard = screen.getByTestId('card-blockers');
    fireEvent.click(blCard);
    expect(screen.getByTestId('focused-blockers-view')).toBeInTheDocument();
  });

  it('toggles dataset configuration drawer and updates time window', () => {
    render(<AnalyticsDashboard tasks={sampleTasks} />);

    // Dataset button in nav header
    const datasetBtn = screen.getByTestId('dataset-drawer-trigger');
    fireEvent.click(datasetBtn);

    // Drawer opens
    const drawer = screen.getByRole('dialog', { name: /configuração do conjunto de dados/i });
    expect(drawer).toBeInTheDocument();

    // Click 30 days window chip
    const window30Chip = screen.getByTestId('window-btn-30');
    fireEvent.click(window30Chip);

    // Close drawer
    const closeDrawerBtn = screen.getByRole('button', { name: /fechar painel de dados/i });
    fireEvent.click(closeDrawerBtn);

    expect(
      screen.queryByRole('dialog', { name: /configuração do conjunto de dados/i }),
    ).not.toBeInTheDocument();
  });
});
