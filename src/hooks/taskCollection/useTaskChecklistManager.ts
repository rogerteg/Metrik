import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BoardState, SubtaskModel, TaskModel } from '../../types/kanban';

export function useTaskChecklistManager(
  setBoard: React.Dispatch<React.SetStateAction<BoardState>>,
) {
  const addSubtask = useCallback(
    (taskId: string, title: string) => {
      const cleanTitle = title.trim();
      if (!cleanTitle) return;

      const newSubtask: SubtaskModel = {
        id: uuidv4(),
        title: cleanTitle,
        completed: false,
      };

      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        for (const [colId, tasks] of Object.entries(prev.tasks)) {
          nextTasks[colId] = tasks.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                subtasks: [...(t.subtasks || []), newSubtask],
                updatedAt: new Date().toISOString(),
              };
            }
            return t;
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        for (const [colId, tasks] of Object.entries(prev.tasks)) {
          nextTasks[colId] = tasks.map((t) => {
            if (t.id === taskId) {
              const updatedSubtasks = (t.subtasks || []).map((st) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st,
              );
              return {
                ...t,
                subtasks: updatedSubtasks,
                updatedAt: new Date().toISOString(),
              };
            }
            return t;
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const deleteSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        for (const [colId, tasks] of Object.entries(prev.tasks)) {
          nextTasks[colId] = tasks.map((t) => {
            if (t.id === taskId) {
              const updatedSubtasks = (t.subtasks || []).filter((st) => st.id !== subtaskId);
              return {
                ...t,
                subtasks: updatedSubtasks,
                updatedAt: new Date().toISOString(),
              };
            }
            return t;
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  return {
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  };
}
