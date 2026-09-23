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
    <li className="flex items-baseline justify-between py-1.5 px-2 rounded-lg hover:bg-slate-800/40 transition-colors group text-xs text-slate-300">
      {/* Bullet Marker + Action Text */}
      <div className="flex items-baseline gap-2 min-w-0 flex-1">
        <span className="text-slate-500 group-hover:text-slate-400 select-none flex-shrink-0">•</span>
        <span className="truncate text-slate-300 font-normal leading-relaxed" title={formattedText}>
          {formattedText}
        </span>
      </div>

      {/* Right-aligned Timestamp */}
      <span className="ml-4 flex-shrink-0 whitespace-nowrap text-[11px] text-slate-400 font-mono text-right">
        {formattedTime}
      </span>
    </li>
  );
};
