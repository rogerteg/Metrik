import { useCallback } from 'react';
import { BoardState, PriorityLevel, TaskModel } from '../../types/kanban';
import { createTaskActivityEvent, AuditDescriptions } from '../../utils/taskActivityLogger';
import { isBlockingTag } from '../../utils/taskReorder';

export function useTaskTagsAndBlockers(setBoard: React.Dispatch<React.SetStateAction<BoardState>>) {
  const setTaskPriority = useCallback(
    (taskId: string, priority?: PriorityLevel) => {
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();

        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
            if (task.id === taskId) {
              const auditEvent = createTaskActivityEvent({
                taskId,
                eventType: 'priority_changed',
                description: AuditDescriptions.priorityChanged(
                  task.priority || 'média',
                  priority || 'nenhuma',
                  'Rogerio Teixeira',
                ),
                fromValue: task.priority,
                toValue: priority,
                user: { id: 'usr_default', name: 'Rogerio Teixeira' },
              });
              return {
                ...task,
                priority,
                updatedAt: now,
                activityLog: [...(task.activityLog || []), auditEvent],
              };
            }
            return task;
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const addTaskTag = useCallback(
    (taskId: string, tag: string) => {
      const cleanTag = tag.trim().slice(0, 20);
      if (!cleanTag) return;

      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();

        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
            if (task.id === taskId) {
              const currentTags = task.tags ?? [];
              const isDuplicate = currentTags.some(
                (t) => t.toLowerCase() === cleanTag.toLowerCase(),
              );
              if (isDuplicate) return task;

              const nextTags = [...currentTags, cleanTag];
              const isBlockingKeyword = isBlockingTag(cleanTag);

              const auditEvent = createTaskActivityEvent({
                taskId,
                eventType: 'tags_changed',
                description: AuditDescriptions.tagsChanged(
                  'adicionada',
                  cleanTag,
                  'Rogerio Teixeira',
                ),
                toValue: cleanTag,
                user: { id: 'usr_default', name: 'Rogerio Teixeira' },
              });

              if (isBlockingKeyword) {
                return {
                  ...task,
                  tags: nextTags,
                  blocked: true,
                  blockedAt: task.blockedAt || now,
                  blockedReason: task.blockedReason || 'Bloqueado via etiqueta',
                  updatedAt: now,
                  activityLog: [...(task.activityLog || []), auditEvent],
                };
              }

              return {
                ...task,
                tags: nextTags,
                updatedAt: now,
                activityLog: [...(task.activityLog || []), auditEvent],
              };
            }
            return task;
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const removeTaskTag = useCallback(
    (taskId: string, tag: string) => {
      const targetTag = tag.trim().toLowerCase();

      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();

        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
            if (task.id === taskId) {
              const currentTags = task.tags ?? [];
              const nextTags = currentTags.filter((t) => t.trim().toLowerCase() !== targetTag);
              const hasRemainingBlockingTag = nextTags.some((t) => isBlockingTag(t));
              const removedIsBlocking = isBlockingTag(targetTag);

              const auditEvent = createTaskActivityEvent({
                taskId,
                eventType: 'tags_changed',
                description: AuditDescriptions.tagsChanged('removida', tag, 'Rogerio Teixeira'),
                fromValue: tag,
                user: { id: 'usr_default', name: 'Rogerio Teixeira' },
              });

              if (removedIsBlocking && !hasRemainingBlockingTag && task.blocked) {
                const startMs = task.blockedAt ? new Date(task.blockedAt).getTime() : Date.now();
                const elapsed = Math.max(0, Date.now() - startMs);
                const totalBlockedMs = (task.totalBlockedMs || 0) + elapsed;
                return {
                  ...task,
                  tags: nextTags,
                  blocked: false,
                  blockedAt: undefined,
                  totalBlockedMs,
                  updatedAt: now,
                  activityLog: [...(task.activityLog || []), auditEvent],
                };
              }

              return {
                ...task,
                tags: nextTags,
                updatedAt: now,
                activityLog: [...(task.activityLog || []), auditEvent],
              };
            }
            return task;
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const toggleTaskBlocked = useCallback(
    (taskId: string, reason?: string) => {
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        let found = false;

        for (const [colId, tasks] of Object.entries(prev.tasks)) {
          nextTasks[colId] = tasks.map((task) => {
            if (task.id === taskId) {
              found = true;
              const now = new Date().toISOString();
              const willBlock = !task.blocked;
              const auditEvent = createTaskActivityEvent({
                taskId,
                eventType: willBlock ? 'blocked' : 'unblocked',
                description: willBlock
                  ? AuditDescriptions.blocked(reason || '', 'Rogerio Teixeira')
                  : AuditDescriptions.unblocked('Rogerio Teixeira'),
                user: { id: 'usr_default', name: 'Rogerio Teixeira' },
              });

              if (willBlock) {
                const currentTags = task.tags ?? [];
                const hasTag = currentTags.some((t) => isBlockingTag(t));
                const nextTags = hasTag ? currentTags : [...currentTags, 'bloqueado'];
                return {
                  ...task,
                  blocked: true,
                  blockedReason: reason !== undefined ? reason : task.blockedReason || '',
                  blockedAt: now,
                  tags: nextTags,
                  updatedAt: now,
                  activityLog: [...(task.activityLog || []), auditEvent],
                };
              } else {
                const startMs = task.blockedAt ? new Date(task.blockedAt).getTime() : Date.now();
                const elapsed = Math.max(0, Date.now() - startMs);
                const totalBlockedMs = (task.totalBlockedMs || 0) + elapsed;
                const currentTags = task.tags ?? [];
                const nextTags = currentTags.filter((t) => !isBlockingTag(t));
                return {
                  ...task,
                  blocked: false,
                  blockedAt: undefined,
                  tags: nextTags,
                  totalBlockedMs,
                  updatedAt: now,
                  activityLog: [...(task.activityLog || []), auditEvent],
                };
              }
            }
            return task;
          });
        }

        if (!found) return prev;
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const updateBlockedReason = useCallback(
    (taskId: string, reason: string) => {
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        let found = false;

        for (const [colId, tasks] of Object.entries(prev.tasks)) {
          nextTasks[colId] = tasks.map((task) => {
            if (task.id === taskId) {
              found = true;
              return {
                ...task,
                blockedReason: reason,
                updatedAt: new Date().toISOString(),
              };
            }
            return task;
          });
        }

        if (!found) return prev;
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  return {
    setTaskPriority,
    addTaskTag,
    removeTaskTag,
    toggleTaskBlocked,
    updateBlockedReason,
  };
}
