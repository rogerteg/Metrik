import React from 'react';
import { useTaskCollection } from './hooks/useTaskCollection';
import { useFlowMetrics } from './hooks/useFlowMetrics';
import { useBoardFilters } from './hooks/useBoardFilters';
import { useDataPortability } from './hooks/useDataPortability';
import { MetricsBar } from './components/MetricsBar';
import { SprintBar } from './components/SprintBar';
import { SprintManagerModal } from './components/SprintManagerModal';
import { FilterBar } from './components/FilterBar';
import { Board } from './components/Board';
import { BoardTask } from './components/BoardTask';
import { TaskDetailsModal } from './components/TaskDetailsModal';
const AnalyticsDashboard = React.lazy(() =>
  import('./components/AnalyticsDashboard').then((module) => ({
    default: module.AnalyticsDashboard,
  })),
);
import { useBoards } from './hooks/useBoards';
import { AppHeader } from './components/AppHeader';
import { BoardManagementModal } from './components/BoardManagementModal';
import { NewColumnModal } from './components/NewColumnModal';
import { useColumnWidths } from './hooks/useColumnWidths';
import { useTheme } from './hooks/useTheme';
import { ToastNotification } from './components/ToastNotification';
import { TaskModel, BLOCKED_TASK_MOVE_WARNING_MESSAGE } from './types/kanban';
import { isTaskBlocked } from './utils/taskReorder';
import { ReorderOptions } from './types/dnd';
import { useTeamAccess } from './hooks/useTeamAccess';
import { TeamManagementModal } from './components/TeamManagementModal';
import { RestrictedBoardFallback } from './components/RestrictedBoardFallback';
import { TaskRelationType, CrossSquadTaskSummary } from './types/taskTypes';
import {
  addBidirectionalLink,
  removeBidirectionalLink,
  getPendingBlockers,
} from './utils/taskRelations';
import { buildTasksCsv, buildSprintsCsv } from './utils/csvExport';
import { DependencySoftBlockModal } from './components/DependencySoftBlockModal';
import { useWorkspaces, DEFAULT_WORKSPACE_ID } from './hooks/useWorkspaces';
import { useAppSettings } from './hooks/useAppSettings';
import { useCloudAutoSync } from './hooks/useCloudAutoSync';
import { WorkspaceHub } from './components/WorkspaceHub/WorkspaceHub';
import { CreateWorkspaceModal } from './components/WorkspaceHub/CreateWorkspaceModal';
import { SettingsView } from './components/Settings/SettingsView';
import { ManageBoardsView } from './components/ManageBoards/ManageBoardsView';
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
  const { boards, activeBoardId, createBoard, switchBoard, renameBoard, deleteBoard } = useBoards();

  const activeBoard = boards.find((b) => b.id === activeBoardId);
  const isAuthorized = activeBoard ? isBoardAccessible(activeBoard.teamId) : true;
  const effectiveTeamId = activeBoard?.teamId || 'default-team-main';
  const activeBoardTeam = teams.find((t) => t.id === effectiveTeamId);
  const activeBoardUserRole = getUserRoleInTeam(effectiveTeamId, activeUserId);
  const isGuest = activeBoardUserRole === 'guest';
  const isAdmin = activeBoardUserRole === 'admin';
  const currentUser = React.useMemo(
    () => ({ id: activeUser?.id ?? activeUserId, name: activeUser?.name ?? 'Rogerio Teixeira' }),
    [activeUser, activeUserId],
  );

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
  const [isSprintManagerOpen, setIsSprintManagerOpen] = React.useState(false);

  const { theme, setTheme } = useTheme();

  const { columnWidths, setColumnWidth, resetColumnWidth } = useColumnWidths(activeBoardId);

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

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
    addTaskComment,
    deleteTaskComment,
    editTaskComment,
    addSubtaskComment,
    editSubtaskComment,
    deleteSubtaskComment,
    addSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    setTaskSprint,
    discardIfEmpty,
    clearTasks,
    resetToSeed,
    overwriteBoard,
  } = useTaskCollection(activeBoardId, { onNotify: setToastMessage });

  const { exportData, importData, exportCsv } = useDataPortability();
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
    addBoardToWorkspace,
    removeBoardFromWorkspace,
    deleteWorkspace,
  } = useWorkspaces();

  const { settings, updateSettings } = useAppSettings();

  // Sincronização automática (opt-in) — envia o estado local ao Supabase com debounce.
  const { isSyncing: isCloudAutoSyncing, lastSyncAt: cloudLastSyncAt } = useCloudAutoSync({
    enabled: settings.cloudAutoSync ?? false,
    workspaces,
    boards,
    teams,
    teamMembers,
    revision: board,
  });
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = React.useState(false);
  const [view, setView] = React.useState<
    'workspaces' | 'board' | 'analytics' | 'manage' | 'settings'
  >('board');

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
      'Tem certeza de que deseja limpar todas as tarefas do quadro? Esta ação não pode ser desfeita.',
    );
    if (confirmed) {
      clearTasks();
    }
  };

  /**
   * Aplica dados remotos (Pull do Supabase): o CloudSyncTab já persistiu no
   * localStorage; recarregar reidrata os hooks (boards/workspaces/tasks).
   */
  const handleApplyRemoteData = React.useCallback(() => {
    window.setTimeout(() => window.location.reload(), 600);
  }, []);

  /** Move um quadro entre espaços a partir do Hub (remove de todos e adiciona ao destino). */
  const handleMoveBoardToWorkspace = React.useCallback(
    (boardId: string, targetWorkspaceId: string | null) => {
      workspaces.forEach((ws) => {
        if (ws.boardIds.includes(boardId)) {
          removeBoardFromWorkspace(ws.id, boardId);
        }
      });
      if (targetWorkspaceId) {
        addBoardToWorkspace(targetWorkspaceId, boardId);
      }
    },
    [workspaces, addBoardToWorkspace, removeBoardFromWorkspace],
  );

  /** Cria um quadro já vinculado ao espaço ativo (ou "Geral" quando "Todos"). */
  const handleCreateBoard = React.useCallback(
    (name: string, teamId?: string) => {
      const created = createBoard(name, teamId);
      const targetWorkspaceId =
        activeWorkspaceId === 'all' ? DEFAULT_WORKSPACE_ID : activeWorkspaceId;
      addBoardToWorkspace(targetWorkspaceId, created.id);
      return created;
    },
    [createBoard, activeWorkspaceId, addBoardToWorkspace],
  );

  const handleAddLink = React.useCallback(
    (
      targetTaskId: string,
      relationType: TaskRelationType,
      targetBoardId: string,
      targetTeamId: string,
    ) => {
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
                  t.id === targetTaskId ? updatedTarget : t,
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
    [selectedTaskId, activeBoardId, allBoardTasks, effectiveTeamId, updateTask],
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
    [selectedTaskId, activeBoardId, allBoardTasks, updateTask],
  );

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
    [allBoardTasks, board.columns, moveTask],
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
    [allBoardTasks, board.columns, reorderOrMoveTask],
  );

  const handleAddTask = (columnId: string) => {
    addTask(columnId, '');
  };

  const handleExport = () => {
    // Pass active board info if needed, but for now exportData just takes the board state.
    // We will update useDataPortability shortly.
    exportData(board, activeBoardId);
  };

  const csvStamp = () => new Date().toISOString().slice(0, 10);

  const handleExportTasksCsv = () => {
    exportCsv(`metrik-tarefas-${csvStamp()}.csv`, buildTasksCsv(board));
  };

  const handleExportSprintsCsv = () => {
    exportCsv(`metrik-sprints-${csvStamp()}.csv`, buildSprintsCsv(board.sprints, allBoardTasks));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      'A importação irá substituir completamente o seu quadro atual. Deseja continuar?',
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
        },
      );
    } else {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app-container" data-theme={theme}>
      <AppHeader
        boards={boards}
        activeBoardId={activeBoardId}
        onSwitchBoard={switchBoard}
        teams={teams}
        activeUserId={activeUserId}
        view={view}
        onSelectView={setView}
        theme={theme}
        onSelectTheme={setTheme}
        users={users}
        activeUser={activeUser}
        onSelectUser={selectUser}
        onCreateUser={createUser}
        onOpenTeamsModal={() => setIsTeamModalOpen(true)}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onImportClick={handleImportClick}
        onExport={handleExport}
        onResetDemo={resetToSeed}
        onClearBoard={handleClearBoard}
        isGuest={isGuest}
      />

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
          onMoveBoardToWorkspace={handleMoveBoardToWorkspace}
        />
      ) : view === 'settings' ? (
        <SettingsView
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          workspaces={workspaces}
          onUpdateWorkspace={updateWorkspace}
          onCreateWorkspace={() => setIsCreateWorkspaceModalOpen(true)}
          onAddBoardToWorkspace={addBoardToWorkspace}
          onRemoveBoardFromWorkspace={removeBoardFromWorkspace}
          onDeleteWorkspace={deleteWorkspace}
          boards={boards}
          teams={teams}
          teamMembers={teamMembers}
          users={users}
          onBackToBoard={() => setView('board')}
          onExportData={handleExport}
          onImportData={handleImportClick}
          onClearTasks={handleClearBoard}
          onExportTasksCsv={handleExportTasksCsv}
          onExportSprintsCsv={handleExportSprintsCsv}
          onApplyRemoteData={handleApplyRemoteData}
          autoSyncEnabled={settings.cloudAutoSync ?? false}
          onToggleAutoSync={(enabled) => updateSettings({ cloudAutoSync: enabled })}
          isAutoSyncing={isCloudAutoSyncing}
          autoSyncLastAt={cloudLastSyncAt}
          onShowToast={(msg) => setToastMessage(msg)}
        />
      ) : view === 'manage' ? (
        <ManageBoardsView
          boards={boards}
          activeBoardId={activeBoardId}
          teams={teams}
          activeUser={users.find((u) => u.id === activeUserId)}
          onSelectBoard={(boardId) => {
            switchBoard(boardId);
            setView('board');
          }}
          onCreateBoard={(name, teamId) => {
            handleCreateBoard(name, teamId);
          }}
          onRenameBoard={(boardId, newName) => {
            renameBoard(boardId, newName);
          }}
          onDeleteBoard={(boardId) => {
            deleteBoard(boardId);
          }}
          onOpenAnalytics={(boardId) => {
            switchBoard(boardId);
            setView('analytics');
          }}
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
          <SprintBar
            sprints={board.sprints}
            activeSprintId={board.activeSprintId}
            tasks={allBoardTasks}
            isReadOnly={isGuest}
            onOpenManager={() => setIsSprintManagerOpen(true)}
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
                onSelect={setSelectedTaskId}
                onUpdateTask={updateTask}
                onDelete={deleteTask}
                onDiscardIfEmpty={discardIfEmpty}
                onUpdatePriority={setTaskPriority}
                onAddTag={addTaskTag}
                onRemoveTag={removeTaskTag}
                onToggleBlocked={toggleTaskBlocked}
                onDropTask={handleGuardedDropTask}
                onMoveTask={handleGuardedMoveTask}
                addTaskComment={addTaskComment}
                editTaskComment={editTaskComment}
                deleteTaskComment={deleteTaskComment}
                addSubtaskComment={addSubtaskComment}
                editSubtaskComment={editSubtaskComment}
                deleteSubtaskComment={deleteSubtaskComment}
              />
            )}
          />
        </>
      ) : (
        <React.Suspense
          fallback={
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              Carregando análises…
            </div>
          }
        >
          <AnalyticsDashboard board={board} tasks={Object.values(board.tasks).flat()} />
        </React.Suspense>
      )}

      {selectedTaskId && (
        <TaskDetailsModal
          task={Object.values(board.tasks)
            .flat()
            .find((t) => t.id === selectedTaskId)!}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={updateTask}
          onToggleBlocked={toggleTaskBlocked}
          onAddComment={addTaskComment}
          onDeleteComment={deleteTaskComment}
          onEditComment={
            isGuest
              ? undefined
              : (taskId, commentId, text) => editTaskComment(taskId, commentId, text, currentUser)
          }
          currentUserId={currentUser.id}
          boardTasks={allBoardTasks}
          columns={board.columns}
          currentBoardId={activeBoardId || ''}
          currentTeamId={effectiveTeamId}
          allBoards={boards}
          teams={teams}
          users={users}
          sprints={board.sprints}
          onSetTaskSprint={isGuest ? undefined : setTaskSprint}
          isReadOnly={isGuest}
          autoSaveComments={settings.autoSaveComments ?? true}
          autoSaveDebounceMs={settings.autoSaveDebounceMs ?? 800}
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
        onCreateBoard={handleCreateBoard}
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

      <SprintManagerModal
        isOpen={isSprintManagerOpen}
        onClose={() => setIsSprintManagerOpen(false)}
        sprints={board.sprints}
        activeSprintId={board.activeSprintId}
        tasks={allBoardTasks}
        isReadOnly={isGuest}
        onAdd={addSprint}
        onUpdate={updateSprint}
        onDelete={deleteSprint}
        onStart={startSprint}
        onComplete={completeSprint}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        onCreateWorkspace={(name, color, description) => {
          createWorkspace(name, color, description);
        }}
      />

      <ToastNotification message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};

export default App;
