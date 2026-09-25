import React, { useMemo } from 'react';
import { TaskComment, TaskActivityLog, TimelineItem } from '../types/taskActivity';
import { CommentInputForm } from './CommentInputForm';
import { CommentItem } from './CommentItem';
import { ActivityLogItem } from './ActivityLogItem';
import { TimelineFilterBar } from './TimelineFilterBar';
import { TimelineStatsHeader } from './TimelineStatsHeader';
import { groupTimelineItems, filterTimelineItems } from '../utils/taskActivityLogger';
import { useTimelinePreferences } from '../hooks/useTimelinePreferences';
import './TaskActivityFeed.css';

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
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const AwardIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
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

  // Combined, filtered, and sorted items (pure function — performance-tested in T026)
  const timelineItems = useMemo<TimelineItem[]>(
    () => filterTimelineItems(comments, activityLog, filter, searchQuery),
    [comments, activityLog, filter, searchQuery]
  );

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
    <div className="mrf-timeline">
      <div className="mrf-timeline__header">
        <h3 className="mrf-timeline__title">
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
        <div data-testid="spotlight-decision-banner" className="mrf-decision-spotlight">
          <div className="mrf-decision-spotlight__icon">
            <AwardIcon />
          </div>
          <div className="mrf-decision-spotlight__body">
            <div className="mrf-decision-spotlight__head">
              <span className="mrf-decision-spotlight__label">Spotlight de Decisão</span>
              <span className="mrf-decision-spotlight__author">{latestDecision.userName}</span>
            </div>
            <p className="mrf-decision-spotlight__text">{latestDecision.text}</p>
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
      <div className="mrf-timeline__list">
        {timelineGroups.length === 0 ? (
          <div className="mrf-timeline__empty">
            <HistoryIcon />
            <p>Nenhum registro encontrado para os filtros selecionados.</p>
            <span>Tente ajustar o termo de pesquisa ou a categoria do filtro.</span>
          </div>
        ) : (
          timelineGroups.map((group) => (
            <div key={group.groupKey} className="mrf-group">
              <div className="mrf-group__head">
                <span className="mrf-group__label">{group.label}</span>
                <div className="mrf-group__rule" />
              </div>

              <div className={`mrf-group__items ${densityMode === 'compact' ? '' : 'mrf-group__items--detailed'}`}>
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
