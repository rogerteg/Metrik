import { TaskActivityLog, TaskActivityEventType, TimelineItem, TimelineGroup } from '../types/taskActivity';

export interface CreateActivityEventParams {
  taskId: string;
  eventType: TaskActivityEventType;
  description: string;
  fromValue?: string;
  toValue?: string;
  user?: {
    id: string;
    name: string;
  };
}

/**
 * Factory helper function to build structured TaskActivityLog instances.
 */
export function createTaskActivityEvent(params: CreateActivityEventParams): TaskActivityLog {
  const { taskId, eventType, description, fromValue, toValue, user } = params;
  
  const userId = user?.id || 'system';
  const userName = user?.name || 'Usuário do Sistema';

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    taskId,
    userId,
    userName,
    eventType,
    description,
    fromValue,
    toValue,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Helper to format ClickUp diff pill text [From ➔ To]
 */
export function formatDiffPill(fromValue?: string, toValue?: string): string | null {
  if (!fromValue && !toValue) return null;
  if (fromValue && toValue) return `${fromValue} ➔ ${toValue}`;
  if (toValue) return `➔ ${toValue}`;
  if (fromValue) return `${fromValue} ➔ Removido`;
  return null;
}

/**
 * Portuguese description formatters for common audit events.
 */
export const AuditDescriptions = {
  created: (userName: string) => `Tarefa criada por ${userName}`,
  moved: (fromColName: string, toColName: string, userName: string) =>
    `Movido da coluna "${fromColName}" para "${toColName}" por ${userName}`,
  blocked: (reason: string, userName: string) =>
    `Marcado como bloqueado por ${userName}${reason ? `: ${reason}` : ''}`,
  unblocked: (userName: string) => `Impedimento removido por ${userName}`,
  priorityChanged: (fromPriority: string, toPriority: string, userName: string) =>
    `Prioridade alterada de "${fromPriority}" para "${toPriority}" por ${userName}`,
  datesChanged: (details: string, userName: string) =>
    `Datas atualizadas (${details}) por ${userName}`,
  tagsChanged: (action: 'adicionada' | 'removida', tag: string, userName: string) =>
    `Tag "${tag}" ${action} por ${userName}`,
  commentAdded: (userName: string) => `Comentário adicionado por ${userName}`,
  commentDeleted: (userName: string) => `Comentário removido por ${userName}`,
  edited: (field: string, userName: string) => `Campo "${field}" atualizado por ${userName}`,
};

/**
 * Groups a chronologically sorted list of TimelineItems into time buckets:
 * - "Hoje"
 * - "Ontem"
 * - "Esta Semana"
 * - "Anteriores"
 */
export function groupTimelineItems(items: TimelineItem[], nowMs: number = Date.now()): TimelineGroup[] {
  const todayStart = new Date(nowMs);
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groupsMap: Record<'today' | 'yesterday' | 'this_week' | 'older', TimelineItem[]> = {
    today: [],
    yesterday: [],
    this_week: [],
    older: [],
  };

  items.forEach((item) => {
    const itemDate = new Date(item.timestamp);

    if (itemDate >= todayStart) {
      groupsMap.today.push(item);
    } else if (itemDate >= yesterdayStart) {
      groupsMap.yesterday.push(item);
    } else if (itemDate >= weekStart) {
      groupsMap.this_week.push(item);
    } else {
      groupsMap.older.push(item);
    }
  });

  const result: TimelineGroup[] = [];

  if (groupsMap.today.length > 0) {
    result.push({ groupKey: 'today', label: 'Hoje', items: groupsMap.today });
  }
  if (groupsMap.yesterday.length > 0) {
    result.push({ groupKey: 'yesterday', label: 'Ontem', items: groupsMap.yesterday });
  }
  if (groupsMap.this_week.length > 0) {
    result.push({ groupKey: 'this_week', label: 'Esta Semana', items: groupsMap.this_week });
  }
  if (groupsMap.older.length > 0) {
    result.push({ groupKey: 'older', label: 'Anteriores', items: groupsMap.older });
  }

  return result;
}
