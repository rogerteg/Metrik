import React, { useState, useMemo } from 'react';
import { TaskComment, TaskActivityLog, TimelineItem } from '../types/taskActivity';
import { CommentInputForm } from './CommentInputForm';
import { CommentItem } from './CommentItem';
import { ActivityLogItem } from './ActivityLogItem';
import { TimelineFilterBar, TimelineFilter } from './TimelineFilterBar';

export interface TaskTimelineProps {
  taskId: string;
  comments?: TaskComment[];
  activityLog?: TaskActivityLog[];
  onAddComment: (text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  isGuest?: boolean;
}

const HistoryIcon = () => (
  <svg className="h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

export const TaskTimeline: React.FC<TaskTimelineProps> = ({
  comments = [],
  activityLog = [],
  onAddComment,
  onDeleteComment,
  isGuest = false,
}) => {
  const [filter, setFilter] = useState<TimelineFilter>('all');

  // Combine and sort chronologically (newest first)
  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    if (filter === 'all' || filter === 'comments') {
      comments.forEach((c) => {
        items.push({
          type: 'comment',
          ...c,
          timestamp: c.createdAt,
        });
      });
    }

    if (filter === 'all' || filter === 'activity') {
      activityLog.forEach((a) => {
        items.push({
          type: 'activity',
          ...a,
        });
      });
    }

    return items.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA; // Decrescente (mais recente no topo)
    });
  }, [comments, activityLog, filter]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-100">
          <HistoryIcon />
          Histórico e Comentários da Tarefa
        </h3>
      </div>

      {/* Form para novo comentário */}
      <CommentInputForm onSubmitComment={onAddComment} disabled={isGuest} />

      {/* Barra de Filtros */}
      <TimelineFilterBar
        activeFilter={filter}
        onFilterChange={setFilter}
        commentsCount={comments.length}
        activityCount={activityLog.length}
      />

      {/* Lista de itens da linha do tempo */}
      <div className="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {timelineItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-slate-500">
            <HistoryIcon />
            <p className="mt-2">Nenhum registro encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          timelineItems.map((item) => {
            if (item.type === 'comment') {
              return (
                <CommentItem
                  key={`comment-${item.id}`}
                  comment={item}
                  onDelete={onDeleteComment}
                  canDelete={!isGuest}
                />
              );
            }
            return <ActivityLogItem key={`activity-${item.id}`} activity={item} />;
          })
        )}
      </div>
    </div>
  );
};
