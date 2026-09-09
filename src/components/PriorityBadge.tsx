import React, { useState, useRef, useEffect } from 'react';
import { PriorityLevel } from '../types/kanban';
import { PRIORITY_CONFIG, getPriorityConfig } from '../utils/priorityConfig';

export interface PriorityBadgeProps {
  priority?: PriorityLevel;
  onChange: (priority?: PriorityLevel) => void;
  readOnly?: boolean;
}

const PRIORITY_LEVELS: PriorityLevel[] = ['urgent', 'high', 'medium', 'low'];

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  onChange,
  readOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentConfig = getPriorityConfig(priority);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readOnly) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (level?: PriorityLevel) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(level);
    setIsOpen(false);
  };

  return (
    <div className="priority-badge-container" ref={containerRef}>
      {currentConfig ? (
        <button
          type="button"
          className={`priority-badge priority-badge--${priority}`}
          onClick={handleToggle}
          disabled={readOnly}
          aria-label={`Prioridade: ${currentConfig.label}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          style={{
            color: currentConfig.color,
            backgroundColor: currentConfig.bg,
            borderColor: currentConfig.border,
          }}
        >
          <span
            className="priority-badge__dot"
            style={{ backgroundColor: currentConfig.color }}
          />
          <span className="priority-badge__label">{currentConfig.label}</span>
        </button>
      ) : (
        <button
          type="button"
          className="priority-badge priority-badge--empty"
          onClick={handleToggle}
          disabled={readOnly}
          aria-label="Definir prioridade"
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <span className="priority-badge__icon">🚩</span>
          <span className="priority-badge__label">+ Prioridade</span>
        </button>
      )}

      {isOpen && !readOnly && (
        <div className="priority-menu" role="menu" aria-label="Selecionar prioridade">
          {PRIORITY_LEVELS.map((lvl) => {
            const config = PRIORITY_CONFIG[lvl];
            const isSelected = lvl === priority;
            return (
              <button
                key={lvl}
                type="button"
                role="menuitem"
                className={`priority-menu__item ${isSelected ? 'is-selected' : ''}`}
                onClick={handleSelect(lvl)}
              >
                <span
                  className="priority-badge__dot"
                  style={{ backgroundColor: config.color }}
                />
                <span className="priority-menu__item-label">{config.label}</span>
                {isSelected && <span className="priority-menu__checkmark">✓</span>}
              </button>
            );
          })}
          <div className="priority-menu__divider" />
          <button
            type="button"
            role="menuitem"
            className="priority-menu__item priority-menu__item--clear"
            onClick={handleSelect(undefined)}
          >
            <span className="priority-menu__item-label">Sem prioridade</span>
          </button>
        </div>
      )}
    </div>
  );
};
