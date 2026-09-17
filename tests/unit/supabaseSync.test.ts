import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  testConnection,
  flattenTasksForDb,
  pushToSupabase,
  pullFromSupabase,
} from '../../src/services/supabase/syncService';
import {
  _resetSupabaseClientForTesting,
  _setSupabaseEnvForTesting,
} from '../../src/services/supabase/client';
import { Workspace } from '../../src/types/workspace';
import { BoardModel, BoardState, TaskModel } from '../../src/types/kanban';

describe('Supabase Sync Service', () => {
  beforeEach(() => {
    _setSupabaseEnvForTesting(null);
    _resetSupabaseClientForTesting(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    _setSupabaseEnvForTesting(null);
  });

  describe('testConnection', () => {
    it('returns not ok when credentials are not configured', async () => {
      _setSupabaseEnvForTesting({ url: null, anonKey: null });
      const result = await testConnection();
      expect(result.ok).toBe(false);
      expect(result.message).toContain('não configuradas');
    });

    it('returns ok when mock client successfully queries workspaces', async () => {
      _setSupabaseEnvForTesting({
        url: 'https://kmvjtitcberfjsreolhr.supabase.co',
        anonKey: 'valid-test-key',
      });
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any;
      _resetSupabaseClientForTesting(mockClient);

      const result = await testConnection();
      expect(result.ok).toBe(true);
      expect(result.message).toContain('bem-sucedida');
    });
  });

  describe('flattenTasksForDb', () => {
    it('accurately flattens nested board state into tabular rows', () => {
      const mockTask: TaskModel = {
        id: 'task-101',
        title: 'Integrar ao Supabase',
        column: 'col-todo',
        priority: 'urgent',
        tags: ['backend', 'database'],
        subtasks: [{ id: 'sub-1', title: 'Criar schema', completed: true }],
        createdAt: '2026-09-16T12:00:00Z',
      };

      const tasksByBoardId: Record<string, BoardState> = {
        'board-main': {
          columns: [{ id: 'col-todo', title: 'A Fazer', category: 'todo', wipLimit: 5, colorScheme: 'todo' }],
          tasks: {
            'col-todo': [mockTask],
          },
        },
      };

      const rows = flattenTasksForDb(tasksByBoardId);
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe('task-101');
      expect(rows[0].board_id).toBe('board-main');
      expect(rows[0].column_id).toBe('col-todo');
      expect(rows[0].title).toBe('Integrar ao Supabase');
      expect(rows[0].priority).toBe('urgent');
      expect(rows[0].order_index).toBe(0);
      expect(rows[0].tags).toEqual(['backend', 'database']);
      expect(rows[0].subtasks).toHaveLength(1);
    });

    it('handles empty or malformed boards gracefully', () => {
      const rows = flattenTasksForDb({} as any);
      expect(rows).toEqual([]);
    });
  });

  describe('pushToSupabase', () => {
    it('returns error if client is not available', async () => {
      _setSupabaseEnvForTesting({ url: null, anonKey: null });
      const result = await pushToSupabase({
        workspaces: [],
        boards: [],
        tasksByBoardId: {},
      });
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Supabase não está configurado.');
    });

    it('executes upserts across workspaces, boards, and tasks when client is available', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null });
      const fromMock = vi.fn().mockReturnValue({ upsert: upsertMock });
      const mockClient = { from: fromMock } as any;
      _resetSupabaseClientForTesting(mockClient);

      const workspaces: Workspace[] = [
        {
          id: 'ws-test',
          name: 'Workspace Test',
          color: '#38bdf8',
          boardIds: ['b-1'],
          createdAt: '2026-09-16T10:00:00Z',
          updatedAt: '2026-09-16T10:00:00Z',
        },
      ];

      const boards: BoardModel[] = [
        {
          id: 'b-1',
          name: 'Quadro 1',
          createdAt: '2026-09-16T10:00:00Z',
          lastAccessed: '2026-09-16T10:00:00Z',
        },
      ];

      const tasksByBoardId: Record<string, BoardState> = {
        'b-1': {
          columns: [],
          tasks: {
            'col-1': [
              {
                id: 't-1',
                title: 'Tarefa 1',
                column: 'col-1',
                createdAt: '2026-09-16T10:00:00Z',
              },
            ],
          },
        },
      };

      const result = await pushToSupabase({
        workspaces,
        boards,
        tasksByBoardId,
      });

      expect(result.ok).toBe(true);
      expect(result.syncedCount.workspaces).toBe(1);
      expect(result.syncedCount.boards).toBe(1);
      expect(result.syncedCount.tasks).toBe(1);
      expect(fromMock).toHaveBeenCalledWith('workspaces');
      expect(fromMock).toHaveBeenCalledWith('boards');
      expect(fromMock).toHaveBeenCalledWith('tasks');
    });
  });

  describe('pullFromSupabase', () => {
    it('returns error if client is not available', async () => {
      _setSupabaseEnvForTesting({ url: null, anonKey: null });
      const result = await pullFromSupabase();
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Supabase não está configurado.');
    });

    it('fetches workspaces, boards, tasks and groups them into BoardState', async () => {
      const selectMock = vi.fn().mockImplementation((table: string) => {
        if (table === 'workspaces') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'ws-1',
                  name: 'Espaço 1',
                  color: '#38bdf8',
                  board_ids: ['b-1'],
                  created_at: '2026-09-16T10:00:00Z',
                  updated_at: '2026-09-16T10:00:00Z',
                },
              ],
              error: null,
            }),
          };
        }
        if (table === 'boards') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'b-1',
                  name: 'Quadro A',
                  columns: [{ id: 'col-1', title: 'Todo', category: 'todo' }],
                  created_at: '2026-09-16T10:00:00Z',
                  updated_at: '2026-09-16T10:00:00Z',
                },
              ],
              error: null,
            }),
          };
        }
        if (table === 'tasks') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'task-1',
                  board_id: 'b-1',
                  column_id: 'col-1',
                  title: 'Tarefa Nuvem',
                  priority: 'high',
                  created_at: '2026-09-16T10:00:00Z',
                  updated_at: '2026-09-16T10:00:00Z',
                },
              ],
              error: null,
            }),
          };
        }
        if (table === 'app_settings') {
          return {
            select: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { theme: 'slate', density: 'compact', default_wip_limit: 4 },
                }),
              }),
            }),
          };
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
      });

      const mockClient = { from: selectMock } as any;
      _resetSupabaseClientForTesting(mockClient);

      const result = await pullFromSupabase();
      expect(result.ok).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.workspaces).toHaveLength(1);
      expect(result.data?.boards).toHaveLength(1);
      expect(result.data?.tasksByBoardId['b-1'].tasks['col-1']).toHaveLength(1);
      expect(result.data?.tasksByBoardId['b-1'].tasks['col-1'][0].title).toBe('Tarefa Nuvem');
    });
  });
});
