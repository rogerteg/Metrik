import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TopLeveragesCard from '../../src/components/MonteCarlo/TopLeveragesCard';
import { TopLeveragesSummary } from '../../src/types/analytics';

describe('TopLeveragesCard (Feature 058 - US3)', () => {
  const sampleSummary: TopLeveragesSummary = {
    boardId: 'b1',
    calculatedAt: new Date().toISOString(),
    isSampleSufficient: true,
    deliveryDaysCount: 15,
    items: [
      {
        id: 'lev-1',
        taskId: 'task-101',
        taskTitle: 'Desbloquear Gateway de Pagamento',
        category: 'cascade_unblock',
        impactDaysP85: 5,
        dependentTaskCount: 3,
        dependentTaskIds: ['task-102', 'task-103'],
        currentAgingDays: 6,
        rationale:
          'Desbloquear este item destrava 3 tarefas a jusante e pode economizar ~5 dias no prazo P85.',
        columnTitle: 'Desenvolvimento',
      },
      {
        id: 'lev-2',
        taskId: 'task-202',
        taskTitle: 'Swarming em Autenticação OAuth',
        category: 'aging_swarming',
        impactDaysP85: 3,
        dependentTaskCount: 0,
        dependentTaskIds: [],
        currentAgingDays: 14,
        rationale:
          'Aplicar swarming neste item com aging crítico (14d) pode reduzir ~3 dias no P85.',
        columnTitle: 'Homologação',
      },
    ],
  };

  it('renders title, items, chips #ID and CTA button', () => {
    const onSelectTask = vi.fn();
    const onNavigateToSimulator = vi.fn();

    render(
      <TopLeveragesCard
        summary={sampleSummary}
        onSelectTask={onSelectTask}
        onNavigateToSimulator={onNavigateToSimulator}
      />,
    );

    expect(screen.getByText(/Top 3 Alavancas de Fluxo/i)).toBeInTheDocument();
    expect(screen.getByText(/Desbloquear Gateway de Pagamento/i)).toBeInTheDocument();
    expect(screen.getByText(/Swarming em Autenticação OAuth/i)).toBeInTheDocument();
    expect(screen.getAllByText(/~5 dias/i).length).toBeGreaterThanOrEqual(1);

    const chip = screen.getByText('#task-101');
    fireEvent.click(chip);
    expect(onSelectTask).toHaveBeenCalledWith('task-101');

    const ctaBtn = screen.getByRole('button', { name: /Abrir Simulador What-If/i });
    fireEvent.click(ctaBtn);
    expect(onNavigateToSimulator).toHaveBeenCalled();
  });

  it('displays NIST sample warning when sample is insufficient', () => {
    const insufficientSummary: TopLeveragesSummary = {
      ...sampleSummary,
      isSampleSufficient: false,
      deliveryDaysCount: 4,
    };

    render(<TopLeveragesCard summary={insufficientSummary} />);
    expect(screen.getByText(/Amostra preliminar/i)).toBeInTheDocument();
  });

  it('renders clean empty state when no leverages exist', () => {
    const emptySummary: TopLeveragesSummary = {
      boardId: 'b1',
      calculatedAt: new Date().toISOString(),
      isSampleSufficient: true,
      deliveryDaysCount: 15,
      items: [],
    };

    render(<TopLeveragesCard summary={emptySummary} />);
    expect(screen.getByText(/Nenhuma alavanca crítica detectada/i)).toBeInTheDocument();
  });
});
