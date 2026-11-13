import React, { lazy, Suspense } from 'react';
import { BoardModel } from '../../types/kanban';
import { Team, User, TeamMember } from '../../types/team';
import { Workspace, AppSettings } from '../../types/workspace';
import { WorkspaceHub } from '../WorkspaceHub/WorkspaceHub';
import { SettingsView } from '../Settings/SettingsView';
import { ManageBoardsView } from '../ManageBoards/ManageBoardsView';
import { RestrictedBoardFallback } from '../RestrictedBoardFallback';
import { AppBoardView, AppBoardViewProps } from './AppBoardView';
import { SleConfig } from '../../types/sle';
import { AnalyticsCategory } from '../../types/analytics';

const AnalyticsDashboard = lazy(() =>
  import('../AnalyticsDashboard').then((module) => ({
    default: module.AnalyticsDashboard,
  })),
);

export interface AppMainContentProps {
  view: 'workspaces' | 'board' | 'analytics' | 'manage' | 'settings';
  isAuthorized: boolean;
  activeBoardTeam?: Team;
  boards: BoardModel[];
  activeBoardId: string | null;
  onSwitchBoard: (boardId: string) => void;
  onSelectView: (view: 'workspaces' | 'board' | 'analytics' | 'manage' | 'settings') => void;
  onOpenJoinCode: () => void;
  onRedirectFirstAllowed: () => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  favoriteBoardIds: string[];
  onToggleFavorite: (id: string) => void;
  onNewPanel: () => void;
  onNewBoard: () => void;
  onMoveBoardToWorkspace: (boardId: string, targetWorkspaceId: string | null) => void;
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onUpdateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  onCreateWorkspace: () => void;
  onAddBoardToWorkspace: (workspaceId: string, boardId: string) => void;
  onRemoveBoardFromWorkspace: (workspaceId: string, boardId: string) => void;
  onDeleteWorkspace: (id: string) => void;
  teams: Team[];
  teamMembers: TeamMember[];
  users: User[];
  activeUserId: string;
  onCreateBoard: (name: string, teamId?: string) => BoardModel;
  onRenameBoard: (boardId: string, newName: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onExportData: () => void;
  initialAnalyticsCategory?: AnalyticsCategory;
  initialForecastMode?: 'how-many' | 'when' | 'backlog' | 'leverage';
  initialScopeType?: 'initiative' | 'sprint' | 'all' | 'tag';
  initialScopeId?: string;
  onImportData: () => void;
  onClearTasks: () => void;
  onExportTasksCsv: () => void;
  onExportSprintsCsv: () => void;
  isCloudAutoSyncing: boolean;
  cloudLastSyncAt: string | null;
  onShowToast: (msg: string) => void;
  boardViewProps: AppBoardViewProps;
  sleConfig?: SleConfig;
  onUpdateSleConfig?: (updates: Partial<Omit<SleConfig, 'boardId'>>) => void;
  onResetSleConfig?: () => void;
}

export const AppMainContent: React.FC<AppMainContentProps> = ({
  view,
  isAuthorized,
  activeBoardTeam,
  boards,
  activeBoardId,
  onSwitchBoard,
  onSelectView,
  onOpenJoinCode,
  onRedirectFirstAllowed,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  favoriteBoardIds,
  onToggleFavorite,
  onNewPanel,
  onNewBoard,
  onMoveBoardToWorkspace,
  settings,
  onUpdateSettings,
  onUpdateWorkspace,
  onCreateWorkspace,
  onAddBoardToWorkspace,
  onRemoveBoardFromWorkspace,
  onDeleteWorkspace,
  teams,
  teamMembers,
  users,
  activeUserId,
  onCreateBoard,
  onRenameBoard,
  onDeleteBoard,
  onExportData,
  initialAnalyticsCategory,
  initialForecastMode,
  initialScopeType,
  initialScopeId,
  onImportData,
  onClearTasks,
  onExportTasksCsv,
  onExportSprintsCsv,
  isCloudAutoSyncing,
  cloudLastSyncAt,
  onShowToast,
  boardViewProps,
  sleConfig,
  onUpdateSleConfig,
  onResetSleConfig,
}) => {
  if (view === 'workspaces') {
    return (
      <WorkspaceHub
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={onSelectWorkspace}
        boards={boards}
        favoriteBoardIds={favoriteBoardIds}
        onToggleFavorite={onToggleFavorite}
        onSelectBoard={(boardId) => {
          onSwitchBoard(boardId);
          onSelectView('board');
        }}
        onNewPanel={onNewPanel}
        onNewBoard={onNewBoard}
        onMoveBoardToWorkspace={onMoveBoardToWorkspace}
      />
    );
  }

  if (view === 'settings') {
    return (
      <SettingsView
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        workspaces={workspaces}
        onUpdateWorkspace={onUpdateWorkspace}
        onCreateWorkspace={onCreateWorkspace}
        onAddBoardToWorkspace={onAddBoardToWorkspace}
        onRemoveBoardFromWorkspace={onRemoveBoardFromWorkspace}
        onDeleteWorkspace={onDeleteWorkspace}
        boards={boards}
        teams={teams}
        teamMembers={teamMembers}
        users={users}
        onBackToBoard={() => onSelectView('board')}
        onExportData={onExportData}
        onImportData={onImportData}
        onClearTasks={onClearTasks}
        onExportTasksCsv={onExportTasksCsv}
        onExportSprintsCsv={onExportSprintsCsv}
        onApplyRemoteData={() => window.setTimeout(() => window.location.reload(), 600)}
        autoSyncEnabled={settings.cloudAutoSync ?? false}
        onToggleAutoSync={(enabled) => onUpdateSettings({ cloudAutoSync: enabled })}
        isAutoSyncing={isCloudAutoSyncing}
        autoSyncLastAt={cloudLastSyncAt}
        onShowToast={onShowToast}
        sleConfig={sleConfig}
        onUpdateSleConfig={onUpdateSleConfig}
        onResetSleConfig={onResetSleConfig}
      />
    );
  }

  if (view === 'manage') {
    return (
      <ManageBoardsView
        boards={boards}
        activeBoardId={activeBoardId}
        teams={teams}
        activeUser={users.find((u) => u.id === activeUserId)}
        onSelectBoard={(boardId) => {
          onSwitchBoard(boardId);
          onSelectView('board');
        }}
        onCreateBoard={onCreateBoard}
        onRenameBoard={onRenameBoard}
        onDeleteBoard={onDeleteBoard}
        onOpenAnalytics={(boardId) => {
          onSwitchBoard(boardId);
          onSelectView('analytics');
        }}
      />
    );
  }

  if (!isAuthorized) {
    return (
      <RestrictedBoardFallback
        teamName={activeBoardTeam?.name}
        onRedirectDefault={onRedirectFirstAllowed}
        onOpenJoinCode={onOpenJoinCode}
      />
    );
  }

  if (view === 'board') {
    return <AppBoardView {...boardViewProps} />;
  }

  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Carregando análises…
        </div>
      }
    >
      <AnalyticsDashboard
        board={boardViewProps.board}
        tasks={boardViewProps.allBoardTasks}
        initialCategory={initialAnalyticsCategory}
        initialForecastMode={initialForecastMode}
        initialScopeType={initialScopeType}
        initialScopeId={initialScopeId}
      />
    </Suspense>
  );
};
