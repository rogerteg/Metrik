import { TaskActivityLog, TaskActivityEventType } from '../types/taskActivity';

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
