import React from 'react';
import { useTaskCollection } from './hooks/useTaskCollection';
import { useFlowMetrics } from './hooks/useFlowMetrics';
import { useBoardFilters } from './hooks/useBoardFilters';
import { useDataPortability } from './hooks/useDataPortability';
import { MetricsBar } from './components/MetricsBar';
import { FilterBar } from './components/FilterBar';
import { Board } from './components/Board';
import { Task } from './components/Task';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { useBoards } from './hooks/useBoards';
import { BoardSwitcher } from './components/BoardSwitcher';
import { BoardManagementModal } from './components/BoardManagementModal';
import { NewColumnModal } from './components/NewColumnModal';
import { useColumnWidths } from './hooks/useColumnWidths';
import { getDefaultColumnColor } from './types/kanban';
import './App.css';

export const App: React.FC = () => {
  const {
    boards,
    activeBoardId,
    createBoard,
    switchBoard,
    renameBoard,
    deleteBoard
  } = useBoards();

  const [isBoardModalOpen, setIsBoardModalOpen] = React.useState(false);
  const [isNewColumnModalOpen, setIsNewColumnModalOpen] = React.useState(false);

  const { columnWidths, setColumnWidth, resetColumnWidth } = useColumnWidths(activeBoardId);

  const {
    board,
    addColumn,
    addTask,
    updateTask,
    toggleTaskBlocked,
    deleteTask,
    updateColumn,
    deleteColumn,
    reorderColumn,
    moveTask,
    reorderOrMoveTask,
    setTaskPriority,
    addTaskTag,
    removeTaskTag,
    discardIfEmpty,
    clearTasks,
    resetToSeed,
    overwriteBoard,
  } = useTaskCollection(activeBoardId);

  const { exportData, importData } = useDataPortability();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [view, setView] = React.useState<'board' | 'analytics'>('board');

  const filterData = useBoardFilters(board);

  const allBoardTasks = React.useMemo(() => {
    return Object.values(board.tasks).flat();
  }, [board.tasks]);

  const completedTasks = React.useMemo(() => {
    return board.columns
      .filter((col) => col.category === 'done')
      .flatMap((col) => board.tasks[col.id] || []);
  }, [board.columns, board.tasks]);
  
  const flowMetrics = useFlowMetrics(completedTasks, allBoardTasks);

  const handleClearBoard = () => {
    const confirmed = window.confirm(
      'Tem certeza de que deseja limpar todas as tarefas do quadro? Esta ação não pode ser desfeita.'
    );
    if (confirmed) {
      clearTasks();
    }
  };

  const handleAddTask = (columnId: string) => {
    addTask(columnId, '');
  };

  const handleExport = () => {
    // Pass active board info if needed, but for now exportData just takes the board state.
    // We will update useDataPortability shortly.
    exportData(board, activeBoardId);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      'A importação irá substituir completamente o seu quadro atual. Deseja continuar?'
    );

    if (confirmed) {
      importData(
        file,
        (newBoard) => {
          overwriteBoard(newBoard);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        (errorMsg) => {
          alert(errorMsg);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      );
    } else {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="brand-logo" aria-hidden="true">
            M
          </div>
          <div>
            <h1 className="brand-title">Metrik</h1>
            <p className="brand-subtitle">Quadro Kanban Ágil de Alta Performance</p>
          </div>
          
          <BoardSwitcher 
            boards={boards}
            activeBoardId={activeBoardId}
            onSwitchBoard={switchBoard}
            onManageBoards={() => setIsBoardModalOpen(true)}
          />
        </div>

        <div className="header-actions">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
          
          <div className="view-toggle">
            <button
              type="button"
              className={`btn ${view === 'board' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('board')}
            >
              Quadro
            </button>
            <button
              type="button"
              className={`btn ${view === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('analytics')}
            >
              Analytics
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleImportClick}
            aria-label="Importar Quadro"
            title="Importar dados do quadro a partir de um arquivo JSON"
          >
            Importar
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExport}
            aria-label="Exportar Quadro"
            title="Exportar dados do quadro para um arquivo JSON"
          >
            Exportar
          </button>
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

      {view === 'board' ? (
        <>
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
          />

          <Board
            board={filterData.filteredBoard}
            rawBoard={board}
            hasActiveFilters={filterData.hasActiveFilters}
            columnWidths={columnWidths}
            onResizeColumnWidth={setColumnWidth}
            onResetColumnWidth={resetColumnWidth}
            onAddTask={handleAddTask}
            onUpdateColumn={updateColumn}
            onDeleteColumn={deleteColumn}
            onDropTask={reorderOrMoveTask}
            onMoveColumn={reorderColumn}
            onOpenNewColumnModal={() => setIsNewColumnModalOpen(true)}
            renderTask={(task, columnId) => {
              const currentIndex = board.columns.findIndex(c => c.id === columnId);
              const currentColumn = board.columns[currentIndex];
              const canMoveLeft = currentIndex > 0;
              const canMoveRight = currentIndex < board.columns.length - 1;
              const colColor = getDefaultColumnColor(currentColumn);

              return (
                <Task
                  key={task.id}
                  task={task}
                  columnColor={colColor}
                  onClick={() => setSelectedTaskId(task.id)}
                  onUpdateTitle={(id, title) => updateTask(id, { title })}
                  onDelete={deleteTask}
                  onDiscardIfEmpty={discardIfEmpty}
                  onUpdatePriority={setTaskPriority}
                  onAddTag={addTaskTag}
                  onRemoveTag={removeTaskTag}
                  onDropTask={reorderOrMoveTask}
                  isCompleted={currentColumn?.category === 'done'}
                  canMoveLeft={canMoveLeft}
                  canMoveRight={canMoveRight}
                  onMoveLeft={() => {
                    if (canMoveLeft) {
                      moveTask(task.id, board.columns[currentIndex - 1].id);
                    }
                  }}
                  onMoveRight={() => {
                    if (canMoveRight) {
                      moveTask(task.id, board.columns[currentIndex + 1].id);
                    }
                  }}
                />
              );
            }}
          />
        </>
      ) : (
        <AnalyticsDashboard
          board={board}
          tasks={Object.values(board.tasks).flat()}
        />
      )}

      {selectedTaskId && (
        <TaskDetailsModal
          task={Object.values(board.tasks).flat().find(t => t.id === selectedTaskId)!}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={updateTask}
          onToggleBlocked={toggleTaskBlocked}
        />
      )}

      <BoardManagementModal 
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        boards={boards}
        activeBoardId={activeBoardId}
        onCreateBoard={createBoard}
        onRenameBoard={renameBoard}
        onDeleteBoard={deleteBoard}
        onSwitchBoard={switchBoard}
      />

      <NewColumnModal
        isOpen={isNewColumnModalOpen}
        onClose={() => setIsNewColumnModalOpen(false)}
        onAddColumn={addColumn}
        currentColumnCount={board.columns.length}
      />
    </div>
  );
};

export default App;
