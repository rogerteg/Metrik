import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMika } from '../../src/hooks/useMika';
import { mikaService } from '../../src/services/ai/mikaService';
import { ColumnModel, TaskModel } from '../../src/types/kanban';

describe('useMika Hook', () => {
  const mockColumns: ColumnModel[] = [
    { id: 'c1', title: 'Todo', category: 'todo', wipLimit: null, colorScheme: 'todo' },
  ];
  const mockTasks: TaskModel[] = [
    { id: 't1', title: 'Task 1', column: 'c1', createdAt: '2026-10-10T10:00:00Z' },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve inicializar com estado padrão e carregar insights', async () => {
    vi.spyOn(mikaService, 'getBoardInsights').mockResolvedValue([
      {
        id: 'i1',
        title: 'Diagnóstico Teste',
        summary: 'Resumo teste',
        severity: 'info',
        category: 'cycle-time',
        timestamp: '2026-10-16T10:00:00Z',
      },
    ]);

    const { result } = renderHook(() =>
      useMika({ boardId: 'b1', columns: mockColumns, tasks: mockTasks }),
    );

    expect(result.current.isDrawerOpen).toBe(false);

    await act(async () => {
      await result.current.refreshInsights();
    });

    expect(result.current.insights.length).toBe(1);
    expect(result.current.insights[0].title).toBe('Diagnóstico Teste');
  });

  it('deve alternar a abertura da gaveta retrátil', () => {
    const { result } = renderHook(() => useMika({ autoDiagnose: false }));

    expect(result.current.isDrawerOpen).toBe(false);

    act(() => {
      result.current.openDrawer();
    });
    expect(result.current.isDrawerOpen).toBe(true);

    act(() => {
      result.current.closeDrawer();
    });
    expect(result.current.isDrawerOpen).toBe(false);

    act(() => {
      result.current.toggleDrawer();
    });
    expect(result.current.isDrawerOpen).toBe(true);
  });

  it('deve atualizar preferências e limpar chave de API', () => {
    const { result } = renderHook(() => useMika({ autoDiagnose: false }));

    act(() => {
      result.current.updatePreferences({ provider: 'gemini', tone: 'direct' });
    });
    expect(result.current.preferences.provider).toBe('gemini');
    expect(result.current.preferences.tone).toBe('direct');

    act(() => {
      result.current.clearApiKey();
    });
    expect(result.current.preferences.provider).toBe('heuristic-offline');
    expect(result.current.preferences.apiKeyObfuscated).toBe('');
  });
});
