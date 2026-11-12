/**
 * CascadeImpactGraphView.tsx - Diagnóstico Visual de Impacto em Cascata e Custo do Atraso
 * Feature: 058-flow-leverage-simulator (User Story 1)
 * Governança: Constituição Artigo II (<= 400 linhas), Local-First e acessível.
 */

import React, { useMemo, useState } from 'react';
import { TaskModel } from '../../types/kanban';
import { CardSlePrediction } from '../../types/sle';
import { calculateCascadeImpact } from '../../utils/flowLeverageEngine';

export interface CascadeImpactGraphViewProps {
  tasks: TaskModel[];
  selectedTaskId?: string;
  onSelectTask?: (taskId: string) => void;
  slePredictions?: Record<string, CardSlePrediction>;
}

export const CascadeImpactGraphView: React.FC<CascadeImpactGraphViewProps> = ({
  tasks,
  selectedTaskId: controlledTaskId,
  onSelectTask,
  slePredictions,
}) => {
  const blockedTasks = useMemo(() => {
    return tasks.filter((t) => t.blocked && !t.completedAt);
  }, [tasks]);

  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(
    blockedTasks[0]?.id,
  );

  const activeRootId = controlledTaskId || internalSelectedId || blockedTasks[0]?.id;

  const impact = useMemo(() => {
    if (!activeRootId) return null;
    return calculateCascadeImpact(tasks, activeRootId, slePredictions);
  }, [tasks, activeRootId, slePredictions]);

  const rootTask = useMemo(() => {
    return tasks.find((t) => t.id === activeRootId);
  }, [tasks, activeRootId]);

  const dependentTasks = useMemo(() => {
    if (!impact || impact.dependentTaskIds.length === 0) return [];
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    return impact.dependentTaskIds
      .map((id) => taskMap.get(id))
      .filter((t): t is TaskModel => Boolean(t));
  }, [tasks, impact]);

  if (blockedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-center">
        <svg
          className="w-12 h-12 text-emerald-400 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h4 className="text-base font-semibold text-emerald-300">
          Nenhum impedimento ativo em cascata detectado
        </h4>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          O fluxo está desimpedido! Não há cartões bloqueados retendo tarefas dependentes a jusante
          no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seletor de Bloqueios */}
      {blockedTasks.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Impedimentos Ativos:
          </span>
          {blockedTasks.map((bt) => {
            const isSelected = bt.id === activeRootId;
            return (
              <button
                key={bt.id}
                onClick={() => {
                  setInternalSelectedId(bt.id);
                  onSelectTask?.(bt.id);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                <span className="text-rose-400 font-bold">⛔</span>
                <span>#{bt.id}</span>
                <span className="truncate max-w-[120px]">{bt.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Cartão de Raiz & Custo do Atraso */}
      {rootTask && impact && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  #{rootTask.id}
                </span>
                <h4 className="text-base font-semibold text-slate-100">{rootTask.title}</h4>
              </div>
              {rootTask.blockedReason && (
                <p className="text-xs text-rose-300/90 mt-1 flex items-center gap-1.5">
                  <span className="font-semibold">Motivo:</span> {rootTask.blockedReason}
                </p>
              )}
            </div>

            {/* Badge de Cost of Delay */}
            <div className="flex items-center gap-3 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
              <svg
                className="w-5 h-5 text-rose-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                  Custo do Atraso Estimado
                </div>
                <div className="text-lg font-bold text-rose-200">
                  +{impact.estimatedDelayDaysP85} dias{' '}
                  <span className="text-xs font-normal text-rose-300">no P85</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerta de Ciclo Circular */}
          {impact.hasCycle && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-medium">
              <span className="text-amber-400 text-base">⚠️</span>
              <span>
                Dependência circular detectada entre tarefas vinculadas. A travessia foi protegida
                para manter o cálculo determinístico.
              </span>
            </div>
          )}

          {/* Árvore / Lista de Dependentes a Jusante */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                🔗 Tarefas Retidas a Jusante ({dependentTasks.length}):
              </span>
              <span>Profundidade Máxima da Cadeia: {impact.maxDepth}</span>
            </div>

            {dependentTasks.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                Nenhuma tarefa a jusante diretamente retida por este bloqueador.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dependentTasks.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 hover:border-sky-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => onSelectTask?.(dep.id)}
                        className="px-1.5 py-0.5 text-xs font-mono font-semibold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition-colors"
                        title="Ver detalhes da tarefa"
                      >
                        #{dep.id}
                      </button>
                      <span className="text-xs text-slate-200 truncate">{dep.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 shrink-0">
                      {dep.column}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CascadeImpactGraphView;
