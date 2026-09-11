import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MonteCarloSimulationView } from '../../src/components/MonteCarloSimulationView';
import { AnalyticsDashboard } from '../../src/components/AnalyticsDashboard';
import { TaskModel } from '../../src/types/kanban';

const mockTasksWithHistory: TaskModel[] = [
  {
    id: 't1',
    title: 'Task 1',
    column: 'done',
    tags: [],
    createdAt: '2026-08-10T00:00:00Z',
    completedAt: '2026-08-15T12:00:00Z',
  },
  {
    id: 't2',
    title: 'Task 2',
    column: 'done',
    tags: [],
    createdAt: '2026-08-11T00:00:00Z',
    completedAt: '2026-08-20T12:00:00Z',
  },
  {
    id: 't3',
    title: 'Task 3',
    column: 'done',
    tags: [],
    createdAt: '2026-08-12T00:00:00Z',
    completedAt: '2026-08-25T12:00:00Z',
  },
  {
    id: 't4',
    title: 'Task 4',
    column: 'done',
    tags: [],
    createdAt: '2026-08-15T00:00:00Z',
    completedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 't5',
    title: 'Task 5',
    column: 'done',
    tags: [],
    createdAt: '2026-08-20T00:00:00Z',
    completedAt: '2026-09-05T12:00:00Z',
  },
  {
    id: 't6',
    title: 'Task 6 (Open)',
    column: 'in_progress',
    tags: [],
    createdAt: '2026-09-06T00:00:00Z',
  },
];

describe('Feature 019: MonteCarloSimulationView UI', () => {
  it('renders guidance card when task history is insufficient', () => {
    render(<MonteCarloSimulationView tasks={[]} />);
    expect(screen.getByTestId('monte-carlo-guidance')).toBeInTheDocument();
    expect(screen.getByText(/Histórico de Throughput Insuficiente/i)).toBeInTheDocument();
  });

  it('renders How Many mode controls and percentile summary cards', () => {
    render(<MonteCarloSimulationView tasks={mockTasksWithHistory} />);
    
    expect(screen.getByTestId('mode-how-many-btn')).toHaveClass('is-active');
    expect(screen.getByTestId('target-days-input')).toBeInTheDocument();
    expect(screen.getByTestId('how-many-cards')).toBeInTheDocument();
    expect(screen.getByTestId('monte-carlo-histogram')).toBeInTheDocument();

    expect(screen.getByText(/50% de Certeza/i)).toBeInTheDocument();
    expect(screen.getByText(/85% de Certeza/i)).toBeInTheDocument();
    expect(screen.getByText(/95% de Certeza/i)).toBeInTheDocument();
  });

  it('switches to When mode when user clicks the When toggle button', () => {
    render(<MonteCarloSimulationView tasks={mockTasksWithHistory} />);

    const whenBtn = screen.getByTestId('mode-when-btn');
    fireEvent.click(whenBtn);

    expect(whenBtn).toHaveClass('is-active');
    expect(screen.getByTestId('item-count-input')).toBeInTheDocument();
    expect(screen.getByTestId('when-cards')).toBeInTheDocument();

    // Deve conter botão de preenchimento rápido com itens em aberto
    const quickFillBtn = screen.getByTestId('use-open-tasks-btn');
    expect(quickFillBtn).toBeInTheDocument();
    fireEvent.click(quickFillBtn);
    expect(screen.getByTestId('item-count-input')).toHaveValue(1);
  });

  it('allows changing sample history window and recalculates simulation', () => {
    render(<MonteCarloSimulationView tasks={mockTasksWithHistory} />);

    const select = screen.getByTestId('history-days-select');
    fireEvent.change(select, { target: { value: '60' } });

    expect(select).toHaveValue('60');
    expect(screen.getByTestId('how-many-cards')).toBeInTheDocument();
  });

  it('integrates seamlessly with AnalyticsDashboard forecasting tab', () => {
    render(<AnalyticsDashboard tasks={mockTasksWithHistory} />);

    const forecastingTab = screen.getByTestId('tab-forecasting');
    expect(forecastingTab).toBeInTheDocument();

    fireEvent.click(forecastingTab);
    expect(screen.getByTestId('focused-forecasting-view')).toBeInTheDocument();
    expect(screen.getByTestId('monte-carlo-simulation-view')).toBeInTheDocument();
  });
});
