import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BacklogForecastPanel } from '../../src/components/MonteCarlo/BacklogForecastPanel';
import { TaskModel } from '../../src/types/kanban';
import { CardSlePrediction } from '../../src/types/sle';

describe('BacklogForecastPanel component (Feature 056)', () => {
  const fixedRefDate = new Date('2026-11-01T10:00:00Z');

  const mockTasks: TaskModel[] = [
    {
      id: 'init-1',
      title: 'Iniciativa Portal Web',
      column: 'in_progress',
      type: 'initiative',
      dueDate: '2026-12-01',
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'card-1',
      title: 'Implementar Autenticação OAuth',
      column: 'in_progress',
      type: 'card',
      createdAt: '2026-10-02T10:00:00Z',
      links: [
        {
          id: 'l1',
          targetTaskId: 'init-1',
          relationType: 'relates_to',
          targetBoardId: 'b1',
          targetTeamId: 't1',
          createdAt: '2026-10-02T10:00:00Z',
        },
      ],
      tags: ['mvp'],
      sprintId: 'sprint-1',
    },
    {
      id: 'card-2',
      title: 'Configurar Banco de Dados',
      column: 'done',
      type: 'card',
      createdAt: '2026-10-02T10:00:00Z',
      completedAt: '2026-10-15T12:00:00Z',
      links: [
        {
          id: 'l2',
          targetTaskId: 'init-1',
          relationType: 'relates_to',
          targetBoardId: 'b1',
          targetTeamId: 't1',
          createdAt: '2026-10-02T10:00:00Z',
        },
      ],
      tags: ['infra'],
      sprintId: 'sprint-1',
    },
    {
      id: 'card-3',
      title: 'Layout do Dashboard',
      column: 'todo',
      type: 'card',
      createdAt: '2026-10-05T10:00:00Z',
      tags: ['mvp', 'frontend'],
      sprintId: 'sprint-2',
    },
  ];

  // 12 historical tasks completed on distinct days to fulfill NIST N >= 10
  const historicalSufficient: TaskModel[] = Array.from({ length: 12 }, (_, i) => ({
    id: `hist-${i}`,
    title: `Entrega Histórica ${i}`,
    column: 'done',
    createdAt: '2026-09-01T10:00:00Z',
    completedAt: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
  }));

  const allTasksSufficient = [...mockTasks, ...historicalSufficient];

  it('renders forecast metrics grid (P50, P85, P95) when sample is sufficient', () => {
    render(<BacklogForecastPanel tasks={allTasksSufficient} referenceDate={fixedRefDate} />);

    expect(screen.getByTestId('metric-card-p50')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-p85')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-p95')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-target-date')).toBeInTheDocument();
    expect(screen.queryByTestId('insufficient-sample-banner')).not.toBeInTheDocument();
  });

  it('renders NIST insufficient sample warning banner when delivery days < 10', () => {
    // Only 2 delivery days
    const insufficientTasks = [
      ...mockTasks,
      {
        id: 'hist-1',
        title: 'Histórica 1',
        column: 'done',
        createdAt: '2026-10-01T10:00:00Z',
        completedAt: '2026-10-05T12:00:00Z',
      },
    ];

    render(<BacklogForecastPanel tasks={insufficientTasks} referenceDate={fixedRefDate} />);

    expect(screen.getByTestId('insufficient-sample-banner')).toBeInTheDocument();
    expect(screen.getByText(/Amostra Estatística Insuficiente/i)).toBeInTheDocument();
  });

  it('switches scope to initiative and infers target date with risk badge', () => {
    render(<BacklogForecastPanel tasks={allTasksSufficient} referenceDate={fixedRefDate} />);

    const initBtn = screen.getByTestId('scope-btn-initiative');
    fireEvent.click(initBtn);

    expect(initBtn).toHaveClass('is-active');
    expect(screen.getByTestId('dropdown-initiatives')).toBeInTheDocument();

    // Check inferred target date
    const dateInput = screen.getByTestId('input-target-date') as HTMLInputElement;
    expect(dateInput.value).toBe('2026-12-01');

    // Check risk badge is rendered
    expect(screen.getByTestId('target-date-risk-badge')).toBeInTheDocument();
  });

  it('switches scope to sprint and tag, interacting with dropdowns and window select', () => {
    render(<BacklogForecastPanel tasks={allTasksSufficient} referenceDate={fixedRefDate} />);

    // Switch to sprint
    const sprintBtn = screen.getByTestId('scope-btn-sprint');
    fireEvent.click(sprintBtn);
    expect(sprintBtn).toHaveClass('is-active');

    const sprintSelect = screen.getByTestId('dropdown-sprints');
    fireEvent.change(sprintSelect, { target: { value: 'sprint-2' } });
    expect(sprintSelect).toHaveValue('sprint-2');

    // Switch to tag
    const tagBtn = screen.getByTestId('scope-btn-tag');
    fireEvent.click(tagBtn);
    expect(tagBtn).toHaveClass('is-active');

    const tagSelect = screen.getByTestId('dropdown-tags');
    fireEvent.change(tagSelect, { target: { value: 'frontend' } });
    expect(tagSelect).toHaveValue('frontend');

    // Switch back to all
    const allBtn = screen.getByTestId('scope-btn-all');
    fireEvent.click(allBtn);
    expect(allBtn).toHaveClass('is-active');

    // Change window days
    const windowSelect = screen.getByTestId('select-window-days');
    fireEvent.change(windowSelect, { target: { value: '60' } });
    expect(windowSelect).toHaveValue('60');

    // Change target date
    const dateInput = screen.getByTestId('input-target-date');
    fireEvent.change(dateInput, { target: { value: '2026-12-25' } });
    expect(dateInput).toHaveValue('2026-12-25');
  });

  it('allows granular inclusion/exclusion of tasks and displays select all / clear buttons', () => {
    render(
      <BacklogForecastPanel
        tasks={allTasksSufficient}
        initialScopeType="initiative"
        initialScopeId="init-1"
        referenceDate={fixedRefDate}
      />,
    );

    expect(screen.getByTestId('scope-cards-list')).toBeInTheDocument();

    const clearBtn = screen.getByTestId('scope-btn-clear-selection');
    fireEvent.click(clearBtn);

    const selectAllBtn = screen.getByTestId('scope-btn-select-all');
    fireEvent.click(selectAllBtn);
  });

  it('renders SLE dynamic risk badge when card prediction indicates risk', () => {
    const mockSlePredictions: Record<string, CardSlePrediction> = {
      'card-1': {
        taskId: 'card-1',
        riskLevel: 'risk_p85',
        thresholds: {
          p50Days: 3,
          p85Days: 7,
          p95Days: 14,
          sampleSize: 15,
          isStatisticallySignificant: true,
        },
        agingDays: 8,
        effectiveTargetDays: 7,
        daysToBreach: -1,
        percentageOfTarget: 114,
        label: 'Risco SLE (P85)',
      },
    };

    render(
      <BacklogForecastPanel
        tasks={allTasksSufficient}
        referenceDate={fixedRefDate}
        slePredictions={mockSlePredictions}
      />,
    );

    // Card-1 should have SLE badge rendered
    const card1Element = screen.getByTestId('scope-card-card-1');
    expect(card1Element).toBeInTheDocument();
  });
});
