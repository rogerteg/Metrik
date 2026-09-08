import React, { useState, useEffect } from 'react';
import { ColumnType } from '../types/kanban';

export interface WipLimitBadgeProps {
  column: ColumnType;
  currentCount: number;
  limit: number | null;
  onUpdateLimit: (column: ColumnType, limit: number | null) => void;
}

export const WipLimitBadge: React.FC<WipLimitBadgeProps> = ({
  column,
  currentCount,
  limit,
  onUpdateLimit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>(
    limit !== null ? String(limit) : ''
  );

  useEffect(() => {
    setInputValue(limit !== null ? String(limit) : '');
  }, [limit]);

  const commitValue = () => {
    setIsEditing(false);
    const trimmed = inputValue.trim();
    if (!trimmed) {
      onUpdateLimit(column, null);
      return;
    }

    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      onUpdateLimit(column, parsed);
    } else {
      // Revert if invalid
      setInputValue(limit !== null ? String(limit) : '');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitValue();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(limit !== null ? String(limit) : '');
    }
  };

  if (isEditing) {
    return (
      <span className="wip-badge-container">
        <input
          type="number"
          min="1"
          autoFocus
          className="wip-limit-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitValue}
          aria-label={`Editar limite de WIP para ${column}`}
        />
      </span>
    );
  }

  const isOverloaded = limit !== null && currentCount > limit;
  const displayText =
    limit !== null
      ? `${currentCount}/${limit}${isOverloaded ? ' ⚠️' : ''}`
      : `${currentCount}`;

  return (
    <span
      className={`badge-wip ${isOverloaded ? 'badge-wip-overload' : ''}`}
      onClick={() => setIsEditing(true)}
      title="Clique para configurar o limite de WIP"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsEditing(true);
        }
      }}
    >
      {displayText}
    </span>
  );
};
