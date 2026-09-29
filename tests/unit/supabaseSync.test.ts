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
        sprintId: 'sp-1',
        estimation: 5,
        createdAt: '2026-09-16T12:00:00Z',
      };

      const tasksByBoardId: Record<string, BoardState> = {
        'board-main': {
          columns: [
            {
              id: 'col-todo',
              title: 'A Fazer',
              category: 'todo',
              wipLimit: 5,
              colorScheme: 'todo',
            },
          ],
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
      expect(rows[0].sprint_id).toBe('sp-1');
      expect(rows[0].estimation).toBe(5);
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
          sprints: [
            {
              id: 'sp-1',
              name: 'Sprint 1',
              status: 'active',
              createdAt: '2026-09-16T10:00:00Z',
            },
          ],
          activeSprintId: 'sp-1',
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

      // As sprints do quadro fazem parte do payload de boards (Feature 038–042).
      const boardUpsert = upsertMock.mock.calls.find(
        (call) => Array.isArray(call[0]) && call[0][0] && 'sprints' in call[0][0],
      );
      expect(boardUpsert).toBeDefined();
      expect(boardUpsert?.[0][0].sprints).toHaveLength(1);
      expect(boardUpsert?.[0][0].active_sprint_id).toBe('sp-1');
    });

    it('skips stale rows in favor of newer remote versions (updated_at)', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null });
      const inMock = vi.fn().mockResolvedValue({
        data: [
          { id: 'b-1', updated_at: '2030-01-01T00:00:00Z' },
          { id: 't-1', updated_at: '2030-01-01T00:00:00Z' },
        ],
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ in: inMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock, upsert: upsertMock });
      _resetSupabaseClientForTesting({ from: fromMock } as any);

      const result = await pushToSupabase({
        workspaces: [],
        boards: [
          {
            id: 'b-1',
            name: 'Quadro 1',
            createdAt: '2026-09-16T10:00:00Z',
            lastAccessed: '2026-09-16T10:00:00Z',
          },
        ],
        tasksByBoardId: {
          'b-1': {
            columns: [],
            tasks: {
              'col-1': [
                {
                  id: 't-1',
                  title: 'Tarefa 1',
                  column: 'col-1',
                  createdAt: '2026-09-16T10:00:00Z',
                  updatedAt: '2026-09-16T10:00:00Z',
                },
              ],
            },
          },
        },
      });

      expect(result.ok).toBe(true);
      const pushedIds = upsertMock.mock.calls.flatMap((call) =>
        Array.isArray(call[0]) ? call[0].map((row: { id: string }) => row.id) : [],
      );
      expect(pushedIds).not.toContain('b-1');
      expect(pushedIds).not.toContain('t-1');
    });

    it('pushes teams and team members', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null });
      const fromMock = vi.fn().mockReturnValue({ upsert: upsertMock });
      _resetSupabaseClientForTesting({ from: fromMock } as any);

      const result = await pushToSupabase({
        workspaces: [],
        boards: [],
        tasksByBoardId: {},
        teams: [
          { id: 'tm-1', name: 'Time A', createdById: 'u-1', createdAt: '2026-09-16T10:00:00Z' },
        ],
        teamMembers: [
          {
            id: 'm-1',
            teamId: 'tm-1',
            userId: 'u-1',
            role: 'admin',
            joinedAt: '2026-09-16T10:00:00Z',
          },
        ],
      });

      expect(result.ok).toBe(true);
      expect(result.syncedCount.teams).toBe(1);
      expect(result.syncedCount.teamMembers).toBe(1);
      expect(fromMock).toHaveBeenCalledWith('teams');
      expect(fromMock).toHaveBeenCalledWith('team_members');
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
                  sprints: [
                    {
                      id: 'sp-1',
                      name: 'Sprint 1',
                      status: 'active',
                      createdAt: '2026-09-16T10:00:00Z',
                    },
                  ],
                  active_sprint_id: 'sp-1',
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
                  sprint_id: 'sp-1',
                  estimation: 8,
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
      expect(result.data?.tasksByBoardId['b-1'].sprints).toHaveLength(1);
      expect(result.data?.tasksByBoardId['b-1'].activeSprintId).toBe('sp-1');
      expect(result.data?.tasksByBoardId['b-1'].tasks['col-1'][0].sprintId).toBe('sp-1');
      expect(result.data?.tasksByBoardId['b-1'].tasks['col-1'][0].estimation).toBe(8);
    });

    it('pulls teams and team members', async () => {
      const selectMock = vi.fn().mockImplementation((table: string) => {
        if (table === 'teams') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'tm-1',
                  name: 'Time A',
                  created_by: 'u-1',
                  created_at: '2026-09-16T10:00:00Z',
                },
              ],
              error: null,
            }),
          };
        }
        if (table === 'team_members') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'm-1',
                  team_id: 'tm-1',
                  user_id: 'u-1',
                  role: 'admin',
                  joined_at: '2026-09-16T10:00:00Z',
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
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              }),
            }),
          };
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
      });
      _resetSupabaseClientForTesting({ from: selectMock } as any);

      const result = await pullFromSupabase();
      expect(result.ok).toBe(true);
      expect(result.data?.teams?.[0].id).toBe('tm-1');
      expect(result.data?.teamMembers?.[0].id).toBe('m-1');
    });
  });
});
