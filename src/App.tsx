import React, { useState, useMemo, useEffect } from 'react';
import { useTaskCollection } from './hooks/useTaskCollection';
import { useFlowMetrics } from './hooks/useFlowMetrics';
import { useBoardFilters } from './hooks/useBoardFilters';
import { useBoardExportImport } from './hooks/useBoardExportImport';
import { useBoards } from './hooks/useBoards';
import { AppHeaderBar } from './components/App/AppHeaderBar';
import { AppMainContent } from './components/App/AppMainContent';
import { AppDialogsContainer } from './components/App/AppDialogsContainer';
import { useColumnWidths } from './hooks/useColumnWidths';
import { useTheme } from './hooks/useTheme';
import { useTeamAccess } from './hooks/useTeamAccess';
import { useWorkspaces } from './hooks/useWorkspaces';
import { useAppSettings } from './hooks/useAppSettings';
import { useCloudAutoSync } from './hooks/useCloudAutoSync';
import { useMika } from './hooks/useMika';
import { useCrossSquadLinking } from './hooks/useCrossSquadLinking';
import { useGuardedTaskMove } from './hooks/useGuardedTaskMove';
import { useAppModals } from './hooks/useAppModals';
import { useBoardWorkspaceActions } from './hooks/useBoardWorkspaceActions';
import { AppAutomationReportDialogs } from './components/App/AppAutomationReportDialogs';
import { useFlowRules } from './hooks/useFlowRules';
import { useFlowRulesTimer } from './hooks/useFlowRulesTimer';
import { useColumnPolicies } from './hooks/useColumnPolicies';
import { useDynamicSle } from './hooks/useDynamicSle';
import { AnalyticsCategory } from './types/analytics';
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
  const [analyticsCategory, setAnalyticsCategory] = useState<AnalyticsCategory | undefined>();
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

  const [forecastScope, setForecastScope] = useState<{
    scopeType?: 'initiative' | 'sprint' | 'all' | 'tag';
    scopeId?: string;
    mode?: 'how-many' | 'when' | 'backlog' | 'leverage';
  }>({});

  const handleNavigateToForecast = (
    scopeType?: 'initiative' | 'sprint' | 'all' | 'tag',
    scopeId?: string,
    mode?: 'date' | 'capacity' | 'leverage',
  ) => {
    mika.closeDrawer();
    setAnalyticsCategory('forecasting');
    const fMode = mode === 'leverage' ? 'leverage' : mode === 'capacity' ? 'how-many' : 'backlog';
    setForecastScope({ scopeType, scopeId, mode: fMode });
    setView('analytics');
  };

  const exportImport = useBoardExportImport({
    board,
    activeBoardId,
    allBoardTasks,
    overwriteBoard: taskOps.overwriteBoard,
  });

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

  const sle = useDynamicSle(activeBoardId || 'default-board', allBoardTasks, board.columns);
  const filterData = useBoardFilters(board, sle.predictions);

  const completedTasks = useMemo(() => {
    return board.columns
      .filter((col) => col.category === 'done')
      .flatMap((col) => board.tasks[col.id] || []);
  }, [board.columns, board.tasks]);

  const flowMetrics = useFlowMetrics(completedTasks, allBoardTasks);

  const {
    handleClearBoard,
    handleFitColumnsToWindow,
    handleMoveBoardToWorkspace,
    handleCreateBoard,
  } = useBoardWorkspaceActions({
    workspaces: workspacesData.workspaces,
    activeWorkspaceId: workspacesData.activeWorkspaceId,
    addBoardToWorkspace: workspacesData.addBoardToWorkspace,
    removeBoardFromWorkspace: workspacesData.removeBoardFromWorkspace,
    createBoard,
    columns: board.columns,
    setColumnWidth,
    clearTasks: taskOps.clearTasks,
  });

  const { handleAddLink, handleRemoveLink } = useCrossSquadLinking({
    selectedTaskId: modals.selectedTaskId,
    activeBoardId,
    allBoardTasks,
    effectiveTeamId,
    updateTask: taskOps.updateTask,
  });

  const flowRulesData = useFlowRules(activeBoardId || '');
  const columnPolicies = useColumnPolicies(activeBoardId || '');

  const { softBlockState, cancelSoftBlock, handleGuardedMoveTask, handleGuardedDropTask } =
    useGuardedTaskMove({
      allBoardTasks,
      columns: board.columns,
      moveTask: taskOps.moveTask,
      reorderOrMoveTask: taskOps.reorderOrMoveTask,
      onToast: modals.setToastMessage,
      flowRules: flowRulesData.rules,
      boardId: activeBoardId || '',
      updateTask: taskOps.updateTask,
      recordRuleExecution: flowRulesData.recordExecution,
    });

  useFlowRulesTimer({
    enabled: !isGuest && Boolean(activeBoardId),
    boardId: activeBoardId || '',
    rules: flowRulesData.rules,
    tasks: allBoardTasks,
    columns: board.columns,
    onApplyUpdates: taskOps.updateTask,
    onRecordExecution: flowRulesData.recordExecution,
    onToast: modals.setToastMessage,
  });

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
        fileInputRef={exportImport.fileInputRef}
        onFileChange={exportImport.handleFileChange}
        onImportClick={() => exportImport.fileInputRef.current?.click()}
        onExport={exportImport.handleExportData}
        onResetDemo={taskOps.resetToSeed}
        onClearBoard={handleClearBoard}
        isGuest={isGuest}
        onOpenMika={mika.toggleDrawer}
        isMikaOpen={mika.isDrawerOpen}
        hasMikaAlerts={mika.insights.some(
          (i) => i.severity === 'warning' || i.severity === 'critical',
        )}
        onOpenExportModal={modals.openExportModal}
        onOpenFlowRules={modals.openFlowRulesModal}
        activeFlowRulesCount={flowRulesData.activeRulesCount}
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
          if (firstAllowed) switchBoard(firstAllowed.id);
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
        onExportData={exportImport.handleExportData}
        onImportData={() => exportImport.fileInputRef.current?.click()}
        onClearTasks={handleClearBoard}
        onExportTasksCsv={exportImport.handleExportTasks}
        onExportSprintsCsv={exportImport.handleExportSprints}
        isCloudAutoSyncing={isCloudAutoSyncing}
        cloudLastSyncAt={cloudLastSyncAt}
        initialAnalyticsCategory={analyticsCategory}
        initialForecastMode={forecastScope.mode}
        initialScopeType={forecastScope.scopeType}
        initialScopeId={forecastScope.scopeId}
        onShowToast={modals.setToastMessage}
        sleConfig={sle.config}
        onUpdateSleConfig={sle.updateConfig}
        onResetSleConfig={sle.resetConfig}
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
          policies: columnPolicies.policies,
          onSavePolicy: columnPolicies.setPolicy,
          slePredictions: sle.predictions,
        }}
      />

      <AppDialogsContainer
        selectedTaskId={modals.selectedTaskId}
        onCloseTaskModal={modals.closeTaskModal}
        onOpenTaskDetails={modals.setSelectedTaskId}
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
        onCreateWorkspace={(name, color, desc) =>
          workspacesData.createWorkspace(name, color || '#38bdf8', desc)
        }
        mika={mika}
        onNavigateToForecast={handleNavigateToForecast}
        toastMessage={modals.toastMessage}
        onCloseToast={modals.closeToast}
      />

      <AppAutomationReportDialogs
        board={board}
        allBoardTasks={allBoardTasks}
        filteredTasks={Object.values(filterData.filteredBoard.tasks).flat()}
        mikaInsights={mika.insights}
        hasActiveFilters={filterData.hasActiveFilters}
        isExportModalOpen={modals.isExportModalOpen}
        onCloseExportModal={modals.closeExportModal}
        headerPrintSnapshot={modals.headerPrintSnapshot}
        onCloseHeaderPrint={() => modals.setHeaderPrintSnapshot(null)}
        onGeneratePdf={(snapshot) => modals.setHeaderPrintSnapshot(snapshot)}
        isFlowRulesModalOpen={modals.isFlowRulesModalOpen}
        onCloseFlowRulesModal={modals.closeFlowRulesModal}
        activeBoardId={activeBoardId || ''}
        flowRules={flowRulesData.rules}
        onAddFlowRule={flowRulesData.addRule}
        onUpdateFlowRule={flowRulesData.updateRule}
        onToggleFlowRule={flowRulesData.toggleRule}
        onDeleteFlowRule={flowRulesData.deleteRule}
        onDuplicateFlowRule={flowRulesData.duplicateRule}
        onSetFlowRules={flowRulesData.setRules}
        onToast={modals.setToastMessage}
      />
    </div>
  );
};

export default App;
