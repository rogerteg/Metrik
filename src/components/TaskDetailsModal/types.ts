import { TaskModel, BoardModel, ColumnModel } from '../../types/kanban';
import { TaskRelationType } from '../../types/taskTypes';
import { Team } from '../../types/team';
import { UseFieldEditReturn } from '../../types/taskEdit';

export type TaskDetailTab = 'overview' | 'activity' | 'metrics';

export interface TaskModalHeaderProps {
  task: TaskModel;
  currentBoard?: BoardModel;
  currentColumn?: ColumnModel;
  dueDateStatus: string | null;
  pendingBlockersCount: number;
  titleEdit: UseFieldEditReturn<string>;
  isReadOnly: boolean;
}

export interface TaskModalDescriptionProps {
  task: TaskModel;
  descEdit: UseFieldEditReturn<string>;
  acEdit: UseFieldEditReturn<string>;
  tsEdit: UseFieldEditReturn<string>;
  isReadOnly: boolean;
}

export interface TaskModalPrimaryFieldsProps {
  task: TaskModel;
  columns: ColumnModel[];
  boardTasks: TaskModel[];
  allBoards: BoardModel[];
  teams: Team[];
  currentBoardId: string;
  currentTeamId: string;
  isReadOnly: boolean;
  initiativeProgress: { total: number; completed: number; percentage: number };
  onUpdateTask: (id: string, updates: Partial<TaskModel>) => void;
  acEdit: UseFieldEditReturn<string>;
  onAddLink?: (
    targetTaskId: string,
    relationType: TaskRelationType,
    targetBoardId: string,
    targetTeamId: string,
  ) => void;
  onRemoveLink?: (targetTaskId: string) => void;
  onNavigateToBoard?: (boardId: string) => void;
}

export interface TaskModalActivityTabProps {
  task: TaskModel;
  activeTab: TaskDetailTab;
  setActiveTab: (tab: TaskDetailTab) => void;
  activityCount: number;
  currentUserId?: string;
  isReadOnly: boolean;
  currentColumnTitle?: string;
  pendingBlockersCount: number;
  initiativeProgress: { total: number; completed: number; percentage: number };
  totalBlockedMs: number;
  onUpdateTask: (id: string, updates: Partial<TaskModel>) => void;
  onAddComment?: (taskId: string, text: string, isDecision?: boolean) => void;
  onDeleteComment?: (taskId: string, commentId: string) => void;
  onEditComment?: (taskId: string, commentId: string, text: string) => void;
}
