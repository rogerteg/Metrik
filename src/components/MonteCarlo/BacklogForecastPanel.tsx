/**
 * Metrik — Painel de Previsão de Backlog & Épicos com Monte Carlo
 * Feature: 056-monte-carlo-backlog-forecast
 *
 * Apresenta a seleção de escopo, métricas probabilísticas (P50/P85/P95),
 * análise de cumprimento de data meta com classificação de risco e
 * lista granular de cartões.
 */

import React from 'react';
import { TaskModel } from '../../types/kanban';
import { CardSlePrediction } from '../../types/sle';
import { BacklogScopeType } from '../../../specs/056-monte-carlo-backlog-forecast/contracts/backlog-forecast-contracts';
import { useBacklogForecast } from '../../hooks/useBacklogForecast';
import { TargetDateRiskBadge } from './TargetDateRiskBadge';
import { ForecastScopeCardList } from './ForecastScopeCardList';
import './BacklogForecast.css';

export interface BacklogForecastPanelProps {
  tasks: TaskModel[];
  initialScopeType?: BacklogScopeType;
  initialScopeId?: string;
  referenceDate?: Date;
  slePredictions?: Record<string, CardSlePrediction>;
}

export const BacklogForecastPanel: React.FC<BacklogForecastPanelProps> = ({
  tasks,
  initialScopeType = 'all',
  initialScopeId,
  referenceDate,
  slePredictions,
}) => {
  const {
    scopeType,
    setScopeType,
    scopeId,
    setScopeId,
    targetDate,
    setTargetDate,
    scope,
    toggleTaskSelection,
    selectAll,
    clearSelection,
    windowDays,
    setWindowDays,
    isSampleSufficient,
    warningReason,
    forecastResult,
    availableScopes,
  } = useBacklogForecast({
    tasks,
    initialScopeType,
    initialScopeId,
    referenceDate,
  });

  return (
    <div className="backlog-forecast-panel" data-testid="backlog-forecast-panel">
      {/* 1. Cabeçalho de Seleção de Escopo */}
      <div className="backlog-forecast-header">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div className="scope-type-selector" data-testid="scope-type-selector">
            <button
              type="button"
              className={`scope-type-btn ${scopeType === 'all' ? 'is-active' : ''}`}
              onClick={() => setScopeType('all')}
              data-testid="scope-btn-all"
            >
              Backlog Geral
            </button>
            <button
              type="button"
              className={`scope-type-btn ${scopeType === 'initiative' ? 'is-active' : ''}`}
              onClick={() => {
                setScopeType('initiative');
                if (availableScopes.initiatives.length > 0) {
                  setScopeId(availableScopes.initiatives[0].id);
                }
              }}
              data-testid="scope-btn-initiative"
            >
              Iniciativas ({availableScopes.initiatives.length})
            </button>
            <button
              type="button"
              className={`scope-type-btn ${scopeType === 'sprint' ? 'is-active' : ''}`}
              onClick={() => {
                setScopeType('sprint');
                if (availableScopes.sprints.length > 0) {
                  setScopeId(availableScopes.sprints[0].id);
                }
              }}
              data-testid="scope-btn-sprint"
            >
              Sprints ({availableScopes.sprints.length})
            </button>
            <button
              type="button"
              className={`scope-type-btn ${scopeType === 'tag' ? 'is-active' : ''}`}
              onClick={() => {
                setScopeType('tag');
                if (availableScopes.tags.length > 0) {
                  setScopeId(availableScopes.tags[0].id);
                }
              }}
              data-testid="scope-btn-tag"
            >
              Tags ({availableScopes.tags.length})
            </button>
          </div>

          {/* Seletor dinâmico de item específico do agrupador */}
          {scopeType === 'initiative' && (
            <select
              className="scope-item-dropdown"
              value={scopeId || ''}
              onChange={(e) => setScopeId(e.target.value)}
              data-testid="dropdown-initiatives"
            >
              {availableScopes.initiatives.length === 0 ? (
                <option value="">Nenhuma iniciativa encontrada</option>
              ) : (
                availableScopes.initiatives.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.count} pendentes)
                  </option>
                ))
              )}
            </select>
          )}

          {scopeType === 'sprint' && (
            <select
              className="scope-item-dropdown"
              value={scopeId || ''}
              onChange={(e) => setScopeId(e.target.value)}
              data-testid="dropdown-sprints"
            >
              {availableScopes.sprints.length === 0 ? (
                <option value="">Nenhuma sprint encontrada</option>
              ) : (
                availableScopes.sprints.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.count} pendentes)
                  </option>
                ))
              )}
            </select>
          )}

          {scopeType === 'tag' && (
            <select
              className="scope-item-dropdown"
              value={scopeId || ''}
              onChange={(e) => setScopeId(e.target.value)}
              data-testid="dropdown-tags"
            >
              {availableScopes.tags.length === 0 ? (
                <option value="">Nenhuma tag encontrada</option>
              ) : (
                availableScopes.tags.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.count} pendentes)
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        {/* Janela Histórica de Vazão */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label
            htmlFor="forecast-window-select"
            style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}
          >
            Janela de Vazão:
          </label>
          <select
            id="forecast-window-select"
            className="scope-item-dropdown"
            style={{ minWidth: '130px' }}
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
            data-testid="select-window-days"
          >
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* 2. Banner de Amostra Insuficiente ou Alerta */}
      {!isSampleSufficient && (
        <div className="forecast-insufficient-banner" data-testid="insufficient-sample-banner">
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <strong>Amostra Estatística Insuficiente</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem' }}>
              {warningReason ||
                'São necessários no mínimo 10 dias com entregas registradas para simulações estocásticas seguras.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Grid de Percentis e Data Meta */}
      <div className="forecast-metrics-grid">
        <div className="forecast-metric-card p50-card" data-testid="metric-card-p50">
          <span className="metric-card-label">P50 — Otimista (Mediana)</span>
          <span className="metric-card-days">
            {isSampleSufficient && forecastResult ? `${forecastResult.p50.days} dias` : '—'}
          </span>
          <span className="metric-card-date">
            {isSampleSufficient && forecastResult
              ? forecastResult.p50.projectedDate
              : 'Aguardando dados'}
          </span>
        </div>

        <div className="forecast-metric-card p85-card" data-testid="metric-card-p85">
          <span className="metric-card-label">P85 — Recomendado (SLE)</span>
          <span className="metric-card-days">
            {isSampleSufficient && forecastResult ? `${forecastResult.p85.days} dias` : '—'}
          </span>
          <span className="metric-card-date">
            {isSampleSufficient && forecastResult
              ? forecastResult.p85.projectedDate
              : 'Aguardando dados'}
          </span>
        </div>

        <div className="forecast-metric-card p95-card" data-testid="metric-card-p95">
          <span className="metric-card-label">P95 — Conservador (Cauda)</span>
          <span className="metric-card-days">
            {isSampleSufficient && forecastResult ? `${forecastResult.p95.days} dias` : '—'}
          </span>
          <span className="metric-card-date">
            {isSampleSufficient && forecastResult
              ? forecastResult.p95.projectedDate
              : 'Aguardando dados'}
          </span>
        </div>

        <div
          className="forecast-metric-card target-date-card"
          data-testid="metric-card-target-date"
        >
          <span className="metric-card-label">Data Meta & Confiança</span>
          <div className="target-date-input-group">
            <input
              type="date"
              className="target-date-input"
              value={targetDate || ''}
              onChange={(e) => setTargetDate(e.target.value)}
              placeholder="Definir data meta"
              data-testid="input-target-date"
            />
            {isSampleSufficient && forecastResult?.targetDateAnalysis ? (
              <TargetDateRiskBadge result={forecastResult.targetDateAnalysis} />
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                {targetDate
                  ? 'Calculando probabilidade...'
                  : 'Defina uma data para avaliar o risco'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Lista Granular de Tarefas do Escopo */}
      <ForecastScopeCardList
        tasks={scope.allTasks}
        selectedTaskIds={scope.selectedTaskIds}
        onToggleTask={toggleTaskSelection}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        slePredictions={slePredictions}
      />
    </div>
  );
};
