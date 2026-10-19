import { describe, it, expect, beforeEach } from 'vitest';
import { MikaCacheManager } from '../../src/services/ai/mikaCacheManager';
import { TaskModel } from '../../src/types/kanban';
import { MikaInsight } from '../../src/types/mika';

describe('MikaCacheManager', () => {
  let cacheManager: MikaCacheManager;

  const mockTasks: TaskModel[] = [
    {
      id: 'task-1',
      title: 'Setup Kanban',
      column: 'col-todo',
      createdAt: '2026-10-10T10:00:00Z',
      updatedAt: '2026-10-10T10:00:00Z',
    },
    {
      id: 'task-2',
      title: 'Implement AI Copilot',
      column: 'col-progress',
      createdAt: '2026-10-11T10:00:00Z',
      updatedAt: '2026-10-11T12:00:00Z',
    },
  ];

  const mockInsights: MikaInsight[] = [
    {
      id: 'insight-1',
      title: 'Cycle Time Estável',
      summary: 'Percentil 85 está em 3.5 dias.',
      severity: 'info',
      category: 'cycle-time',
      timestamp: '2026-10-16T10:00:00Z',
    },
  ];

  beforeEach(() => {
    cacheManager = new MikaCacheManager();
    cacheManager.invalidate();
  });

  it('deve calcular checksum determinístico para o mesmo conjunto de tarefas', () => {
    const hash1 = cacheManager.computeBoardChecksum('board-a', mockTasks);
    const hash2 = cacheManager.computeBoardChecksum('board-a', [...mockTasks].reverse());
    expect(hash1).toBe(hash2);
  });

  it('deve mudar o checksum se uma tarefa for movida de coluna', () => {
    const hash1 = cacheManager.computeBoardChecksum('board-a', mockTasks);
    const modifiedTasks: TaskModel[] = [
      { ...mockTasks[0] },
      { ...mockTasks[1], column: 'col-done', lastMovedAt: '2026-10-16T12:00:00Z' },
    ];
    const hash2 = cacheManager.computeBoardChecksum('board-a', modifiedTasks);
    expect(hash1).not.toBe(hash2);
  });

  it('deve armazenar e recuperar insights em cache', () => {
    expect(cacheManager.get('board-a', mockTasks)).toBeNull();

    cacheManager.set('board-a', mockTasks, mockInsights);
    const cached = cacheManager.get('board-a', mockTasks);
    expect(cached).toEqual(mockInsights);
  });

  it('deve retornar null se as tarefas forem alteradas após o cache', () => {
    cacheManager.set('board-a', mockTasks, mockInsights);
    const modifiedTasks: TaskModel[] = [
      ...mockTasks,
      {
        id: 'task-3',
        title: 'Nova Tarefa',
        column: 'col-todo',
        createdAt: '2026-10-16T15:00:00Z',
      },
    ];

    expect(cacheManager.get('board-a', modifiedTasks)).toBeNull();
  });

  it('deve invalidar cache de um quadro específico', () => {
    cacheManager.set('board-a', mockTasks, mockInsights);
    expect(cacheManager.get('board-a', mockTasks)).toEqual(mockInsights);

    cacheManager.invalidate('board-a');
    expect(cacheManager.get('board-a', mockTasks)).toBeNull();
  });
});
