import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CycleTimeScatterPlot } from '../../src/components/charts/CycleTimeScatterPlot';
import { TaskModel } from '../../src/types/kanban';

describe('CycleTimeScatterPlot Component', () => {
  const mockTasks: TaskModel[] = [
    {
      id: 'task-1',
      title: 'Tarefa Concluída Rápida',
      column: 'done',
      createdAt: '2026-09-01T10:00:00.000Z',
      startedAt: '2026-09-01T10:00:00.000Z',
      completedAt: '2026-09-02T10:00:00.000Z', // 1 dia
    },
    {
      id: 'task-2',
      title: 'Tarefa Mediana',
      column: 'done',
      createdAt: '2026-09-01T10:00:00.000Z',
      startedAt: '2026-09-01T10:00:00.000Z',
      completedAt: '2026-09-04T10:00:00.000Z', // 3 dias
    },
    {
      id: 'task-3',
      title: 'Tarefa Longa com Bloqueio',
      column: 'done',
      createdAt: '2026-09-01T10:00:00.000Z',
      startedAt: '2026-09-01T10:00:00.000Z',
      completedAt: '2026-09-10T10:00:00.000Z', // 9 dias
      blocked: true,
      totalBlockedMs: 86400000 * 2, // 2 dias bloqueada
    },
  ];

  it('renders empty state when there are no completed tasks', () => {
    render(<CycleTimeScatterPlot tasks={[]} />);
    expect(screen.getByTestId('scatter-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma tarefa concluída no período/i)).toBeInTheDocument();
  });

  it('renders scatter plot SVG, dots, and percentile lines', () => {
    render(<CycleTimeScatterPlot tasks={mockTasks} initialTimeWindowDays={30} />);

    // Container deve estar presente
    expect(screen.getByTestId('cycle-time-scatter-plot')).toBeInTheDocument();

    // Scatter dots devem estar renderizados para as 3 tarefas
    expect(screen.getByTestId('scatter-dot-task-1')).toBeInTheDocument();
    expect(screen.getByTestId('scatter-dot-task-2')).toBeInTheDocument();
    expect(screen.getByTestId('scatter-dot-task-3')).toBeInTheDocument();

    // As linhas de percentil 50, 85 e 95 devem estar presentes por padrão
    expect(screen.getByTestId('percentile-line-50')).toBeInTheDocument();
    expect(screen.getByTestId('percentile-line-85')).toBeInTheDocument();
    expect(screen.getByTestId('percentile-line-95')).toBeInTheDocument();
  });

  it('highlights blocked task dots when highlightBlocked is enabled', () => {
    render(<CycleTimeScatterPlot tasks={mockTasks} />);

    const blockedDot = screen.getByTestId('scatter-dot-task-3');
    expect(blockedDot).toHaveClass('is-blocked');

    const normalDot = screen.getByTestId('scatter-dot-task-1');
    expect(normalDot).not.toHaveClass('is-blocked');
  });

  it('toggles percentile lines visibility via ChartControlsPanel', () => {
    render(<CycleTimeScatterPlot tasks={mockTasks} />);

    // Abre o painel retrátil de controles
    const toggleBtn = screen.getByTestId('controls-panel-toggle');
    fireEvent.click(toggleBtn);

    const drawer = screen.getByTestId('chart-controls-drawer');
    expect(drawer).toHaveClass('is-open');

    // Desliga a linha de 95%
    const switchP95 = screen.getByTestId('switch-p95');
    fireEvent.click(switchP95);

    // Linha de 95% não deve mais estar visível no DOM
    expect(screen.queryByTestId('percentile-line-95')).toBeNull();

    // Linha de 50% e 85% continuam presentes
    expect(screen.getByTestId('percentile-line-50')).toBeInTheDocument();
    expect(screen.getByTestId('percentile-line-85')).toBeInTheDocument();
  });

  it('toggles highlight blocked points via ChartControlsPanel', () => {
    render(<CycleTimeScatterPlot tasks={mockTasks} />);

    // Abre o painel
    fireEvent.click(screen.getByTestId('controls-panel-toggle'));

    // Desliga o switch de itens bloqueados
    const switchBlocked = screen.getByTestId('switch-highlight-blocked');
    fireEvent.click(switchBlocked);

    // Agora o ponto da tarefa 3 não deve ter a classe de destaque
    const blockedDot = screen.getByTestId('scatter-dot-task-3');
    expect(blockedDot).not.toHaveClass('is-blocked');
  });
});
