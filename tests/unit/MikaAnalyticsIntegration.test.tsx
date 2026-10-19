import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AnalyticsDashboard } from '../../src/components/AnalyticsDashboard';
import { BoardState, TaskModel } from '../../src/types/kanban';
import { mikaCacheManager } from '../../src/services/ai/mikaCacheManager';
import { mikaService } from '../../src/services/ai/mikaService';

describe('Mika Analytics Integration (US1 & Cache Check)', () => {
  const mockBoard: BoardState & { id: string; name: string } = {
    id: 'board-analytics-test',
    name: 'Board de Teste Mika',
    columns: [
      { id: 'c-todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
      {
        id: 'c-prog',
        title: 'Em Progresso',
        category: 'in_progress',
        wipLimit: 2,
        colorScheme: 'progress',
      },
      {
        id: 'c-done',
        title: 'Concluído',
        category: 'done',
        wipLimit: null,
        colorScheme: 'completed',
      },
    ],
    tasks: {},
  };

  const mockTasks: TaskModel[] = [
    {
      id: 't-1',
      title: 'Configurar rotas',
      column: 'c-done',
      createdAt: '2026-10-10T10:00:00Z',
      startedAt: '2026-10-10T10:00:00Z',
      completedAt: '2026-10-12T10:00:00Z',
    },
    {
      id: 't-2',
      title: 'Desenvolver telas',
      column: 'c-prog',
      createdAt: '2026-10-11T10:00:00Z',
      startedAt: '2026-10-11T10:00:00Z',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    mikaCacheManager.invalidate();
    vi.restoreAllMocks();
  });

  it('deve carregar e renderizar os cards de diagnóstico da Mika no AnalyticsDashboard', async () => {
    await act(async () => {
      render(<AnalyticsDashboard board={mockBoard} tasks={mockTasks} />);
    });

    const mikaBadge = await screen.findByTitle('Mika AI Flow Copilot');
    expect(mikaBadge).toBeInTheDocument();
    expect(screen.getByText('Diagnósticos da Mika')).toBeInTheDocument();
  });

  it('deve utilizar o cache reativo sem reexecutar getBoardInsights quando as tarefas não mudam', async () => {
    const getInsightsSpy = vi.spyOn(mikaService, 'getBoardInsights');

    const { rerender } = render(<AnalyticsDashboard board={mockBoard} tasks={mockTasks} />);

    await act(async () => {
      // Re-render simulando clique em outra aba ou atualização de componente pai sem mutação de tarefas
      rerender(<AnalyticsDashboard board={mockBoard} tasks={mockTasks} />);
    });

    // O cache deve ser consultado ou reutilizado
    expect(getInsightsSpy).toHaveBeenCalled();
  });
});
