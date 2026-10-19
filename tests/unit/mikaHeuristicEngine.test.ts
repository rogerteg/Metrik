import { describe, it, expect } from 'vitest';
import { MikaHeuristicEngine } from '../../src/services/ai/mikaHeuristicEngine';
import { ColumnModel, TaskModel } from '../../src/types/kanban';

describe('MikaHeuristicEngine', () => {
  const engine = new MikaHeuristicEngine();

  const mockColumns: ColumnModel[] = [
    { id: 'col-todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    {
      id: 'col-prog',
      title: 'Em Andamento',
      category: 'in_progress',
      wipLimit: 2,
      colorScheme: 'progress',
    },
    {
      id: 'col-done',
      title: 'Concluído',
      category: 'done',
      wipLimit: null,
      colorScheme: 'completed',
    },
  ];

  it('deve emitir insight informativo preliminar quando houver menos de 5 tarefas concluídas', () => {
    const tasks: TaskModel[] = [
      { id: 't1', title: 'Task 1', column: 'col-todo', createdAt: '2026-10-01T10:00:00Z' },
      {
        id: 't2',
        title: 'Task 2',
        column: 'col-done',
        createdAt: '2026-10-01T10:00:00Z',
        completedAt: '2026-10-02T10:00:00Z',
      },
    ];

    const insights = engine.generateBoardInsights(mockColumns, tasks);
    expect(insights.length).toBeGreaterThan(0);

    const preliminary = insights.find((i) =>
      i.summary.includes('amostrais ainda são preliminares'),
    );
    expect(preliminary).toBeDefined();
    expect(preliminary?.severity).toBe('info');
  });

  it('deve calcular Cycle Time P85 fielmente quando houver histórico suficiente', () => {
    const tasks: TaskModel[] = [
      {
        id: 't1',
        title: 'Task 1',
        column: 'col-done',
        createdAt: '2026-10-01T10:00:00Z',
        startedAt: '2026-10-01T10:00:00Z',
        completedAt: '2026-10-02T10:00:00Z',
      }, // 1 dia
      {
        id: 't2',
        title: 'Task 2',
        column: 'col-done',
        createdAt: '2026-10-01T10:00:00Z',
        startedAt: '2026-10-01T10:00:00Z',
        completedAt: '2026-10-03T10:00:00Z',
      }, // 2 dias
      {
        id: 't3',
        title: 'Task 3',
        column: 'col-done',
        createdAt: '2026-10-01T10:00:00Z',
        startedAt: '2026-10-01T10:00:00Z',
        completedAt: '2026-10-04T10:00:00Z',
      }, // 3 dias
      {
        id: 't4',
        title: 'Task 4',
        column: 'col-done',
        createdAt: '2026-10-01T10:00:00Z',
        startedAt: '2026-10-01T10:00:00Z',
        completedAt: '2026-10-05T10:00:00Z',
      }, // 4 dias
      {
        id: 't5',
        title: 'Task 5',
        column: 'col-done',
        createdAt: '2026-10-01T10:00:00Z',
        startedAt: '2026-10-01T10:00:00Z',
        completedAt: '2026-10-06T10:00:00Z',
      }, // 5 dias
      {
        id: 't6',
        title: 'Task 6',
        column: 'col-done',
        createdAt: '2026-10-01T10:00:00Z',
        startedAt: '2026-10-01T10:00:00Z',
        completedAt: '2026-10-07T10:00:00Z',
      }, // 6 dias
    ];

    const insights = engine.generateBoardInsights(mockColumns, tasks);
    const ctInsight = insights.find((i) => i.category === 'cycle-time');

    expect(ctInsight).toBeDefined();
    expect(ctInsight?.title).toContain('Tempo de Ciclo (SLE)');
    expect(ctInsight?.summary).toContain('85%');
  });

  it('deve alertar sobre violação de limite de WIP na coluna', () => {
    // mockColumns[1] tem wipLimit = 2
    const tasks: TaskModel[] = [
      { id: 't1', title: 'WIP 1', column: 'col-prog', createdAt: '2026-10-10T10:00:00Z' },
      { id: 't2', title: 'WIP 2', column: 'col-prog', createdAt: '2026-10-10T10:00:00Z' },
      { id: 't3', title: 'WIP 3', column: 'col-prog', createdAt: '2026-10-10T10:00:00Z' }, // Excede limite de 2!
    ];

    const insights = engine.generateBoardInsights(mockColumns, tasks);
    const wipInsight = insights.find((i) => i.category === 'wip-bottleneck');

    expect(wipInsight).toBeDefined();
    expect(wipInsight?.severity).toBe('warning');
    expect(wipInsight?.summary).toContain('Em Andamento');
    expect(wipInsight?.summary).toContain('excedendo o limite de WIP configurado (2)');
    expect(wipInsight?.affectedColumnId).toBe('col-prog');
  });

  it('deve decompor tarefas heurísticamente com subtarefas atômicas e critérios de aceite', () => {
    const task: TaskModel = {
      id: 'task-refine',
      title: 'Integrar conector de pagamento Stripe no checkout',
      description: 'Implementar fluxo de checkout transparente com cartão de crédito e PIX.',
      column: 'col-todo',
      createdAt: '2026-10-15T10:00:00Z',
    };

    const decomp = engine.decomposeTask(task);
    expect(decomp.taskId).toBe(task.id);
    expect(decomp.suggestedSubtasks.length).toBeGreaterThanOrEqual(3);
    expect(decomp.suggestedAcceptanceCriteria?.length).toBeGreaterThanOrEqual(1);
    expect(decomp.suggestedAcceptanceCriteria?.[0]).toContain('Dado');
  });

  it('deve orientar o usuário ao decompor tarefas com título muito curto ou vago', () => {
    const task: TaskModel = {
      id: 'task-short',
      title: 'Fix',
      column: 'col-todo',
      createdAt: '2026-10-15T10:00:00Z',
    };

    const decomp = engine.decomposeTask(task);
    expect(decomp.explanation).toContain('poucas informações');
    expect(decomp.suggestedSubtasks.length).toBeGreaterThan(0);
  });
});
