export type TaskActivityEventType =
  | 'created'
  | 'moved'
  | 'blocked'
  | 'unblocked'
  | 'priority_changed'
  | 'dates_changed'
  | 'tags_changed'
  | 'comment_added'
  | 'comment_deleted'
  | 'assignment'
  | 'unassignment'
  | 'edited';

export interface TaskComment {
  /** Unique UUID v4 identifier for the comment */
  id: string;

  /** ID of the parent task */
  taskId: string;

  /** User ID of the comment author */
  userId: string;

  /** Display name of the comment author */
  userName: string;

  /** Plain text content of the comment with line breaks preserved */
  text: string;

  /** Flag indicating if the comment represents a Project Decision */
  isDecision?: boolean;

  /** Flag indicating if the decision comment is pinned to top */
  pinned?: boolean;

  /** Creation timestamp in ISO 8601 format */
  createdAt: string;
}

export interface TaskActivityLog {
  /** Unique UUID v4 identifier for the activity log entry */
  id: string;

  /** ID of the target task */
  taskId: string;

  /** User ID of the actor performing the action */
  userId: string;

  /** Display name of the actor */
  userName: string;

  /** Canonical event classification type */
  eventType: TaskActivityEventType;

  /** Human-readable Portuguese description of the event */
  description: string;

  /** Optional previous value before mutation */
  fromValue?: string;

  /** Optional new value after mutation */
  toValue?: string;

  /** ISO 8601 timestamp when the event occurred */
  timestamp: string;
}

export type TimelineItem =
  | ({ type: 'comment' } & TaskComment & { timestamp: string })
  | ({ type: 'activity' } & TaskActivityLog);

export type GroupKey = 'today' | 'yesterday' | 'this_week' | 'older';

export interface TimelineGroup {
  groupKey: GroupKey;
  label: string;
  items: TimelineItem[];
}

export type TimelineFilter = 'all' | 'decisions' | 'comments' | 'activity';
export type DensityMode = 'detailed' | 'compact';

export interface UserTimelinePreferences {
  version: number;
  densityMode: DensityMode;
  activeFilter: TimelineFilter;
  searchQuery: string;
}

export interface TaskDetailsModalState {
  taskId: string | null;
  draftCommentText: string;
  draftIsDecision: boolean;
  isDraftDirty: boolean;
  showDirtyConfirmDialog: boolean;
  isSidebarCollapsedMobile: boolean;
}

export type ActivityCategoryFilter = 'all' | 'comments' | 'mutations' | 'assignments' | 'creations';

export interface ActivityFilterOptions {
  searchQuery: string;
  category: ActivityCategoryFilter;
  unreadOnly: boolean;
}

export interface ActivityLogEntry {
  id: string;
  taskId: string;
  actorName: string;
  actorAvatar?: string;
  type: TaskActivityEventType | 'creation' | 'assignment' | 'unassignment' | 'status_change' | 'priority_change' | 'due_date_change' | 'tag_change' | 'subtask_change' | 'comment';
  actionText: string;
  fieldName?: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  isUnread?: boolean;
}

export interface TaskActivityViewState {
  entries: ActivityLogEntry[];
  isExpanded: boolean;
  filter: ActivityFilterOptions;
  isSearchOpen: boolean;
  unreadCount: number;
}



