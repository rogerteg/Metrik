import { describe, it, expect } from 'vitest';
import { matchMonteCarloForecastIntent } from '../../src/services/ai/mikaMonteCarloHeuristics';
import { MikaBoardTelemetryContext } from '../../src/types/mika';

describe('mikaMonteCarloHeuristics (Feature 057)', () => {
  const mockContextWithData: MikaBoardTelemetryContext = {
    boardId: 'b1',
    boardTitle: 'Quadro de Engenharia',
    columns: [],
    blockedTasks: [],
    cycleTimeP85Days: 14,
    throughputLast14Days: 10,
    totalActiveTasks: 5,
    totalCompletedTasks: 20,
    generatedAt: '2026-11-01T10:00:00Z',
    monteCarloTelemetry: {
      sampleValidation: {
        isSampleSufficient: true,
        deliveryDays: 15,
        totalDelivered: 20,
      },
      initiatives: [
        {
          id: 'init-1',
          title: 'Portal Web',
          pendingCount: 4,
          completedCount: 2,
          targetDate: '2026-12-15',
          p50Days: 10,
          p50Date: '2026-11-11',
          p85Days: 18,
          p85Date: '2026-11-19',
          p95Days: 25,
          p95Date: '2026-11-26',
          targetProbability: 92.5,
          riskLevel: 'low',
        },
        {
          id: 'init-2',
          title: 'App Mobile',
          pendingCount: 8,
          completedCount: 0,
          targetDate: '2026-11-20',
          p50Days: 15,
          p50Date: '2026-11-16',
          p85Days: 24,
          p85Date: '2026-11-25',
          p95Days: 32,
          p95Date: '2026-12-03',
          targetProbability: 38.0,
          riskLevel: 'high',
        },
      ],
      activeSprint: {
        id: 'sprint-1',
        title: 'Sprint 1',
        pendingCount: 3,
        completedCount: 5,
        targetDate: '2026-11-15',
        p85Days: 8,
        p85Date: '2026-11-09',
        targetProbability: 88.0,
        riskLevel: 'low',
      },
      defaultCapacity14Days: {
        windowDays: 14,
        p50Items: 12,
        p85Items: 8,
        p95Items: 5,
      },
      generalBacklogPendingCount: 15,
      generalBacklogP85Days: 30,
      generalBacklogP85Date: '2026-12-01',
    },
  };

  it('matches specific initiative query and returns P50, P85, P95 and target probability', () => {
    const result = matchMonteCarloForecastIntent(
      'quando entregamos a iniciativa portal?',
      mockContextWithData,
    );

    expect(result).not.toBeNull();
    expect(result?.category).toBe('forecast_initiative');
    expect(result?.referencedTaskIds).toContain('init-1');
    expect(result?.content).toContain('Portal Web');
    expect(result?.content).toContain('P50');
    expect(result?.content).toContain('P85');
    expect(result?.content).toContain('P95');
    expect(result?.content).toContain('92.5%');
    expect(result?.content).toContain('Baixo Risco');

    // CTA Action
    expect(result?.action).toBeDefined();
    expect(result?.action?.type).toBe('NAVIGATE_TO_FORECAST');
    expect(result?.action?.scopeType).toBe('initiative');
    expect(result?.action?.scopeId).toBe('init-1');
  });

  it('matches portfolio overview query and lists all active initiatives (Clarification 1 - Option A)', () => {
    const result = matchMonteCarloForecastIntent(
      'como estao os prazos das iniciativas?',
      mockContextWithData,
    );

    expect(result).not.toBeNull();
    expect(result?.category).toBe('forecast_initiative');
    expect(result?.referencedTaskIds).toContain('init-1');
    expect(result?.referencedTaskIds).toContain('init-2');
    expect(result?.content).toContain('Portal Web');
    expect(result?.content).toContain('App Mobile');
    expect(result?.content).toContain('Baixo Risco');
    expect(result?.content).toContain('Alto Risco');
  });

  it('matches capacity query and reports default 14-day assumption (Clarification 2 - Option A)', () => {
    const result = matchMonteCarloForecastIntent(
      'quantos itens cabem na proxima sprint?',
      mockContextWithData,
    );

    expect(result).not.toBeNull();
    expect(result?.category).toBe('forecast_capacity');
    expect(result?.content).toContain('14 dias');
    expect(result?.content).toContain('8 itens'); // P85
    expect(result?.content).toContain('85% de certeza');
  });

  it('matches active sprint delay risk query and reports sprint forecast', () => {
    const result = matchMonteCarloForecastIntent(
      'a sprint atual vai atrasar?',
      mockContextWithData,
    );

    expect(result).not.toBeNull();
    expect(result?.category).toBe('forecast_sprint');
    expect(result?.content).toContain('Sprint 1');
    expect(result?.content).toContain('88%');
    expect(result?.action?.scopeType).toBe('sprint');
    expect(result?.action?.scopeId).toBe('sprint-1');
  });

  it('matches general backlog query and reports overall backlog P85', () => {
    const result = matchMonteCarloForecastIntent(
      'quando entregamos todo o backlog?',
      mockContextWithData,
    );

    expect(result).not.toBeNull();
    expect(result?.category).toBe('forecast_general');
    expect(result?.content).toContain('15 tarefas pendentes');
    expect(result?.content).toContain('30 dias');
    expect(result?.action?.scopeType).toBe('all');
  });

  it('includes NIST warning when throughput delivery sample < 10', () => {
    const contextInsufficient: MikaBoardTelemetryContext = {
      ...mockContextWithData,
      monteCarloTelemetry: {
        ...mockContextWithData.monteCarloTelemetry!,
        sampleValidation: {
          isSampleSufficient: false,
          deliveryDays: 4,
          totalDelivered: 5,
          warningReason: 'Menos de 10 dias com entregas',
        },
      },
    };

    const result = matchMonteCarloForecastIntent(
      'quando entregamos a iniciativa portal?',
      contextInsufficient,
    );
    expect(result).not.toBeNull();
    expect(result?.content).toContain('⚠️');
    expect(result?.content).toContain('Amostra Estatística Reduzida');
  });

  it('returns null when query is unrelated to forecasting', () => {
    const result = matchMonteCarloForecastIntent(
      'quais tarefas estao bloqueadas?',
      mockContextWithData,
    );
    expect(result).toBeNull();
  });

  it('handles query when no active sprint exists', () => {
    const contextNoSprint: MikaBoardTelemetryContext = {
      ...mockContextWithData,
      monteCarloTelemetry: {
        ...mockContextWithData.monteCarloTelemetry!,
        activeSprint: undefined,
      },
    };
    const result = matchMonteCarloForecastIntent('a sprint atual vai atrasar?', contextNoSprint);
    expect(result).not.toBeNull();
    expect(result?.content).toContain('Não identifiquei nenhuma sprint ativa');
  });

  it('scales capacity calculation for custom requested window duration (e.g. 28 dias)', () => {
    const result = matchMonteCarloForecastIntent(
      'quantos itens cabem em 28 dias?',
      mockContextWithData,
    );
    expect(result).not.toBeNull();
    expect(result?.category).toBe('forecast_capacity');
    expect(result?.content).toContain('28 dias');
    expect(result?.content).toContain('15 itens');
  });

  it('returns informative fallback for general forecast query with active initiatives', () => {
    const result = matchMonteCarloForecastIntent('qual a previsao?', mockContextWithData);
    expect(result).not.toBeNull();
    expect(result?.referencedTaskIds).toContain('init-1');
  });

  it('returns null when monteCarloTelemetry is undefined', () => {
    const emptyContext: MikaBoardTelemetryContext = {
      ...mockContextWithData,
      monteCarloTelemetry: undefined,
    };
    const result = matchMonteCarloForecastIntent('quando entregamos?', emptyContext);
    expect(result).toBeNull();
  });

  describe('Flow Leverages Intent (Feature 058)', () => {
    const contextWithLeverages: MikaBoardTelemetryContext = {
      ...mockContextWithData,
      monteCarloTelemetry: {
        ...mockContextWithData.monteCarloTelemetry!,
        topLeverages: {
          boardId: 'b1',
          calculatedAt: '2026-11-01T10:00:00Z',
          isSampleSufficient: true,
          deliveryDaysCount: 15,
          items: [
            {
              id: 'lev-1',
              taskId: 'task-99',
              taskTitle: 'Desbloquear Gateway',
              category: 'cascade_unblock',
              impactDaysP85: 6,
              dependentTaskCount: 2,
              dependentTaskIds: ['task-100', 'task-101'],
              currentAgingDays: 5,
              rationale:
                'Desbloquear este item destrava 2 tarefas a jusante e pode economizar ~6 dias no prazo P85.',
            },
          ],
        },
      },
    };

    it('matches flow leverage queries and returns prescriptive plan with CTA action mode leverage', () => {
      const result = matchMonteCarloForecastIntent(
        'quais as alavancas de hoje?',
        contextWithLeverages,
      );
      expect(result).not.toBeNull();
      expect(result?.category).toBe('flow_leverage');
      expect(result?.referencedTaskIds).toContain('task-99');
      expect(result?.content).toContain('#task-99');
      expect(result?.content).toContain('~6 dias');
      expect(result?.action).toBeDefined();
      expect(result?.action?.mode).toBe('leverage');
    });

    it('matches "o que destravar primeiro" and returns leverage advice', () => {
      const result = matchMonteCarloForecastIntent(
        'o que destravar primeiro?',
        contextWithLeverages,
      );
      expect(result).not.toBeNull();
      expect(result?.category).toBe('flow_leverage');
      expect(result?.content).toContain('Top 1 Alavancas de Fluxo Prescritivas');
    });
  });
});
