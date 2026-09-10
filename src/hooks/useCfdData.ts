import { useMemo } from 'react';
import { ColumnModel, TaskModel } from '../types/kanban';
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
 * Calcula a evolução do Diagrama de Fluxo Cumulativo (CFD) para a lista de tarefas e colunas fornecidas.
 * Suporta o fluxo completo de todas as etapas (colunas) configuradas no quadro.
 */
export const calculateCfd = (
  tasks: TaskModel[],
  daysCount = 14,
  columns?: ColumnModel[]
): CfdData => {
  const days = getLastNDays(daysCount);

  if (tasks.length === 0) {
    const points: CfdDataPoint[] = days.map((date) => {
      const stageCounts: Record<string, number> = {};
      const cumulativeStages: Record<string, number> = {};
      if (columns) {
        columns.forEach((col) => {
          stageCounts[col.id] = 0;
          cumulativeStages[col.id] = 0;
        });
      }
      return {
        date,
        done: 0,
        inProgress: 0,
        todo: 0,
        total: 0,
        cumulativeStarted: 0,
        cumulativeDone: 0,
        stageCounts,
        cumulativeStages,
      };
    });
    return {
      points,
      maxTotal: 1,
      isEmpty: true,
      columns,
    };
  }

  const points: CfdDataPoint[] = days.map((date) => {
    let createdCount = 0;
    let startedCount = 0;
    let doneCount = 0;

    // Contadores por coluna
    const stageCounts: Record<string, number> = {};
    if (columns) {
      columns.forEach((col) => {
        stageCounts[col.id] = 0;
      });
    }

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

      // Se colunas foram fornecidas, rastreamos a etapa da tarefa nesta data
      if (columns && isCreated) {
        if (isCompleted) {
          // Se completada, pertence à etapa 'done' (ou à última coluna 'done')
          const doneCol = columns.find((c) => c.category === 'done') || columns[columns.length - 1];
          if (doneCol) {
            stageCounts[doneCol.id] = (stageCounts[doneCol.id] || 0) + 1;
          }
        } else if (isStarted) {
          // Tarefa em progresso: se sua coluna atual pertencer a columns, incrementa nela
          const currentCol = columns.find((c) => c.id === task.column);
          if (currentCol && currentCol.category !== 'todo') {
            stageCounts[currentCol.id] = (stageCounts[currentCol.id] || 0) + 1;
          } else {
            // Fallback para a primeira coluna em progresso
            const firstProgress = columns.find((c) => c.category === 'in_progress') || columns[1] || columns[0];
            if (firstProgress) {
              stageCounts[firstProgress.id] = (stageCounts[firstProgress.id] || 0) + 1;
            }
          }
        } else {
          // Tarefa ainda não iniciada: alocada na coluna inicial/todo
          const currentCol = columns.find((c) => c.id === task.column);
          if (currentCol && currentCol.category === 'todo') {
            stageCounts[currentCol.id] = (stageCounts[currentCol.id] || 0) + 1;
          } else {
            const firstTodo = columns.find((c) => c.category === 'todo') || columns[0];
            if (firstTodo) {
              stageCounts[firstTodo.id] = (stageCounts[firstTodo.id] || 0) + 1;
            }
          }
        }
      }
    }

    // Calcular valores cumulativos a partir da direita (concluído) para a esquerda (a fazer)
    const cumulativeStages: Record<string, number> = {};
    if (columns && columns.length > 0) {
      let runningSum = 0;
      for (let i = columns.length - 1; i >= 0; i--) {
        const colId = columns[i].id;
        runningSum += stageCounts[colId] || 0;
        cumulativeStages[colId] = runningSum;
      }
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
      stageCounts,
      cumulativeStages,
    };
  });

  const maxTotal = Math.max(1, ...points.map((p) => p.total));
  const isEmpty = points.every((p) => p.total === 0);

  return {
    points,
    maxTotal,
    isEmpty,
    columns,
  };
};

export const useCfdData = (
  tasks: TaskModel[],
  daysCount = 14,
  columns?: ColumnModel[]
): CfdData => {
  return useMemo(() => calculateCfd(tasks, daysCount, columns), [tasks, daysCount, columns]);
};
