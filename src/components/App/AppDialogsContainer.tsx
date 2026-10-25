import React from 'react';
import { BoardState, BoardModel, TaskModel, ColumnCategory, SprintModel } from '../../types/kanban';
import { Team, User, TeamRole, TeamMember, TeamInvitation } from '../../types/team';
import { TaskRelationType, CrossSquadTaskSummary } from '../../types/taskTypes';
import { TaskDetailsModal } from '../TaskDetailsModal';
import { DependencySoftBlockModal } from '../DependencySoftBlockModal';
import { BoardManagementModal } from '../BoardManagementModal';
import { TeamManagementModal } from '../TeamManagementModal';
import { NewColumnModal } from '../NewColumnModal';
import { SprintManagerModal } from '../SprintManagerModal';
import { CreateWorkspaceModal } from '../WorkspaceHub/CreateWorkspaceModal';
import { MikaDrawer } from '../Mika/MikaDrawer';
import { ToastNotification } from '../ToastNotification';
import { UseTaskCollectionReturn } from '../../hooks/useTaskCollection';
import { MikaInsight } from '../../types/mika';

export interface AppDialogsContainerProps {
  selectedTaskId: string | null;
  onCloseTaskModal: () => void;
  allBoardTasks: TaskModel[];
  board: BoardState;
  activeBoardId: string | null;
  effectiveTeamId: string;
  boards: BoardModel[];
  teams: Team[];
  users: User[];
  isGuest: boolean;
  currentUser: { id: string; name: string };
  settings: { autoSaveComments?: boolean; autoSaveDebounceMs?: number };
  taskOps?: UseTaskCollectionReturn;
  onUpdateTask?: (id: string, updates: Partial<TaskModel>) => void;
  onToggleBlocked?: (id: string, reason?: string) => void;
  onAddComment?: (taskId: string, text: string) => void;
  onDeleteComment?: (taskId: string, commentId: string) => void;
  onEditComment?: (
    taskId: string,
    commentId: string,
    text: string,
    user: { id: string; name: string },
  ) => void;
  onSetTaskSprint?: (taskId: string, sprintId: string | null) => void;
  onAddLink: (
    targetTaskId: string,
    relationType: TaskRelationType,
    targetBoardId: string,
    targetTeamId: string,
  ) => void;
  onRemoveLink: (targetTaskId: string) => void;
  onNavigateToBoard: (boardId: string) => void;

  softBlockState: {
    task: TaskModel;
    blockingTasks: CrossSquadTaskSummary[];
    onConfirm: () => void;
  } | null;
  onCancelSoftBlock: () => void;

  isBoardModalOpen: boolean;
  onCloseBoardModal: () => void;
  onCreateBoard: (name: string, teamId?: string) => void;
  onRenameBoard: (boardId: string, newName: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onSwitchBoard: (boardId: string) => void;
  activeUserId: string;

  isTeamModalOpen: boolean;
  onCloseTeamModal: () => void;
  invitations: TeamInvitation[];
  onCreateTeam: (name: string, description?: string) => Team;
  onUpdateMemberRole: (teamId: string, userId: string, role: TeamRole) => void;
  onRemoveMember: (teamId: string, userId: string) => void;
  onCreateInvitation: (teamId: string, email: string, role: TeamRole) => TeamInvitation;
  onAcceptInvitation: (code: string) => void;
  teamMembers: TeamMember[];

  isNewColumnModalOpen: boolean;
  onCloseNewColumnModal: () => void;
  onAddColumn?: (title: string, category: ColumnCategory, wipLimit?: number | null) => void;

  isSprintManagerOpen: boolean;
  onCloseSprintManager: () => void;
  onAddSprint?: (input: {
    name: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  onUpdateSprint?: (id: string, updates: Partial<SprintModel>) => void;
  onDeleteSprint?: (id: string) => void;
  onStartSprint?: (id: string) => void;
  onCompleteSprint?: (id: string) => void;

  isCreateWorkspaceModalOpen: boolean;
  onCloseCreateWorkspaceModal: () => void;
  onCreateWorkspace: (name: string, color?: string, description?: string) => void;

  mika: {
    isDrawerOpen: boolean;
    closeDrawer: () => void;
    insights: MikaInsight[];
    refreshInsights: () => void;
    isLoading: boolean;
    preferences: { provider?: string };
  };

  toastMessage: string | null;
  onCloseToast: () => void;
}

export const AppDialogsContainer: React.FC<AppDialogsContainerProps> = ({
  selectedTaskId,
  onCloseTaskModal,
  allBoardTasks,
  board,
  activeBoardId,
  effectiveTeamId,
  boards,
  teams,
  users,
  isGuest,
  currentUser,
  settings,
  taskOps,
  onUpdateTask,
  onToggleBlocked,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onSetTaskSprint,
  onAddLink,
  onRemoveLink,
  onNavigateToBoard,
  softBlockState,
  onCancelSoftBlock,
  isBoardModalOpen,
  onCloseBoardModal,
  onCreateBoard,
  onRenameBoard,
  onDeleteBoard,
  onSwitchBoard,
  activeUserId,
  isTeamModalOpen,
  onCloseTeamModal,
  invitations,
  onCreateTeam,
  onUpdateMemberRole,
  onRemoveMember,
  onCreateInvitation,
  onAcceptInvitation,
  teamMembers,
  isNewColumnModalOpen,
  onCloseNewColumnModal,
  onAddColumn,
  isSprintManagerOpen,
  onCloseSprintManager,
  onAddSprint,
  onUpdateSprint,
  onDeleteSprint,
  onStartSprint,
  onCompleteSprint,
  isCreateWorkspaceModalOpen,
  onCloseCreateWorkspaceModal,
  onCreateWorkspace,
  mika,
  toastMessage,
  onCloseToast,
}) => {
  const selectedTask = selectedTaskId ? allBoardTasks.find((t) => t.id === selectedTaskId) : null;

  const handleUpdate = onUpdateTask || taskOps?.updateTask;
  const handleToggleBlocked = onToggleBlocked || taskOps?.toggleTaskBlocked;
  const handleAddComment = onAddComment || taskOps?.addTaskComment;
  const handleDeleteComment = onDeleteComment || taskOps?.deleteTaskComment;
  const handleSetSprint = onSetTaskSprint || taskOps?.setTaskSprint;
  const handleAddCol = onAddColumn || taskOps?.addColumn;
  const handleAddSp = onAddSprint || taskOps?.addSprint;
  const handleUpdateSp = onUpdateSprint || taskOps?.updateSprint;
  const handleDeleteSp = onDeleteSprint || taskOps?.deleteSprint;
  const handleStartSp = onStartSprint || taskOps?.startSprint;
  const handleCompleteSp = onCompleteSprint || taskOps?.completeSprint;

  const handleEditComment =
    onEditComment ||
    (taskOps ? (tId, cId, text, user) => taskOps.editTaskComment(tId, cId, text, user) : undefined);

  return (
    <>
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={!!selectedTaskId}
          onClose={onCloseTaskModal}
          onUpdateTask={handleUpdate!}
          onToggleBlocked={handleToggleBlocked!}
          onAddComment={handleAddComment!}
          onDeleteComment={handleDeleteComment!}
          onEditComment={
            isGuest
              ? undefined
              : (taskId, commentId, text) =>
                  handleEditComment?.(taskId, commentId, text, currentUser)
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
          onSetTaskSprint={isGuest ? undefined : handleSetSprint}
          isReadOnly={isGuest}
          autoSaveComments={settings.autoSaveComments ?? true}
          autoSaveDebounceMs={settings.autoSaveDebounceMs ?? 800}
          onAddLink={onAddLink}
          onRemoveLink={onRemoveLink}
          onNavigateToBoard={onNavigateToBoard}
        />
      )}

      {softBlockState && (
        <DependencySoftBlockModal
          isOpen={!!softBlockState}
          taskTitle={softBlockState.task.title}
          blockingTasks={softBlockState.blockingTasks}
          onConfirm={softBlockState.onConfirm}
          onCancel={onCancelSoftBlock}
        />
      )}

      <BoardManagementModal
        isOpen={isBoardModalOpen}
        onClose={onCloseBoardModal}
        boards={boards}
        activeBoardId={activeBoardId}
        onCreateBoard={onCreateBoard}
        onRenameBoard={onRenameBoard}
        onDeleteBoard={onDeleteBoard}
        onSwitchBoard={onSwitchBoard}
        teams={teams}
        activeUserId={activeUserId}
      />

      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={onCloseTeamModal}
        teams={teams}
        users={users}
        activeUserId={activeUserId}
        invitations={invitations}
        onCreateTeam={onCreateTeam}
        onUpdateMemberRole={onUpdateMemberRole}
        onRemoveMember={onRemoveMember}
        onCreateInvitation={onCreateInvitation}
        onAcceptInvitation={onAcceptInvitation}
        teamMembers={teamMembers}
      />

      <NewColumnModal
        isOpen={isNewColumnModalOpen}
        onClose={onCloseNewColumnModal}
        onAddColumn={handleAddCol!}
        currentColumnCount={board.columns.length}
      />

      <SprintManagerModal
        isOpen={isSprintManagerOpen}
        onClose={onCloseSprintManager}
        sprints={board.sprints}
        activeSprintId={board.activeSprintId}
        tasks={allBoardTasks}
        isReadOnly={isGuest}
        onAdd={handleAddSp!}
        onUpdate={handleUpdateSp!}
        onDelete={handleDeleteSp!}
        onStart={handleStartSp!}
        onComplete={handleCompleteSp!}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={onCloseCreateWorkspaceModal}
        onCreateWorkspace={onCreateWorkspace}
      />

      <MikaDrawer
        isOpen={mika.isDrawerOpen}
        onClose={mika.closeDrawer}
        insights={mika.insights}
        onRefresh={mika.refreshInsights}
        isLoading={mika.isLoading}
        providerName={
          mika.preferences.provider === 'gemini' ? 'Google Gemini' : 'Local-First (Offline)'
        }
      />

      <ToastNotification message={toastMessage} onClose={onCloseToast} />
    </>
  );
};
