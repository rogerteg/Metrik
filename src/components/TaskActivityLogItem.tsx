import React from 'react';
import { ActivityLogEntry } from '../types/taskActivity';
import { formatActivityActionText, formatActivityTimestamp } from '../utils/activityFormatter';

export interface TaskActivityLogItemProps {
  entry: ActivityLogEntry;
}

export const TaskActivityLogItem: React.FC<TaskActivityLogItemProps> = ({ entry }) => {
  const formattedText = formatActivityActionText(entry);
  const formattedTime = formatActivityTimestamp(entry.timestamp);

  return (
    <li className="task-activity-item">
      {/* Bullet Marker + Action Text */}
      <span className="task-activity-item-text" title={formattedText}>
        • {formattedText}
      </span>

      {/* Right-aligned Timestamp */}
      <span className="task-activity-item-time">
        {formattedTime}
      </span>
    </li>
  );
};
