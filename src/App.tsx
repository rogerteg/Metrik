import React from 'react';
import { useTaskCollection } from './hooks/useTaskCollection';
import { useWipLimits } from './hooks/useWipLimits';
import { useFlowMetrics } from './hooks/useFlowMetrics';
import { useBoardFilters } from './hooks/useBoardFilters';
import { MetricsBar } from './components/MetricsBar';
import { FilterBar } from './components/FilterBar';
import { Board } from './components/Board';
import { Task } from './components/Task';
import { ColumnType } from './types/kanban';
import './App.css';

const COLUMN_ORDER: ColumnType[] = [
  ColumnType.TO_DO,
  ColumnType.IN_PROGRESS,
  ColumnType.BLOCKED,
  ColumnType.COMPLETED,
];

export const App: React.FC = () => {
  const {
    board,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderOrMoveTask,
    setTaskPriority,
    addTaskTag,
    removeTaskTag,
    discardIfEmpty,
    clearTasks,
    resetToSeed,
  } = useTaskCollection();

  const { wipLimits, setWipLimit } = useWipLimits();

  const filterData = useBoardFilters(board);

  const completedTasks = board[ColumnType.COMPLETED] || [];
  const flowMetrics = useFlowMetrics(completedTasks);

  const handleClearBoard = () => {
    const confirmed = window.confirm(
      'Tem certeza de que deseja limpar todas as tarefas do quadro? Esta ação não pode ser desfeita.'
    );
    if (confirmed) {
      clearTasks();
    }
  };

  const handleAddTask = (column: ColumnType) => {
    addTask(column, '');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo" aria-hidden="true">
            M
          </div>
          <div>
            <h1 className="brand-title">Metrik</h1>
            <p className="brand-subtitle">Quadro Kanban Ágil de Alta Performance</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetToSeed}
            aria-label="Restaurar Demo"
            title="Restaurar tarefas de demonstração"
          >
            Restaurar Demo
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleClearBoard}
            aria-label="Limpar Quadro"
            title="Limpar todas as tarefas do quadro"
          >
            Limpar Quadro
          </button>
        </div>
      </header>

      <MetricsBar metrics={flowMetrics} />

      <FilterBar
        filters={filterData.filters}
        onSearchChange={filterData.setSearchQuery}
        onPriorityChange={filterData.setPriorityFilter}
        onToggleTag={filterData.toggleTagFilter}
        onClearFilters={filterData.clearFilters}
        hasActiveFilters={filterData.hasActiveFilters}
        availableTags={filterData.availableTags}
        visibleCount={filterData.visibleCount}
        totalCount={filterData.totalCount}
      />

      <Board
        board={filterData.filteredBoard}
        rawBoard={board}
        hasActiveFilters={filterData.hasActiveFilters}
        wipLimits={wipLimits}
        onUpdateWipLimit={setWipLimit}
        onAddTask={handleAddTask}
        onDropTask={reorderOrMoveTask}
        renderTask={(task, column) => {
          const currentIndex = COLUMN_ORDER.indexOf(column);
          const canMoveLeft = currentIndex > 0;
          const canMoveRight = currentIndex < COLUMN_ORDER.length - 1;

          return (
            <Task
              key={task.id}
              task={task}
              onUpdateTitle={(id, title) => updateTask(id, { title })}
              onDelete={deleteTask}
              onDiscardIfEmpty={discardIfEmpty}
              onUpdatePriority={setTaskPriority}
              onAddTag={addTaskTag}
              onRemoveTag={removeTaskTag}
              onDropTask={reorderOrMoveTask}
              canMoveLeft={canMoveLeft}
              canMoveRight={canMoveRight}
              onMoveLeft={() => {
                if (canMoveLeft) {
                  moveTask(task.id, COLUMN_ORDER[currentIndex - 1]);
                }
              }}
              onMoveRight={() => {
                if (canMoveRight) {
                  moveTask(task.id, COLUMN_ORDER[currentIndex + 1]);
                }
              }}
            />
          );
        }}
      />
    </div>
  );
};

export default App;
