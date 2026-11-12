import { describe, it, expect } from 'vitest';
import {
  buildBoardTelemetryContext,
  buildMikaSystemPrompt,
} from '../../src/services/ai/mikaContextBuilder';
import { ColumnModel, TaskModel } from '../../src/types/kanban';

describe('mikaContextBuilder (Feature 057)', () => {
  const fixedDate = new Date('2026-11-01T10:00:00Z');

  const mockBoard = { id: 'board-1', title: 'Quadro de Engenharia' };
  const mockColumns: ColumnModel[] = [
    { id: 'todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    {
      id: 'prog',
      title: 'Em Progresso',
      category: 'in_progress',
      wipLimit: 3,
      colorScheme: 'progress',
    },
    { id: 'done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  const mockTasks: TaskModel[] = [
    {
      id: 'init-1',
      title: 'Iniciativa Portal Web',
      column: 'prog',
      type: 'initiative',
      dueDate: '2026-12-01',
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'card-1',
      title: 'Tarefa 1',
      column: 'prog',
      type: 'card',
      createdAt: '2026-10-02T10:00:00Z',
      links: [
        {
          id: 'l1',
          targetTaskId: 'init-1',
          relationType: 'relates_to',
          targetBoardId: 'board-1',
          targetTeamId: 'team-1',
          createdAt: '2026-10-02T10:00:00Z',
        },
      ],
      sprintId: 'sprint-1',
    },
    ...Array.from({ length: 11 }, (_, i) => ({
      id: `done-${i}`,
      title: `Entrega ${i}`,
      column: 'done',
      createdAt: '2026-09-01T10:00:00Z',
      completedAt: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
    })),
  ];

  it('builds context with monteCarloTelemetry attached', () => {
    const context = buildBoardTelemetryContext(mockBoard, mockTasks, mockColumns, fixedDate);

    expect(context.boardId).toBe('board-1');
    expect(context.monteCarloTelemetry).toBeDefined();
    expect(context.monteCarloTelemetry?.sampleValidation.isSampleSufficient).toBe(true);
    expect(context.monteCarloTelemetry?.initiatives.length).toBe(1);
    expect(context.monteCarloTelemetry?.activeSprint?.id).toBe('sprint-1');
  });

  it('generates system prompt containing Monte Carlo forecast sections without competitor brands', () => {
    const context = buildBoardTelemetryContext(mockBoard, mockTasks, mockColumns, fixedDate);
    const prompt = buildMikaSystemPrompt(context);

    expect(prompt).toContain('PREVISÕES DE MONTE CARLO & CAPACIDADE');
    expect(prompt).toContain('INICIATIVAS ATIVAS');
    expect(prompt).toContain('SPRINT ATIVA');
    expect(prompt).toContain('CAPACIDADE 14 DIAS');

    // Principle VII: Zero brand leaks
    expect(prompt).not.toContain('Jira');
    expect(prompt).not.toContain('ClickUp');
    expect(prompt).not.toContain('Businessmap');
  });

  it('includes NIST sample warning in prompt when delivery sample < 10', () => {
    // Only 2 delivery days
    const smallTasks = mockTasks.slice(0, 4);
    const context = buildBoardTelemetryContext(mockBoard, smallTasks, mockColumns, fixedDate);
    const prompt = buildMikaSystemPrompt(context);

    expect(prompt).toContain('RESSALVA NIST');
    expect(prompt).toContain('Margem de erro estatística elevada');
  });
});
