/**
 * FlowLeverageSimulatorPanel.tsx - Simulador What-If de Políticas de Fluxo (WIP & Swarming)
 * Feature: 058-flow-leverage-simulator (User Story 2)
 * Governança: Constituição Artigo II (<= 400 linhas), Local-First, Sandbox Seguro (Const. X).
 */

import React, { useMemo, useState } from 'react';
import { ColumnModel, TaskModel } from '../../types/kanban';
import { CardSlePrediction } from '../../types/sle';
import { BacklogScopeType } from '../../../specs/056-monte-carlo-backlog-forecast/contracts/backlog-forecast-contracts';
import { simulatePolicyScenario } from '../../utils/flowLeverageEngine';
import CascadeImpactGraphView from './CascadeImpactGraphView';

export interface FlowLeverageSimulatorPanelProps {
  tasks: TaskModel[];
  columns: ColumnModel[];
  scopeType: BacklogScopeType;
  scopeId?: string;
  slePredictions?: Record<string, CardSlePrediction>;
  isReadOnly?: boolean;
  onApplyWipLimit?: (columnId: string, newLimit: number) => void;
  onSelectTask?: (taskId: string) => void;
}

export const FlowLeverageSimulatorPanel: React.FC<FlowLeverageSimulatorPanelProps> = ({
  tasks,
  columns,
  scopeType,
  scopeId,
  slePredictions,
  isReadOnly = false,
  onApplyWipLimit,
  onSelectTask,
}) => {
  const inProgressCols = useMemo(
    () => columns.filter((c) => c.category === 'in_progress'),
    [columns],
  );

  // Estado em memória do modo Sandbox
  const [simulatedLimits, setSimulatedLimits] = useState<Record<string, number | null>>(() => {
    const initial: Record<string, number | null> = {};
    for (const c of inProgressCols) {
      initial[c.id] = c.wipLimit ?? 8;
    }
    return initial;
  });

  const [swarmingEnabled, setSwarmingEnabled] = useState<boolean>(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    columnId: string;
    columnTitle: string;
    newLimit: number;
  } | null>(null);

  // Cálculo reativo via Little's Law (< 50ms)
  const scenario = useMemo(() => {
    return simulatePolicyScenario({
      boardId: 'current-board',
      tasks,
      columns,
      scopeType,
      scopeId,
      simulatedLimits,
      swarmingEnabled,
      deliveryDaysCount: 15,
    });
  }, [tasks, columns, scopeType, scopeId, simulatedLimits, swarmingEnabled]);

  const handleSliderChange = (colId: string, val: number) => {
    setSimulatedLimits((prev) => ({
      ...prev,
      [colId]: val,
    }));
  };

  const handleConfirmApply = () => {
    if (pendingConfirmation && onApplyWipLimit) {
      onApplyWipLimit(pendingConfirmation.columnId, pendingConfirmation.newLimit);
      setPendingConfirmation(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Badge de Sandbox */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100">
              Simulador Prescritivo de Alavancas de Fluxo
            </h3>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              🧪 Modo Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simule ajustes de limites de WIP e swarming em tempo real via Lei de Little. Zero
            alterações no quadro real sem confirmação explícita.
          </p>
        </div>

        {/* Toggle Swarming */}
        <label className="flex items-center gap-2.5 text-xs font-medium text-slate-300 cursor-pointer bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/60 hover:border-slate-600 transition-colors">
          <input
            type="checkbox"
            checked={swarmingEnabled}
            onChange={(e) => setSwarmingEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
          />
          <span>🐝 Swarming em Itens Críticos ({'>'} P85)</span>
        </label>
      </div>

      {/* Cards Comparativos (Atual vs Simulado) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            P85 Atual (Baseline)
          </span>
          <div className="text-2xl font-bold text-slate-200 mt-1">
            {scenario.currentCycleTimeP85}{' '}
            <span className="text-xs font-normal text-slate-400">dias</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            P50 atual: {scenario.currentCycleTimeP50} dias
          </div>
        </div>

        <div className="bg-slate-900/80 border border-indigo-500/30 p-4 rounded-xl">
          <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
            P85 Simulado (Lei de Little)
          </span>
          <div className="text-2xl font-bold text-indigo-200 mt-1">
            {scenario.simulatedCycleTimeP85}{' '}
            <span className="text-xs font-normal text-indigo-300">dias</span>
          </div>
          <div className="text-[11px] text-indigo-300/80 mt-1">
            P50 projetado: {scenario.simulatedCycleTimeP50} dias
          </div>
        </div>

        <div
          className={`border p-4 rounded-xl ${
            scenario.deltaDaysP85 < 0
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : scenario.deltaDaysP85 > 0
                ? 'bg-rose-950/20 border-rose-500/30'
                : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Variação Projetada
          </span>
          <div
            className={`text-2xl font-bold mt-1 ${
              scenario.deltaDaysP85 < 0
                ? 'text-emerald-400'
                : scenario.deltaDaysP85 > 0
                  ? 'text-rose-400'
                  : 'text-slate-300'
            }`}
          >
            {scenario.deltaDaysP85 > 0 ? `+${scenario.deltaDaysP85}` : scenario.deltaDaysP85} dias
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {scenario.deltaDaysP85 < 0
              ? '🚀 Ganho estimado no prazo de entrega'
              : scenario.deltaDaysP85 > 0
                ? '⚠️ Atraso projetado por elevação de fila'
                : 'Sem alteração significativa'}
          </div>
        </div>
      </div>

      {/* Sliders de WIP por Coluna */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Ajuste Fino de Limites de WIP por Etapa:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inProgressCols.map((col) => {
            const currentWip = scenario.currentWipByColumn[col.id] || 0;
            const simLimit = simulatedLimits[col.id] ?? 8;
            const hasChanged = simLimit !== (col.wipLimit ?? 8);

            return (
              <div
                key={col.id}
                className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{col.title}</span>
                  <span className="text-slate-400">
                    WIP Atual: <strong className="text-slate-200">{currentWip}</strong> | Limite
                    Configurado: {col.wipLimit ?? '∞'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor={`slider-${col.id}`} className="sr-only">
                    Limite Simulado: {col.title}
                  </label>
                  <input
                    id={`slider-${col.id}`}
                    type="range"
                    min="1"
                    max="20"
                    value={simLimit}
                    onChange={(e) => handleSliderChange(col.id, Number(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 min-w-[36px] text-center">
                    {simLimit}
                  </span>
                </div>

                {!isReadOnly && onApplyWipLimit && hasChanged && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() =>
                        setPendingConfirmation({
                          columnId: col.id,
                          columnTitle: col.title,
                          newLimit: simLimit,
                        })
                      }
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    >
                      Aplicar limite na coluna {col.title}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Árvore de Diagnóstico em Cascata */}
      <CascadeImpactGraphView
        tasks={tasks}
        onSelectTask={onSelectTask}
        slePredictions={slePredictions}
      />

      {/* Modal de Confirmação de Aplicação de Limite (Constituição X) */}
      {pendingConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-100">Confirmar alteração de política</h4>
            <p className="text-sm text-slate-300">
              Deseja aplicar o limite de WIP de{' '}
              <strong className="text-indigo-300">{pendingConfirmation.newLimit}</strong> na coluna{' '}
              <strong className="text-slate-100">{pendingConfirmation.columnTitle}</strong> no
              quadro real?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingConfirmation(null)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmApply}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                Confirmar Aplicação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowLeverageSimulatorPanel;
