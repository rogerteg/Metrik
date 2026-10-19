import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MikaService } from '../../src/services/ai/mikaService';
import { ColumnModel, TaskModel } from '../../src/types/kanban';
import { mikaCacheManager } from '../../src/services/ai/mikaCacheManager';
import { obfuscateApiKey } from '../../src/utils/mikaSecurity';

describe('MikaService', () => {
  let service: MikaService;

  const mockColumns: ColumnModel[] = [
    { id: 'c1', title: 'Todo', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    { id: 'c2', title: 'Done', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  const mockTasks: TaskModel[] = [
    { id: 't1', title: 'Task 1', column: 'c1', createdAt: '2026-10-10T10:00:00Z' },
  ];

  beforeEach(() => {
    localStorage.clear();
    mikaCacheManager.invalidate();
    service = new MikaService();
    vi.restoreAllMocks();
  });

  it('deve usar por padrão o motor heurístico local offline quando não houver chave configurada', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const insights = await service.getBoardInsights('board-1', mockColumns, mockTasks);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].summary).toBeDefined();
  });

  it('deve utilizar o cache e não recalcular insights desnecessários em chamadas consecutivas', async () => {
    const firstCall = await service.getBoardInsights('board-1', mockColumns, mockTasks);
    const secondCall = await service.getBoardInsights('board-1', mockColumns, mockTasks);

    expect(secondCall).toEqual(firstCall);
  });

  it('deve realizar fallback transparente para o motor heurístico se a chamada ao Gemini falhar', async () => {
    service.savePreferences({
      provider: 'gemini',
      apiKeyObfuscated: obfuscateApiKey('AIzaSyInvalidKey'),
    });

    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error / Offline'));

    const insights = await service.getBoardInsights('board-1', mockColumns, mockTasks);
    expect(insights.length).toBeGreaterThan(0);
    // Verificamos que gerou insight pelo motor heurístico local sem estourar exceção para o usuário
    expect(insights.some((i) => i.title.includes('Amostra') || i.title.includes('Fluxo'))).toBe(
      true,
    );
  });

  it('deve persistir e recuperar preferências no localStorage com chave ofuscada', () => {
    const prefs = service.getPreferences();
    expect(prefs.provider).toBe('heuristic-offline');

    service.savePreferences({
      provider: 'gemini',
      apiKeyObfuscated: obfuscateApiKey('AIzaSyNewKey123'),
      tone: 'direct',
    });

    const updated = service.getPreferences();
    expect(updated.provider).toBe('gemini');
    expect(updated.tone).toBe('direct');
    expect(updated.apiKeyObfuscated).toBeDefined();
  });

  it('deve decompor tarefas com fallback seguro para motor local', async () => {
    const task: TaskModel = {
      id: 't-decomp',
      title: 'Configurar rotas e navegação',
      column: 'c1',
      createdAt: '2026-10-10T10:00:00Z',
    };

    const result = await service.decomposeTask(task);
    expect(result.taskId).toBe(task.id);
    expect(result.suggestedSubtasks.length).toBeGreaterThanOrEqual(3);
  });
});
