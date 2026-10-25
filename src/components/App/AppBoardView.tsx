import React from 'react';
import { BoardState, TaskModel, FlowMetricsSummary } from '../../types/kanban';
import { SprintBar } from '../SprintBar';
import { MetricsBar } from '../MetricsBar';
import { FilterBar } from '../FilterBar';
import { Board } from '../Board';
import { BoardTask } from '../BoardTask';
import { UseBoardFiltersReturn } from '../../types/filter';
import { ReorderOptions } from '../../types/dnd';
import { UseTaskCollectionReturn } from '../../hooks/useTaskCollection';

export interface AppBoardViewProps {
  board: BoardState;
  allBoardTasks: TaskModel[];
  flowMetrics: FlowMetricsSummary;
  filterData: UseBoardFiltersReturn;
  columnWidths: Record<string, number>;
  setColumnWidth: (columnId: string, width: number) => void;
  resetColumnWidth: (columnId: string) => void;
  resetAllColumnWidths: () => void;
  onFitColumns: () => void;
  isGuest: boolean;
  isAdmin: boolean;
  currentUser: { id: string; name: string };
  settings: {
    autoSaveComments?: boolean;
    autoSaveDebounceMs?: number;
  };
  onOpenSprintManager: () => void;
  onOpenNewColumnModal: () => void;
  taskOps: UseTaskCollectionReturn;
  onDropTask: (options: ReorderOptions) => void;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
  onSelectTask: (taskId: string) => void;
}

export const AppBoardView: React.FC<AppBoardViewProps> = ({
  board,
  allBoardTasks,
  flowMetrics,
  filterData,
  columnWidths,
  setColumnWidth,
  resetColumnWidth,
  resetAllColumnWidths,
  onFitColumns,
  isGuest,
  isAdmin,
  currentUser,
  settings,
  onOpenSprintManager,
  onOpenNewColumnModal,
  taskOps,
  onDropTask,
  onMoveTask,
  onSelectTask,
}) => {
  return (
    <>
      <SprintBar
        sprints={board.sprints}
        activeSprintId={board.activeSprintId}
        tasks={allBoardTasks}
        isReadOnly={isGuest}
        onOpenManager={onOpenSprintManager}
      />

      <MetricsBar metrics={flowMetrics} />

      <FilterBar
        filters={filterData.filters}
        onSearchChange={filterData.setSearchQuery}
        onPriorityChange={filterData.setPriorityFilter}
        onToggleTag={filterData.toggleTagFilter}
        onToggleOnlyBlocked={filterData.toggleOnlyBlocked}
        onClearFilters={filterData.clearFilters}
        hasActiveFilters={filterData.hasActiveFilters}
        availableTags={filterData.availableTags}
        visibleCount={filterData.visibleCount}
        totalCount={filterData.totalCount}
        blockedCount={filterData.blockedCount}
        sprints={board.sprints}
        activeSprintId={board.activeSprintId}
        onSprintChange={filterData.setSprintFilter}
        onFitColumns={onFitColumns}
        onResetColumns={resetAllColumnWidths}
      />

      <Board
        board={filterData.filteredBoard}
        rawBoard={board}
        hasActiveFilters={filterData.hasActiveFilters}
        columnWidths={columnWidths}
        onResizeColumnWidth={setColumnWidth}
        onResetColumnWidth={resetColumnWidth}
        onAddTask={(columnId) => taskOps.addTask(columnId, '')}
        onUpdateColumn={taskOps.updateColumn}
        onDeleteColumn={taskOps.deleteColumn}
        onDropTask={onDropTask}
        onMoveColumn={taskOps.reorderColumn}
        onOpenNewColumnModal={onOpenNewColumnModal}
        isReadOnly={isGuest}
        renderTask={(task, columnId) => (
          <BoardTask
            key={task.id}
            task={task}
            columnId={columnId}
            board={board}
            allBoardTasks={allBoardTasks}
            isGuest={isGuest}
            isAdmin={isAdmin}
            currentUser={currentUser}
            autoSaveComments={settings.autoSaveComments ?? true}
            autoSaveDebounceMs={settings.autoSaveDebounceMs ?? 800}
            sprints={board.sprints}
            onSelect={onSelectTask}
            onUpdateTask={taskOps.updateTask}
            onDelete={taskOps.deleteTask}
            onDiscardIfEmpty={taskOps.discardIfEmpty}
            onUpdatePriority={taskOps.setTaskPriority}
            onAddTag={taskOps.addTaskTag}
            onRemoveTag={taskOps.removeTaskTag}
            onToggleBlocked={taskOps.toggleTaskBlocked}
            onDropTask={onDropTask}
            onMoveTask={onMoveTask}
            addTaskComment={taskOps.addTaskComment}
            editTaskComment={taskOps.editTaskComment}
            deleteTaskComment={taskOps.deleteTaskComment}
            addSubtaskComment={taskOps.addSubtaskComment}
            editSubtaskComment={taskOps.editSubtaskComment}
            deleteSubtaskComment={taskOps.deleteSubtaskComment}
          />
        )}
      />
    </>
  );
};
