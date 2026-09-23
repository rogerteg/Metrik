import React from 'react';
import { ActivityLogEntry } from '../types/taskActivity';
import { useTaskActivity } from '../hooks/useTaskActivity';
import { TaskActivityHeader } from './TaskActivityHeader';
import { TaskActivityLogList } from './TaskActivityLogList';
import { TaskActivityCommentForm } from './TaskActivityCommentForm';

export interface TaskActivityPanelProps {
  taskId: string;
  initialEntries?: ActivityLogEntry[];
  onSubmitComment: (commentText: string) => void;
  onDirtyStateChange?: (isDirty: boolean) => void;
}

export const TaskActivityPanel: React.FC<TaskActivityPanelProps> = ({
  taskId,
  initialEntries = [],
  onSubmitComment,
  onDirtyStateChange,
}) => {
  const {
    displayedEntries,
    isExpanded,
    isSearchOpen,
    unreadCount,
    filter,
    toggleExpand,
    toggleSearch,
    setSearchQuery,
    setCategory,
    toggleUnreadFilter,
  } = useTaskActivity({ initialEntries, collapseThreshold: 5 });

  return (
    <aside className="task-activity-panel">
      {/* Header */}
      <TaskActivityHeader
        unreadCount={unreadCount}
        isSearchOpen={isSearchOpen}
        searchQuery={filter.searchQuery}
        selectedCategory={filter.category}
        onToggleSearch={toggleSearch}
        onSearchQueryChange={setSearchQuery}
        onToggleUnreadFilter={toggleUnreadFilter}
        onSelectCategoryFilter={setCategory}
      />

      {/* Activity Log List */}
      <div className="task-activity-list-container custom-scrollbar">
        <TaskActivityLogList
          entries={displayedEntries}
          isExpanded={isExpanded}
          collapseThreshold={5}
          onToggleExpand={toggleExpand}
        />
      </div>

      {/* Comment Card Footer */}
      <TaskActivityCommentForm
        taskId={taskId}
        onSubmitComment={onSubmitComment}
        onDirtyStateChange={onDirtyStateChange}
      />
    </aside>
  );
};
