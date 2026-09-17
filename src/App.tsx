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
import { useTheme } from './hooks/useTheme';
import { ThemeSelector } from './components/ThemeSelector';
import { ToastNotification } from './components/ToastNotification';
import { getDefaultColumnColor, TaskModel, BLOCKED_TASK_MOVE_WARNING_MESSAGE } from './types/kanban';
import { isTaskBlocked } from './utils/taskReorder';
import { ReorderOptions } from './types/dnd';
import { useTeamAccess } from './hooks/useTeamAccess';
import { UserProfileMenu } from './components/UserProfileMenu';
import { TeamManagementModal } from './components/TeamManagementModal';
import { RestrictedBoardFallback } from './components/RestrictedBoardFallback';
import { TaskRelationType, CrossSquadTaskSummary } from './types/taskTypes';
import {
  addBidirectionalLink,
  removeBidirectionalLink,
  calculateInitiativeProgress,
  getPendingBlockers,
} from './utils/taskRelations';
import { DependencySoftBlockModal } from './components/DependencySoftBlockModal';
import { useWorkspaces } from './hooks/useWorkspaces';
import { useAppSettings } from './hooks/useAppSettings';
import { WorkspaceHub } from './components/WorkspaceHub/WorkspaceHub';
import { CreateWorkspaceModal } from './components/WorkspaceHub/CreateWorkspaceModal';
import { SettingsView } from './components/Settings/SettingsView';
import metrikLogo from './assets/metrik-logo.png';
import './App.css';

export const App: React.FC = () => {
  const {
    users,
    activeUser,
    activeUserId,
    teams,
    invitations,
    selectUser,
    createUser,
    createTeam,
    updateMemberRole,
    removeMember,
    createInvitation,
    acceptInvitation,
    isBoardAccessible,
    teamMembers,
    getUserRoleInTeam,
  } = useTeamAccess();

  const [isTeamModalOpen, setIsTeamModalOpen] = React.useState(false);
  const {
    boards,
    activeBoardId,
    createBoard,
    switchBoard,
    renameBoard,
    deleteBoard
  } = useBoards();

  const activeBoard = boards.find((b) => b.id === activeBoardId);
  const isAuthorized = activeBoard ? isBoardAccessible(activeBoard.teamId) : true;
  const effectiveTeamId = activeBoard?.teamId || 'default-team-main';
  const activeBoardTeam = teams.find((t) => t.id === effectiveTeamId);
  const activeBoardUserRole = getUserRoleInTeam(effectiveTeamId, activeUserId);
  const isGuest = activeBoardUserRole === 'guest';

  // Auto-switch to first accessible board if active board is not accessible (e.g. on profile switch)
  React.useEffect(() => {
    if (activeBoard && !isBoardAccessible(activeBoard.teamId)) {
      const firstAllowed = boards.find((b) => isBoardAccessible(b.teamId));
      if (firstAllowed) {
        switchBoard(firstAllowed.id);
      }
    }
  }, [activeUserId, activeBoard, boards, isBoardAccessible, switchBoard]);

  const [isBoardModalOpen, setIsBoardModalOpen] = React.useState(false);
  const [isNewColumnModalOpen, setIsNewColumnModalOpen] = React.useState(false);

  const { theme, setTheme } = useTheme();

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

  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    favoriteBoardIds,
    toggleFavoriteBoard,
    createWorkspace,
    updateWorkspace,
  } = useWorkspaces();

  const { settings, updateSettings } = useAppSettings();
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = React.useState(false);
  const [view, setView] = React.useState<'workspaces' | 'board' | 'analytics' | 'settings'>('board');

  const handleUpdateSettings = (patch: Partial<typeof settings>) => {
    updateSettings(patch);
    if (patch.theme && patch.theme !== theme) {
      const mappedTheme = patch.theme === 'slate' ? 'neutral' : patch.theme;
      setTheme(mappedTheme);
    }
  };

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

  const handleAddLink = React.useCallback(
    (targetTaskId: string, relationType: TaskRelationType, targetBoardId: string, targetTeamId: string) => {
      if (!selectedTaskId || !activeBoardId) return;

      const sourceTask = allBoardTasks.find((t) => t.id === selectedTaskId);
      if (!sourceTask) return;

      if (targetBoardId === activeBoardId) {
        // Intra-board linking
        const targetTask = allBoardTasks.find((t) => t.id === targetTaskId);
        if (!targetTask) return;

        const { updatedSource, updatedTarget } = addBidirectionalLink({
          sourceTask,
          targetTask,
          relationType,
          sourceBoardId: activeBoardId,
          targetBoardId,
          sourceTeamId: effectiveTeamId,
          targetTeamId,
        });

        updateTask(sourceTask.id, { links: updatedSource.links });
        updateTask(targetTask.id, { links: updatedTarget.links });
      } else {
        // Cross-board / Cross-squad linking
        try {
          const storageKey = `metrik-tasks-${targetBoardId}`;
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            let targetTask: TaskModel | undefined;
            for (const colId of Object.keys(parsed.tasks || {})) {
              const found = (parsed.tasks[colId] as TaskModel[]).find((t) => t.id === targetTaskId);
              if (found) {
                targetTask = found;
                break;
              }
            }

            if (targetTask) {
              const { updatedSource, updatedTarget } = addBidirectionalLink({
                sourceTask,
                targetTask,
                relationType,
                sourceBoardId: activeBoardId,
                targetBoardId,
                sourceTeamId: effectiveTeamId,
                targetTeamId,
              });

              updateTask(sourceTask.id, { links: updatedSource.links });

              for (const colId of Object.keys(parsed.tasks)) {
                parsed.tasks[colId] = (parsed.tasks[colId] as TaskModel[]).map((t) =>
                  t.id === targetTaskId ? updatedTarget : t
                );
              }
              localStorage.setItem(storageKey, JSON.stringify(parsed));
            }
          }
        } catch (err) {
          console.error('[Metrik] Falha ao criar vínculo cross-squad:', err);
        }
      }
    },
    [selectedTaskId, activeBoardId, allBoardTasks, effectiveTeamId, updateTask]
  );

  const handleRemoveLink = React.useCallback(
    (targetTaskId: string) => {
      if (!selectedTaskId || !activeBoardId) return;

      const sourceTask = allBoardTasks.find((t) => t.id === selectedTaskId);
      if (!sourceTask) return;

      const linkToRemove = (sourceTask.links ?? []).find((l) => l.targetTaskId === targetTaskId);
      if (!linkToRemove) return;

      if (linkToRemove.targetBoardId === activeBoardId) {
        // Intra-board removal
        const targetTask = allBoardTasks.find((t) => t.id === targetTaskId);
        if (targetTask) {
          const { updatedSource, updatedTarget } = removeBidirectionalLink(sourceTask, targetTask);
          updateTask(sourceTask.id, { links: updatedSource.links });
          updateTask(targetTask.id, { links: updatedTarget.links });
        } else {
          updateTask(sourceTask.id, {
            links: (sourceTask.links ?? []).filter((l) => l.targetTaskId !== targetTaskId),
          });
        }
      } else {
        // Cross-board removal
        updateTask(sourceTask.id, {
          links: (sourceTask.links ?? []).filter((l) => l.targetTaskId !== targetTaskId),
        });

        try {
          const storageKey = `metrik-tasks-${linkToRemove.targetBoardId}`;
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            for (const colId of Object.keys(parsed.tasks || {})) {
              parsed.tasks[colId] = (parsed.tasks[colId] as TaskModel[]).map((t) => {
                if (t.id === targetTaskId && t.links) {
                  return {
                    ...t,
                    links: t.links.filter((l) => l.targetTaskId !== sourceTask.id),
                  };
                }
                return t;
              });
            }
            localStorage.setItem(storageKey, JSON.stringify(parsed));
          }
        } catch (err) {
          console.error('[Metrik] Falha ao remover vínculo cross-squad:', err);
        }
      }
    },
    [selectedTaskId, activeBoardId, allBoardTasks, updateTask]
  );

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const [softBlockState, setSoftBlockState] = React.useState<{
    task: TaskModel;
    blockingTasks: CrossSquadTaskSummary[];
    onConfirm: () => void;
  } | null>(null);

  const handleGuardedMoveTask = React.useCallback(
    (taskId: string, targetColumnId: string) => {
      const task = allBoardTasks.find((t) => t.id === taskId);
      const targetCol = board.columns.find((c) => c.id === targetColumnId);

      // Trava Estrita de Movimentação para Cartões Bloqueados (Feature 025):
      if (task && isTaskBlocked(task) && task.column !== targetColumnId) {
        setToastMessage(BLOCKED_TASK_MOVE_WARNING_MESSAGE);
        return;
      }

      if (targetCol?.category === 'done' && task) {
        const pending = getPendingBlockers(task, allBoardTasks, board.columns);
        if (pending.length > 0) {
          setSoftBlockState({
            task,
            blockingTasks: pending,
            onConfirm: () => {
              moveTask(taskId, targetColumnId);
              setSoftBlockState(null);
            },
          });
          return;
        }
      }

      moveTask(taskId, targetColumnId);
    },
    [allBoardTasks, board.columns, moveTask]
  );

  const handleGuardedDropTask = React.useCallback(
    (options: ReorderOptions) => {
      const task = allBoardTasks.find((t) => t.id === options.activeTaskId);
      const targetCol = board.columns.find((c) => c.id === options.targetColumn);

      // Trava Estrita de Movimentação para Cartões Bloqueados (Feature 025):
      if (task && isTaskBlocked(task) && task.column !== options.targetColumn) {
        setToastMessage(BLOCKED_TASK_MOVE_WARNING_MESSAGE);
        return;
      }

      if (targetCol?.category === 'done' && task) {
        const pending = getPendingBlockers(task, allBoardTasks, board.columns);
        if (pending.length > 0) {
          setSoftBlockState({
            task,
            blockingTasks: pending,
            onConfirm: () => {
              reorderOrMoveTask(options);
              setSoftBlockState(null);
            },
          });
          return;
        }
      }

      reorderOrMoveTask(options);
    },
    [allBoardTasks, board.columns, reorderOrMoveTask]
  );

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
    <div className="app-container" data-theme={theme}>
      <header className="app-header">
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="brand-logo-container" aria-label="Logotipo Metrik">
            <img src={metrikLogo} alt="Metrik — Métricas para Gestão Ágil" className="brand-logo-img" />
          </div>
          <div>
            <h1 className="brand-title">Metrik</h1>
            <p className="brand-subtitle">Métricas para Gestão Ágil</p>
          </div>
          
          <BoardSwitcher 
            boards={boards}
            activeBoardId={activeBoardId}
            onSwitchBoard={switchBoard}
            onManageBoards={() => setIsBoardModalOpen(true)}
            teams={teams}
            activeUserId={activeUserId}
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

          {/* Cluster 1: Navegação & Tema */}
          <div className="header-cluster header-nav-cluster">
            <div className="view-toggle">
              <button
                type="button"
                className={`btn ${view === 'workspaces' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setView('workspaces')}
              >
                Espaços
              </button>
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
              className={`btn ${view === 'settings' ? 'btn-primary' : 'btn-secondary'} btn-compact btn-settings-trigger`}
              onClick={() => setView('settings')}
              aria-label="Configurações do Sistema"
              title="Abrir Configurações do Sistema"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Configurações</span>
            </button>

            <ThemeSelector currentTheme={theme} onSelectTheme={setTheme} />
          </div>

          <div className="header-cluster-divider" aria-hidden="true" />

          {/* Cluster 2: Perfil & Sessão */}
          <div className="header-cluster header-session-cluster">
            <UserProfileMenu
              users={users}
              activeUser={activeUser}
              onSelectUser={selectUser}
              onCreateUser={createUser}
              onOpenTeamsModal={() => setIsTeamModalOpen(true)}
              onOpenSettings={() => setView('settings')}
            />
          </div>

          <div className="header-cluster-divider" aria-hidden="true" />

          {/* Cluster 3: Ações do Quadro */}
          <div className="header-cluster header-board-ops-cluster">
            {!isGuest && (
              <button
                type="button"
                className="btn btn-secondary btn-compact"
                onClick={handleImportClick}
                aria-label="Importar Quadro"
                title="Importar dados do quadro a partir de um arquivo JSON"
              >
                Importar
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-compact"
              onClick={handleExport}
              aria-label="Exportar Quadro"
              title="Exportar dados do quadro para um arquivo JSON"
            >
              Exportar
            </button>
            {!isGuest && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary btn-compact"
                  onClick={resetToSeed}
                  aria-label="Restaurar Demo"
                  title="Restaurar tarefas de demonstração"
                >
                  Restaurar Demo
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-compact"
                  onClick={handleClearBoard}
                  aria-label="Limpar Quadro"
                  title="Limpar todas as tarefas do quadro"
                >
                  Limpar Quadro
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {view === 'workspaces' ? (
        <WorkspaceHub
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={setActiveWorkspaceId}
          boards={boards}
          favoriteBoardIds={favoriteBoardIds}
          onToggleFavorite={toggleFavoriteBoard}
          onSelectBoard={(boardId) => {
            switchBoard(boardId);
            setView('board');
          }}
          onNewPanel={() => setIsCreateWorkspaceModalOpen(true)}
          onNewBoard={() => setIsBoardModalOpen(true)}
        />
      ) : view === 'settings' ? (
        <SettingsView
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          workspaces={workspaces}
          onUpdateWorkspace={updateWorkspace}
          onCreateWorkspace={() => setIsCreateWorkspaceModalOpen(true)}
          boards={boards}
          teams={teams}
          users={users}
          onBackToBoard={() => setView('board')}
          onExportData={handleExport}
          onImportData={handleImportClick}
          onClearTasks={handleClearBoard}
          onShowToast={(msg) => setToastMessage(msg)}
        />
      ) : !isAuthorized ? (
        <RestrictedBoardFallback
          teamName={activeBoardTeam?.name}
          onRedirectDefault={() => {
            const firstAllowed = boards.find((b) => isBoardAccessible(b.teamId));
            if (firstAllowed) {
              switchBoard(firstAllowed.id);
            }
          }}
          onOpenJoinCode={() => setIsTeamModalOpen(true)}
        />
      ) : view === 'board' ? (
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
            onDropTask={handleGuardedDropTask}
            onMoveColumn={reorderColumn}
            onOpenNewColumnModal={() => setIsNewColumnModalOpen(true)}
            isReadOnly={isGuest}
            renderTask={(task, columnId) => {
              const currentIndex = board.columns.findIndex(c => c.id === columnId);
              const currentColumn = board.columns[currentIndex];
              const isBlocked = isTaskBlocked(task);
              const canMoveLeft = !isGuest && currentIndex > 0 && !isBlocked;
              const canMoveRight = !isGuest && currentIndex < board.columns.length - 1 && !isBlocked;
              const colColor = getDefaultColumnColor(currentColumn);
              const initiativeProgress = task.type === 'initiative'
                ? calculateInitiativeProgress(task, allBoardTasks, board.columns)
                : undefined;
              const pendingBlockers = task.links && task.links.length > 0
                ? getPendingBlockers(task, allBoardTasks, board.columns)
                : [];

              return (
                <Task
                  key={task.id}
                  task={task}
                  columnColor={colColor}
                  onClick={() => setSelectedTaskId(task.id)}
                  onUpdateTitle={isGuest ? () => {} : (id, title) => updateTask(id, { title })}
                  onDelete={isGuest ? () => {} : deleteTask}
                  onDiscardIfEmpty={isGuest ? () => {} : discardIfEmpty}
                  onUpdatePriority={isGuest ? () => {} : setTaskPriority}
                  onAddTag={isGuest ? () => {} : addTaskTag}
                  onRemoveTag={isGuest ? () => {} : removeTaskTag}
                  onToggleBlocked={isGuest ? undefined : toggleTaskBlocked}
                  onDropTask={isGuest ? () => {} : handleGuardedDropTask}
                  isCompleted={currentColumn?.category === 'done'}
                  canMoveLeft={canMoveLeft}
                  canMoveRight={canMoveRight}
                  onUpdateTask={isGuest ? () => {} : updateTask}
                  initiativeProgress={initiativeProgress}
                  pendingBlockersCount={pendingBlockers.length}
                  onMoveLeft={() => {
                    if (canMoveLeft) {
                      handleGuardedMoveTask(task.id, board.columns[currentIndex - 1].id);
                    }
                  }}
                  onMoveRight={() => {
                    if (canMoveRight) {
                      handleGuardedMoveTask(task.id, board.columns[currentIndex + 1].id);
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
          boardTasks={allBoardTasks}
          columns={board.columns}
          currentBoardId={activeBoardId || ''}
          currentTeamId={effectiveTeamId}
          allBoards={boards}
          teams={teams}
          isReadOnly={isGuest}
          onAddLink={handleAddLink}
          onRemoveLink={handleRemoveLink}
          onNavigateToBoard={(bId) => {
            switchBoard(bId);
            setSelectedTaskId(null);
          }}
        />
      )}

      {softBlockState && (
        <DependencySoftBlockModal
          isOpen={!!softBlockState}
          taskTitle={softBlockState.task.title}
          blockingTasks={softBlockState.blockingTasks}
          onConfirm={softBlockState.onConfirm}
          onCancel={() => setSoftBlockState(null)}
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
        teams={teams}
        activeUserId={activeUserId}
      />

      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teams={teams}
        users={users}
        activeUserId={activeUserId}
        invitations={invitations}
        onCreateTeam={createTeam}
        onUpdateMemberRole={updateMemberRole}
        onRemoveMember={removeMember}
        onCreateInvitation={createInvitation}
        onAcceptInvitation={acceptInvitation}
        teamMembers={teamMembers}
      />

      <NewColumnModal
        isOpen={isNewColumnModalOpen}
        onClose={() => setIsNewColumnModalOpen(false)}
        onAddColumn={addColumn}
        currentColumnCount={board.columns.length}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        onCreateWorkspace={(name, color, description) => {
          createWorkspace(name, color, description);
        }}
      />

      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};

export default App;
