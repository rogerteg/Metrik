/**
 * Feature 054 — Previsibilidade Dinâmica & Alertas de SLE
 * Badge visual com popover analítico integrado ao passar o mouse ou focar.
 */

import React, { useState, useRef, useEffect } from 'react';
import { CardSlePrediction } from '../../types/sle';
import { TaskSlePopover } from './TaskSlePopover';

export interface TaskSleBadgeProps {
  prediction?: CardSlePrediction;
  showInsufficientNotice?: boolean;
  className?: string;
}

export const TaskSleBadge: React.FC<TaskSleBadgeProps> = ({
  prediction,
  showInsufficientNotice = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  if (!prediction || prediction.riskLevel === 'normal') {
    return null;
  }

  if (prediction.riskLevel === 'insufficient_data') {
    if (!showInsufficientNotice) return null;
    return (
      <span
        className={`task-indicator-badge sle-insufficient-data ${className}`}
        title="Histórico insuficiente para cálculo estatístico de SLE (< 5 itens concluídos)"
        style={{
          background: 'rgba(148, 163, 184, 0.15)',
          color: '#94a3b8',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '4px',
          fontSize: '0.6875rem',
          padding: '1px 5px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          fontWeight: 500,
        }}
      >
        <span>📊</span> Amostra insuficiente
      </span>
    );
  }

  const { riskLevel, label, agingDays } = prediction;

  const configByRisk = {
    warning_p50: {
      icon: '⏳',
      bg: 'rgba(234, 179, 8, 0.16)',
      border: 'rgba(234, 179, 8, 0.45)',
      color: '#eab308',
      cls: 'sle-warning-p50',
    },
    risk_p85: {
      icon: '⚠️',
      bg: 'rgba(249, 115, 22, 0.18)',
      border: 'rgba(249, 115, 22, 0.5)',
      color: '#f97316',
      cls: 'sle-risk-p85',
    },
    critical_p95: {
      icon: '🚨',
      bg: 'rgba(239, 68, 68, 0.2)',
      border: 'rgba(239, 68, 68, 0.6)',
      color: '#ef4444',
      cls: 'sle-critical-p95',
    },
  }[riskLevel];

  if (!configByRisk) return null;

  const handleMouseEnter = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Tolerância de 150ms para fechamento suave
    dismissTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        role="status"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Alerta de SLE: ${label} - Aging ${agingDays} dias`}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className={`task-indicator-badge task-sle-badge ${configByRisk.cls} ${className}`}
        style={{
          background: configByRisk.bg,
          color: configByRisk.color,
          border: `1px solid ${configByRisk.border}`,
          borderRadius: '4px',
          fontSize: '0.6875rem',
          padding: '1px 5px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          fontWeight: 600,
          letterSpacing: '0.01em',
          cursor: 'pointer',
        }}
      >
        <span aria-hidden="true">{configByRisk.icon}</span>
        <span>{label}</span>
      </span>

      {isOpen && <TaskSlePopover prediction={prediction} onClose={() => setIsOpen(false)} />}
    </div>
  );
};
