import { useMemo } from 'react';
import { TaskModel } from '../types/kanban';
import { CfdData, CfdDataPoint } from '../types/analytics';

/**
 * Retorna os últimos N dias no formato 'YYYY-MM-DD'
 */
export const getLastNDays = (daysCount = 14): string[] => {
  const days: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

/**
 * Calcula a evolução do Diagrama de Fluxo Cumulativo (CFD) para a lista de tarefas fornecida
 */
export const calculateCfd = (tasks: TaskModel[], daysCount = 14): CfdData => {
  const days = getLastNDays(daysCount);

  if (tasks.length === 0) {
    const points: CfdDataPoint[] = days.map((date) => ({
      date,
      done: 0,
      inProgress: 0,
      todo: 0,
      total: 0,
      cumulativeStarted: 0,
      cumulativeDone: 0,
    }));
    return {
      points,
      maxTotal: 1,
      isEmpty: true,
    };
  }

  const points: CfdDataPoint[] = days.map((date) => {
    let createdCount = 0;
    let startedCount = 0;
    let doneCount = 0;

    for (const task of tasks) {
      const createdDay = task.createdAt ? task.createdAt.split('T')[0] : '';
      const startedDay = task.startedAt ? task.startedAt.split('T')[0] : '';
      const completedDay = task.completedAt ? task.completedAt.split('T')[0] : '';

      const isCreated = createdDay !== '' && createdDay <= date;
      const isCompleted = isCreated && completedDay !== '' && completedDay <= date;
      const isStarted = isCreated && (
        (startedDay !== '' && startedDay <= date) || isCompleted
      );

      if (isCreated) createdCount++;
      if (isStarted) startedCount++;
      if (isCompleted) doneCount++;
    }

    const done = doneCount;
    const inProgress = Math.max(0, startedCount - doneCount);
    const todo = Math.max(0, createdCount - startedCount);

    return {
      date,
      done,
      inProgress,
      todo,
      total: createdCount,
      cumulativeStarted: startedCount,
      cumulativeDone: doneCount,
    };
  });

  const maxTotal = Math.max(1, ...points.map((p) => p.total));
  const isEmpty = points.every((p) => p.total === 0);

  return {
    points,
    maxTotal,
    isEmpty,
  };
};

export const useCfdData = (tasks: TaskModel[], daysCount = 14): CfdData => {
  return useMemo(() => calculateCfd(tasks, daysCount), [tasks, daysCount]);
};
