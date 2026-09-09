import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CumulativeFlowChart } from '../../src/components/charts/CumulativeFlowChart';
import { CfdDataPoint } from '../../src/types/analytics';

describe('CumulativeFlowChart Component (Feature 011)', () => {
  const mockData: CfdDataPoint[] = [
    {
      date: '2026-09-01',
      done: 1,
      inProgress: 2,
      todo: 3,
      total: 6,
      cumulativeStarted: 3,
      cumulativeDone: 1,
    },
    {
      date: '2026-09-02',
      done: 2,
      inProgress: 2,
      todo: 3,
      total: 7,
      cumulativeStarted: 4,
      cumulativeDone: 2,
    },
  ];

  it('renders title, axis labels, and color-coded legend', () => {
    render(<CumulativeFlowChart data={mockData} maxTotal={7} />);

    expect(screen.getByText('Diagrama de Fluxo Cumulativo (CFD)')).toBeInTheDocument();
    expect(screen.getByText('A Fazer (Backlog)')).toBeInTheDocument();
    expect(screen.getByText('Em Progresso (WIP)')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('Total de Tarefas Acumuladas')).toBeInTheDocument();
  });

  it('displays empty state message when isEmpty is true', () => {
    render(<CumulativeFlowChart data={[]} maxTotal={1} isEmpty={true} />);

    expect(screen.getByText('Nenhuma tarefa registrada no período')).toBeInTheDocument();
  });

  it('renders SVG chart with polygon layers when data is present', () => {
    const { container } = render(<CumulativeFlowChart data={mockData} maxTotal={7} />);

    const svg = screen.getByTestId('cfd-svg');
    expect(svg).toBeInTheDocument();

    const polygons = container.querySelectorAll('polygon');
    expect(polygons.length).toBe(3); // Todo, InProgress, Done
  });

  it('shows tooltip on mouse move and hides on mouse leave', () => {
    render(<CumulativeFlowChart data={mockData} maxTotal={7} />);

    const svg = screen.getByTestId('cfd-svg');

    // Simulate getBoundingClientRect for SVG
    svg.getBoundingClientRect = () => ({
      width: 600,
      height: 240,
      top: 0,
      left: 0,
      bottom: 240,
      right: 600,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    fireEvent.mouseMove(svg, { clientX: 50, clientY: 100 });

    expect(screen.getAllByText(/2026-09-01/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Total no Sistema:/)).toBeInTheDocument();

    fireEvent.mouseLeave(svg);
    expect(screen.queryByText(/Total no Sistema:/)).not.toBeInTheDocument();
  });
});
