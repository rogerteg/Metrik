/**
 * Metrik — Selo Visual de Probabilidade e Risco de Cumprimento de Data Meta
 * Feature: 056-monte-carlo-backlog-forecast
 */

import React from 'react';
import { TargetDateProbabilityResult } from '../../../specs/056-monte-carlo-backlog-forecast/contracts/backlog-forecast-contracts';

interface TargetDateRiskBadgeProps {
  result?: TargetDateProbabilityResult;
}

export const TargetDateRiskBadge: React.FC<TargetDateRiskBadgeProps> = ({ result }) => {
  if (!result) return null;

  const { riskLevel, probability, statusMessage } = result;

  const riskLabels: Record<string, { label: string; icon: string }> = {
    low: { label: 'Baixo Risco', icon: '🟢' },
    moderate: { label: 'Risco Moderado', icon: '🟡' },
    high: { label: 'Alto Risco', icon: '🔴' },
    critical: { label: 'Risco Crítico', icon: '⚠️' },
  };

  const currentRisk = riskLabels[riskLevel] || { label: 'Desconhecido', icon: '⚪' };

  return (
    <div
      className={`target-risk-badge risk-${riskLevel}`}
      title={statusMessage}
      data-testid="target-date-risk-badge"
    >
      <span>{currentRisk.icon}</span>
      <span>
        {probability}% — {currentRisk.label}
      </span>
    </div>
  );
};

