import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useTaskCollection } from './hooks/useTaskCollection';
import { useFlowMetrics } from './hooks/useFlowMetrics';
import { useBoardFilters } from './hooks/useBoardFilters';
import { useDataPortability } from './hooks/useDataPortability';
import { useBoards } from './hooks/useBoards';
import { AppHeaderBar } from './components/App/AppHeaderBar';
import { AppMainContent } from './components/App/AppMainContent';
import { AppDialogsContainer } from './components/App/AppDialogsContainer';
import { useColumnWidths } from './hooks/useColumnWidths';
import { MIN_COLUMN_WIDTH } from './utils/columnGeometry';
import { useTheme } from './hooks/useTheme';
import { useTeamAccess } from './hooks/useTeamAccess';
import { buildTasksCsv, buildSprintsCsv } from './utils/csvExport';
import { useWorkspaces, DEFAULT_WORKSPACE_ID } from './hooks/useWorkspaces';
import { useAppSettings } from './hooks/useAppSettings';
import { useCloudAutoSync } from './hooks/useCloudAutoSync';
import { useMika } from './hooks/useMika';
import { useCrossSquadLinking } from './hooks/useCrossSquadLinking';
import { useGuardedTaskMove } from './hooks/useGuardedTaskMove';
import { useAppModals } from './hooks/useAppModals';
import './App.css';

export const App: React.FC = () => {
  const teamAccess = useTeamAccess();
  const modals = useAppModals();
  const { boards, activeBoardId, createBoard, switchBoard, renameBoard, deleteBoard } = useBoards();

  const activeBoard = boards.find((b) => b.id === activeBoardId);
  const isAuthorized = activeBoard ? teamAccess.isBoardAccessible(activeBoard.teamId) : true;
  const effectiveTeamId = activeBoard?.teamId || 'default-team-main';
  const activeBoardTeam = teamAccess.teams.find((t) => t.id === effectiveTeamId);
  const activeBoardUserRole = teamAccess.getUserRoleInTeam(
    effectiveTeamId,
    teamAccess.activeUserId,
  );
  const isGuest = activeBoardUserRole === 'guest';
  const isAdmin = activeBoardUserRole === 'admin';
  const currentUser = useMemo(
    () => ({
      id: teamAccess.activeUser?.id ?? teamAccess.activeUserId,
      name: teamAccess.activeUser?.name ?? 'Rogerio Teixeira',
    }),
    [teamAccess.activeUser, teamAccess.activeUserId],
  );

  useEffect(() => {
    if (activeBoard && !teamAccess.isBoardAccessible(activeBoard.teamId)) {
      const firstAllowed = boards.find((b) => teamAccess.isBoardAccessible(b.teamId));
      if (firstAllowed) {
        switchBoard(firstAllowed.id);
      }
    }
  }, [teamAccess, activeBoard, boards, switchBoard]);

  const [view, setView] = useState<'workspaces' | 'board' | 'analytics' | 'manage' | 'settings'>(
    'board',
  );

  const { theme, setTheme } = useTheme();
  const { columnWidths, setColumnWidth, resetColumnWidth, resetAllColumnWidths } =
    useColumnWidths(activeBoardId);

  const taskOps = useTaskCollection(activeBoardId, { onNotify: modals.setToastMessage });
  const { board } = taskOps;
  const allBoardTasks = useMemo(() => Object.values(board.tasks).flat(), [board.tasks]);

  const mika = useMika({
    boardId: activeBoardId || 'default-board',
    columns: board.columns || [],
    tasks: allBoardTasks,
  });

  const { exportData, importData, exportCsv } = useDataPortability();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workspacesData = useWorkspaces();
  const { settings, updateSettings } = useAppSettings();

  const { isSyncing: isCloudAutoSyncing, lastSyncAt: cloudLastSyncAt } = useCloudAutoSync({
    enabled: settings.cloudAutoSync ?? false,
    workspaces: workspacesData.workspaces,
    boards,
    teams: teamAccess.teams,
    teamMembers: teamAccess.teamMembers,
    revision: board,
  });

  const handleUpdateSettings = (patch: Partial<typeof settings>) => {
    updateSettings(patch);
    if (patch.theme && patch.theme !== theme) {
      setTheme(patch.theme === 'slate' ? 'neutral' : patch.theme);
    }
  };

  const filterData = useBoardFilters(board);

  const completedTasks = useMemo(() => {
    return board.columns
      .filter((col) => col.category === 'done')
      .flatMap((col) => board.tasks[col.id] || []);
  }, [board.columns, board.tasks]);

  const flowMetrics = useFlowMetrics(completedTasks, allBoardTasks);

  const handleClearBoard = () => {
    if (
      window.confirm(
        'Tem certeza de que deseja limpar todas as tarefas do quadro? Esta ação não pode ser desfeita.',
      )
    ) {
      taskOps.clearTasks();
    }
  };

  const handleFitColumnsToWindow = () => {
    const n = board.columns.length;
    if (n === 0) return;
    const grid =
      typeof document !== 'undefined'
        ? (document.querySelector('.kanban-board-grid') as HTMLElement | null)
        : null;
    const available =
      grid?.clientWidth ?? (typeof window !== 'undefined' ? window.innerWidth - 40 : 0);
    const usable = available - 12 - 14 * (n - 1);
    const width = Math.max(MIN_COLUMN_WIDTH, Math.floor(usable / n));
    board.columns.forEach((column) => setColumnWidth(column.id, width));
  };

  const handleMoveBoardToWorkspace = useCallback(
    (boardId: string, targetWorkspaceId: string | null) => {
      workspacesData.workspaces.forEach((ws) => {
        if (ws.boardIds.includes(boardId)) {
          workspacesData.removeBoardFromWorkspace(ws.id, boardId);
        }
      });
      if (targetWorkspaceId) {
        workspacesData.addBoardToWorkspace(targetWorkspaceId, boardId);
      }
    },
    [workspacesData],
  );

  const handleCreateBoard = useCallback(
    (name: string, teamId?: string) => {
      const created = createBoard(name, teamId);
      const targetWorkspaceId =
        workspacesData.activeWorkspaceId === 'all'
          ? DEFAULT_WORKSPACE_ID
          : workspacesData.activeWorkspaceId;
      workspacesData.addBoardToWorkspace(targetWorkspaceId, created.id);
      return created;
    },
    [createBoard, workspacesData],
  );

  const { handleAddLink, handleRemoveLink } = useCrossSquadLinking({
    selectedTaskId: modals.selectedTaskId,
    activeBoardId,
    allBoardTasks,
    effectiveTeamId,
    updateTask: taskOps.updateTask,
  });

  const { softBlockState, cancelSoftBlock, handleGuardedMoveTask, handleGuardedDropTask } =
    useGuardedTaskMove({
      allBoardTasks,
      columns: board.columns,
      moveTask: taskOps.moveTask,
      reorderOrMoveTask: taskOps.reorderOrMoveTask,
      onToast: modals.setToastMessage,
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      window.confirm(
        'A importação irá substituir completamente o seu quadro atual. Deseja continuar?',
      )
    ) {
      importData(
        file,
        (newBoard) => {
          taskOps.overwriteBoard(newBoard);
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
      <AppHeaderBar
        boards={boards}
        activeBoardId={activeBoardId}
        onSwitchBoard={switchBoard}
        teams={teamAccess.teams}
        activeUserId={teamAccess.activeUserId}
        view={view}
        onSelectView={setView}
        theme={theme}
        onSelectTheme={setTheme}
        users={teamAccess.users}
        activeUser={teamAccess.activeUser}
        onSelectUser={teamAccess.selectUser}
        onCreateUser={teamAccess.createUser}
        onOpenTeamsModal={modals.openTeamModal}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onImportClick={() => fileInputRef.current?.click()}
        onExport={() => exportData(board, activeBoardId)}
        onResetDemo={taskOps.resetToSeed}
        onClearBoard={handleClearBoard}
        isGuest={isGuest}
        onOpenMika={mika.toggleDrawer}
        isMikaOpen={mika.isDrawerOpen}
        hasMikaAlerts={mika.insights.some(
          (i) => i.severity === 'warning' || i.severity === 'critical',
        )}
      />

      <AppMainContent
        view={view}
        isAuthorized={isAuthorized}
        activeBoardTeam={activeBoardTeam}
        boards={boards}
        activeBoardId={activeBoardId}
        onSwitchBoard={switchBoard}
        onSelectView={setView}
        onOpenJoinCode={modals.openTeamModal}
        onRedirectFirstAllowed={() => {
          const firstAllowed = boards.find((b) => teamAccess.isBoardAccessible(b.teamId));
          if (firstAllowed) {
            switchBoard(firstAllowed.id);
          }
        }}
        workspaces={workspacesData.workspaces}
        activeWorkspaceId={workspacesData.activeWorkspaceId}
        onSelectWorkspace={workspacesData.setActiveWorkspaceId}
        favoriteBoardIds={workspacesData.favoriteBoardIds}
        onToggleFavorite={workspacesData.toggleFavoriteBoard}
        onNewPanel={modals.openCreateWorkspaceModal}
        onNewBoard={modals.openBoardModal}
        onMoveBoardToWorkspace={handleMoveBoardToWorkspace}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onUpdateWorkspace={workspacesData.updateWorkspace}
        onCreateWorkspace={modals.openCreateWorkspaceModal}
        onAddBoardToWorkspace={workspacesData.addBoardToWorkspace}
        onRemoveBoardFromWorkspace={workspacesData.removeBoardFromWorkspace}
        onDeleteWorkspace={workspacesData.deleteWorkspace}
        teams={teamAccess.teams}
        teamMembers={teamAccess.teamMembers}
        users={teamAccess.users}
        activeUserId={teamAccess.activeUserId}
        onCreateBoard={handleCreateBoard}
        onRenameBoard={renameBoard}
        onDeleteBoard={deleteBoard}
        onExportData={() => exportData(board, activeBoardId)}
        onImportData={() => fileInputRef.current?.click()}
        onClearTasks={handleClearBoard}
        onExportTasksCsv={() =>
          exportCsv(
            `metrik-tarefas-${new Date().toISOString().slice(0, 10)}.csv`,
            buildTasksCsv(board),
          )
        }
        onExportSprintsCsv={() =>
          exportCsv(
            `metrik-sprints-${new Date().toISOString().slice(0, 10)}.csv`,
            buildSprintsCsv(board.sprints, allBoardTasks),
          )
        }
        isCloudAutoSyncing={isCloudAutoSyncing}
        cloudLastSyncAt={cloudLastSyncAt}
        onShowToast={modals.setToastMessage}
        boardViewProps={{
          board,
          allBoardTasks,
          flowMetrics,
          filterData,
          columnWidths,
          setColumnWidth,
          resetColumnWidth,
          resetAllColumnWidths,
          onFitColumns: handleFitColumnsToWindow,
          isGuest,
          isAdmin,
          currentUser,
          settings,
          onOpenSprintManager: modals.openSprintManager,
          onOpenNewColumnModal: modals.openNewColumnModal,
          taskOps,
          onDropTask: handleGuardedDropTask,
          onMoveTask: handleGuardedMoveTask,
          onSelectTask: modals.setSelectedTaskId,
        }}
      />

      <AppDialogsContainer
        selectedTaskId={modals.selectedTaskId}
        onCloseTaskModal={modals.closeTaskModal}
        allBoardTasks={allBoardTasks}
        board={board}
        activeBoardId={activeBoardId}
        effectiveTeamId={effectiveTeamId}
        boards={boards}
        teams={teamAccess.teams}
        users={teamAccess.users}
        isGuest={isGuest}
        currentUser={currentUser}
        settings={settings}
        taskOps={taskOps}
        onAddLink={handleAddLink}
        onRemoveLink={handleRemoveLink}
        onNavigateToBoard={(bId) => {
          switchBoard(bId);
          modals.closeTaskModal();
        }}
        softBlockState={softBlockState}
        onCancelSoftBlock={cancelSoftBlock}
        isBoardModalOpen={modals.isBoardModalOpen}
        onCloseBoardModal={modals.closeBoardModal}
        onCreateBoard={handleCreateBoard}
        onRenameBoard={renameBoard}
        onDeleteBoard={deleteBoard}
        onSwitchBoard={switchBoard}
        activeUserId={teamAccess.activeUserId}
        isTeamModalOpen={modals.isTeamModalOpen}
        onCloseTeamModal={modals.closeTeamModal}
        invitations={teamAccess.invitations}
        onCreateTeam={teamAccess.createTeam}
        onUpdateMemberRole={teamAccess.updateMemberRole}
        onRemoveMember={teamAccess.removeMember}
        onCreateInvitation={teamAccess.createInvitation}
        onAcceptInvitation={teamAccess.acceptInvitation}
        teamMembers={teamAccess.teamMembers}
        isNewColumnModalOpen={modals.isNewColumnModalOpen}
        onCloseNewColumnModal={modals.closeNewColumnModal}
        isSprintManagerOpen={modals.isSprintManagerOpen}
        onCloseSprintManager={modals.closeSprintManager}
        isCreateWorkspaceModalOpen={modals.isCreateWorkspaceModalOpen}
        onCloseCreateWorkspaceModal={modals.closeCreateWorkspaceModal}
        onCreateWorkspace={(name, color, description) =>
          workspacesData.createWorkspace(name, color || '#38bdf8', description)
        }
        mika={mika}
        toastMessage={modals.toastMessage}
        onCloseToast={modals.closeToast}
      />
    </div>
  );
};

export default App;
