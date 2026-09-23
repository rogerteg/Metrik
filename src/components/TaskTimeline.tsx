import React, { useMemo } from 'react';
import { TaskComment, TaskActivityLog, TimelineItem } from '../types/taskActivity';
import { CommentInputForm } from './CommentInputForm';
import { CommentItem } from './CommentItem';
import { ActivityLogItem } from './ActivityLogItem';
import { TimelineFilterBar } from './TimelineFilterBar';
import { TimelineStatsHeader } from './TimelineStatsHeader';
import { groupTimelineItems } from '../utils/taskActivityLogger';
import { useTimelinePreferences } from '../hooks/useTimelinePreferences';

export interface TaskTimelineProps {
  taskId: string;
  comments?: TaskComment[];
  activityLog?: TaskActivityLog[];
  onAddComment?: (text: string, isDecision?: boolean) => void;
  onDeleteComment?: (commentId: string) => void;
  isGuest?: boolean;
  totalBlockedMs?: number;
}

const HistoryIcon = () => (
  <svg width={16} height={16} style={{ width: 16, height: 16, flexShrink: 0 }} className="h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  totalBlockedMs = 0,
}) => {
  const {
    densityMode,
    activeFilter: filter,
    searchQuery,
    setDensityMode,
    setActiveFilter: setFilter,
    setSearchQuery,
  } = useTimelinePreferences();

  // Counts statistics
  const counts = useMemo(() => {
    const decisionsCount = comments.filter((c) => Boolean(c.isDecision)).length;
    const movesCount = activityLog.filter((a) => a.eventType === 'moved').length;

    return {
      all: comments.length + activityLog.length,
      decisions: decisionsCount,
      comments: comments.length,
      activity: activityLog.length,
      moves: movesCount,
    };
  }, [comments, activityLog]);

  // Combined, filtered, and sorted items
  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    // Filter by type
    if (filter === 'all' || filter === 'comments' || filter === 'decisions') {
      comments.forEach((c) => {
        if (filter === 'decisions' && !c.isDecision) return;
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

    // Search filter
    const cleanSearch = searchQuery.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (!cleanSearch) return true;
      if (item.type === 'comment') {
        return (
          item.text.toLowerCase().includes(cleanSearch) ||
          item.userName.toLowerCase().includes(cleanSearch)
        );
      }
      return (
        item.description.toLowerCase().includes(cleanSearch) ||
        item.userName.toLowerCase().includes(cleanSearch) ||
        (item.fromValue && item.fromValue.toLowerCase().includes(cleanSearch)) ||
        (item.toValue && item.toValue.toLowerCase().includes(cleanSearch))
      );
    });

    // Decrescente (mais recente no topo)
    return filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
  }, [comments, activityLog, filter, searchQuery]);

  // Grouped by time buckets
  const timelineGroups = useMemo(() => {
    return groupTimelineItems(timelineItems);
  }, [timelineItems]);

  const toggleDensity = () => {
    setDensityMode(densityMode === 'compact' ? 'detailed' : 'compact');
  };

  // Latest decision for Spotlight Banner (filtered by search query if any)
  const latestDecision = useMemo(() => {
    const cleanSearch = searchQuery.trim().toLowerCase();
    const decisionComments = comments.filter((c) => {
      if (!c.isDecision) return false;
      if (!cleanSearch) return true;
      return c.text.toLowerCase().includes(cleanSearch) || c.userName.toLowerCase().includes(cleanSearch);
    });
    return decisionComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [comments, searchQuery]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-100">
          <HistoryIcon />
          Histórico e Comentários da Tarefa
        </h3>
      </div>

      {/* Header Resumido com Métricas */}
      <TimelineStatsHeader
        totalComments={counts.comments}
        totalDecisions={counts.decisions}
        totalMoves={counts.moves}
        totalBlockedMs={totalBlockedMs}
      />

      {/* Spotlight de Decisões */}
      {latestDecision && (
        <div data-testid="spotlight-decision-banner" className="flex items-start gap-2.5 rounded-xl border border-amber-500/50 bg-amber-950/30 p-3 text-xs shadow-md">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-900/80 text-amber-300 border border-amber-600/70">
            <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-amber-300 text-[10px]">Spotlight de Decisão</span>
              <span className="text-[11px] text-amber-400/80 font-medium">{latestDecision.userName}</span>
            </div>
            <p className="text-slate-200 font-medium line-clamp-2">{latestDecision.text}</p>
          </div>
        </div>
      )}

      {/* Form para novo comentário */}
      <CommentInputForm
        onSubmitComment={(text, isDecision) => onAddComment?.(text, isDecision)}
        disabled={isGuest || !onAddComment}
      />

      {/* Barra de Filtros com Busca e Densidade */}
      <TimelineFilterBar
        activeFilter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        densityMode={densityMode}
        onToggleDensity={toggleDensity}
        counts={counts}
      />

      {/* Lista de itens da linha do tempo agrupados por baldes temporais */}
      <div className="flex flex-col gap-4 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
        {timelineGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <HistoryIcon />
            <p className="mt-2.5 font-medium text-slate-400">Nenhum registro encontrado para os filtros selecionados.</p>
            <span className="mt-1 text-[11px] text-slate-600">Tente ajustar o termo de pesquisa ou a categoria do filtro.</span>
          </div>
        ) : (
          timelineGroups.map((group) => (
            <div key={group.groupKey} className="flex flex-col gap-2">
              <div className="sticky top-0 z-10 flex items-center gap-2 bg-slate-950/90 py-1 backdrop-blur-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-slate-800/80" />
              </div>

              <div className={`flex flex-col ${densityMode === 'compact' ? 'gap-1.5' : 'gap-2.5'}`}>
                {group.items.map((item) => {
                  if (item.type === 'comment') {
                    return (
                      <CommentItem
                        key={`comment-${item.id}`}
                        comment={item}
                        onDelete={onDeleteComment}
                        canDelete={!isGuest}
                        compact={densityMode === 'compact'}
                      />
                    );
                  }
                  return (
                    <ActivityLogItem
                      key={`activity-${item.id}`}
                      activity={item}
                      compact={densityMode === 'compact'}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
