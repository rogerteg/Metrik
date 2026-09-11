import React, { useState, useMemo } from 'react';
import { TaskModel, ColumnModel } from '../types/kanban';
import { groupActiveTasksByColumn } from '../utils/wipAgingMetrics';
import { WipAgingChart } from './charts/WipAgingChart';
import { WipAgingFilterDrawer } from './charts/WipAgingFilterDrawer';
import { WipAgingControlDrawer } from './charts/WipAgingControlDrawer';

export interface WipAgingViewProps {
  tasks: TaskModel[];
  columns?: ColumnModel[];
  onSelectTask?: (taskId: string) => void;
}

export const WipAgingView: React.FC<WipAgingViewProps> = ({
  tasks,
  columns = [],
  onSelectTask,
}) => {
  // Controle das gavetas retráteis
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  // Filtro de colunas visíveis
  const [visibleColumnIds, setVisibleColumnIds] = useState<Set<string>>(() => {
    return new Set(columns.filter((c) => c.category !== 'done' && c.id !== 'done').map((c) => c.id));
  });

  // Filtro de data inicial
  const [startDateAfter, setStartDateAfter] = useState<string>('');

  // Controles de exibição de percentis
  const [showP50, setShowP50] = useState(true);
  const [showP70, setShowP70] = useState(true);
  const [showP85, setShowP85] = useState(true);
  const [showP95, setShowP95] = useState(true);
  const [highlightBlockedOnly, setHighlightBlockedOnly] = useState(false);

  // Filtragem de tarefas de acordo com data inicial configurada
  const filteredTasks = useMemo(() => {
    if (!startDateAfter) return tasks;
    const startTimestamp = new Date(startDateAfter).getTime();
    return tasks.filter((t) => {
      const taskStart = t.startedAt ? new Date(t.startedAt).getTime() : new Date(t.createdAt).getTime();
      return taskStart >= startTimestamp;
    });
  }, [tasks, startDateAfter]);

  // Agrupamento de tarefas ativas por coluna
  const allGroupedColumns = useMemo(() => {
    return groupActiveTasksByColumn(filteredTasks, columns, new Date());
  }, [filteredTasks, columns]);

  // Filtrar apenas colunas selecionadas no drawer esquerdo
  const displayColumns = useMemo(() => {
    if (visibleColumnIds.size === 0) return allGroupedColumns;
    return allGroupedColumns.filter((col) => visibleColumnIds.has(col.id));
  }, [allGroupedColumns, visibleColumnIds]);

  const totalActiveWip = useMemo(() => {
    return displayColumns.reduce((acc, col) => acc + col.wipCount, 0);
  }, [displayColumns]);

  const handleToggleColumnVisibility = (colId: string) => {
    setVisibleColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) {
        if (next.size > 1) next.delete(colId);
      } else {
        next.add(colId);
      }
      return next;
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="wip-aging-view-root" data-testid="wip-aging-view">
      {/* Barra de Ações e Cabeçalho Superior */}
      <div className="wip-aging-top-bar">
        <div className="top-bar-title-group">
          <h3 className="top-bar-main-title">
            <span className="top-bar-icon">⏳</span> Envelhecimento do WIP (Aging Work In Progress)
          </h3>
          <p className="top-bar-subtitle">
            Monitore proativamente a idade dos cartões ativos no fluxo antes da quebra de acordos de nível de serviço (SLE).
          </p>
        </div>

        <div className="wip-summary-pills">
          <span className="wip-pill">
            WIP Total Ativo: <strong>{totalActiveWip} itens</strong>
          </span>
          <span className="wip-pill date-pill">
            Data de Corte: <strong>{todayStr}</strong>
          </span>
        </div>
      </div>

      {/* Container Principal com Área do Gráfico e Gavetas Retráteis */}
      <div className="wip-aging-main-stage">
        {/* Gaveta Esquerda: Dataset Configuration */}
        <WipAgingFilterDrawer
          isOpen={leftDrawerOpen}
          onToggleOpen={() => setLeftDrawerOpen((prev) => !prev)}
          columns={columns}
          visibleColumnIds={visibleColumnIds}
          onToggleColumnVisibility={handleToggleColumnVisibility}
          startDateAfter={startDateAfter}
          onApplyFilters={(date) => setStartDateAfter(date)}
          onResetFilters={() => setStartDateAfter('')}
        />

        {/* Gráfico SVG Central */}
        <div className="wip-aging-canvas-area">
          {displayColumns.length === 0 || totalActiveWip === 0 && tasks.length === 0 ? (
            <div className="wip-aging-guidance-card" data-testid="wip-guidance-card">
              <div className="guidance-icon">💡</div>
              <div className="guidance-content">
                <h4>Nenhum Trabalho em Andamento</h4>
                <p>
                  O Gráfico de Envelhecimento do WIP acompanha cartões que estão atualmente em progresso nas colunas ativas do board.
                </p>
                <ul>
                  <li>Crie ou mova cartões para as colunas do fluxo de trabalho.</li>
                  <li>Cartões concluídos geram a linha base histórica das faixas de percentil de ritmo (Pace Percentiles).</li>
                </ul>
              </div>
            </div>
          ) : (
            <WipAgingChart
              columns={displayColumns}
              showP50={showP50}
              showP70={showP70}
              showP85={showP85}
              showP95={showP95}
              highlightBlockedOnly={highlightBlockedOnly}
              referenceDateStr={todayStr}
              onSelectTask={onSelectTask}
            />
          )}
        </div>

        {/* Gaveta Direita: Controls for this Chart */}
        <WipAgingControlDrawer
          isOpen={rightDrawerOpen}
          onToggleOpen={() => setRightDrawerOpen((prev) => !prev)}
          showP50={showP50}
          onToggleP50={() => setShowP50((prev) => !prev)}
          showP70={showP70}
          onToggleP70={() => setShowP70((prev) => !prev)}
          showP85={showP85}
          onToggleP85={() => setShowP85((prev) => !prev)}
          showP95={showP95}
          onToggleP95={() => setShowP95((prev) => !prev)}
          highlightBlockedOnly={highlightBlockedOnly}
          onToggleHighlightBlockedOnly={() => setHighlightBlockedOnly((prev) => !prev)}
          onSelectAllPercentiles={() => {
            setShowP50(true);
            setShowP70(true);
            setShowP85(true);
            setShowP95(true);
          }}
          onClearAllPercentiles={() => {
            setShowP50(false);
            setShowP70(false);
            setShowP85(false);
            setShowP95(false);
          }}
        />
      </div>
    </div>
  );
};
