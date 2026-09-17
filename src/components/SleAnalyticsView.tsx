import React, { useState } from 'react';
import { TaskModel } from '../types/kanban';
import { ServiceLevelExpectation } from '../types/analytics';
import { calculateCycleTimeMs } from '../utils/timeFormatters';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface SleAnalyticsViewProps {
  tasks: TaskModel[];
  sle: ServiceLevelExpectation;
  onUpdateTargetDays?: (days: number | null) => void;
}

export const SleAnalyticsView: React.FC<SleAnalyticsViewProps> = ({
  tasks,
  sle,
  onUpdateTargetDays,
}) => {
  const [targetInput, setTargetInput] = useState<string>(
    sle.targetDays ? String(sle.targetDays) : ''
  );

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetInput(val);
    const parsed = parseFloat(val);
    if (onUpdateTargetDays) {
      if (!isNaN(parsed) && parsed > 0) {
        onUpdateTargetDays(parsed);
      } else {
        onUpdateTargetDays(null);
      }
    }
  };

  // Filtrar tarefas concluídas com cycle time válido
  const taskAnalysis = tasks
    .filter((t) => Boolean(t.completedAt))
    .map((task) => {
      const ms = calculateCycleTimeMs(task) || 0;
      const days = Number((ms / MS_PER_DAY).toFixed(1));
      const threshold = sle.targetDays && sle.targetDays > 0 ? sle.targetDays : sle.observedDays;
      const isCompliant = days <= threshold;
      return {
        task,
        days,
        isCompliant,
      };
    })
    .sort((a, b) => b.days - a.days);

  return (
    <div className="sle-analytics-view" data-testid="focused-sles-view">
      <div className="sle-view-header">
        <div className="sle-header-titles">
          <h2 className="sle-view-title">Expectativas de Nível de Serviço (SLEs)</h2>
          <p className="sle-view-subtitle">
            Monitore o compromisso probabilístico de entrega da equipe com base no percentil 85% e conformidade histórica.
          </p>
        </div>
      </div>

      {/* Grid de Indicadores Principais */}
      <div className="sle-metrics-grid">
        <div className="sle-metric-card">
          <div className="sle-metric-caption">SLE P85 Observado</div>
          <div className="sle-metric-value" data-testid="sle-observed-metric">
            {sle.observedDays}d
          </div>
          <div className="sle-metric-helper">
            85% dos itens concluídos em até {sle.observedDays} dias
          </div>
        </div>

        <div className="sle-metric-card">
          <div className="sle-metric-caption">Taxa de Conformidade</div>
          <div
            className={`sle-metric-value ${sle.complianceRate >= 85 ? 'text-success' : 'text-warning'}`}
            data-testid="sle-compliance-metric"
          >
            {sle.complianceRate}%
          </div>
          <div className="sle-metric-helper">
            {sle.targetDays
              ? `Entregas dentro da meta de ${sle.targetDays} dias`
              : `Entregas dentro da expectativa observada`}
          </div>
        </div>

        <div className="sle-metric-card">
          <div className="sle-metric-caption">Amostra Analisada</div>
          <div className="sle-metric-value">{sle.sampleSize}</div>
          <div className="sle-metric-helper">
            Amostra de {sle.sampleSize} tarefas concluídas no período
          </div>
        </div>

        <div className="sle-metric-card sle-target-config-card">
          <div className="sle-metric-caption">Meta da Equipe (Dias)</div>
          <div className="sle-target-input-row">
            <input
              type="number"
              min="0.5"
              step="0.5"
              placeholder={`${sle.observedDays}`}
              value={targetInput}
              onChange={handleTargetChange}
              className="sle-target-input"
              data-testid="target-days-input"
              aria-label="Meta de SLE em dias"
            />
            <span className="sle-target-unit">dias</span>
          </div>
          <div className="sle-metric-helper">
            Defina uma meta explícita para aferir a conformidade
          </div>
        </div>
      </div>

      {/* Tabela de Itens e Conformidade */}
      <div className="sle-tasks-table-container">
        <h3 className="sle-table-title">Distribuição Individual de Tarefas Concluídas</h3>
        {taskAnalysis.length === 0 ? (
          <div className="sle-empty-state">
            Nenhuma tarefa concluída encontrada no período filtrado para análise de SLE.
          </div>
        ) : (
          <div className="sle-table-wrapper">
            <table className="sle-table">
              <thead>
                <tr>
                  <th>Tarefa</th>
                  <th>Tempo de Ciclo</th>
                  <th>Status SLE</th>
                  <th>Conclusão</th>
                </tr>
              </thead>
              <tbody>
                {taskAnalysis.map(({ task, days, isCompliant }) => (
                  <tr key={task.id} className={isCompliant ? 'row-compliant' : 'row-breached'}>
                    <td className="task-title-cell">{task.title}</td>
                    <td className="task-days-cell">
                      <strong>{days}</strong> dias
                    </td>
                    <td>
                      <span className={`sle-status-badge ${isCompliant ? 'is-compliant' : 'is-breached'}`}>
                        {isCompliant ? '✓ Conforme' : '⚠️ Excedeu SLE'}
                      </span>
                    </td>
                    <td className="task-date-cell">
                      {task.completedAt ? new Date(task.completedAt).toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
