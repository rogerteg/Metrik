import { useState, useEffect } from 'react';
import { TaskModel, ColumnModel } from '../types/kanban';
import { MikaInsight } from '../types/mika';
import { mikaService } from '../services/ai/mikaService';

export function useDashboardMikaInsights(
  boardId: string,
  columns: ColumnModel[],
  filteredTasks: TaskModel[],
) {
  const [mikaInsights, setMikaInsights] = useState<MikaInsight[]>([]);
  const [mikaLoading, setMikaLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    mikaService.getBoardInsights(boardId, columns, filteredTasks).then((insights) => {
      if (isMounted) setMikaInsights(insights);
    });
    return () => {
      isMounted = false;
    };
  }, [boardId, columns, filteredTasks]);

  const handleRefreshMika = async () => {
    setMikaLoading(true);
    try {
      const refreshed = await mikaService.getBoardInsights(boardId, columns, filteredTasks, true);
      setMikaInsights(refreshed);
    } finally {
      setMikaLoading(false);
    }
  };

  return { mikaInsights, mikaLoading, handleRefreshMika };
}
