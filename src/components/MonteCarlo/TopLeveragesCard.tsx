/**
 * TopLeveragesCard.tsx - Card Sintético do Top 3 Alavancas de Fluxo
 * Feature: 058-flow-leverage-simulator (User Story 3)
 * Governança: Constituição Artigo II (<= 400 linhas), Local-First e Acessível.
 */

import React from 'react';
import { TopLeveragesSummary, FlowLeverageCategory } from '../../types/analytics';

export interface TopLeveragesCardProps {
  summary: TopLeveragesSummary;
  onSelectTask?: (taskId: string) => void;
  onNavigateToSimulator?: () => void;
}

const CATEGORY_BADGES: Record<
  FlowLeverageCategory,
  { label: string; icon: string; classes: string }
> = {
  cascade_unblock: {
    label: 'Desbloqueio',
    icon: '⛔',
    classes: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  aging_swarming: {
    label: 'Swarming',
    icon: '🐝',
    classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  wip_reduction: {
    label: 'Limite WIP',
    icon: '⚡',
    classes: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
};

export const TopLeveragesCard: React.FC<TopLeveragesCardProps> = ({
  summary,
  onSelectTask,
  onNavigateToSimulator,
}) => {
  const { items, isSampleSufficient, deliveryDaysCount } = summary;

  return (
    <div
      className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3"
      data-testid="top-leverages-card"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <h4 className="text-sm font-bold text-slate-100">Top 3 Alavancas de Fluxo</h4>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Prescritivo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ações cirúrgicas de maior impacto estatístico no prazo P85 para focar hoje.
          </p>
        </div>

        {onNavigateToSimulator && (
          <button
            onClick={onNavigateToSimulator}
            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors self-start sm:self-auto shrink-0 flex items-center gap-1.5"
          >
            <span>📊</span>
            <span>Abrir Simulador What-If</span>
          </button>
        )}
      </div>

      {!isSampleSufficient && (
        <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-[11px]">
          <span>⚠️</span>
          <span>
            Amostra preliminar ({deliveryDaysCount}/10 dias de entrega). Margem estatística em
            calibração.
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400">
          <p className="text-slate-300 font-medium">Nenhuma alavanca crítica detectada</p>
          <p className="text-slate-500 mt-1">
            O fluxo está equilibrado, sem impedimentos em cascata ou filas com saturação anômala.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => {
            const badge = CATEGORY_BADGES[item.category] || CATEGORY_BADGES.cascade_unblock;

            return (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${badge.classes}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                    <button
                      onClick={() => onSelectTask?.(item.taskId)}
                      className="px-1.5 py-0.5 text-xs font-mono font-semibold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition-colors"
                      title="Ver tarefa no quadro"
                    >
                      #{item.taskId}
                    </button>
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {item.taskTitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4">{item.rationale}</p>
                </div>

                <div className="text-right shrink-0 pl-4 sm:pl-0 border-t sm:border-t-0 border-slate-700/40 pt-1 sm:pt-0">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Ganho Estimado
                  </div>
                  <div className="text-sm font-bold text-emerald-300">
                    ~{item.impactDaysP85} dias{' '}
                    <span className="text-[10px] font-normal text-emerald-400/80">no P85</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopLeveragesCard;
