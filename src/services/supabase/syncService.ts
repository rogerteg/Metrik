import { getSupabaseClient, isSupabaseConfigured } from './client';
import { Workspace } from '../../types/workspace';
import { BoardModel, BoardState, TaskModel } from '../../types/kanban';
import { AppSettings } from '../../types/workspace';

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
}

export interface SyncPushPayload {
  workspaces: Workspace[];
  boards: BoardModel[];
  tasksByBoardId: Record<string, BoardState>;
  settings?: AppSettings;
}

export interface SyncPushResult {
  ok: boolean;
  syncedCount: {
    workspaces: number;
    boards: number;
    tasks: number;
  };
  error?: string;
}

export interface SyncPullResult {
  ok: boolean;
  data?: {
    workspaces: Workspace[];
    boards: BoardModel[];
    tasksByBoardId: Record<string, BoardState>;
    settings?: AppSettings;
  };
  error?: string;
}

/**
 * Testa a conectividade com o Supabase executando uma verificação leve de rede.
 */
export async function testConnection(): Promise<ConnectionTestResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'Credenciais do Supabase não configuradas no ambiente (.env).',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      message: 'Não foi possível instanciar o cliente Supabase.',
    };
  }

  const start = performance.now();
  try {
    // Consulta simples e rápida em workspaces
    const { error } = await client.from('workspaces').select('id', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      // Se a tabela ainda não foi criada no Supabase
      if (error.code === '42P01') {
        return {
          ok: false,
          latencyMs,
          message: 'Conectado ao Supabase, mas a tabela "workspaces" não existe. Execute o script supabase/schema.sql no SQL Editor do Supabase.',
        };
      }
      return {
        ok: false,
        latencyMs,
        message: `Falha na consulta ao Supabase: ${error.message} (Código: ${error.code})`,
      };
    }

    return {
      ok: true,
      latencyMs,
      message: `Conexão bem-sucedida com o Supabase (${latencyMs}ms)!`,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      latencyMs,
      message: `Erro ao conectar ao Supabase: ${errorMsg}`,
    };
  }
}

/**
 * Converte dados de tarefas agrupadas por coluna em registros tabulares para o Supabase.
 */
export function flattenTasksForDb(tasksByBoardId: Record<string, BoardState>): any[] {
  const rows: any[] = [];

  for (const [boardId, boardState] of Object.entries(tasksByBoardId)) {
    if (!boardState || !boardState.tasks) continue;

    for (const [columnId, tasks] of Object.entries(boardState.tasks)) {
      if (!Array.isArray(tasks)) continue;

      tasks.forEach((task, index) => {
        rows.push({
          id: task.id,
          board_id: boardId,
          column_id: columnId,
          title: task.title || '',
          description: task.description || null,
          color: task.color || null,
          priority: task.priority || null,
          tags: task.tags || [],
          subtasks: task.subtasks || [],
          comments: (task as any).comments || [],
          links: task.links || [],
          blocked: Boolean(task.blocked),
          blocked_reason: task.blockedReason || null,
          blocked_at: task.blockedAt || null,
          total_blocked_ms: task.totalBlockedMs || 0,
          type: task.type || 'card',
          due_date: task.dueDate || null,
          start_date: task.startDate || null,
          end_date: task.endDate || null,
          acceptance_criteria: task.acceptanceCriteria || null,
          test_scenarios: task.testScenarios || null,
          order_index: index,
          started_at: task.startedAt || null,
          completed_at: task.completedAt || null,
          created_at: task.createdAt || new Date().toISOString(),
          updated_at: task.updatedAt || new Date().toISOString(),
        });
      });
    }
  }

  return rows;
}

/**
 * Envia o estado local do Metrik para o Supabase (Push / Backup).
 */
export async function pushToSupabase(payload: SyncPushPayload): Promise<SyncPushResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      syncedCount: { workspaces: 0, boards: 0, tasks: 0 },
      error: 'Supabase não está configurado.',
    };
  }

  try {
    // 1. Sincronizar Workspaces
    let workspacesCount = 0;
    if (payload.workspaces.length > 0) {
      const workspaceRows = payload.workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        description: w.description || null,
        color: w.color,
        icon: w.icon || null,
        board_ids: w.boardIds || [],
        team_id: w.teamId || null,
        created_at: w.createdAt,
        updated_at: w.updatedAt,
      }));

      const { error: wsError } = await client
        .from('workspaces')
        .upsert(workspaceRows, { onConflict: 'id' });

      if (wsError) throw new Error(`Erro ao sincronizar workspaces: ${wsError.message}`);
      workspacesCount = workspaceRows.length;
    }

    // 2. Sincronizar Boards
    let boardsCount = 0;
    if (payload.boards.length > 0) {
      const boardRows = payload.boards.map((b) => ({
        id: b.id,
        name: b.name,
        columns: payload.tasksByBoardId[b.id]?.columns || [],
        team_id: b.teamId || null,
        created_at: b.createdAt || new Date().toISOString(),
        updated_at: b.lastAccessed || new Date().toISOString(),
      }));

      const { error: bError } = await client
        .from('boards')
        .upsert(boardRows, { onConflict: 'id' });

      if (bError) throw new Error(`Erro ao sincronizar boards: ${bError.message}`);
      boardsCount = boardRows.length;
    }

    // 3. Sincronizar Tasks
    let tasksCount = 0;
    const taskRows = flattenTasksForDb(payload.tasksByBoardId);
    if (taskRows.length > 0) {
      const { error: tError } = await client
        .from('tasks')
        .upsert(taskRows, { onConflict: 'id' });

      if (tError) throw new Error(`Erro ao sincronizar tasks: ${tError.message}`);
      tasksCount = taskRows.length;
    }

    // 4. Sincronizar AppSettings (se fornecido)
    if (payload.settings) {
      await client.from('app_settings').upsert({
        id: 'global_settings',
        theme: payload.settings.theme,
        density: payload.settings.density,
        default_wip_limit: payload.settings.defaultWipLimit,
        enable_animations: payload.settings.enableAnimations,
        default_board_id: payload.settings.defaultBoardId || null,
        updated_at: payload.settings.updatedAt || new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    console.info(`[Metrik] Push to Supabase successful: ${workspacesCount} workspaces, ${boardsCount} boards, ${tasksCount} tasks.`);

    return {
      ok: true,
      syncedCount: {
        workspaces: workspacesCount,
        boards: boardsCount,
        tasks: tasksCount,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Metrik] Push to Supabase failed:', message);
    return {
      ok: false,
      syncedCount: { workspaces: 0, boards: 0, tasks: 0 },
      error: message,
    };
  }
}

/**
 * Baixa os dados remotos do Supabase para o estado local do Metrik (Pull).
 */
export async function pullFromSupabase(): Promise<SyncPullResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      error: 'Supabase não está configurado.',
    };
  }

  try {
    // 1. Buscar Workspaces
    const { data: wsData, error: wsError } = await client.from('workspaces').select('*');
    if (wsError) throw new Error(`Erro ao buscar workspaces: ${wsError.message}`);

    const workspaces: Workspace[] = (wsData || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      color: row.color,
      icon: row.icon || undefined,
      boardIds: Array.isArray(row.board_ids) ? row.board_ids : [],
      teamId: row.team_id || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    // 2. Buscar Boards
    const { data: bData, error: bError } = await client.from('boards').select('*');
    if (bError) throw new Error(`Erro ao buscar boards: ${bError.message}`);

    const boards: BoardModel[] = (bData || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      teamId: row.team_id || undefined,
      createdAt: row.created_at,
      lastAccessed: row.updated_at || row.created_at,
    }));

    // 3. Buscar Tasks
    const { data: tData, error: tError } = await client.from('tasks').select('*');
    if (tError) throw new Error(`Erro ao buscar tasks: ${tError.message}`);

    const tasksByBoardId: Record<string, BoardState> = {};

    // Inicializar estruturas por board a partir dos dados do banco
    for (const bRow of bData || []) {
      const boardCols = Array.isArray(bRow.columns) ? bRow.columns : [];
      tasksByBoardId[bRow.id] = {
        columns: boardCols,
        tasks: {},
      };
      for (const col of boardCols) {
        tasksByBoardId[bRow.id].tasks[col.id] = [];
      }
    }

    // Distribuir tarefas
    for (const row of tData || []) {
      const boardId = row.board_id;
      const columnId = row.column_id;

      if (!tasksByBoardId[boardId]) {
        tasksByBoardId[boardId] = {
          columns: [],
          tasks: {},
        };
      }

      if (!tasksByBoardId[boardId].tasks[columnId]) {
        tasksByBoardId[boardId].tasks[columnId] = [];
      }

      const taskModel: TaskModel = {
        id: row.id,
        title: row.title,
        column: columnId,
        color: row.color || undefined,
        description: row.description || undefined,
        priority: row.priority || undefined,
        tags: Array.isArray(row.tags) ? row.tags : [],
        subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
        links: Array.isArray(row.links) ? row.links : [],
        blocked: Boolean(row.blocked),
        blockedReason: row.blocked_reason || undefined,
        blockedAt: row.blocked_at || undefined,
        totalBlockedMs: Number(row.total_blocked_ms) || 0,
        type: row.type || 'card',
        dueDate: row.due_date || undefined,
        startDate: row.start_date || undefined,
        endDate: row.end_date || undefined,
        acceptanceCriteria: row.acceptance_criteria || undefined,
        testScenarios: row.test_scenarios || undefined,
        startedAt: row.started_at || undefined,
        completedAt: row.completed_at || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      tasksByBoardId[boardId].tasks[columnId].push(taskModel);
    }

    // 4. Buscar AppSettings
    let settings: AppSettings | undefined;
    const { data: sData } = await client.from('app_settings').select('*').limit(1).maybeSingle();
    if (sData) {
      settings = {
        theme: sData.theme || 'dark',
        density: sData.density || 'comfortable',
        defaultWipLimit: sData.default_wip_limit || 5,
        enableAnimations: Boolean(sData.enable_animations),
        defaultBoardId: sData.default_board_id || undefined,
        updatedAt: sData.updated_at || new Date().toISOString(),
      };
    }

    console.info(`[Metrik] Pull from Supabase successful: ${workspaces.length} workspaces, ${boards.length} boards, ${(tData || []).length} tasks.`);

    return {
      ok: true,
      data: {
        workspaces,
        boards,
        tasksByBoardId,
        settings,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Metrik] Pull from Supabase failed:', message);
    return {
      ok: false,
      error: message,
    };
  }
}
