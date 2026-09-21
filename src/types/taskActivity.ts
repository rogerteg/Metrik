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
