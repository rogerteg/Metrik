import { useEffect, useRef, useState } from 'react';
import { Workspace } from '../types/workspace';
import { BoardModel, BoardState } from '../types/kanban';
import { Team, TeamMember } from '../types/team';
import { pushToSupabase, SyncPushResult } from '../services/supabase/syncService';
import { isSupabaseConfigured } from '../services/supabase/client';

/** Coleta o estado de tarefas de todos os quadros a partir do localStorage. */
export function collectBoardsState(boards: BoardModel[]): Record<string, BoardState> {
  const result: Record<string, BoardState> = {};
  for (const board of boards) {
    try {
      const raw = localStorage.getItem(`metrik-tasks-${board.id}`);
      if (raw) result[board.id] = JSON.parse(raw);
    } catch (err) {
      console.warn(`[Metrik] Could not read local tasks for board ${board.id}`, err);
    }
  }
  return result;
}

export interface UseCloudAutoSyncOptions {
  /** Habilitado pelo usuário (opt-in) e configuração presente. */
  enabled: boolean;
  workspaces: Workspace[];
  boards: BoardModel[];
  teams?: Team[];
  teamMembers?: TeamMember[];
  /** Qualquer valor que mude quando o estado local relevante mudar. */
  revision?: unknown;
  debounceMs?: number;
  /** Injetável para testes. */
  push?: (payload: {
    workspaces: Workspace[];
    boards: BoardModel[];
    tasksByBoardId: Record<string, BoardState>;
  }) => Promise<SyncPushResult>;
  onResult?: (result: SyncPushResult) => void;
}

export interface UseCloudAutoSyncReturn {
  isSyncing: boolean;
  lastSyncAt: string | null;
}

/**
 * Sincronização automática (opt-in) do estado local para o Supabase (Feature 038+).
 * Dispara um push debounced após alterações; nunca no primeiro mount; falha de forma
 * silenciosa e não-bloqueante (Local-First, Constituição VIII).
 */
export function useCloudAutoSync(options: UseCloudAutoSyncOptions): UseCloudAutoSyncReturn {
  const { enabled, workspaces, boards, teams, teamMembers, revision, debounceMs = 2500 } = options;
  const push = options.push ?? pushToSupabase;
  const onResult = options.onResult;

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) {
      return;
    }

    // Não sincroniza no mount: só após uma alteração real.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      const result = await push({
        workspaces,
        boards,
        tasksByBoardId: collectBoardsState(boards),
        teams,
        teamMembers,
      });
      setIsSyncing(false);
      if (result.ok) {
        setLastSyncAt(new Date().toLocaleTimeString());
      }
      onResult?.(result);
    }, debounceMs);

    return () => clearTimeout(timer);
    // `onResult` fica fora das deps para não reagendar a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, workspaces, boards, teams, teamMembers, revision, debounceMs, push]);

  return { isSyncing, lastSyncAt };
}
