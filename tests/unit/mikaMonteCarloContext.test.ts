import { describe, it, expect } from 'vitest';
import { buildMikaMonteCarloTelemetry } from '../../src/services/ai/mikaMonteCarloContext';
import { TaskModel } from '../../src/types/kanban';

describe('mikaMonteCarloContext (Feature 057 - Foundational)', () => {
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
      sprintId: 'sprint-1',
    },
  ];

  // 12 historical tasks on distinct days to fulfill NIST N >= 10
  const historicalSufficient: TaskModel[] = Array.from({ length: 12 }, (_, i) => ({
    id: `hist-${i}`,
    title: `Entrega Histórica ${i}`,
    column: 'done',
    createdAt: '2026-09-01T10:00:00Z',
    completedAt: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
  }));

  const allTasksSufficient = [...mockTasks, ...historicalSufficient];

  it('builds complete telemetry when throughput sample is sufficient', () => {
    const telemetry = buildMikaMonteCarloTelemetry(allTasksSufficient, fixedRefDate, 500);

    expect(telemetry.sampleValidation.isSampleSufficient).toBe(true);
    expect(telemetry.sampleValidation.deliveryDays).toBeGreaterThanOrEqual(10);

    // Initiatives
    expect(telemetry.initiatives.length).toBe(1);
    const init1 = telemetry.initiatives[0];
    expect(init1.id).toBe('init-1');
    expect(init1.title).toBe('Iniciativa Portal Web');
    expect(init1.pendingCount).toBe(1); // card-1
    expect(init1.completedCount).toBe(1); // card-2
    expect(init1.p85Days).toBeGreaterThan(0);
    expect(init1.targetProbability).toBeDefined();

    // Active sprint
    expect(telemetry.activeSprint).toBeDefined();
    expect(telemetry.activeSprint?.id).toBe('sprint-1');
    expect(telemetry.activeSprint?.pendingCount).toBe(2); // card-1 and card-3

    // Default capacity
    expect(telemetry.defaultCapacity14Days).toBeDefined();
    expect(telemetry.defaultCapacity14Days?.windowDays).toBe(14);
    expect(telemetry.defaultCapacity14Days?.p85Items).toBeGreaterThanOrEqual(0);

    // General backlog
    expect(telemetry.generalBacklogPendingCount).toBe(2); // card-1, card-3
    expect(telemetry.generalBacklogP85Days).toBeGreaterThan(0);
  });

  it('handles insufficient historical throughput gracefully with NIST warning', () => {
    const telemetry = buildMikaMonteCarloTelemetry(mockTasks, fixedRefDate, 500);

    expect(telemetry.sampleValidation.isSampleSufficient).toBe(false);
    expect(telemetry.sampleValidation.warningReason).toBeDefined();
  });

  it('handles empty task list without errors', () => {
    const telemetry = buildMikaMonteCarloTelemetry([], fixedRefDate, 100);

    expect(telemetry.sampleValidation.isSampleSufficient).toBe(false);
    expect(telemetry.initiatives).toEqual([]);
    expect(telemetry.activeSprint).toBeUndefined();
    expect(telemetry.generalBacklogPendingCount).toBe(0);
  });
});
