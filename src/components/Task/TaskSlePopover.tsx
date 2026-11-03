/**
 * Feature 054 — Previsibilidade Dinâmica & Alertas de SLE
 * Popover analítico flutuante com régua graduada de percentis e deltas de entrega.
 */

import React, { useEffect, useRef } from 'react';
import { CardSlePrediction } from '../../types/sle';

export interface TaskSlePopoverProps {
  prediction: CardSlePrediction;
  onClose: () => void;
  className?: string;
}

export const TaskSlePopover: React.FC<TaskSlePopoverProps> = ({
  prediction,
  onClose,
  className = '',
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { agingDays, thresholds, effectiveTargetDays, daysToBreach, percentageOfTarget, label } =
    prediction;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Formatação de decimais para pt-BR
  const formatDays = (days: number) =>
    days.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  // Máximo da escala visual da régua (pelo menos P95 * 1.25 ou aging * 1.1)
  const maxScale = Math.max(thresholds.p95Days * 1.2, agingDays * 1.1, 1);
  const agingPct = Math.min(100, Math.max(0, (agingDays / maxScale) * 100));
  const p50Pct = Math.min(100, (thresholds.p50Days / maxScale) * 100);
  const p85Pct = Math.min(100, (thresholds.p85Days / maxScale) * 100);
  const p95Pct = Math.min(100, (thresholds.p95Days / maxScale) * 100);

  const isBreached = daysToBreach < 0;

  return (
    <div
      ref={popoverRef}
      role="tooltip"
      id={`sle-popover-${prediction.taskId}`}
      className={`task-sle-popover ${className}`}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: '0',
        zIndex: 50,
        width: '270px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        fontSize: '0.75rem',
        lineHeight: 1.4,
        pointerEvents: 'auto',
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <strong style={{ fontSize: '0.8125rem', color: '#e2e8f0' }}>
          Diagnóstico de Previsibilidade (SLE)
        </strong>
      </div>

      {/* Indicador de Status Atual */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
          padding: '4px 8px',
          borderRadius: '4px',
          background: isBreached ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
          color: isBreached ? '#fca5a5' : '#93c5fd',
          fontWeight: 600,
        }}
      >
        <span>{isBreached ? '⚠️' : 'ℹ️'}</span>
        <span>{label}</span>
      </div>

      {/* Métricas Principais */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>Aging Atual:</span>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f1f5f9' }}>
            {formatDays(agingDays)}d
          </div>
        </div>
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>SLE Acordado:</span>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#38bdf8' }}>
            {formatDays(effectiveTargetDays)}d
          </div>
        </div>
      </div>

      {/* Delta de Estouro ou Margem */}
      <div
        style={{
          marginBottom: '12px',
          fontSize: '0.6875rem',
          color: isBreached ? '#f87171' : '#4ade80',
          fontWeight: 600,
        }}
      >
        {isBreached
          ? `+${formatDays(Math.abs(daysToBreach))} dias além do SLE`
          : `Faltam ${formatDays(daysToBreach)} dias para o SLE (${percentageOfTarget}% consumido)`}
      </div>

      {/* Régua Graduada de Percentis */}
      <div style={{ marginBottom: '6px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#94a3b8',
            fontSize: '0.625rem',
            marginBottom: '3px',
          }}
        >
          <span>Início (0d)</span>
          <span>Escala</span>
        </div>

        {/* Barra de Progresso */}
        <div
          style={{
            position: 'relative',
            height: '10px',
            backgroundColor: '#334155',
            borderRadius: '5px',
            overflow: 'visible',
            marginBottom: '16px',
          }}
        >
          {/* Marca P50 */}
          <div
            title={`P50: ${formatDays(thresholds.p50Days)}d`}
            style={{
              position: 'absolute',
              left: `${p50Pct}%`,
              top: '-3px',
              bottom: '-3px',
              width: '2px',
              backgroundColor: '#eab308',
              zIndex: 2,
            }}
          />

          {/* Marca P85 */}
          <div
            title={`P85: ${formatDays(thresholds.p85Days)}d`}
            style={{
              position: 'absolute',
              left: `${p85Pct}%`,
              top: '-3px',
              bottom: '-3px',
              width: '2px',
              backgroundColor: '#f97316',
              zIndex: 2,
            }}
          />

          {/* Marca P95 */}
          <div
            title={`P95: ${formatDays(thresholds.p95Days)}d`}
            style={{
              position: 'absolute',
              left: `${p95Pct}%`,
              top: '-3px',
              bottom: '-3px',
              width: '2px',
              backgroundColor: '#ef4444',
              zIndex: 2,
            }}
          />

          {/* Marcador do Aging do Cartão */}
          <div
            title={`Aging Atual: ${formatDays(agingDays)}d`}
            style={{
              position: 'absolute',
              left: `calc(${agingPct}% - 4px)`,
              top: '-2px',
              width: '8px',
              height: '14px',
              borderRadius: '2px',
              backgroundColor: '#ffffff',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
              zIndex: 3,
            }}
          />
        </div>

        {/* Legenda dos Percentis */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#cbd5e1',
            fontSize: '0.625rem',
          }}
        >
          <span style={{ color: '#eab308' }}>P50: {formatDays(thresholds.p50Days)}d</span>
          <span style={{ color: '#f97316' }}>P85: {formatDays(thresholds.p85Days)}d</span>
          <span style={{ color: '#ef4444' }}>P95: {formatDays(thresholds.p95Days)}d</span>
        </div>
      </div>
    </div>
  );
};
